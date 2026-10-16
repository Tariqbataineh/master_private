using Microsoft.EntityFrameworkCore;
namespace Wusool.Data;

// This supplements Identity password verification; it is not a login endpoint.
public sealed class AccountAccess(WusoolDbContext db)
{
    public async Task<bool> CanSignInAsync(string accountId, string requestedRole, CancellationToken ct = default)
    {
        if (requestedRole is not ("User" or "Organization" or "Admin")) return false;
        return await db.Users.AsNoTracking().AnyAsync(x => x.Id == accountId && !x.IsDeleted &&
            x.RoleCode == requestedRole && x.Status != "blocked" && x.Status != "suspended" &&
            x.Status != "disabled", ct);
        // Pending/rejected organization accounts may reach registration-status pages,
        // matching the frontend. Approval must still gate publication/organization operations.
    }
    public async Task<bool> IsSessionValidAsync(string accountId, byte[] sessionHash, string securityStamp,
        DateTimeOffset now, CancellationToken ct = default)
        => await db.DeviceSessions.AsNoTracking().Include(x => x.Account)
            .AnyAsync(x => x.AccountId == accountId && x.SessionHash == sessionHash && !x.IsDeleted &&
                x.RevokedAt == null && x.ExpiresAt > now && x.SecurityStampSnapshot == securityStamp &&
                x.Account.SecurityStamp == securityStamp && !x.Account.IsDeleted &&
                x.Account.Status != "blocked" && x.Account.Status != "suspended" && x.Account.Status != "disabled", ct);
}
