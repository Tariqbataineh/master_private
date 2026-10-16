using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class AccessibilityRequirement
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Category { get; set; }
    public decimal Weight { get; set; }
    public bool Required { get; set; }
    public bool Enabled { get; set; } = true;
}
