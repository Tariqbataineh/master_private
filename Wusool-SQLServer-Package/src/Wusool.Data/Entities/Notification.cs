using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Notification
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OwnerId { get; set; } = string.Empty;
    public string? BookingId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? BranchName { get; set; }
    public string? HoursChangeRequestId { get; set; }
    public ApplicationUser Owner { get; set; } = null!;
    public Booking? Booking { get; set; }
    public HoursChangeRequest? HoursRequest { get; set; }
    public ICollection<NotificationRead> Readers { get; set; } = new List<NotificationRead>();
}
