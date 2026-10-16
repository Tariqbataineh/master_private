using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Review
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? Title { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool? Flagged { get; set; }
    public bool? ModerationLocked { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public string BookingId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string BranchId { get; set; } = string.Empty;
    public Booking Booking { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public ApplicationUser? Moderator { get; set; }
}
