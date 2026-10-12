using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class SavedPlace
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string AccountId { get; set; } = string.Empty;
    public string BranchId { get; set; } = string.Empty;
    public ApplicationUser Account { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
}
