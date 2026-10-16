using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Booking
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public DateOnly VisitDate { get; set; }
    public TimeOnly VisitTime { get; set; }
    public string TimeZone { get; set; } = "Asia/Amman";
    public bool? RequiresAssistant { get; set; }
    public string? SupportJson { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public string? Purpose { get; set; }
    public string? VisitPurpose { get; set; }
    public string? Destination { get; set; }
    public string? GuidanceMethod { get; set; }
    public string? Reason { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string JourneyState { get; set; } = "not-started";
    public string? LocationSnapshotJson { get; set; }
    public DateTimeOffset? DepartedAt { get; set; }
    public DateTimeOffset? ArrivedAt { get; set; }
    public DateTimeOffset? ReceivedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset? CalledAt { get; set; }
    public string? CancellationReason { get; set; }
    public string? ScheduleBlockedJson { get; set; }
    public DateTimeOffset? QrUsedAt { get; set; }
    public bool? ScheduleConflict { get; set; }
    public DateTimeOffset? ScheduleConflictAt { get; set; }
    public string? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceSnapshotJson { get; set; }
    public string BranchId { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int? QueueNumber { get; set; }
    public string? QueueCalledById { get; set; }
    public DateTimeOffset? QueueCalledAt { get; set; }
    public Branch Branch { get; set; } = null!;
    public Organization Organization { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public BranchService? Service { get; set; }
    public ApplicationUser? QueueCalledBy { get; set; }
    public ICollection<BookingHistory> JourneyHistory { get; set; } = new List<BookingHistory>();
    public ICollection<AppointmentProposal> AppointmentProposals { get; set; } = new List<AppointmentProposal>();
    public ICollection<VisitPass> Passes { get; set; } = new List<VisitPass>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
