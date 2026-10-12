using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Plan
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string Name { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public decimal AnnualDiscount { get; set; }
    public int BranchLimit { get; set; }
    public string Currency { get; set; } = string.Empty;
    public bool Active { get; set; }
    public string? Description { get; set; }
    public string? FeaturesJson { get; set; }
}
