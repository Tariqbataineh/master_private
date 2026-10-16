using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class OrganizationApplication
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OrganizationId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string SubmittedById { get; set; } = string.Empty;
    public string? ReviewedById { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? Reason { get; set; }
    public string? SnapshotJson { get; set; }
    public Organization Organization { get; set; } = null!;
    public ApplicationUser SubmittedBy { get; set; } = null!;
    public ApplicationUser? ReviewedBy { get; set; }
}
