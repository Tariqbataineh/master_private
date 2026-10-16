using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Wusool.Data.Entities;
namespace Wusool.Data;

public sealed partial class WusoolDbContext(DbContextOptions<WusoolDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationMembership> OrganizationMemberships => Set<OrganizationMembership>();
    public DbSet<OrganizationApplication> OrganizationApplications => Set<OrganizationApplication>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<OrganizationHours> OrganizationHours => Set<OrganizationHours>();
    public DbSet<OrganizationSpecialDate> OrganizationSpecialDates => Set<OrganizationSpecialDate>();
    public DbSet<BranchHours> BranchHours => Set<BranchHours>();
    public DbSet<BranchSpecialDate> BranchSpecialDates => Set<BranchSpecialDate>();
    public DbSet<BranchService> BranchServices => Set<BranchService>();
    public DbSet<BranchLegacyService> BranchLegacyServices => Set<BranchLegacyService>();
    public DbSet<BranchDestination> BranchDestinations => Set<BranchDestination>();
    public DbSet<AccessibilityRequirement> AccessibilityRequirements => Set<AccessibilityRequirement>();
    public DbSet<BranchAccessibility> BranchAccessibility => Set<BranchAccessibility>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<BranchPhoto> BranchPhotos => Set<BranchPhoto>();
    public DbSet<BranchAnalysis> BranchAnalyses => Set<BranchAnalysis>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingHistory> BookingHistory => Set<BookingHistory>();
    public DbSet<AppointmentProposal> AppointmentProposals => Set<AppointmentProposal>();
    public DbSet<VisitPass> VisitPasses => Set<VisitPass>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
    public DbSet<TicketAttachment> TicketAttachments => Set<TicketAttachment>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<PaymentOperation> PaymentOperations => Set<PaymentOperation>();
    public DbSet<HoursChangeRequest> HoursChangeRequests => Set<HoursChangeRequest>();
    public DbSet<HoursAffectedBooking> HoursAffectedBookings => Set<HoursAffectedBooking>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationRead> NotificationReads => Set<NotificationRead>();
    public DbSet<SavedPlace> SavedPlaces => Set<SavedPlace>();
    public DbSet<DeviceSession> DeviceSessions => Set<DeviceSession>();
    public DbSet<AccessChallenge> AccessChallenges => Set<AccessChallenge>();
    public DbSet<ImpersonationSession> ImpersonationSessions => Set<ImpersonationSession>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<FrontendState> FrontendStates => Set<FrontendState>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();
    public DbSet<RuntimeError> RuntimeErrors => Set<RuntimeError>();
    public DbSet<ExternalJob> ExternalJobs => Set<ExternalJob>();
    public DbSet<SyncRevision> SyncRevisions => Set<SyncRevision>();
    public DbSet<TicketMessageAttachment> TicketMessageAttachments => Set<TicketMessageAttachment>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.Entity<ApplicationUser>(e =>
        {
            e.ToTable("AspNetUsers", "dbo", t =>
            {
                t.HasCheckConstraint("CK_AspNetUsers_0", "[RoleCode] IN (N'User',N'Organization',N'Admin')");
                t.HasCheckConstraint("CK_AspNetUsers_1", "[Status] IN (N'active',N'pending',N'rejected',N'blocked',N'suspended',N'disabled')");
                t.HasCheckConstraint("CK_AspNetUsers_2", "[ApprovalStatus] IS NULL OR [ApprovalStatus] IN (N'pending',N'approved',N'rejected')");
                t.HasCheckConstraint("CK_AspNetUsers_3", "[AccessibilityPreferencesJson] IS NULL OR ISJSON([AccessibilityPreferencesJson]) = 1");
                t.HasCheckConstraint("CK_AspNetUsers_4", "[ProfileJson] IS NULL OR ISJSON([ProfileJson]) = 1");
                t.HasCheckConstraint("CK_AspNetUsers_5", "[PreferencesJson] IS NULL OR ISJSON([PreferencesJson]) = 1");
                t.HasCheckConstraint("CK_AspNetUsers_6", "[SettingsJson] IS NULL OR ISJSON([SettingsJson]) = 1");
                t.HasCheckConstraint("CK_AspNetUsers_7", "([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL AND [Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180)");
                t.HasCheckConstraint("CK_AspNetUsers_8", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.UserName).HasColumnType("nvarchar(256)").HasMaxLength(256).IsRequired();
            e.Property(x => x.NormalizedUserName).HasColumnType("nvarchar(256)").HasMaxLength(256).IsRequired();
            e.Property(x => x.Email).HasColumnType("nvarchar(256)").HasMaxLength(256).IsRequired();
            e.Property(x => x.NormalizedEmail).HasColumnType("nvarchar(256)").HasMaxLength(256).IsRequired();
            e.Property(x => x.EmailConfirmed).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.PasswordHash).HasColumnType("nvarchar(max)");
            e.Property(x => x.SecurityStamp).HasColumnType("nvarchar(max)");
            e.Property(x => x.ConcurrencyStamp).HasColumnType("nvarchar(max)");
            e.Property(x => x.PhoneNumber).HasColumnType("nvarchar(50)").HasMaxLength(50);
            e.Property(x => x.PhoneNumberConfirmed).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.TwoFactorEnabled).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.LockoutEnd).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.LockoutEnabled).HasColumnType("bit").IsRequired().HasDefaultValue(true);
            e.Property(x => x.AccessFailedCount).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.Property(x => x.Name).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.ContactPhone).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired().HasDefaultValue("pending");
            e.Property(x => x.ApprovalStatus).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.RequiresInitialSetup).HasColumnType("bit");
            e.Property(x => x.Type).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.OrganizationType).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.OrganizationCategory).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.City).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Address).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Latitude).HasColumnType("decimal(10,7)");
            e.Property(x => x.Longitude).HasColumnType("decimal(10,7)");
            e.Property(x => x.CountryCode).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Governorate).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.GooglePlaceId).HasColumnType("nvarchar(128)").HasMaxLength(128);
            e.Property(x => x.Website).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.AccessibilityPreferencesJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.ProfileJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.PreferencesJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.SettingsJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.RepresentativeName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.JobTitle).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.ManagerName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.ManagerPosition).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.ManagerEmail).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.ManagerPhone).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.RegistrationNumber).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Logo).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.DocumentName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.DocumentId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.DocumentStatus).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.RoleCode).HasColumnType("nvarchar(20)").HasMaxLength(20).IsRequired().HasDefaultValue("User");
            e.Property(x => x.BlockedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.BlockedById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.BlockReason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.TermsAcceptedAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.NormalizedEmail }).HasDatabaseName("IX_AspNetUsers_0").IsUnique().HasFilter("[NormalizedEmail] IS NOT NULL");
            e.HasIndex(x => new { x.NormalizedUserName }).HasDatabaseName("IX_AspNetUsers_1").IsUnique().HasFilter("[NormalizedUserName] IS NOT NULL");
            e.HasIndex(x => new { x.BlockedById }).HasDatabaseName("IX_AspNetUsers_2");
            e.HasIndex(x => new { x.DocumentId }).HasDatabaseName("IX_AspNetUsers_3");
            e.HasOne(x => x.BlockedBy).WithMany().HasForeignKey(x => new { x.BlockedById }).HasConstraintName("FK_AspNetUsers_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.RegistrationDocument).WithMany().HasForeignKey(x => new { x.DocumentId }).HasConstraintName("FK_AspNetUsers_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<IdentityRole>(e =>
        {
            e.ToTable("AspNetRoles", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(256)").HasMaxLength(256);
            e.Property(x => x.NormalizedName).HasColumnType("nvarchar(256)").HasMaxLength(256);
            e.Property(x => x.ConcurrencyStamp).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.NormalizedName }).HasDatabaseName("IX_AspNetRoles_0").IsUnique().HasFilter("[NormalizedName] IS NOT NULL");
        });
        b.Entity<IdentityUserRole<string>>(e =>
        {
            e.ToTable("AspNetUserRoles", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.UserId, x.RoleId });
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.RoleId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.RoleId }).HasDatabaseName("IX_AspNetUserRoles_0");
            e.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_AspNetUserRoles_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne<IdentityRole>().WithMany().HasForeignKey(x => new { x.RoleId }).HasConstraintName("FK_AspNetUserRoles_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<IdentityUserClaim<string>>(e =>
        {
            e.ToTable("AspNetUserClaims", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).UseIdentityColumn();
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ClaimType).HasColumnType("nvarchar(max)");
            e.Property(x => x.ClaimValue).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.UserId }).HasDatabaseName("IX_AspNetUserClaims_0");
            e.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_AspNetUserClaims_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<IdentityRoleClaim<string>>(e =>
        {
            e.ToTable("AspNetRoleClaims", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).UseIdentityColumn();
            e.Property(x => x.RoleId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ClaimType).HasColumnType("nvarchar(max)");
            e.Property(x => x.ClaimValue).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.RoleId }).HasDatabaseName("IX_AspNetRoleClaims_0");
            e.HasOne<IdentityRole>().WithMany().HasForeignKey(x => new { x.RoleId }).HasConstraintName("FK_AspNetRoleClaims_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<IdentityUserLogin<string>>(e =>
        {
            e.ToTable("AspNetUserLogins", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.LoginProvider, x.ProviderKey });
            e.Property(x => x.LoginProvider).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ProviderKey).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ProviderDisplayName).HasColumnType("nvarchar(max)");
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.UserId }).HasDatabaseName("IX_AspNetUserLogins_0");
            e.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_AspNetUserLogins_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<IdentityUserToken<string>>(e =>
        {
            e.ToTable("AspNetUserTokens", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.UserId, x.LoginProvider, x.Name });
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.LoginProvider).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Value).HasColumnType("nvarchar(max)");
            e.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_AspNetUserTokens_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Organization>(e =>
        {
            e.ToTable("Organizations", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Organizations_0", "[Id] = [AccountId]");
                t.HasCheckConstraint("CK_Organizations_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.HoursRevision).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.Property(x => x.HoursUpdatedAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.AccountId }).HasDatabaseName("IX_Organizations_0").IsUnique();
            e.HasOne(x => x.Account).WithOne(x => x.Organization).HasForeignKey<Organization>(x => new { x.AccountId }).HasConstraintName("FK_Organizations_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<OrganizationMembership>(e =>
        {
            e.ToTable("OrganizationMemberships", "dbo", t =>
            {
                t.HasCheckConstraint("CK_OrganizationMemberships_0", "[Role] IN (N'owner',N'manager',N'staff')");
                t.HasCheckConstraint("CK_OrganizationMemberships_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Role).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired().HasDefaultValue("owner");
            e.Property(x => x.Active).HasColumnType("bit").IsRequired().HasDefaultValue(true);
            e.HasIndex(x => new { x.OrganizationId, x.AccountId }).HasDatabaseName("IX_OrganizationMemberships_0").IsUnique();
            e.HasIndex(x => new { x.AccountId }).HasDatabaseName("IX_OrganizationMemberships_1");
            e.HasOne(x => x.Organization).WithMany(x => x.Memberships).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_OrganizationMemberships_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Account).WithMany(x => x.Memberships).HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_OrganizationMemberships_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<OrganizationApplication>(e =>
        {
            e.ToTable("OrganizationApplications", "dbo", t =>
            {
                t.HasCheckConstraint("CK_OrganizationApplications_0", "[SnapshotJson] IS NULL OR ISJSON([SnapshotJson]) = 1");
                t.HasCheckConstraint("CK_OrganizationApplications_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired().HasDefaultValue("pending");
            e.Property(x => x.SubmittedById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ReviewedById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.ReviewedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.Reason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.SnapshotJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_OrganizationApplications_0");
            e.HasIndex(x => new { x.SubmittedById }).HasDatabaseName("IX_OrganizationApplications_1");
            e.HasIndex(x => new { x.ReviewedById }).HasDatabaseName("IX_OrganizationApplications_2");
            e.HasOne(x => x.Organization).WithMany(x => x.Applications).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_OrganizationApplications_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.SubmittedBy).WithMany().HasForeignKey(x => new { x.SubmittedById }).HasConstraintName("FK_OrganizationApplications_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.ReviewedBy).WithMany().HasForeignKey(x => new { x.ReviewedById }).HasConstraintName("FK_OrganizationApplications_2").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Branch>(e =>
        {
            e.ToTable("Branches", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Branches_0", "[Status] IN (N'draft',N'pending',N'approved',N'published',N'rejected',N'suspended',N'changes-requested')");
                t.HasCheckConstraint("CK_Branches_1", "[AccessibilityScore] IS NULL OR [AccessibilityScore] BETWEEN 0 AND 100");
                t.HasCheckConstraint("CK_Branches_2", "[AccessibilityFeaturesJson] IS NULL OR ISJSON([AccessibilityFeaturesJson]) = 1");
                t.HasCheckConstraint("CK_Branches_3", "[OperationalAvailabilityJson] IS NULL OR ISJSON([OperationalAvailabilityJson]) = 1");
                t.HasCheckConstraint("CK_Branches_4", "[BookingConfigurationJson] IS NULL OR ISJSON([BookingConfigurationJson]) = 1");
                t.HasCheckConstraint("CK_Branches_5", "[ClosuresJson] IS NULL OR ISJSON([ClosuresJson]) = 1");
                t.HasCheckConstraint("CK_Branches_6", "([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL AND [Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180)");
                t.HasCheckConstraint("CK_Branches_7", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.HasAlternateKey(x => new { x.Id, x.OrganizationId }).HasName("AK_Branches_0");
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Name).HasColumnType("nvarchar(120)").HasMaxLength(120).IsRequired();
            e.Property(x => x.BranchType).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Type).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Description).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Phone).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Email).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.City).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.District).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Area).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Address).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Latitude).HasColumnType("decimal(10,7)");
            e.Property(x => x.Longitude).HasColumnType("decimal(10,7)");
            e.Property(x => x.CountryCode).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Governorate).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.GooglePlaceId).HasColumnType("nvarchar(128)").HasMaxLength(128);
            e.Property(x => x.AccessibilityFeaturesJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.OperationalAvailabilityJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.AccessibilityScore).HasColumnType("decimal(18,6)");
            e.Property(x => x.Score).HasColumnType("decimal(18,6)");
            e.Property(x => x.ScoreSource).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.EvidenceStatus).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.IsPublished).HasColumnType("bit");
            e.Property(x => x.ReviewedBy).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.ReviewedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ApprovedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.SubmittedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.StatusUpdatedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.AdminFeedback).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.HoursRevision).HasColumnType("int").IsRequired();
            e.Property(x => x.HoursUpdatedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.TicketServicesConfigured).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.BookingConfigurationJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.ClosuresJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.DetailsCompleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.HoursCompleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.AccessibilityCompleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.PhotosCompleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.AiReviewCompleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.CurrentAnalysisId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.HasIndex(x => new { x.OrganizationId, x.Status, x.IsDeleted }).HasDatabaseName("IX_Branches_0");
            e.HasIndex(x => new { x.ReviewedBy }).HasDatabaseName("IX_Branches_1");
            e.HasIndex(x => new { x.CurrentAnalysisId, x.Id }).HasDatabaseName("IX_Branches_2");
            e.HasOne(x => x.Organization).WithMany(x => x.Branches).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_Branches_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Reviewer).WithMany().HasForeignKey(x => new { x.ReviewedBy }).HasConstraintName("FK_Branches_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.CurrentAnalysis).WithMany().HasForeignKey(x => new { x.CurrentAnalysisId, x.Id }).HasPrincipalKey(x => new { x.Id, x.BranchId }).HasConstraintName("FK_Branches_2").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<OrganizationHours>(e =>
        {
            e.ToTable("OrganizationHours", "dbo", t =>
            {
                t.HasCheckConstraint("CK_OrganizationHours_0", "[DayOfWeek] BETWEEN 0 AND 6");
                t.HasCheckConstraint("CK_OrganizationHours_1", "([IsOpen] = 0 AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([IsOpen] = 1 AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])");
                t.HasCheckConstraint("CK_OrganizationHours_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.DayOfWeek).HasColumnType("tinyint").IsRequired();
            e.Property(x => x.IsOpen).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.OpenTime).HasColumnType("time(0)");
            e.Property(x => x.CloseTime).HasColumnType("time(0)");
            e.HasIndex(x => new { x.OrganizationId, x.DayOfWeek }).HasDatabaseName("IX_OrganizationHours_0").IsUnique();
            e.HasOne(x => x.Organization).WithMany(x => x.WorkingHours).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_OrganizationHours_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<OrganizationSpecialDate>(e =>
        {
            e.ToTable("OrganizationSpecialDates", "dbo", t =>
            {
                t.HasCheckConstraint("CK_OrganizationSpecialDates_0", "([Status] = N'closed' AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([Status] = N'custom' AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])");
                t.HasCheckConstraint("CK_OrganizationSpecialDates_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Date).HasColumnType("date").IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(20)").HasMaxLength(20).IsRequired();
            e.Property(x => x.OpenTime).HasColumnType("time(0)");
            e.Property(x => x.CloseTime).HasColumnType("time(0)");
            e.Property(x => x.Note).HasColumnType("nvarchar(300)").HasMaxLength(300);
            e.HasIndex(x => new { x.OrganizationId, x.Date }).HasDatabaseName("IX_OrganizationSpecialDates_0").IsUnique();
            e.HasOne(x => x.Organization).WithMany(x => x.SpecialDates).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_OrganizationSpecialDates_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchHours>(e =>
        {
            e.ToTable("BranchHours", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchHours_0", "[DayOfWeek] BETWEEN 0 AND 6");
                t.HasCheckConstraint("CK_BranchHours_1", "([IsOpen] = 0 AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([IsOpen] = 1 AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])");
                t.HasCheckConstraint("CK_BranchHours_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.DayOfWeek).HasColumnType("tinyint").IsRequired();
            e.Property(x => x.IsOpen).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.OpenTime).HasColumnType("time(0)");
            e.Property(x => x.CloseTime).HasColumnType("time(0)");
            e.HasIndex(x => new { x.BranchId, x.DayOfWeek }).HasDatabaseName("IX_BranchHours_0").IsUnique();
            e.HasOne(x => x.Branch).WithMany(x => x.WorkingHours).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchHours_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchSpecialDate>(e =>
        {
            e.ToTable("BranchSpecialDates", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchSpecialDates_0", "([Status] = N'closed' AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([Status] = N'custom' AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])");
                t.HasCheckConstraint("CK_BranchSpecialDates_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Date).HasColumnType("date").IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(20)").HasMaxLength(20).IsRequired();
            e.Property(x => x.OpenTime).HasColumnType("time(0)");
            e.Property(x => x.CloseTime).HasColumnType("time(0)");
            e.Property(x => x.Note).HasColumnType("nvarchar(300)").HasMaxLength(300);
            e.HasIndex(x => new { x.BranchId, x.Date }).HasDatabaseName("IX_BranchSpecialDates_0").IsUnique();
            e.HasOne(x => x.Branch).WithMany(x => x.SpecialDates).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchSpecialDates_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchService>(e =>
        {
            e.ToTable("BranchServices", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchServices_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.HasAlternateKey(x => new { x.Id, x.BranchId }).HasName("AK_BranchServices_0");
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(120)").HasMaxLength(120).IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Active).HasColumnType("bit").IsRequired().HasDefaultValue(true);
            e.Property(x => x.Available).HasColumnType("bit").IsRequired().HasDefaultValue(true);
            e.Property(x => x.NormalizedName).HasColumnType("nvarchar(120)").HasMaxLength(120).IsRequired();
            e.HasIndex(x => new { x.BranchId, x.NormalizedName }).HasDatabaseName("IX_BranchServices_0").IsUnique().HasFilter("[IsDeleted] = 0");
            e.HasOne(x => x.Branch).WithMany(x => x.TicketServices).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchServices_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchLegacyService>(e =>
        {
            e.ToTable("BranchLegacyServices", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchLegacyServices_0", "[LegacyPayloadJson] IS NULL OR ISJSON([LegacyPayloadJson]) = 1");
                t.HasCheckConstraint("CK_BranchLegacyServices_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(120)").HasMaxLength(120).IsRequired();
            e.Property(x => x.SortOrder).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.Property(x => x.LegacyPayloadJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.BranchId, x.Name }).HasDatabaseName("IX_BranchLegacyServices_0").IsUnique();
            e.HasOne(x => x.Branch).WithMany(x => x.LegacyServices).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchLegacyServices_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchDestination>(e =>
        {
            e.ToTable("BranchDestinations", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchDestinations_0", "[LegacyPayloadJson] IS NULL OR ISJSON([LegacyPayloadJson]) = 1");
                t.HasCheckConstraint("CK_BranchDestinations_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(120)").HasMaxLength(120).IsRequired();
            e.Property(x => x.SortOrder).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.Property(x => x.LegacyPayloadJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.BranchId, x.Name }).HasDatabaseName("IX_BranchDestinations_0").IsUnique();
            e.HasOne(x => x.Branch).WithMany(x => x.Destinations).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchDestinations_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<AccessibilityRequirement>(e =>
        {
            e.ToTable("AccessibilityRequirements", "dbo", t =>
            {
                t.HasCheckConstraint("CK_AccessibilityRequirements_0", "[Weight] >= 0");
                t.HasCheckConstraint("CK_AccessibilityRequirements_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Key).HasColumnType("nvarchar(100)").HasMaxLength(100).IsRequired();
            e.Property(x => x.Title).HasColumnType("nvarchar(200)").HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.Icon).HasColumnType("nvarchar(100)").HasMaxLength(100);
            e.Property(x => x.Category).HasColumnType("nvarchar(100)").HasMaxLength(100);
            e.Property(x => x.Weight).HasColumnType("decimal(9,4)").IsRequired().HasDefaultValueSql("1");
            e.Property(x => x.Required).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.Enabled).HasColumnType("bit").IsRequired().HasDefaultValue(true);
            e.HasIndex(x => new { x.Key }).HasDatabaseName("IX_AccessibilityRequirements_0").IsUnique();
        });
        b.Entity<BranchAccessibility>(e =>
        {
            e.ToTable("BranchAccessibility", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchAccessibility_0", "[Value] IN (N'available',N'not-available',N'not-sure',N'yes',N'no',N'unknown')");
                t.HasCheckConstraint("CK_BranchAccessibility_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.RequirementId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Value).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired();
            e.Property(x => x.Notes).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.HasIndex(x => new { x.BranchId, x.RequirementId }).HasDatabaseName("IX_BranchAccessibility_0").IsUnique();
            e.HasIndex(x => new { x.RequirementId }).HasDatabaseName("IX_BranchAccessibility_1");
            e.HasOne(x => x.Branch).WithMany(x => x.Accessibility).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchAccessibility_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Requirement).WithMany().HasForeignKey(x => new { x.RequirementId }).HasConstraintName("FK_BranchAccessibility_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Document>(e =>
        {
            e.ToTable("Documents", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Documents_0", "[Size] >= 0");
                t.HasCheckConstraint("CK_Documents_1", "[Status] IN (N'uploaded',N'preview-only',N'approved',N'rejected')");
                t.HasCheckConstraint("CK_Documents_2", "[MetadataJson] IS NULL OR ISJSON([MetadataJson]) = 1");
                t.HasCheckConstraint("CK_Documents_3", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OwnerId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.CategoryKey).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Purpose).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Name).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.FileName).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Url).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Type).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Size).HasColumnType("int").IsRequired();
            e.Property(x => x.Uploaded).HasColumnType("bit");
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.MetadataJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.OwnerId, x.CreatedAt }).HasDatabaseName("IX_Documents_0");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_Documents_1");
            e.HasIndex(x => new { x.BranchId }).HasDatabaseName("IX_Documents_2");
            e.HasOne(x => x.Owner).WithMany(x => x.Documents).HasForeignKey(x => new { x.OwnerId }).HasConstraintName("FK_Documents_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Organization).WithMany().HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_Documents_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_Documents_2").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchPhoto>(e =>
        {
            e.ToTable("BranchPhotos", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchPhotos_0", "[CategoryKey] IN (N'main-entrance',N'entrance-route',N'internal-pathway',N'destination-area')");
                t.HasCheckConstraint("CK_BranchPhotos_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.CategoryKey).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.CategoryTitle).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Name).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Type).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Size).HasColumnType("int");
            e.Property(x => x.OriginalSize).HasColumnType("int");
            e.Property(x => x.CompressionSavedBytes).HasColumnType("int");
            e.Property(x => x.Url).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Uploaded).HasColumnType("bit");
            e.Property(x => x.UploadedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.DocumentId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.SortOrder).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.HasIndex(x => new { x.BranchId, x.CategoryKey }).HasDatabaseName("IX_BranchPhotos_0");
            e.HasIndex(x => new { x.DocumentId }).HasDatabaseName("IX_BranchPhotos_1");
            e.HasOne(x => x.Branch).WithMany(x => x.Photos).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchPhotos_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Document).WithMany().HasForeignKey(x => new { x.DocumentId }).HasConstraintName("FK_BranchPhotos_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BranchAnalysis>(e =>
        {
            e.ToTable("BranchAnalyses", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BranchAnalyses_0", "[Score] IS NULL OR [Score] BETWEEN 0 AND 100");
                t.HasCheckConstraint("CK_BranchAnalyses_1", "[Confidence] IS NULL OR [Confidence] BETWEEN 0 AND 1");
                t.HasCheckConstraint("CK_BranchAnalyses_2", "[FindingsJson] IS NULL OR ISJSON([FindingsJson]) = 1");
                t.HasCheckConstraint("CK_BranchAnalyses_3", "[RecommendationsJson] IS NULL OR ISJSON([RecommendationsJson]) = 1");
                t.HasCheckConstraint("CK_BranchAnalyses_4", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.HasAlternateKey(x => new { x.Id, x.BranchId }).HasName("AK_BranchAnalyses_0");
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Score).HasColumnType("decimal(18,6)");
            e.Property(x => x.Confidence).HasColumnType("decimal(18,6)");
            e.Property(x => x.Source).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.IsDemo).HasColumnType("bit");
            e.Property(x => x.Model).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.GeneratedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.Message).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.FindingsJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.RecommendationsJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.BranchId, x.GeneratedAt }).HasDatabaseName("IX_BranchAnalyses_0");
            e.HasOne(x => x.Branch).WithMany(x => x.Analyses).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_BranchAnalyses_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Booking>(e =>
        {
            e.ToTable("Bookings", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Bookings_0", "[DurationMinutes] BETWEEN 15 AND 120");
                t.HasCheckConstraint("CK_Bookings_1", "[TimeZone] = N'Asia/Amman'");
                t.HasCheckConstraint("CK_Bookings_2", "[Status] IN (N'pending',N'confirmed',N'in-progress',N'completed',N'cancelled',N'no-show',N'waitlisted')");
                t.HasCheckConstraint("CK_Bookings_3", "[JourneyState] IN (N'not-started',N'on-the-way',N'arrived',N'serving',N'completed',N'cancelled',N'no-show')");
                t.HasCheckConstraint("CK_Bookings_4", "[SupportJson] IS NULL OR ISJSON([SupportJson]) = 1");
                t.HasCheckConstraint("CK_Bookings_5", "[LocationSnapshotJson] IS NULL OR ISJSON([LocationSnapshotJson]) = 1");
                t.HasCheckConstraint("CK_Bookings_6", "[ScheduleBlockedJson] IS NULL OR ISJSON([ScheduleBlockedJson]) = 1");
                t.HasCheckConstraint("CK_Bookings_7", "[ServiceSnapshotJson] IS NULL OR ISJSON([ServiceSnapshotJson]) = 1");
                t.HasCheckConstraint("CK_Bookings_8", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.HasAlternateKey(x => new { x.Id, x.UserId, x.BranchId }).HasName("AK_Bookings_0");
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.VisitDate).HasColumnType("date").IsRequired();
            e.Property(x => x.VisitTime).HasColumnType("time(0)").IsRequired();
            e.Property(x => x.TimeZone).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired().HasDefaultValue("Asia/Amman");
            e.Property(x => x.RequiresAssistant).HasColumnType("bit");
            e.Property(x => x.SupportJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.DurationMinutes).HasColumnType("int").IsRequired().HasDefaultValue(30);
            e.Property(x => x.Purpose).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.VisitPurpose).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.Destination).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.GuidanceMethod).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Reason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.Reference).HasColumnType("nvarchar(80)").HasMaxLength(80).IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired().HasDefaultValue("pending");
            e.Property(x => x.JourneyState).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired().HasDefaultValue("not-started");
            e.Property(x => x.LocationSnapshotJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.DepartedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ArrivedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ReceivedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.CompletedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.CancelledAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.CalledAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.CancellationReason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.ScheduleBlockedJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.QrUsedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ScheduleConflict).HasColumnType("bit");
            e.Property(x => x.ScheduleConflictAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ServiceId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.ServiceName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.ServiceSnapshotJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.QueueNumber).HasColumnType("int");
            e.Property(x => x.QueueCalledById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.QueueCalledAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.Reference }).HasDatabaseName("IX_Bookings_0").IsUnique();
            e.HasIndex(x => new { x.BranchId, x.VisitDate, x.VisitTime, x.Status }).HasDatabaseName("IX_Bookings_1");
            e.HasIndex(x => new { x.UserId, x.VisitDate, x.Status }).HasDatabaseName("IX_Bookings_2");
            e.HasIndex(x => new { x.BranchId, x.VisitDate, x.QueueNumber }).HasDatabaseName("IX_Bookings_3").IsUnique().HasFilter("[QueueNumber] IS NOT NULL AND [IsDeleted] = 0");
            e.HasIndex(x => new { x.BranchId, x.OrganizationId }).HasDatabaseName("IX_Bookings_4");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_Bookings_5");
            e.HasIndex(x => new { x.ServiceId, x.BranchId }).HasDatabaseName("IX_Bookings_6");
            e.HasIndex(x => new { x.QueueCalledById }).HasDatabaseName("IX_Bookings_7");
            e.HasOne(x => x.Branch).WithMany(x => x.Bookings).HasForeignKey(x => new { x.BranchId, x.OrganizationId }).HasPrincipalKey(x => new { x.Id, x.OrganizationId }).HasConstraintName("FK_Bookings_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Organization).WithMany().HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_Bookings_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.User).WithMany(x => x.Bookings).HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_Bookings_2").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Service).WithMany().HasForeignKey(x => new { x.ServiceId, x.BranchId }).HasPrincipalKey(x => new { x.Id, x.BranchId }).HasConstraintName("FK_Bookings_3").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.QueueCalledBy).WithMany().HasForeignKey(x => new { x.QueueCalledById }).HasConstraintName("FK_Bookings_4").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<BookingHistory>(e =>
        {
            e.ToTable("BookingHistory", "dbo", t =>
            {
                t.HasCheckConstraint("CK_BookingHistory_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Event).HasColumnType("nvarchar(80)").HasMaxLength(80).IsRequired();
            e.Property(x => x.FromState).HasColumnType("nvarchar(30)").HasMaxLength(30);
            e.Property(x => x.ToState).HasColumnType("nvarchar(30)").HasMaxLength(30);
            e.Property(x => x.ActorId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.ActorRole).HasColumnType("nvarchar(20)").HasMaxLength(20);
            e.Property(x => x.ActorName).HasColumnType("nvarchar(120)").HasMaxLength(120);
            e.Property(x => x.Reason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.At).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.BookingId, x.At }).HasDatabaseName("IX_BookingHistory_0");
            e.HasIndex(x => new { x.ActorId }).HasDatabaseName("IX_BookingHistory_1");
            e.HasOne(x => x.Booking).WithMany(x => x.JourneyHistory).HasForeignKey(x => new { x.BookingId }).HasConstraintName("FK_BookingHistory_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Actor).WithMany().HasForeignKey(x => new { x.ActorId }).HasConstraintName("FK_BookingHistory_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<AppointmentProposal>(e =>
        {
            e.ToTable("AppointmentProposals", "dbo", t =>
            {
                t.HasCheckConstraint("CK_AppointmentProposals_0", "[Status] IN (N'pending',N'accepted',N'rejected',N'expired',N'superseded')");
                t.HasCheckConstraint("CK_AppointmentProposals_1", "[DurationMinutes] BETWEEN 15 AND 120");
                t.HasCheckConstraint("CK_AppointmentProposals_2", "[ServiceSnapshotJson] IS NULL OR ISJSON([ServiceSnapshotJson]) = 1");
                t.HasCheckConstraint("CK_AppointmentProposals_3", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ServiceId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.ServiceName).HasColumnType("nvarchar(120)").HasMaxLength(120);
            e.Property(x => x.ServiceSnapshotJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.VisitDate).HasColumnType("date").IsRequired();
            e.Property(x => x.VisitTime).HasColumnType("time(0)").IsRequired();
            e.Property(x => x.RequiresAssistant).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.DurationMinutes).HasColumnType("int").IsRequired().HasDefaultValue(30);
            e.Property(x => x.Reason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.ExpiresAt).HasColumnType("datetimeoffset(7)").IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired().HasDefaultValue("pending");
            e.Property(x => x.RespondedAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.BookingId }).HasDatabaseName("IX_AppointmentProposals_0").IsUnique().HasFilter("[Status] = N'pending' AND [IsDeleted] = 0");
            e.HasIndex(x => new { x.BranchId, x.OrganizationId }).HasDatabaseName("IX_AppointmentProposals_1");
            e.HasIndex(x => new { x.UserId }).HasDatabaseName("IX_AppointmentProposals_2");
            e.HasIndex(x => new { x.ServiceId, x.BranchId }).HasDatabaseName("IX_AppointmentProposals_3");
            e.HasOne(x => x.Booking).WithMany(x => x.AppointmentProposals).HasForeignKey(x => new { x.BookingId }).HasConstraintName("FK_AppointmentProposals_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => new { x.BranchId, x.OrganizationId }).HasPrincipalKey(x => new { x.Id, x.OrganizationId }).HasConstraintName("FK_AppointmentProposals_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_AppointmentProposals_2").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Service).WithMany().HasForeignKey(x => new { x.ServiceId, x.BranchId }).HasPrincipalKey(x => new { x.Id, x.BranchId }).HasConstraintName("FK_AppointmentProposals_3").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<VisitPass>(e =>
        {
            e.ToTable("VisitPasses", "dbo", t =>
            {
                t.HasCheckConstraint("CK_VisitPasses_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.TokenHash).HasColumnType("binary(32)").IsRequired();
            e.Property(x => x.ExpiresAt).HasColumnType("datetimeoffset(7)").IsRequired();
            e.Property(x => x.VerifiedById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.VerifiedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.UsedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.RevokedAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.TokenHash }).HasDatabaseName("IX_VisitPasses_0").IsUnique();
            e.HasIndex(x => new { x.BookingId }).HasDatabaseName("IX_VisitPasses_1").IsUnique().HasFilter("[RevokedAt] IS NULL AND [UsedAt] IS NULL AND [IsDeleted] = 0");
            e.HasIndex(x => new { x.VerifiedById }).HasDatabaseName("IX_VisitPasses_2");
            e.HasOne(x => x.Booking).WithMany(x => x.Passes).HasForeignKey(x => new { x.BookingId }).HasConstraintName("FK_VisitPasses_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.VerifiedBy).WithMany().HasForeignKey(x => new { x.VerifiedById }).HasConstraintName("FK_VisitPasses_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Review>(e =>
        {
            e.ToTable("Reviews", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Reviews_0", "[Rating] BETWEEN 1 AND 5");
                t.HasCheckConstraint("CK_Reviews_1", "[Status] IN (N'Pending',N'Visible',N'Hidden',N'Rejected')");
                t.HasCheckConstraint("CK_Reviews_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Rating).HasColumnType("int").IsRequired();
            e.Property(x => x.Comment).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Title).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Flagged).HasColumnType("bit");
            e.Property(x => x.ModerationLocked).HasColumnType("bit");
            e.Property(x => x.ApprovedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ApprovedBy).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.UserId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.BookingId }).HasDatabaseName("IX_Reviews_0").IsUnique().HasFilter("[IsDeleted] = 0");
            e.HasIndex(x => new { x.BranchId, x.Status, x.IsDeleted }).HasDatabaseName("IX_Reviews_1");
            e.HasIndex(x => new { x.BookingId, x.UserId, x.BranchId }).HasDatabaseName("IX_Reviews_2");
            e.HasIndex(x => new { x.UserId }).HasDatabaseName("IX_Reviews_3");
            e.HasIndex(x => new { x.ApprovedBy }).HasDatabaseName("IX_Reviews_4");
            e.HasOne(x => x.Booking).WithMany(x => x.Reviews).HasForeignKey(x => new { x.BookingId, x.UserId, x.BranchId }).HasPrincipalKey(x => new { x.Id, x.UserId, x.BranchId }).HasConstraintName("FK_Reviews_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.User).WithMany(x => x.Reviews).HasForeignKey(x => new { x.UserId }).HasConstraintName("FK_Reviews_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany(x => x.Reviews).HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_Reviews_2").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Moderator).WithMany().HasForeignKey(x => new { x.ApprovedBy }).HasConstraintName("FK_Reviews_3").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<SupportTicket>(e =>
        {
            e.ToTable("SupportTickets", "dbo", t =>
            {
                t.HasCheckConstraint("CK_SupportTickets_0", "[Kind] IN (N'support',N'accessibility-report',N'place-suggestion')");
                t.HasCheckConstraint("CK_SupportTickets_1", "[Status] IN (N'Open',N'In Progress',N'Resolved',N'Closed')");
                t.HasCheckConstraint("CK_SupportTickets_2", "[Priority] IN (N'Low',N'Medium',N'High',N'Urgent')");
                t.HasCheckConstraint("CK_SupportTickets_3", "[DetailsJson] IS NULL OR ISJSON([DetailsJson]) = 1");
                t.HasCheckConstraint("CK_SupportTickets_4", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.RequesterId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Kind).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Subject).HasColumnType("nvarchar(200)").HasMaxLength(200);
            e.Property(x => x.Title).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Description).HasColumnType("nvarchar(2000)").HasMaxLength(2000);
            e.Property(x => x.Category).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.IssueType).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Priority).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.AssignedTo).HasColumnType("nvarchar(500)").HasMaxLength(500).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.PlaceName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.City).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Address).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.DetailsJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.RequesterId, x.Status }).HasDatabaseName("IX_SupportTickets_0");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_SupportTickets_1");
            e.HasIndex(x => new { x.BranchId }).HasDatabaseName("IX_SupportTickets_2");
            e.HasIndex(x => new { x.AssignedTo }).HasDatabaseName("IX_SupportTickets_3");
            e.HasOne(x => x.Requester).WithMany(x => x.SupportTickets).HasForeignKey(x => new { x.RequesterId }).HasConstraintName("FK_SupportTickets_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Organization).WithMany().HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_SupportTickets_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_SupportTickets_2").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Assignee).WithMany().HasForeignKey(x => new { x.AssignedTo }).HasConstraintName("FK_SupportTickets_3").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<TicketMessage>(e =>
        {
            e.ToTable("TicketMessages", "dbo", t =>
            {
                t.HasCheckConstraint("CK_TicketMessages_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.TicketId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ActorId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Message).HasColumnType("nvarchar(4000)").HasMaxLength(4000).IsRequired();
            e.Property(x => x.ActorName).HasColumnType("nvarchar(120)").HasMaxLength(120);
            e.Property(x => x.ActorRole).HasColumnType("nvarchar(20)").HasMaxLength(20);
            e.HasIndex(x => new { x.TicketId, x.CreatedAt }).HasDatabaseName("IX_TicketMessages_0");
            e.HasIndex(x => new { x.ActorId }).HasDatabaseName("IX_TicketMessages_1");
            e.HasOne(x => x.Ticket).WithMany(x => x.Messages).HasForeignKey(x => new { x.TicketId }).HasConstraintName("FK_TicketMessages_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Actor).WithMany().HasForeignKey(x => new { x.ActorId }).HasConstraintName("FK_TicketMessages_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<TicketAttachment>(e =>
        {
            e.ToTable("TicketAttachments", "dbo", t =>
            {
                t.HasCheckConstraint("CK_TicketAttachments_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.TicketId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.DocumentId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.TicketId, x.DocumentId }).HasDatabaseName("IX_TicketAttachments_0").IsUnique();
            e.HasIndex(x => new { x.DocumentId }).HasDatabaseName("IX_TicketAttachments_1");
            e.HasOne(x => x.Ticket).WithMany(x => x.Attachments).HasForeignKey(x => new { x.TicketId }).HasConstraintName("FK_TicketAttachments_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Document).WithMany().HasForeignKey(x => new { x.DocumentId }).HasConstraintName("FK_TicketAttachments_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Plan>(e =>
        {
            e.ToTable("Plans", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Plans_0", "[MonthlyPrice] >= 0 AND [AnnualDiscount] BETWEEN 0 AND 1 AND [BranchLimit] > 0");
                t.HasCheckConstraint("CK_Plans_1", "[FeaturesJson] IS NULL OR ISJSON([FeaturesJson]) = 1");
                t.HasCheckConstraint("CK_Plans_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Name).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.MonthlyPrice).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(x => x.AnnualDiscount).HasColumnType("decimal(18,6)").IsRequired();
            e.Property(x => x.BranchLimit).HasColumnType("int").IsRequired();
            e.Property(x => x.Currency).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Active).HasColumnType("bit").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.FeaturesJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.Name }).HasDatabaseName("IX_Plans_0").IsUnique();
        });
        b.Entity<Subscription>(e =>
        {
            e.ToTable("Subscriptions", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Subscriptions_0", "[Status] IN (N'Active',N'Inactive',N'Cancelled',N'Expired',N'Pending')");
                t.HasCheckConstraint("CK_Subscriptions_1", "[BillingCycle] IN (N'monthly',N'annual')");
                t.HasCheckConstraint("CK_Subscriptions_2", "[Price] >= 0 AND [BranchLimit] > 0");
                t.HasCheckConstraint("CK_Subscriptions_3", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.PlanId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.PlanName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.BillingCycle).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.BranchLimit).HasColumnType("int").IsRequired();
            e.Property(x => x.Price).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(x => x.Currency).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.StartDate).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.RenewalDate).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.EndDate).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.AutoRenew).HasColumnType("bit");
            e.Property(x => x.PaymentStatus).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.DevelopmentOnly).HasColumnType("bit");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_Subscriptions_0").IsUnique().HasFilter("[Status] = N'Active' AND [IsDeleted] = 0");
            e.HasIndex(x => new { x.PlanId }).HasDatabaseName("IX_Subscriptions_1");
            e.HasOne(x => x.Organization).WithMany(x => x.Subscriptions).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_Subscriptions_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Plan).WithMany().HasForeignKey(x => new { x.PlanId }).HasConstraintName("FK_Subscriptions_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<PaymentOperation>(e =>
        {
            e.ToTable("PaymentOperations", "dbo", t =>
            {
                t.HasCheckConstraint("CK_PaymentOperations_0", "[Amount] IS NULL OR [Amount] >= 0");
                t.HasCheckConstraint("CK_PaymentOperations_1", "[ProviderPayloadJson] IS NULL OR ISJSON([ProviderPayloadJson]) = 1");
                t.HasCheckConstraint("CK_PaymentOperations_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.SubscriptionId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Provider).HasColumnType("nvarchar(40)").HasMaxLength(40).IsRequired();
            e.Property(x => x.ProviderReference).HasColumnType("nvarchar(200)").HasMaxLength(200);
            e.Property(x => x.OperationKind).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired();
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Currency).HasColumnType("nvarchar(3)").HasMaxLength(3).IsRequired().HasDefaultValue("JOD");
            e.Property(x => x.ProviderPayloadJson).HasColumnType("nvarchar(max)");
            e.HasIndex(x => new { x.Provider, x.ProviderReference }).HasDatabaseName("IX_PaymentOperations_0").IsUnique().HasFilter("[ProviderReference] IS NOT NULL");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_PaymentOperations_1");
            e.HasIndex(x => new { x.SubscriptionId }).HasDatabaseName("IX_PaymentOperations_2");
            e.HasOne(x => x.Organization).WithMany().HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_PaymentOperations_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Subscription).WithMany().HasForeignKey(x => new { x.SubscriptionId }).HasConstraintName("FK_PaymentOperations_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<HoursChangeRequest>(e =>
        {
            e.ToTable("HoursChangeRequests", "dbo", t =>
            {
                t.HasCheckConstraint("CK_HoursChangeRequests_0", "[Status] IN (N'pending',N'approved',N'rejected',N'superseded')");
                t.HasCheckConstraint("CK_HoursChangeRequests_1", "[BeforeJson] IS NULL OR ISJSON([BeforeJson]) = 1");
                t.HasCheckConstraint("CK_HoursChangeRequests_2", "[ProposedJson] IS NULL OR ISJSON([ProposedJson]) = 1");
                t.HasCheckConstraint("CK_HoursChangeRequests_3", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.ResourceName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.BeforeJson).HasColumnType("nvarchar(max)").IsRequired();
            e.Property(x => x.ProposedJson).HasColumnType("nvarchar(max)").IsRequired();
            e.Property(x => x.BaseHoursRevision).HasColumnType("int").IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Reason).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.ReviewedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.ReviewReason).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.OrganizationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.RequestedById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ReviewedById).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.HasIndex(x => new { x.OrganizationId, x.BranchId, x.Status }).HasDatabaseName("IX_HoursChangeRequests_0");
            e.HasIndex(x => new { x.BranchId }).HasDatabaseName("IX_HoursChangeRequests_1").IsUnique().HasFilter("[BranchId] IS NOT NULL AND [Status] = N'pending' AND [IsDeleted] = 0");
            e.HasIndex(x => new { x.OrganizationId }).HasDatabaseName("IX_HoursChangeRequests_2").IsUnique().HasFilter("[BranchId] IS NULL AND [Status] = N'pending' AND [IsDeleted] = 0");
            e.HasIndex(x => new { x.BranchId, x.OrganizationId }).HasDatabaseName("IX_HoursChangeRequests_3");
            e.HasIndex(x => new { x.RequestedById }).HasDatabaseName("IX_HoursChangeRequests_4");
            e.HasIndex(x => new { x.ReviewedById }).HasDatabaseName("IX_HoursChangeRequests_5");
            e.HasOne(x => x.Organization).WithMany(x => x.HoursRequests).HasForeignKey(x => new { x.OrganizationId }).HasConstraintName("FK_HoursChangeRequests_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => new { x.BranchId, x.OrganizationId }).HasPrincipalKey(x => new { x.Id, x.OrganizationId }).HasConstraintName("FK_HoursChangeRequests_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.RequestedBy).WithMany().HasForeignKey(x => new { x.RequestedById }).HasConstraintName("FK_HoursChangeRequests_2").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.ReviewedBy).WithMany().HasForeignKey(x => new { x.ReviewedById }).HasConstraintName("FK_HoursChangeRequests_3").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<HoursAffectedBooking>(e =>
        {
            e.ToTable("HoursAffectedBookings", "dbo", t =>
            {
                t.HasCheckConstraint("CK_HoursAffectedBookings_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.HoursChangeRequestId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.HoursChangeRequestId, x.BookingId }).HasDatabaseName("IX_HoursAffectedBookings_0").IsUnique();
            e.HasIndex(x => new { x.BookingId }).HasDatabaseName("IX_HoursAffectedBookings_1");
            e.HasOne(x => x.Request).WithMany(x => x.AffectedBookings).HasForeignKey(x => new { x.HoursChangeRequestId }).HasConstraintName("FK_HoursAffectedBookings_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Booking).WithMany().HasForeignKey(x => new { x.BookingId }).HasConstraintName("FK_HoursAffectedBookings_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<Notification>(e =>
        {
            e.ToTable("Notifications", "dbo", t =>
            {
                t.HasCheckConstraint("CK_Notifications_0", "[Status] IN (N'unread',N'read')");
                t.HasCheckConstraint("CK_Notifications_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OwnerId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Kind).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Title).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.Message).HasColumnType("nvarchar(1000)").HasMaxLength(1000).IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500).IsRequired();
            e.Property(x => x.ActionUrl).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Date).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Time).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.BranchName).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.HoursChangeRequestId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.HasIndex(x => new { x.OwnerId, x.Status, x.CreatedAt }).HasDatabaseName("IX_Notifications_0");
            e.HasIndex(x => new { x.BookingId }).HasDatabaseName("IX_Notifications_1");
            e.HasIndex(x => new { x.HoursChangeRequestId }).HasDatabaseName("IX_Notifications_2");
            e.HasOne(x => x.Owner).WithMany(x => x.Notifications).HasForeignKey(x => new { x.OwnerId }).HasConstraintName("FK_Notifications_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Booking).WithMany().HasForeignKey(x => new { x.BookingId }).HasConstraintName("FK_Notifications_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.HoursRequest).WithMany().HasForeignKey(x => new { x.HoursChangeRequestId }).HasConstraintName("FK_Notifications_2").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<NotificationRead>(e =>
        {
            e.ToTable("NotificationReads", "dbo", t =>
            {
                t.HasCheckConstraint("CK_NotificationReads_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.NotificationId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.ReadAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.NotificationId, x.AccountId }).HasDatabaseName("IX_NotificationReads_0").IsUnique();
            e.HasIndex(x => new { x.AccountId }).HasDatabaseName("IX_NotificationReads_1");
            e.HasOne(x => x.Notification).WithMany(x => x.Readers).HasForeignKey(x => new { x.NotificationId }).HasConstraintName("FK_NotificationReads_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Account).WithMany().HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_NotificationReads_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<SavedPlace>(e =>
        {
            e.ToTable("SavedPlaces", "dbo", t =>
            {
                t.HasCheckConstraint("CK_SavedPlaces_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.AccountId, x.BranchId }).HasDatabaseName("IX_SavedPlaces_0").IsUnique();
            e.HasIndex(x => new { x.BranchId }).HasDatabaseName("IX_SavedPlaces_1");
            e.HasOne(x => x.Account).WithMany(x => x.SavedPlaces).HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_SavedPlaces_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_SavedPlaces_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<DeviceSession>(e =>
        {
            e.ToTable("DeviceSessions", "dbo", t =>
            {
                t.HasCheckConstraint("CK_DeviceSessions_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.SessionHash).HasColumnType("binary(32)").IsRequired();
            e.Property(x => x.Device).HasColumnType("nvarchar(300)").HasMaxLength(300);
            e.Property(x => x.LastActive).HasColumnType("datetimeoffset(7)").IsRequired();
            e.Property(x => x.ExpiresAt).HasColumnType("datetimeoffset(7)").IsRequired();
            e.Property(x => x.RevokedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.SecurityStampSnapshot).HasColumnType("nvarchar(256)").HasMaxLength(256).IsRequired();
            e.HasIndex(x => new { x.SessionHash }).HasDatabaseName("IX_DeviceSessions_0").IsUnique();
            e.HasIndex(x => new { x.AccountId, x.RevokedAt }).HasDatabaseName("IX_DeviceSessions_1");
            e.HasOne(x => x.Account).WithMany(x => x.Sessions).HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_DeviceSessions_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<AccessChallenge>(e =>
        {
            e.ToTable("AccessChallenges", "dbo", t =>
            {
                t.HasCheckConstraint("CK_AccessChallenges_0", "[AttemptCount] >= 0");
                t.HasCheckConstraint("CK_AccessChallenges_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Purpose).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired();
            e.Property(x => x.TokenHash).HasColumnType("binary(32)").IsRequired();
            e.Property(x => x.ExpiresAt).HasColumnType("datetimeoffset(7)").IsRequired();
            e.Property(x => x.ConsumedAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.AttemptCount).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.HasIndex(x => new { x.TokenHash }).HasDatabaseName("IX_AccessChallenges_0").IsUnique();
            e.HasIndex(x => new { x.AccountId }).HasDatabaseName("IX_AccessChallenges_1");
            e.HasOne(x => x.Account).WithMany().HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_AccessChallenges_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<ImpersonationSession>(e =>
        {
            e.ToTable("ImpersonationSessions", "dbo", t =>
            {
                t.HasCheckConstraint("CK_ImpersonationSessions_0", "[AdminId] <> [TargetAccountId]");
                t.HasCheckConstraint("CK_ImpersonationSessions_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AdminId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.TargetAccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Reason).HasColumnType("nvarchar(1000)").HasMaxLength(1000).IsRequired();
            e.Property(x => x.ExpiresAt).HasColumnType("datetimeoffset(7)").IsRequired();
            e.Property(x => x.EndedAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.AdminId }).HasDatabaseName("IX_ImpersonationSessions_0");
            e.HasIndex(x => new { x.TargetAccountId }).HasDatabaseName("IX_ImpersonationSessions_1");
            e.HasOne(x => x.Admin).WithMany().HasForeignKey(x => new { x.AdminId }).HasConstraintName("FK_ImpersonationSessions_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.TargetAccount).WithMany().HasForeignKey(x => new { x.TargetAccountId }).HasConstraintName("FK_ImpersonationSessions_1").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<AuditEvent>(e =>
        {
            e.ToTable("AuditEvents", "dbo", t =>
            {
                t.HasCheckConstraint("CK_AuditEvents_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Actor).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Action).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.EntityType).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.EntityId).HasColumnType("nvarchar(128)").HasMaxLength(128);
            e.Property(x => x.Reason).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.Timestamp).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.Status).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Score).HasColumnType("decimal(18,6)");
            e.Property(x => x.ActorId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.HasIndex(x => new { x.EntityType, x.EntityId, x.Timestamp }).HasDatabaseName("IX_AuditEvents_0");
            e.HasIndex(x => new { x.ActorId, x.Timestamp }).HasDatabaseName("IX_AuditEvents_1");
            e.HasOne(x => x.ActorAccount).WithMany().HasForeignKey(x => new { x.ActorId }).HasConstraintName("FK_AuditEvents_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<FrontendState>(e =>
        {
            e.ToTable("FrontendStates", "dbo", t =>
            {
                t.HasCheckConstraint("CK_FrontendStates_0", "([Scope] = N'global' AND [OwnerKey] = N'global' AND [AccountId] IS NULL) OR ([Scope] = N'account' AND [AccountId] IS NOT NULL AND [OwnerKey] = [AccountId])");
                t.HasCheckConstraint("CK_FrontendStates_1", "[ValueJson] IS NULL OR ISJSON([ValueJson]) = 1");
                t.HasCheckConstraint("CK_FrontendStates_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Scope).HasColumnType("nvarchar(20)").HasMaxLength(20).IsRequired();
            e.Property(x => x.OwnerKey).HasColumnType("nvarchar(128)").HasMaxLength(128).IsRequired();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Key).HasColumnType("nvarchar(200)").HasMaxLength(200).IsRequired();
            e.Property(x => x.ValueJson).HasColumnType("nvarchar(max)").IsRequired();
            e.HasIndex(x => new { x.Scope, x.OwnerKey, x.Key }).HasDatabaseName("IX_FrontendStates_0").IsUnique();
            e.HasIndex(x => new { x.AccountId }).HasDatabaseName("IX_FrontendStates_1");
            e.HasOne(x => x.Account).WithMany().HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_FrontendStates_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<OutboxMessage>(e =>
        {
            e.ToTable("OutboxMessages", "dbo", t =>
            {
                t.HasCheckConstraint("CK_OutboxMessages_0", "[PayloadJson] IS NULL OR ISJSON([PayloadJson]) = 1");
                t.HasCheckConstraint("CK_OutboxMessages_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.OwnerId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Kind).HasColumnType("nvarchar(50)").HasMaxLength(50).IsRequired();
            e.Property(x => x.PayloadJson).HasColumnType("nvarchar(max)").IsRequired();
            e.Property(x => x.Status).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired().HasDefaultValue("queued");
            e.Property(x => x.AttemptCount).HasColumnType("int").IsRequired().HasDefaultValue(0);
            e.Property(x => x.NextAttemptAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.SentAt).HasColumnType("datetimeoffset(7)");
            e.Property(x => x.LastError).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.HasIndex(x => new { x.Status, x.NextAttemptAt }).HasDatabaseName("IX_OutboxMessages_0");
            e.HasIndex(x => new { x.OwnerId }).HasDatabaseName("IX_OutboxMessages_1");
            e.HasOne(x => x.Owner).WithMany().HasForeignKey(x => new { x.OwnerId }).HasConstraintName("FK_OutboxMessages_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<IdempotencyRecord>(e =>
        {
            e.ToTable("IdempotencyRecords", "dbo", t =>
            {
                t.HasCheckConstraint("CK_IdempotencyRecords_0", "[ResponseJson] IS NULL OR ISJSON([ResponseJson]) = 1");
                t.HasCheckConstraint("CK_IdempotencyRecords_1", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Operation).HasColumnType("nvarchar(80)").HasMaxLength(80).IsRequired();
            e.Property(x => x.Key).HasColumnType("nvarchar(128)").HasMaxLength(128).IsRequired();
            e.Property(x => x.RequestHash).HasColumnType("binary(32)").IsRequired();
            e.Property(x => x.ResponseJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.HttpStatus).HasColumnType("int");
            e.Property(x => x.ExpiresAt).HasColumnType("datetimeoffset(7)").IsRequired();
            e.HasIndex(x => new { x.AccountId, x.Operation, x.Key }).HasDatabaseName("IX_IdempotencyRecords_0").IsUnique();
            e.HasOne(x => x.Account).WithMany().HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_IdempotencyRecords_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<RuntimeError>(e =>
        {
            e.ToTable("RuntimeErrors", "dbo", t =>
            {
                t.HasCheckConstraint("CK_RuntimeErrors_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Type).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Message).HasColumnType("nvarchar(2000)").HasMaxLength(2000);
            e.Property(x => x.Source).HasColumnType("nvarchar(500)").HasMaxLength(500);
            e.Property(x => x.Line).HasColumnType("int");
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.HasIndex(x => new { x.CreatedAt }).HasDatabaseName("IX_RuntimeErrors_0");
            e.HasIndex(x => new { x.AccountId }).HasDatabaseName("IX_RuntimeErrors_1");
            e.HasOne(x => x.Account).WithMany().HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_RuntimeErrors_0").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<ExternalJob>(e =>
        {
            e.ToTable("ExternalJobs", "dbo", t =>
            {
                t.HasCheckConstraint("CK_ExternalJobs_0", "[RequestJson] IS NULL OR ISJSON([RequestJson]) = 1");
                t.HasCheckConstraint("CK_ExternalJobs_1", "[ResultJson] IS NULL OR ISJSON([ResultJson]) = 1");
                t.HasCheckConstraint("CK_ExternalJobs_2", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.AccountId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.BranchId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.BookingId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2");
            e.Property(x => x.Kind).HasColumnType("nvarchar(50)").HasMaxLength(50).IsRequired();
            e.Property(x => x.Provider).HasColumnType("nvarchar(50)").HasMaxLength(50);
            e.Property(x => x.Status).HasColumnType("nvarchar(30)").HasMaxLength(30).IsRequired();
            e.Property(x => x.RequestJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.ResultJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.FailureMessage).HasColumnType("nvarchar(1000)").HasMaxLength(1000);
            e.Property(x => x.CompletedAt).HasColumnType("datetimeoffset(7)");
            e.HasIndex(x => new { x.AccountId, x.Kind, x.CreatedAt }).HasDatabaseName("IX_ExternalJobs_0");
            e.HasIndex(x => new { x.BranchId }).HasDatabaseName("IX_ExternalJobs_1");
            e.HasIndex(x => new { x.BookingId }).HasDatabaseName("IX_ExternalJobs_2");
            e.HasOne(x => x.Account).WithMany().HasForeignKey(x => new { x.AccountId }).HasConstraintName("FK_ExternalJobs_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => new { x.BranchId }).HasConstraintName("FK_ExternalJobs_1").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Booking).WithMany().HasForeignKey(x => new { x.BookingId }).HasConstraintName("FK_ExternalJobs_2").OnDelete(DeleteBehavior.NoAction);
        });
        b.Entity<SyncRevision>(e =>
        {
            e.ToTable("SyncRevisions", "dbo", t =>
            {
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("int").ValueGeneratedNever().IsRequired();
            e.Property(x => x.Version).HasColumnType("bigint").IsRequired().HasDefaultValue(0);
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
        });
        b.Entity<TicketMessageAttachment>(e =>
        {
            e.ToTable("TicketMessageAttachments", "dbo", t =>
            {
                t.HasCheckConstraint("CK_TicketMessageAttachments_0", "[Revision] >= 0");
            });
            e.HasKey(x => new { x.Id });
            e.Property(x => x.Id).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.Revision).HasColumnType("int").IsRequired().HasDefaultValue(1).IsConcurrencyToken();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnType("datetimeoffset(7)").IsRequired().HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsDeleted).HasColumnType("bit").IsRequired().HasDefaultValue(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.MessageId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.Property(x => x.DocumentId).HasColumnType("nvarchar(128)").HasMaxLength(128).UseCollation("Latin1_General_100_BIN2").IsRequired();
            e.HasIndex(x => new { x.MessageId, x.DocumentId }).HasDatabaseName("IX_TicketMessageAttachments_0").IsUnique();
            e.HasIndex(x => new { x.DocumentId }).HasDatabaseName("IX_TicketMessageAttachments_1");
            e.HasOne(x => x.Message).WithMany(x => x.Attachments).HasForeignKey(x => new { x.MessageId }).HasConstraintName("FK_TicketMessageAttachments_0").OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Document).WithMany().HasForeignKey(x => new { x.DocumentId }).HasConstraintName("FK_TicketMessageAttachments_1").OnDelete(DeleteBehavior.NoAction);
        });
    }
}
