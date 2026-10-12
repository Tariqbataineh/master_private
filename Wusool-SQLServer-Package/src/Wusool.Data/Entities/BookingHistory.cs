using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class BookingHistory
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string BookingId { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public string? FromState { get; set; }
    public string? ToState { get; set; }
    public string? ActorId { get; set; }
    public string? ActorRole { get; set; }
    public string? ActorName { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset At { get; set; }
    public Booking Booking { get; set; } = null!;
    public ApplicationUser? Actor { get; set; }
}
