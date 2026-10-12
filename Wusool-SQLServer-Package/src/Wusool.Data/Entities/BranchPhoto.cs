using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class BranchPhoto
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string BranchId { get; set; } = string.Empty;
    public string? CategoryKey { get; set; }
    public string? CategoryTitle { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public int? Size { get; set; }
    public int? OriginalSize { get; set; }
    public int? CompressionSavedBytes { get; set; }
    public string? Url { get; set; }
    public bool? Uploaded { get; set; }
    public DateTimeOffset? UploadedAt { get; set; }
    public string? Status { get; set; }
    public string DocumentId { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    public Branch Branch { get; set; } = null!;
    public Document Document { get; set; } = null!;
}
