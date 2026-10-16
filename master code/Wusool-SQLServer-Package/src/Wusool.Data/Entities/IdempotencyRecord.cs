using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class IdempotencyRecord
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string AccountId { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public byte[] RequestHash { get; set; } = Array.Empty<byte>();
    public string? ResponseJson { get; set; }
    public int? HttpStatus { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public ApplicationUser Account { get; set; } = null!;
}
