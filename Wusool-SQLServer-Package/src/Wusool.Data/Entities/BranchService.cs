using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class BranchService
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string BranchId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool Active { get; set; } = true;
    public bool Available { get; set; } = true;
    public string NormalizedName { get; set; } = string.Empty;
    public Branch Branch { get; set; } = null!;
}
