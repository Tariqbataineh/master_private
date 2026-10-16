using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Document
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OwnerId { get; set; } = string.Empty;
    public string? OrganizationId { get; set; }
    public string? BranchId { get; set; }
    public string? CategoryKey { get; set; }
    public string? Purpose { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Size { get; set; }
    public bool? Uploaded { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
    public ApplicationUser Owner { get; set; } = null!;
    public Organization? Organization { get; set; }
    public Branch? Branch { get; set; }
}
