using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Organization
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string AccountId { get; set; } = string.Empty;
    public int HoursRevision { get; set; } = 0;
    public DateTimeOffset? HoursUpdatedAt { get; set; }
    public ApplicationUser Account { get; set; } = null!;
    public ICollection<OrganizationMembership> Memberships { get; set; } = new List<OrganizationMembership>();
    public ICollection<OrganizationApplication> Applications { get; set; } = new List<OrganizationApplication>();
    public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    public ICollection<OrganizationHours> WorkingHours { get; set; } = new List<OrganizationHours>();
    public ICollection<OrganizationSpecialDate> SpecialDates { get; set; } = new List<OrganizationSpecialDate>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<HoursChangeRequest> HoursRequests { get; set; } = new List<HoursChangeRequest>();
}
