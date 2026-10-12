using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class ImpersonationSession
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string AdminId { get; set; } = string.Empty;
    public string TargetAccountId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? EndedAt { get; set; }
    public ApplicationUser Admin { get; set; } = null!;
    public ApplicationUser TargetAccount { get; set; } = null!;
}
