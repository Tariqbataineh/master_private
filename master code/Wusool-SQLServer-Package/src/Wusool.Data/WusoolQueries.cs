using Microsoft.EntityFrameworkCore;
using Wusool.Data.Entities;
namespace Wusool.Data;

// Internal data-access graphs. Map to the supplied OpenAPI DTOs before returning from controllers.
// Never serialize Identity entities directly: they contain credential/security fields.
public sealed class WusoolQueries(WusoolDbContext db)
{
    public async Task<ApplicationUser> RequireAccountAsync(string authenticatedAccountId, CancellationToken ct = default)
    {
        // Account ID comes only from validated server authentication, never from the request body.
        var account = await db.Users.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == authenticatedAccountId, ct);
        if (account is null || account.IsDeleted) throw new UnauthorizedAccessException("UNAUTHENTICATED");
        if (account.Status is "blocked" or "suspended" or "disabled")
            throw new UnauthorizedAccessException("ACCOUNT_BLOCKED");
        return account;
    }

    public async Task<List<Branch>> PublicBranchesAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        ValidatePage(page, pageSize);
        return await PublicBranches()
            .Include(x => x.Organization).ThenInclude(x => x.Account)
            .OrderBy(x => x.Name).ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task<Branch?> PublicBranchDetailsAsync(string id, CancellationToken ct = default)
        => await PublicBranches().Where(x => x.Id == id)
            .Include(x => x.Organization).ThenInclude(x => x.Account)
            .Include(x => x.WorkingHours.Where(h => !h.IsDeleted))
            .Include(x => x.SpecialDates.Where(h => !h.IsDeleted))
            .Include(x => x.TicketServices.Where(s => !s.IsDeleted && s.Active && s.Available))
            .Include(x => x.Photos.Where(p => !p.IsDeleted && p.Uploaded == true)).ThenInclude(p => p.Document)
            .Include(x => x.Accessibility.Where(a => !a.IsDeleted)).ThenInclude(a => a.Requirement)
            .Include(x => x.CurrentAnalysis)
            .AsSplitQuery().SingleOrDefaultAsync(ct);

    public async Task<List<Booking>> MyBookingsAsync(string actorId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var actor = await RequireAccountAsync(actorId, ct);
        ValidatePage(page, pageSize);
        var query = db.Bookings.AsNoTracking().Where(x => !x.IsDeleted);
        query = actor.RoleCode switch
        {
            "Admin" => query,
            "Organization" => query.Where(x => x.OrganizationId == actor.Id),
            "User" => query.Where(x => x.UserId == actor.Id),
            _ => throw new UnauthorizedAccessException("FORBIDDEN")
        };
        return await query.Include(x => x.Branch).ThenInclude(x => x.Organization)
            .Include(x => x.Service)
            .OrderByDescending(x => x.VisitDate).ThenByDescending(x => x.VisitTime).ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task<Booking?> BookingDetailsAsync(string actorId, string bookingId, CancellationToken ct = default)
    {
        var actor = await RequireAccountAsync(actorId, ct);
        return await db.Bookings.AsNoTracking()
            .Where(x => x.Id == bookingId && !x.IsDeleted &&
                (actor.RoleCode == "Admin" || x.UserId == actor.Id ||
                 (actor.RoleCode == "Organization" && x.OrganizationId == actor.Id)))
            .Include(x => x.Branch).ThenInclude(x => x.Organization)
            .Include(x => x.Service)
            .Include(x => x.JourneyHistory.OrderBy(h => h.At).ThenBy(h => h.Id))
            .Include(x => x.AppointmentProposals.Where(p => p.Status == "pending" && !p.IsDeleted))
            .Include(x => x.Reviews.Where(r => !r.IsDeleted))
            .AsSplitQuery().SingleOrDefaultAsync(ct);
    }

    public async Task<List<Branch>> OrganizationBranchesAsync(string actorId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var actor = await RequireAccountAsync(actorId, ct);
        if (actor.RoleCode != "Organization") throw new UnauthorizedAccessException("FORBIDDEN");
        ValidatePage(page, pageSize);
        return await db.Branches.AsNoTracking().Where(x => x.OrganizationId == actor.Id && !x.IsDeleted)
            .Include(x => x.Organization)
            .Include(x => x.TicketServices.Where(s => !s.IsDeleted))
            .OrderBy(x => x.Name).ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).AsSplitQuery().ToListAsync(ct);
    }

    public async Task<List<Review>> PublicReviewsAsync(string branchId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        ValidatePage(page, pageSize);
        var eligibleBranches = PublicBranches().Select(b => b.Id);
        return await db.Reviews.AsNoTracking().Where(x => x.BranchId == branchId && x.Status == "Visible" && !x.IsDeleted)
            .Where(x => eligibleBranches.Contains(x.BranchId))
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task<SupportTicket?> SupportTicketAsync(string actorId, string ticketId, CancellationToken ct = default)
    {
        var actor = await RequireAccountAsync(actorId, ct);
        return await db.SupportTickets.AsNoTracking()
            .Where(x => x.Id == ticketId && !x.IsDeleted &&
                (actor.RoleCode == "Admin" || x.RequesterId == actor.Id ||
                 (actor.RoleCode == "Organization" && x.OrganizationId == actor.Id)))
            .Include(x => x.Branch)
            .Include(x => x.Messages.OrderBy(m => m.CreatedAt).ThenBy(m => m.Id).Take(100))
                .ThenInclude(m => m.Attachments).ThenInclude(a => a.Document)
            .Include(x => x.Attachments).ThenInclude(a => a.Document)
            .AsSplitQuery().SingleOrDefaultAsync(ct);
    }

    public async Task<Subscription?> ActiveSubscriptionAsync(string actorId, CancellationToken ct = default)
    {
        var actor = await RequireAccountAsync(actorId, ct);
        if (actor.RoleCode != "Organization") throw new UnauthorizedAccessException("FORBIDDEN");
        return await db.Subscriptions.AsNoTracking()
            .Where(x => x.OrganizationId == actor.Id && x.Status == "Active" && !x.IsDeleted)
            .Include(x => x.Plan).SingleOrDefaultAsync(ct);
    }

    private IQueryable<Branch> PublicBranches() => db.Branches.AsNoTracking()
        .Where(x => !x.IsDeleted && (x.Status == "published" || x.Status == "approved") && x.IsPublished != false)
        .Where(x => x.DetailsCompleted && x.HoursCompleted && x.AccessibilityCompleted && x.PhotosCompleted && x.AiReviewCompleted)
        .Where(x => x.Name != "" && x.City != null && x.City != "" && x.Address != null && x.Address != "" && x.Phone != null && x.Phone != "")
        .Where(x => x.WorkingHours.Count(h => !h.IsDeleted) == 7)
        .Where(x => !db.AccessibilityRequirements.Where(r => r.Enabled && !r.IsDeleted)
            .Any(r => !x.Accessibility.Any(a => !a.IsDeleted && a.RequirementId == r.Id)))
        .Where(x => x.Photos.Any(p => !p.IsDeleted && p.Url != null && p.CategoryKey == "main-entrance") &&
            x.Photos.Any(p => !p.IsDeleted && p.Url != null && p.CategoryKey == "entrance-route") &&
            x.Photos.Any(p => !p.IsDeleted && p.Url != null && p.CategoryKey == "internal-pathway") &&
            x.Photos.Any(p => !p.IsDeleted && p.Url != null && p.CategoryKey == "destination-area"))
        .Where(x => x.CurrentAnalysis != null && !x.CurrentAnalysis.IsDeleted && x.CurrentAnalysis.Score != null)
        .Where(x => !x.Organization.IsDeleted && !x.Organization.Account.IsDeleted &&
            x.Organization.Account.Status == "active" && x.Organization.Account.ApprovalStatus == "approved" &&
            x.Organization.Account.RoleCode == "Organization");
    // Server publication command must set IsPublished only after all workflow evidence checks pass.

    private static void ValidatePage(int page, int pageSize)
    {
        if (page < 1 || page > 100000 || pageSize < 1 || pageSize > 100)
            throw new ArgumentOutOfRangeException(nameof(page), "Use page >= 1 and pageSize between 1 and 100.");
    }
}
