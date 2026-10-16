using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class HoursAffectedBooking
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string HoursChangeRequestId { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public HoursChangeRequest Request { get; set; } = null!;
    public Booking Booking { get; set; } = null!;
}
