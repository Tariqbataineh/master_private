using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class AppointmentProposal
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string BookingId { get; set; } = string.Empty;
    public string BranchId { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceSnapshotJson { get; set; }
    public DateOnly VisitDate { get; set; }
    public TimeOnly VisitTime { get; set; }
    public bool RequiresAssistant { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public string? Reason { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public string Status { get; set; } = "pending";
    public DateTimeOffset? RespondedAt { get; set; }
    public Booking Booking { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public BranchService? Service { get; set; }
}
