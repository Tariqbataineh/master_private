using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class AuditEvent
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string? Actor { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset? Timestamp { get; set; }
    public string? Status { get; set; }
    public decimal? Score { get; set; }
    public string? ActorId { get; set; }
    public ApplicationUser? ActorAccount { get; set; }
}
