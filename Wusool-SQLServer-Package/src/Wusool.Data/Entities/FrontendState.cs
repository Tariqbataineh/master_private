using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class FrontendState
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string Scope { get; set; } = string.Empty;
    public string OwnerKey { get; set; } = string.Empty;
    public string? AccountId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string ValueJson { get; set; } = string.Empty;
    public ApplicationUser? Account { get; set; }
}
