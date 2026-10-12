using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class ExternalJob
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string AccountId { get; set; } = string.Empty;
    public string? BranchId { get; set; }
    public string? BookingId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string? Provider { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RequestJson { get; set; }
    public string? ResultJson { get; set; }
    public string? FailureMessage { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public ApplicationUser Account { get; set; } = null!;
    public Branch? Branch { get; set; }
    public Booking? Booking { get; set; }
}
