using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class RuntimeError
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string? Type { get; set; }
    public string? Message { get; set; }
    public string? Source { get; set; }
    public int? Line { get; set; }
    public string? AccountId { get; set; }
    public ApplicationUser? Account { get; set; }
}
