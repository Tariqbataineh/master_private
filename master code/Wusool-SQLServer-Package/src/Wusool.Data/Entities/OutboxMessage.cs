using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class OutboxMessage
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string? OwnerId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = string.Empty;
    public string Status { get; set; } = "queued";
    public int AttemptCount { get; set; } = 0;
    public DateTimeOffset? NextAttemptAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public string? LastError { get; set; }
    public ApplicationUser? Owner { get; set; }
}
