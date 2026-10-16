using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class AccessChallenge
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string AccountId { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public byte[] TokenHash { get; set; } = Array.Empty<byte>();
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
    public int AttemptCount { get; set; } = 0;
    public ApplicationUser Account { get; set; } = null!;
}
