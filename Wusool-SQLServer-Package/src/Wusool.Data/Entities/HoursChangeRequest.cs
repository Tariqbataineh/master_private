using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class HoursChangeRequest
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string? ResourceName { get; set; }
    public string BeforeJson { get; set; } = string.Empty;
    public string ProposedJson { get; set; } = string.Empty;
    public int BaseHoursRevision { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewReason { get; set; }
    public string OrganizationId { get; set; } = string.Empty;
    public string? BranchId { get; set; }
    public string RequestedById { get; set; } = string.Empty;
    public string? ReviewedById { get; set; }
    public Organization Organization { get; set; } = null!;
    public Branch? Branch { get; set; }
    public ApplicationUser RequestedBy { get; set; } = null!;
    public ApplicationUser? ReviewedBy { get; set; }
    public ICollection<HoursAffectedBooking> AffectedBookings { get; set; } = new List<HoursAffectedBooking>();
}
