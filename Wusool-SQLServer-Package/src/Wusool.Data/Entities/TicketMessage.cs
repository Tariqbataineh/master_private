using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class TicketMessage
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string TicketId { get; set; } = string.Empty;
    public string? ActorId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ActorName { get; set; }
    public string? ActorRole { get; set; }
    public SupportTicket Ticket { get; set; } = null!;
    public ApplicationUser? Actor { get; set; }
    public ICollection<TicketMessageAttachment> Attachments { get; set; } = new List<TicketMessageAttachment>();
}
