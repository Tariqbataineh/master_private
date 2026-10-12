using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class SupportTicket
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string RequesterId { get; set; } = string.Empty;
    public string? OrganizationId { get; set; }
    public string? BranchId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? IssueType { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? PlaceName { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? DetailsJson { get; set; }
    public ApplicationUser Requester { get; set; } = null!;
    public Organization? Organization { get; set; }
    public Branch? Branch { get; set; }
    public ApplicationUser? Assignee { get; set; }
    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
    public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
}
