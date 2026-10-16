using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class TicketMessageAttachment
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string MessageId { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public TicketMessage Message { get; set; } = null!;
    public Document Document { get; set; } = null!;
}
