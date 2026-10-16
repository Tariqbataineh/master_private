using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class VisitPass
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string BookingId { get; set; } = string.Empty;
    public byte[] TokenHash { get; set; } = Array.Empty<byte>();
    public DateTimeOffset ExpiresAt { get; set; }
    public string? VerifiedById { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public Booking Booking { get; set; } = null!;
    public ApplicationUser? VerifiedBy { get; set; }
}
