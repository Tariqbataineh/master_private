using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class ApplicationUser : IdentityUser
 {
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string Name { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string Status { get; set; } = "pending";
    public string? ApprovalStatus { get; set; }
    public bool? RequiresInitialSetup { get; set; }
    public string? Type { get; set; }
    public string? OrganizationType { get; set; }
    public string? OrganizationCategory { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? CountryCode { get; set; }
    public string? Governorate { get; set; }
    public string? GooglePlaceId { get; set; }
    public string? Website { get; set; }
    public string? AccessibilityPreferencesJson { get; set; }
    public string? ProfileJson { get; set; }
    public string? PreferencesJson { get; set; }
    public string? SettingsJson { get; set; }
    public string? RepresentativeName { get; set; }
    public string? JobTitle { get; set; }
    public string? ManagerName { get; set; }
    public string? ManagerPosition { get; set; }
    public string? ManagerEmail { get; set; }
    public string? ManagerPhone { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? Logo { get; set; }
    public string? DocumentName { get; set; }
    public string? DocumentId { get; set; }
    public string? DocumentStatus { get; set; }
    public string RoleCode { get; set; } = "User";
    public DateTimeOffset? BlockedAt { get; set; }
    public string? BlockedById { get; set; }
    public string? BlockReason { get; set; }
    public DateTimeOffset? TermsAcceptedAt { get; set; }
    public ApplicationUser? BlockedBy { get; set; }
    public Document? RegistrationDocument { get; set; }
    public Organization? Organization { get; set; }
    public ICollection<OrganizationMembership> Memberships { get; set; } = new List<OrganizationMembership>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<SavedPlace> SavedPlaces { get; set; } = new List<SavedPlace>();
    public ICollection<DeviceSession> Sessions { get; set; } = new List<DeviceSession>();
}
