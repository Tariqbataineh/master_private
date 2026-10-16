using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Subscription
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OrganizationId { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string? PlanName { get; set; }
    public string BillingCycle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int BranchLimit { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? RenewalDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public bool? AutoRenew { get; set; }
    public string? PaymentStatus { get; set; }
    public bool? DevelopmentOnly { get; set; }
    public Organization Organization { get; set; } = null!;
    public Plan Plan { get; set; } = null!;
}
