using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class BranchDestination
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string BranchId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    public string? LegacyPayloadJson { get; set; }
    public Branch Branch { get; set; } = null!;
}
