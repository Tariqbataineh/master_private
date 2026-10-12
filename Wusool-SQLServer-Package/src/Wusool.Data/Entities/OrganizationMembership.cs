using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class OrganizationMembership
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string OrganizationId { get; set; } = string.Empty;
    public string AccountId { get; set; } = string.Empty;
    public string Role { get; set; } = "owner";
    public bool Active { get; set; } = true;
    public Organization Organization { get; set; } = null!;
    public ApplicationUser Account { get; set; } = null!;
}
