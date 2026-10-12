using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class NotificationRead
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string NotificationId { get; set; } = string.Empty;
    public string AccountId { get; set; } = string.Empty;
    public DateTimeOffset ReadAt { get; set; }
    public Notification Notification { get; set; } = null!;
    public ApplicationUser Account { get; set; } = null!;
}
