using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class BranchAnalysis
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string? Status { get; set; }
    public decimal? Score { get; set; }
    public decimal? Confidence { get; set; }
    public string? Source { get; set; }
    public bool? IsDemo { get; set; }
    public string? Model { get; set; }
    public DateTimeOffset? GeneratedAt { get; set; }
    public string? Message { get; set; }
    public string? FindingsJson { get; set; }
    public string? RecommendationsJson { get; set; }
    public string BranchId { get; set; } = string.Empty;
    public Branch Branch { get; set; } = null!;
}
