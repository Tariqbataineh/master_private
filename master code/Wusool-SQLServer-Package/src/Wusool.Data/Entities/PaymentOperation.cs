using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class PaymentOperation
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OrganizationId { get; set; } = string.Empty;
    public string? SubscriptionId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string? ProviderReference { get; set; }
    public string OperationKind { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string Currency { get; set; } = "JOD";
    public string? ProviderPayloadJson { get; set; }
    public Organization Organization { get; set; } = null!;
    public Subscription? Subscription { get; set; }
}
