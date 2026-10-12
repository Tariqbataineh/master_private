using Microsoft.AspNetCore.Identity;
namespace Wusool.Data.Entities;

public partial class Branch
 {
    public string Id { get; set; } = string.Empty;
    public int Revision { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public string Name { get; set; } = string.Empty;
    public string? BranchType { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Area { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? CountryCode { get; set; }
    public string? Governorate { get; set; }
    public string? GooglePlaceId { get; set; }
    public string? AccessibilityFeaturesJson { get; set; }
    public string? OperationalAvailabilityJson { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? AccessibilityScore { get; set; }
    public decimal? Score { get; set; }
    public string? ScoreSource { get; set; }
    public string? EvidenceStatus { get; set; }
    public bool? IsPublished { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? StatusUpdatedAt { get; set; }
    public string? AdminFeedback { get; set; }
    public int HoursRevision { get; set; }
    public DateTimeOffset? HoursUpdatedAt { get; set; }
    public string OrganizationId { get; set; } = string.Empty;
    public bool TicketServicesConfigured { get; set; }
    public string? BookingConfigurationJson { get; set; }
    public string? ClosuresJson { get; set; }
    public bool DetailsCompleted { get; set; }
    public bool HoursCompleted { get; set; }
    public bool AccessibilityCompleted { get; set; }
    public bool PhotosCompleted { get; set; }
    public bool AiReviewCompleted { get; set; }
    public string? CurrentAnalysisId { get; set; }
    public Organization Organization { get; set; } = null!;
    public ApplicationUser? Reviewer { get; set; }
    public BranchAnalysis? CurrentAnalysis { get; set; }
    public ICollection<BranchHours> WorkingHours { get; set; } = new List<BranchHours>();
    public ICollection<BranchSpecialDate> SpecialDates { get; set; } = new List<BranchSpecialDate>();
    public ICollection<BranchService> TicketServices { get; set; } = new List<BranchService>();
    public ICollection<BranchLegacyService> LegacyServices { get; set; } = new List<BranchLegacyService>();
    public ICollection<BranchDestination> Destinations { get; set; } = new List<BranchDestination>();
    public ICollection<BranchAccessibility> Accessibility { get; set; } = new List<BranchAccessibility>();
    public ICollection<BranchPhoto> Photos { get; set; } = new List<BranchPhoto>();
    public ICollection<BranchAnalysis> Analyses { get; set; } = new List<BranchAnalysis>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
