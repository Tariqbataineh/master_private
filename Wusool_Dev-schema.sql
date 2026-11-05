-- WUSOOL — وصول | Wusool_Dev
-- Read-only schema snapshot: 2026-11-05T17:43:59.6394176Z
-- Source: SQL Server system catalogs; 136 physical tables, 1439 table columns, 253 foreign keys.
-- Reference DDL only. No business rows. Not a backup or a full deployment script.
-- Triggers and compatibility CUD procedures are not included in table DDL.
-- The application must retain its existing Identity, security and authorized service configuration.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO

-- 01 / PHYSICAL TABLES AND CANDIDATE KEYS

-- __EFMigrationsHistory
CREATE TABLE [dbo].[__EFMigrationsHistory] (
  [MigrationId] nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProductVersion] nvarchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId] ASC)
);
GO

-- AccessibilityReportEvents
CREATE TABLE [dbo].[AccessibilityReportEvents] (
  [Id] uniqueidentifier NOT NULL,
  [ReportId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Message] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AccessibilityReportEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AccessibilityReportMedia
CREATE TABLE [dbo].[AccessibilityReportMedia] (
  [Id] uniqueidentifier NOT NULL,
  [ReportId] uniqueidentifier NOT NULL,
  [MediaAssetId] uniqueidentifier NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AccessibilityReportMedia] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AccessibilityReports
CREATE TABLE [dbo].[AccessibilityReports] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [BookingId] uniqueidentifier NULL,
  [Subject] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [IssueType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Severity] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ObservedDate] date NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Latitude] decimal(28,10) NULL,
  [Longitude] decimal(28,10) NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AccessibilityReports] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AccommodationNeeds
CREATE TABLE [dbo].[AccommodationNeeds] (
  [ScopeKind] varchar(12) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Id] uniqueidentifier NOT NULL,
  [NeedKind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [BookingId] uniqueidentifier NULL,
  [InterviewId] uniqueidentifier NULL,
  CONSTRAINT [PK_AccommodationNeeds] PRIMARY KEY CLUSTERED ([ScopeKind] ASC, [Id] ASC)
);
GO

-- AccountSecurityStates
CREATE TABLE [dbo].[AccountSecurityStates] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Status] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [StatusReason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [DisabledAt] datetimeoffset(7) NULL,
  [InitialPasswordChangedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AccountSecurityStates] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AccountSessions
CREATE TABLE [dbo].[AccountSessions] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [HandleHash] binary(32) NOT NULL,
  [IssuedAt] datetimeoffset(7) NOT NULL,
  [ExpiresAt] datetimeoffset(7) NOT NULL,
  [LastSeenAt] datetimeoffset(7) NULL,
  [RevokedAt] datetimeoffset(7) NULL,
  [DeviceLabel] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AccountSessions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AiAnalysisJobs
CREATE TABLE [dbo].[AiAnalysisJobs] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProviderConfigurationId] uniqueidentifier NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProviderReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ResultJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ErrorCode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CompletedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AiAnalysisJobs] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AiPromptTemplates
CREATE TABLE [dbo].[AiPromptTemplates] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Template] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProviderConfigurationId] uniqueidentifier NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AiPromptTemplates] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AiProviderConfigurations
CREATE TABLE [dbo].[AiProviderConfigurations] (
  [Id] uniqueidentifier NOT NULL,
  [Provider] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Endpoint] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CredentialReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AiProviderConfigurations] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AnnouncementReads
CREATE TABLE [dbo].[AnnouncementReads] (
  [Id] uniqueidentifier NOT NULL,
  [AnnouncementId] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ReadAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AnnouncementReads] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Announcements
CREATE TABLE [dbo].[Announcements] (
  [Id] uniqueidentifier NOT NULL,
  [Title] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Body] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Audience] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartsAt] datetimeoffset(7) NULL,
  [EndsAt] datetimeoffset(7) NULL,
  [Enabled] bit NOT NULL,
  [CreatedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_Announcements] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ApplicationAnswers
CREATE TABLE [dbo].[ApplicationAnswers] (
  [Id] uniqueidentifier NOT NULL,
  [ApplicationId] uniqueidentifier NOT NULL,
  [VacancyId] uniqueidentifier NOT NULL,
  [QuestionId] uniqueidentifier NOT NULL,
  [Answer] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [QuestionLabelSnapshot] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [RequiredSnapshot] bit NULL,
  CONSTRAINT [PK_ApplicationAnswers] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ApplicationProfileSnapshots
CREATE TABLE [dbo].[ApplicationProfileSnapshots] (
  [Id] uniqueidentifier NOT NULL,
  [ApplicationId] uniqueidentifier NOT NULL,
  [DisplayName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Email] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Phone] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [City] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EducationLevel] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [University] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Major] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [GraduationYear] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Gpa] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EmploymentStatus] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [YearsExperience] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Skills] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [LinkedInUrl] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PortfolioUrl] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProfessionalSummary] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CvMediaId] uniqueidentifier NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [CvContentHash] binary(32) NULL,
  [CvOriginalName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CvVersionReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [FirstName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [LastName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_ApplicationProfileSnapshots] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AspNetRoleClaims
CREATE TABLE [dbo].[AspNetRoleClaims] (
  [Id] int IDENTITY(1,1) NOT NULL,
  [RoleId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ClaimType] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ClaimValue] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AspNetRoles
CREATE TABLE [dbo].[AspNetRoles] (
  [Id] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [NormalizedName] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ConcurrencyStamp] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AspNetUserClaims
CREATE TABLE [dbo].[AspNetUserClaims] (
  [Id] int IDENTITY(1,1) NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ClaimType] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ClaimValue] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AspNetUserLogins
CREATE TABLE [dbo].[AspNetUserLogins] (
  [LoginProvider] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProviderKey] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProviderDisplayName] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY CLUSTERED ([LoginProvider] ASC, [ProviderKey] ASC)
);
GO

-- AspNetUserRoles
CREATE TABLE [dbo].[AspNetUserRoles] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RoleId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY CLUSTERED ([UserId] ASC, [RoleId] ASC)
);
GO

-- AspNetUsers
CREATE TABLE [dbo].[AspNetUsers] (
  [Id] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [UserName] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [NormalizedUserName] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Email] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [NormalizedEmail] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EmailConfirmed] bit NOT NULL,
  [PasswordHash] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [SecurityStamp] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ConcurrencyStamp] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PhoneNumber] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PhoneNumberConfirmed] bit NOT NULL,
  [TwoFactorEnabled] bit NOT NULL,
  [LockoutEnd] datetimeoffset(7) NULL,
  [LockoutEnabled] bit NOT NULL,
  [AccessFailedCount] int NOT NULL,
  CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AspNetUserTokens
CREATE TABLE [dbo].[AspNetUserTokens] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [LoginProvider] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Value] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY CLUSTERED ([UserId] ASC, [LoginProvider] ASC, [Name] ASC)
);
GO

-- AuditEvents
CREATE TABLE [dbo].[AuditEvents] (
  [Id] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResourceType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResourceId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OccurredAt] datetimeoffset(7) NOT NULL,
  [Reason] nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_AuditEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AutomationDefinitions
CREATE TABLE [dbo].[AutomationDefinitions] (
  [Id] uniqueidentifier NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Trigger] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Message] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AutomationDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- AutomationRuns
CREATE TABLE [dbo].[AutomationRuns] (
  [Id] uniqueidentifier NOT NULL,
  [DefinitionId] uniqueidentifier NOT NULL,
  [ResourceType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResourceReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ErrorCode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [FinishedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_AutomationRuns] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- BookingEvents
CREATE TABLE [dbo].[BookingEvents] (
  [Id] uniqueidentifier NOT NULL,
  [BookingId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ActorRole] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Event] nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [From] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [To] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [At] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_BookingEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Bookings
CREATE TABLE [dbo].[Bookings] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [ServiceId] uniqueidentifier NOT NULL,
  [CommandId] uniqueidentifier NOT NULL,
  [RequestHash] binary(32) NOT NULL,
  [Reference] nvarchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Date] date NOT NULL,
  [Time] nvarchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartsAt] datetimeoffset(7) NOT NULL,
  [EndsAt] datetimeoffset(7) NOT NULL,
  [DurationMinutes] int NOT NULL,
  [BufferMinutes] int NOT NULL,
  [RequiresAssistant] bit NOT NULL,
  [Purpose] nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [GuidanceMethod] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [BranchName] nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ServiceName] nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Address] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [City] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Latitude] decimal(10,7) NULL,
  [Longitude] decimal(10,7) NULL,
  [Status] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [JourneyState] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Revision] bigint NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [HoldExpiresAt] datetimeoffset(7) NULL,
  [DepartedAt] datetimeoffset(7) NULL,
  [ArrivedAt] datetimeoffset(7) NULL,
  [ReceivedAt] datetimeoffset(7) NULL,
  [CompletedAt] datetimeoffset(7) NULL,
  [CancelledAt] datetimeoffset(7) NULL,
  [CancellationReason] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ScheduleBlocked] bit NOT NULL,
  [IsDeleted] bit NOT NULL,
  [PassHash] binary(32) NOT NULL,
  [ProtectedPass] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [VerifiedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [VerifiedAt] datetimeoffset(7) NULL,
  [PassUsedAt] datetimeoffset(7) NULL,
  [ScheduleConflict] bit NOT NULL CONSTRAINT [DF__Bookings__Schedu__078C1F06] DEFAULT (CONVERT([bit],(0))),
  [ScheduleConflictAt] datetimeoffset(7) NULL,
  [ProposalPresent] bit NOT NULL CONSTRAINT [DF136_Bookings_ProposalPresent] DEFAULT ((0)),
  [ProposalBranchId] uniqueidentifier NULL,
  [ProposalOrganizationId] uniqueidentifier NULL,
  [ProposalServiceId] uniqueidentifier NULL,
  [ProposalDate] date NULL,
  [ProposalTime] nvarchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProposalRequiresAssistant] bit NULL,
  [ProposalReason] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProposalCreatedAt] datetimeoffset(7) NULL,
  [ProposalExpiresAt] datetimeoffset(7) NULL,
  CONSTRAINT [PK_Bookings] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_Bookings_Id_UserId_BranchId] UNIQUE NONCLUSTERED ([Id] ASC, [UserId] ASC, [BranchId] ASC)
);
GO

-- BranchAccessibilityAssessments
CREATE TABLE [dbo].[BranchAccessibilityAssessments] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [Source] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Score] decimal(28,10) NULL,
  [Notes] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProviderReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [IsDemo] bit NOT NULL,
  [VerifiedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [VerifiedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_BranchAccessibilityAssessments] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- BranchDeclaredServices
CREATE TABLE [dbo].[BranchDeclaredServices] (
  [BranchId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK_BranchDeclaredServices] PRIMARY KEY CLUSTERED ([BranchId] ASC, [Position] ASC)
);
GO

-- Branches
CREATE TABLE [dbo].[Branches] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [City] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Address] nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Latitude] decimal(10,7) NULL,
  [Longitude] decimal(10,7) NULL,
  [Status] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Active] bit NOT NULL,
  [IsPublished] bit NOT NULL,
  [IsDeleted] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [ApprovedAt] datetimeoffset(7) NULL,
  [AssistanceCapacity] int NULL,
  [BookingEnabled] bit NOT NULL CONSTRAINT [DF__Branches__Bookin__3E1D39E1] DEFAULT (CONVERT([bit],(0))),
  [Capacity] int NULL,
  [Code] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CreatedAt] datetimeoffset(7) NULL,
  [CreatedByUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CreationHash] binary(32) NULL,
  [CreationKey] uniqueidentifier NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [DetailsComplete] bit NOT NULL CONSTRAINT [DF__Branches__Detail__3F115E1A] DEFAULT (CONVERT([bit],(0))),
  [District] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Email] nvarchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [GooglePlaceId] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Governorate] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [HoursRevision] bigint NOT NULL CONSTRAINT [DF__Branches__HoursR__40058253] DEFAULT (CONVERT([bigint],(0))),
  [MaxAdvanceDays] int NULL,
  [MinAdvanceMinutes] int NULL,
  [OperatingScheduleId] uniqueidentifier NULL,
  [PendingHoldMinutes] int NULL,
  [Phone] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Type] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [UpdatedAt] datetimeoffset(7) NULL,
  CONSTRAINT [PK_Branches] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_Branches_Id_OrganizationId] UNIQUE NONCLUSTERED ([Id] ASC, [OrganizationId] ASC)
);
GO

-- BranchFacilities
CREATE TABLE [dbo].[BranchFacilities] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [FeatureId] uniqueidentifier NOT NULL,
  [Available] bit NULL,
  [Notes] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EvidenceMediaId] uniqueidentifier NULL,
  [VerifiedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [VerifiedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [FeatureNamespace] varchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF136_BranchFacilities_FeatureNamespace] DEFAULT ('accessibility-feature'),
  CONSTRAINT [PK_BranchFacilities] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- BranchFloors
CREATE TABLE [dbo].[BranchFloors] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Position] int NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [DeclaredAccessibilityJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_BranchFloors] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- BranchMedia
CREATE TABLE [dbo].[BranchMedia] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [MediaAssetId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Kind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Caption] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [IsPublished] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [AuthoringMetadataJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_BranchMedia] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- BranchReviewDecisions
CREATE TABLE [dbo].[BranchReviewDecisions] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [SubmittedAt] datetimeoffset(7) NULL,
  [DecidedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_BranchReviewDecisions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- BranchServices
CREATE TABLE [dbo].[BranchServices] (
  [BranchId] uniqueidentifier NOT NULL,
  [ServiceId] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [Active] bit NOT NULL,
  CONSTRAINT [PK_BranchServices] PRIMARY KEY CLUSTERED ([BranchId] ASC, [ServiceId] ASC)
);
GO

-- BusinessRules
CREATE TABLE [dbo].[BusinessRules] (
  [Id] uniqueidentifier NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [EntityType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Field] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Operator] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ComparisonValue] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ActionValue] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_BusinessRules] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- CatalogImportBatches
CREATE TABLE [dbo].[CatalogImportBatches] (
  [Id] uniqueidentifier NOT NULL,
  [Reference] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ApprovedAt] datetimeoffset(7) NULL,
  [CompletedAt] datetimeoffset(7) NULL,
  [ApprovedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_CatalogImportBatches] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- CatalogServices
CREATE TABLE [dbo].[CatalogServices] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Category] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Active] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CategoryId] uniqueidentifier NULL,
  [CategoryNamespace] varchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF136_CatalogServices_CategoryNamespace] DEFAULT ('service-category'),
  CONSTRAINT [PK_CatalogServices] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_CatalogServices_Id_OrganizationId] UNIQUE NONCLUSTERED ([Id] ASC, [OrganizationId] ASC)
);
GO

-- CatalogSources
CREATE TABLE [dbo].[CatalogSources] (
  [Id] uniqueidentifier NOT NULL,
  [BatchId] uniqueidentifier NOT NULL,
  [Browser] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Profile] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Origin] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StorageKey] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [SourceHash] binary(32) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_CatalogSources] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- CatalogSourceSnapshots
CREATE TABLE [dbo].[CatalogSourceSnapshots] (
  [Id] uniqueidentifier NOT NULL,
  [SourceId] uniqueidentifier NOT NULL,
  [Kind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [LegacyId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [JsonPointer] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [PayloadJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ContentHash] binary(32) NOT NULL,
  [OrganizationId] uniqueidentifier NULL,
  [BranchId] uniqueidentifier NULL,
  [ServiceId] uniqueidentifier NULL,
  [TicketServiceId] uniqueidentifier NULL,
  [LegacyParentId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ResolutionState] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResolvedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_CatalogSourceSnapshots] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- CatalogTerms
CREATE TABLE [dbo].[CatalogTerms] (
  [Namespace] varchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Id] uniqueidentifier NOT NULL,
  [Code] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [ParentId] uniqueidentifier NULL,
  CONSTRAINT [PK_CatalogTerms] PRIMARY KEY CLUSTERED ([Namespace] ASC, [Id] ASC)
);
GO

-- ClosedDates
CREATE TABLE [dbo].[ClosedDates] (
  [ScheduleId] uniqueidentifier NOT NULL,
  [Date] date NOT NULL,
  CONSTRAINT [PK_ClosedDates] PRIMARY KEY CLUSTERED ([ScheduleId] ASC, [Date] ASC)
);
GO

-- ConfigurationVersions
CREATE TABLE [dbo].[ConfigurationVersions] (
  [Id] uniqueidentifier NOT NULL,
  [ResourceType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResourceKey] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Number] int NOT NULL,
  [DefinitionJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [AuthorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PublishedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ConfigurationVersions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ContentEntries
CREATE TABLE [dbo].[ContentEntries] (
  [Id] uniqueidentifier NOT NULL,
  [Route] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Value] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ContentEntries] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- DeliveryOutbox
CREATE TABLE [dbo].[DeliveryOutbox] (
  [Id] uniqueidentifier NOT NULL,
  [RecipientUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Channel] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Destination] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [TemplateId] uniqueidentifier NULL,
  [ProtectedPayload] varbinary(max) NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Attempts] int NOT NULL,
  [NextAttemptAt] datetimeoffset(7) NULL,
  [SentAt] datetimeoffset(7) NULL,
  [ProviderReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [LastErrorCode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_DeliveryOutbox] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- DomainFormAnswers
CREATE TABLE [dbo].[DomainFormAnswers] (
  [Id] uniqueidentifier NOT NULL,
  [DefinitionVersionId] uniqueidentifier NOT NULL,
  [OwnerId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Target] nvarchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResourceId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [AnswersJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_DomainFormAnswers] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- DynamicFormDefinitions
CREATE TABLE [dbo].[DynamicFormDefinitions] (
  [Id] uniqueidentifier NOT NULL,
  [Route] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [PublishedVersion] int NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_DynamicFormDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- DynamicFormFields
CREATE TABLE [dbo].[DynamicFormFields] (
  [Id] uniqueidentifier NOT NULL,
  [FormId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Label] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Kind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Required] bit NOT NULL,
  [Placeholder] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ValidationPattern] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_DynamicFormFields] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- DynamicFormOptions
CREATE TABLE [dbo].[DynamicFormOptions] (
  [Id] uniqueidentifier NOT NULL,
  [FieldId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Value] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Label] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_DynamicFormOptions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ExamAnswers
CREATE TABLE [dbo].[ExamAnswers] (
  [Id] uniqueidentifier NOT NULL,
  [QuestionId] uniqueidentifier NOT NULL,
  [OptionId] uniqueidentifier NULL,
  [SavedAt] datetimeoffset(7) NOT NULL,
  [SubmittedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ExamAnswers] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ExamEvents
CREATE TABLE [dbo].[ExamEvents] (
  [Id] uniqueidentifier NOT NULL,
  [ExamId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Detail] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ExamEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ExamOptions
CREATE TABLE [dbo].[ExamOptions] (
  [Id] uniqueidentifier NOT NULL,
  [QuestionId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Text] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [IsCorrect] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ExamOptions] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_ExamOptions_Id_QuestionId] UNIQUE NONCLUSTERED ([Id] ASC, [QuestionId] ASC)
);
GO

-- ExamQuestions
CREATE TABLE [dbo].[ExamQuestions] (
  [Id] uniqueidentifier NOT NULL,
  [ExamId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Kind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Text] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Points] decimal(28,10) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ExamQuestions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- FeatureFlags
CREATE TABLE [dbo].[FeatureFlags] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Enabled] bit NOT NULL,
  [RolloutPercentage] int NULL,
  [Audience] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_FeatureFlags] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- HistoricalServiceActors
CREATE TABLE [dbo].[HistoricalServiceActors] (
  [Id] uniqueidentifier NOT NULL,
  [TicketServiceId] uniqueidentifier NOT NULL,
  [LegacyReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ActorKind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [VerifiedUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [SourceSnapshotId] uniqueidentifier NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_HistoricalServiceActors] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- HoursChangeRequests
CREATE TABLE [dbo].[HoursChangeRequests] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [ProposedScheduleId] uniqueidentifier NOT NULL,
  [BeforeScheduleId] uniqueidentifier NULL,
  [BaseHoursRevision] bigint NOT NULL,
  [Revision] bigint NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [Status] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RequestedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [Reason] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [ReviewReason] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_HoursChangeRequests] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- InterviewEvents
CREATE TABLE [dbo].[InterviewEvents] (
  [Id] uniqueidentifier NOT NULL,
  [InterviewId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CandidateMessage] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PrivateDetail] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_InterviewEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- InterviewMeetings
CREATE TABLE [dbo].[InterviewMeetings] (
  [Id] uniqueidentifier NOT NULL,
  [InterviewId] uniqueidentifier NOT NULL,
  [Provider] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProviderReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProtectedJoinUrl] varbinary(max) NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [AdmissionState] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_InterviewMeetings] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- InvoiceLines
CREATE TABLE [dbo].[InvoiceLines] (
  [Id] uniqueidentifier NOT NULL,
  [InvoiceId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Quantity] decimal(28,10) NOT NULL,
  [UnitAmount] decimal(19,4) NOT NULL,
  [Total] decimal(19,4) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_InvoiceLines] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Invoices
CREATE TABLE [dbo].[Invoices] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [SubscriptionId] uniqueidentifier NULL,
  [Number] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Currency] varchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Total] decimal(19,4) NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [IssuedAt] datetimeoffset(7) NULL,
  [DueAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_Invoices] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- JobApplications
CREATE TABLE [dbo].[JobApplications] (
  [Id] uniqueidentifier NOT NULL,
  [VacancyId] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Decision] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CandidateMessage] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PrivateNotes] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EmploymentStatus] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EmploymentStartAt] datetimeoffset(7) NULL,
  [StartedAt] datetimeoffset(7) NULL,
  [AcceptedAt] datetimeoffset(7) NULL,
  [RejectedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [ConsentConfirmedAt] datetimeoffset(7) NULL,
  [ProfileFingerprint] binary(32) NULL,
  [TitleSnapshot] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_JobApplications] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_JobApplications_Id_OrganizationId_UserId] UNIQUE NONCLUSTERED ([Id] ASC, [OrganizationId] ASC, [UserId] ASC),
  CONSTRAINT [AK_JobApplications_Id_VacancyId] UNIQUE NONCLUSTERED ([Id] ASC, [VacancyId] ASC)
);
GO

-- JobInterviews
CREATE TABLE [dbo].[JobInterviews] (
  [Id] uniqueidentifier NOT NULL,
  [ApplicationId] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [InterviewerId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Round] int NOT NULL,
  [StartsAt] datetimeoffset(7) NOT NULL,
  [EndsAt] datetimeoffset(7) NOT NULL,
  [Mode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [BookingId] uniqueidentifier NULL,
  [Location] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Confirmation] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CandidateMessage] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PrivateEvaluation] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Outcome] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CompletedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [AccessibilitySnapshotJson] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [BranchAddressSnapshot] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [BranchCitySnapshot] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [BranchNameSnapshot] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [InterviewerNameSnapshot] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [RequiresAssistant] bit NOT NULL CONSTRAINT [DF__JobInterv__Requi__2759D01A] DEFAULT (CONVERT([bit],(0))),
  CONSTRAINT [PK_JobInterviews] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- JobOfferEvents
CREATE TABLE [dbo].[JobOfferEvents] (
  [Id] uniqueidentifier NOT NULL,
  [OfferId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_JobOfferEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- JobOffers
CREATE TABLE [dbo].[JobOffers] (
  [Id] uniqueidentifier NOT NULL,
  [ApplicationId] uniqueidentifier NOT NULL,
  [Terms] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [EmploymentStatus] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartedAt] datetimeoffset(7) NULL,
  [RespondedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_JobOffers] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- JobVacancies
CREATE TABLE [dbo].[JobVacancies] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [Title] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Responsibilities] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Qualifications] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Skills] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EmploymentType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [WorkArrangement] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Positions] int NOT NULL,
  [ClosingDate] date NOT NULL,
  [Accommodations] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ReviewReason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [BranchAddressSnapshot] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [BranchCitySnapshot] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [BranchNameSnapshot] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_JobVacancies] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_JobVacancies_Id_OrganizationId] UNIQUE NONCLUSTERED ([Id] ASC, [OrganizationId] ASC)
);
GO

-- LocalizedTexts
CREATE TABLE [dbo].[LocalizedTexts] (
  [Id] uniqueidentifier NOT NULL,
  [ResourceKind] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [LegacyId] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [CatalogServiceId] uniqueidentifier NULL,
  [TicketServiceId] uniqueidentifier NULL,
  [TargetId] AS (coalesce([TicketServiceId],[CatalogServiceId],[BranchId],[OrganizationId])) PERSISTED,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Instructions] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_LocalizedTexts] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- MaintenanceWindows
CREATE TABLE [dbo].[MaintenanceWindows] (
  [Id] uniqueidentifier NOT NULL,
  [StartsAt] datetimeoffset(7) NOT NULL,
  [EndsAt] datetimeoffset(7) NULL,
  [Message] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Scope] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_MaintenanceWindows] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- MediaAssets
CREATE TABLE [dbo].[MediaAssets] (
  [Id] uniqueidentifier NOT NULL,
  [StorageKey] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [OriginalName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ContentType] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Length] bigint NULL,
  [ContentHash] binary(32) NULL,
  [UploadedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [SourceUrl] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ScanState] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [AvailabilityState] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_MediaAssets] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- MembershipBranches
CREATE TABLE [dbo].[MembershipBranches] (
  [MembershipId] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  CONSTRAINT [PK_MembershipBranches] PRIMARY KEY CLUSTERED ([MembershipId] ASC, [BranchId] ASC)
);
GO

-- MessageTemplates
CREATE TABLE [dbo].[MessageTemplates] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Channel] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Subject] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Body] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_MessageTemplates] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- NavigationEdges
CREATE TABLE [dbo].[NavigationEdges] (
  [Id] uniqueidentifier NOT NULL,
  [NavigationVersionId] uniqueidentifier NOT NULL,
  [FromNodeId] uniqueidentifier NOT NULL,
  [ToNodeId] uniqueidentifier NOT NULL,
  [Instruction] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Distance] decimal(28,10) NULL,
  [Accessible] bit NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_NavigationEdges] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- NavigationJourneys
CREATE TABLE [dbo].[NavigationJourneys] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [NavigationVersionId] uniqueidentifier NULL,
  [BookingId] uniqueidentifier NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartedAt] datetimeoffset(7) NOT NULL,
  [CompletedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_NavigationJourneys] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- NavigationJourneySteps
CREATE TABLE [dbo].[NavigationJourneySteps] (
  [Id] uniqueidentifier NOT NULL,
  [JourneyId] uniqueidentifier NOT NULL,
  [NodeId] uniqueidentifier NULL,
  [Position] int NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OccurredAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_NavigationJourneySteps] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- NavigationMenuItems
CREATE TABLE [dbo].[NavigationMenuItems] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ParentId] uniqueidentifier NULL,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Label] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [LocalRoute] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Position] int NOT NULL,
  [RequiredPermission] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_NavigationMenuItems] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- NavigationNodes
CREATE TABLE [dbo].[NavigationNodes] (
  [Id] uniqueidentifier NOT NULL,
  [NavigationVersionId] uniqueidentifier NOT NULL,
  [FloorId] uniqueidentifier NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Label] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [X] decimal(28,10) NULL,
  [Y] decimal(28,10) NULL,
  [Latitude] decimal(28,10) NULL,
  [Longitude] decimal(28,10) NULL,
  [Kind] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_NavigationNodes] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_NavigationNodes_Id_NavigationVersionId] UNIQUE NONCLUSTERED ([Id] ASC, [NavigationVersionId] ASC)
);
GO

-- NavigationVersions
CREATE TABLE [dbo].[NavigationVersions] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [Number] int NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CreatedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PublishedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PublishedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_NavigationVersions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- OperatingPeriods
CREATE TABLE [dbo].[OperatingPeriods] (
  [ScheduleId] uniqueidentifier NOT NULL,
  [Day] int NOT NULL,
  [Position] int NOT NULL,
  [OpenMinute] int NOT NULL,
  [CloseMinute] int NOT NULL,
  CONSTRAINT [PK_OperatingPeriods] PRIMARY KEY CLUSTERED ([ScheduleId] ASC, [Day] ASC, [Position] ASC)
);
GO

-- OperatingSchedules
CREATE TABLE [dbo].[OperatingSchedules] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [CreatedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [ContentHash] binary(32) NOT NULL,
  CONSTRAINT [PK_OperatingSchedules] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_OperatingSchedules_Id_BranchId] UNIQUE NONCLUSTERED ([Id] ASC, [BranchId] ASC)
);
GO

-- OrganizationDocuments
CREATE TABLE [dbo].[OrganizationDocuments] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [MediaAssetId] uniqueidentifier NULL,
  [DocumentType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [ReviewNote] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [OriginalName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ExpiresOn] date NULL,
  [ReplacedByDocumentId] uniqueidentifier NULL,
  CONSTRAINT [PK_OrganizationDocuments] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- OrganizationLegalProfiles
CREATE TABLE [dbo].[OrganizationLegalProfiles] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [RegistrationNumber] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [RepresentativeName] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [RepresentativeJobTitle] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ContactEmail] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ContactPhone] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CountryCode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_OrganizationLegalProfiles] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- OrganizationMemberships
CREATE TABLE [dbo].[OrganizationMemberships] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [MembershipRole] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Active] bit NOT NULL,
  [AllBranches] bit NOT NULL,
  [ServiceManagement] bit NOT NULL,
  [BookingManagement] bit NOT NULL,
  [QueueManagement] bit NOT NULL,
  [AccessibilityEvidence] bit NOT NULL,
  [Reporting] bit NOT NULL,
  [AuditHistory] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [NotifyBookings] bit NULL,
  [NotifyBranchReviews] bit NULL,
  [NotifyEmail] bit NULL,
  [NotifyPayments] bit NULL,
  [NotifyReports] bit NULL,
  CONSTRAINT [PK_OrganizationMemberships] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_OrganizationMemberships_Id_OrganizationId] UNIQUE NONCLUSTERED ([Id] ASC, [OrganizationId] ASC)
);
GO

-- OrganizationNotifications
CREATE TABLE [dbo].[OrganizationNotifications] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [CreatedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Type] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Title] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Message] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [ReadAt] datetimeoffset(7) NULL,
  [IsDeleted] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  CONSTRAINT [PK_OrganizationNotifications] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- OrganizationRegistrationDecisions
CREATE TABLE [dbo].[OrganizationRegistrationDecisions] (
  [Id] uniqueidentifier NOT NULL,
  [RequestId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_OrganizationRegistrationDecisions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- OrganizationRegistrationRequests
CREATE TABLE [dbo].[OrganizationRegistrationRequests] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OrganizationType] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Category] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RegistrationNumber] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RepresentativeName] nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [JobTitle] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Phone] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Address] nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [DocumentName] nvarchar(180) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [DocumentMime] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [DocumentContent] varbinary(max) NOT NULL,
  [State] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RequestedAt] datetimeoffset(7) NOT NULL,
  [OrganizationId] uniqueidentifier NULL,
  [Version] uniqueidentifier NOT NULL,
  CONSTRAINT [PK_OrganizationRegistrationRequests] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Organizations
CREATE TABLE [dbo].[Organizations] (
  [Id] uniqueidentifier NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Type] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PublicDescription] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [City] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Address] nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ContactPhone] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Status] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ApprovalStatus] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [IsDeleted] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [ContactEmail] nvarchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CreatedByUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CreationHash] binary(32) NULL,
  [CreationKey] uniqueidentifier NULL,
  [GooglePlaceId] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Governorate] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Latitude] decimal(10,7) NULL,
  [Longitude] decimal(10,7) NULL,
  [Notes] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [RepresentativeUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Website] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_Organizations] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- OutdoorTrackingSessions
CREATE TABLE [dbo].[OutdoorTrackingSessions] (
  [Id] uniqueidentifier NOT NULL,
  [BookingId] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [State] nvarchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartedAt] datetimeoffset(7) NOT NULL,
  [ExpiresAt] datetimeoffset(7) NOT NULL,
  [EndedAt] datetimeoffset(7) NULL,
  [Latitude] decimal(10,7) NULL,
  [Longitude] decimal(10,7) NULL,
  [Accuracy] float NULL,
  [ObservedAt] datetimeoffset(7) NULL,
  [ReceivedAt] datetimeoffset(7) NULL,
  [RouteRequestedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_OutdoorTrackingSessions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PaymentProviderEvents
CREATE TABLE [dbo].[PaymentProviderEvents] (
  [Id] uniqueidentifier NOT NULL,
  [TransactionId] uniqueidentifier NULL,
  [Provider] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ExternalId] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [PayloadHash] binary(32) NOT NULL,
  [SignatureVerifiedAt] datetimeoffset(7) NULL,
  [ReceivedAt] datetimeoffset(7) NOT NULL,
  [ProcessedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PaymentProviderEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PaymentTransactions
CREATE TABLE [dbo].[PaymentTransactions] (
  [Id] uniqueidentifier NOT NULL,
  [InvoiceId] uniqueidentifier NOT NULL,
  [Provider] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [IdempotencyKey] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ProviderReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Currency] varchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Amount] decimal(19,4) NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ConfirmedAt] datetimeoffset(7) NULL,
  [FailureCode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PaymentTransactions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PermissionDefinitions
CREATE TABLE [dbo].[PermissionDefinitions] (
  [Id] uniqueidentifier NOT NULL,
  [Code] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PermissionDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PersonalNotifications
CREATE TABLE [dbo].[PersonalNotifications] (
  [SourceKind] varchar(8) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Id] uniqueidentifier NOT NULL,
  [RecipientUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Title] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Message] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ReadAt] datetimeoffset(7) NULL,
  [ResourceType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ResourceReference] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NULL,
  [BookingReference] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_PersonalNotifications] PRIMARY KEY CLUSTERED ([SourceKind] ASC, [Id] ASC)
);
GO

-- PlaceSubmissions
CREATE TABLE [dbo].[PlaceSubmissions] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Address] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [City] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Latitude] decimal(28,10) NULL,
  [Longitude] decimal(28,10) NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [AccessibilityNotes] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PlaceType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_PlaceSubmissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PlanEntitlements
CREATE TABLE [dbo].[PlanEntitlements] (
  [Id] uniqueidentifier NOT NULL,
  [PlanId] uniqueidentifier NOT NULL,
  [Code] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Limit] bigint NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PlanEntitlements] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PlanPrices
CREATE TABLE [dbo].[PlanPrices] (
  [Id] uniqueidentifier NOT NULL,
  [PlanId] uniqueidentifier NOT NULL,
  [BillingCycle] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Currency] varchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Amount] decimal(19,4) NOT NULL,
  [ValidFrom] datetimeoffset(7) NULL,
  [ValidTo] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PlanPrices] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PlatformSettings
CREATE TABLE [dbo].[PlatformSettings] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Value] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ValueType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [UpdatedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PlatformSettings] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- PrivilegedAccessRequests
CREATE TABLE [dbo].[PrivilegedAccessRequests] (
  [Id] uniqueidentifier NOT NULL,
  [RequestedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [TargetUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [ExpiresAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_PrivilegedAccessRequests] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- QueueEntries
CREATE TABLE [dbo].[QueueEntries] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [TicketServiceId] uniqueidentifier NOT NULL,
  [BookingId] uniqueidentifier NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Number] int NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [JoinedAt] datetimeoffset(7) NOT NULL,
  [CalledAt] datetimeoffset(7) NULL,
  [FinishedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_QueueEntries] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- QueueEvents
CREATE TABLE [dbo].[QueueEvents] (
  [Id] uniqueidentifier NOT NULL,
  [QueueEntryId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_QueueEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- RecruitmentApplicationEvents
CREATE TABLE [dbo].[RecruitmentApplicationEvents] (
  [Id] uniqueidentifier NOT NULL,
  [ApplicationId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CandidateMessage] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PrivateDetail] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_RecruitmentApplicationEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- RecruitmentExams
CREATE TABLE [dbo].[RecruitmentExams] (
  [Id] uniqueidentifier NOT NULL,
  [ApplicationId] uniqueidentifier NOT NULL,
  [Title] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartsAt] datetimeoffset(7) NOT NULL,
  [DeadlineAt] datetimeoffset(7) NOT NULL,
  [DurationMinutes] int NOT NULL,
  [MaxScore] int NOT NULL,
  [PassScore] int NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Score] decimal(28,10) NULL,
  [RevealScore] bit NOT NULL,
  [StartedAt] datetimeoffset(7) NULL,
  [SubmittedAt] datetimeoffset(7) NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [PublishedAt] datetimeoffset(7) NULL,
  [TimedOut] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_RecruitmentExams] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ReportRuns
CREATE TABLE [dbo].[ReportRuns] (
  [Id] uniqueidentifier NOT NULL,
  [ScheduleId] uniqueidentifier NULL,
  [RequestedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReportType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [MediaAssetId] uniqueidentifier NULL,
  [CompletedAt] datetimeoffset(7) NULL,
  [ErrorCode] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ReportRuns] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- RequirementDefinitions
CREATE TABLE [dbo].[RequirementDefinitions] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [EntityType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Label] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Required] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_RequirementDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ReviewAccessibilityFeatures
CREATE TABLE [dbo].[ReviewAccessibilityFeatures] (
  [Id] uniqueidentifier NOT NULL,
  [ReviewId] uniqueidentifier NOT NULL,
  [FeatureKey] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ReviewAccessibilityFeatures] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ReviewModerationEvents
CREATE TABLE [dbo].[ReviewModerationEvents] (
  [Id] uniqueidentifier NOT NULL,
  [ReviewId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Action] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ReviewModerationEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- RolePermissions
CREATE TABLE [dbo].[RolePermissions] (
  [Id] uniqueidentifier NOT NULL,
  [RoleId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [PermissionId] uniqueidentifier NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- RuntimeIncidents
CREATE TABLE [dbo].[RuntimeIncidents] (
  [Id] uniqueidentifier NOT NULL,
  [CorrelationId] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Code] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Route] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [SanitizedDetail] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [OccurredAt] datetimeoffset(7) NOT NULL,
  [ResolvedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_RuntimeIncidents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SavedItems
CREATE TABLE [dbo].[SavedItems] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Kind] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OrganizationId] uniqueidentifier NULL,
  [CatalogServiceId] uniqueidentifier NULL,
  [TicketServiceId] uniqueidentifier NULL,
  [BranchId] uniqueidentifier NULL,
  [LegacyId] uniqueidentifier NULL,
  [LegacyVersion] uniqueidentifier NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NULL,
  [UpdatedAt] datetimeoffset(7) NULL,
  [TargetId] AS (coalesce([OrganizationId],[CatalogServiceId],[TicketServiceId],[BranchId])) PERSISTED,
  [MigratedFromLegacy] bit NOT NULL,
  CONSTRAINT [PK_SavedItems] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ScheduledReports
CREATE TABLE [dbo].[ScheduledReports] (
  [Id] uniqueidentifier NOT NULL,
  [OwnerId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ReportType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Schedule] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [TimeZone] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Enabled] bit NOT NULL,
  [NextRunAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [RecipientEmail] nvarchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_ScheduledReports] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SecurityEvents
CREATE TABLE [dbo].[SecurityEvents] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Event] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OccurredAt] datetimeoffset(7) NOT NULL,
  [CorrelationId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Detail] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_SecurityEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- ServiceAvailability
CREATE TABLE [dbo].[ServiceAvailability] (
  [Id] uniqueidentifier NOT NULL,
  [TicketServiceId] uniqueidentifier NOT NULL,
  [StartsAt] datetimeoffset(7) NOT NULL,
  [EndsAt] datetimeoffset(7) NOT NULL,
  [Capacity] int NULL,
  [Available] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_ServiceAvailability] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SpecialHours
CREATE TABLE [dbo].[SpecialHours] (
  [Id] uniqueidentifier NOT NULL,
  [ScheduleId] uniqueidentifier NOT NULL,
  [Date] date NOT NULL,
  [IsClosed] bit NOT NULL,
  [Note] nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK_SpecialHours] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SpecialOperatingPeriods
CREATE TABLE [dbo].[SpecialOperatingPeriods] (
  [SpecialHoursId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [OpenMinute] int NOT NULL,
  [CloseMinute] int NOT NULL,
  CONSTRAINT [PK_SpecialOperatingPeriods] PRIMARY KEY CLUSTERED ([SpecialHoursId] ASC, [Position] ASC)
);
GO

-- StripeCheckoutAttempts
CREATE TABLE [dbo].[StripeCheckoutAttempts] (
  [PaymentId] uniqueidentifier NOT NULL,
  [PlanPriceId] uniqueidentifier NOT NULL,
  [PeriodMonths] int NOT NULL,
  [ReturnOrigin] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [SessionId] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PaymentIntentId] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  CONSTRAINT [PK_StripeCheckoutAttempts] PRIMARY KEY CLUSTERED ([PaymentId] ASC)
);
GO

-- SubscriptionGrantHistory
CREATE TABLE [dbo].[SubscriptionGrantHistory] (
  [Id] uniqueidentifier NOT NULL,
  [SubscriptionId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [At] datetimeoffset(7) NOT NULL,
  [StartDate] datetimeoffset(7) NOT NULL,
  [EndDate] datetimeoffset(7) NULL,
  [NonExpiring] bit NOT NULL,
  [Branches] int NOT NULL,
  [OrganizationUsers] int NOT NULL,
  [AiAnalysesPerMonth] int NOT NULL,
  [ServiceManagement] bit NOT NULL,
  [BookingManagement] bit NOT NULL,
  [QueueManagement] bit NOT NULL,
  [AccessibilityEvidence] bit NOT NULL,
  [Reporting] bit NOT NULL,
  [AuditHistory] bit NOT NULL,
  CONSTRAINT [PK_SubscriptionGrantHistory] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SubscriptionPlans
CREATE TABLE [dbo].[SubscriptionPlans] (
  [Id] uniqueidentifier NOT NULL,
  [Code] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_SubscriptionPlans] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Subscriptions
CREATE TABLE [dbo].[Subscriptions] (
  [Id] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [Origin] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Status] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StartDate] datetimeoffset(7) NOT NULL,
  [EndDate] datetimeoffset(7) NULL,
  [NonExpiring] bit NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [PlanId] uniqueidentifier NULL,
  [EntitlementPresent] bit NOT NULL CONSTRAINT [DF136_Subscriptions_EntitlementPresent] DEFAULT ((0)),
  [EntitlementBranches] int NULL,
  [EntitlementOrganizationUsers] int NULL,
  [EntitlementAiAnalysesPerMonth] int NULL,
  [EntitlementServiceManagement] bit NULL,
  [EntitlementBookingManagement] bit NULL,
  [EntitlementQueueManagement] bit NULL,
  [EntitlementAccessibilityEvidence] bit NULL,
  [EntitlementReporting] bit NULL,
  [EntitlementAuditHistory] bit NULL,
  CONSTRAINT [PK_Subscriptions] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_Subscriptions_Id_OrganizationId] UNIQUE NONCLUSTERED ([Id] ASC, [OrganizationId] ASC)
);
GO

-- SubscriptionUsage
CREATE TABLE [dbo].[SubscriptionUsage] (
  [Id] uniqueidentifier NOT NULL,
  [SubscriptionId] uniqueidentifier NOT NULL,
  [Feature] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [PeriodStart] date NOT NULL,
  [PeriodEnd] date NOT NULL,
  [Count] bigint NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_SubscriptionUsage] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SupportAttachments
CREATE TABLE [dbo].[SupportAttachments] (
  [Id] uniqueidentifier NOT NULL,
  [RequestId] uniqueidentifier NOT NULL,
  [MessageId] uniqueidentifier NULL,
  [MediaAssetId] uniqueidentifier NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_SupportAttachments] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SupportCaseEvents
CREATE TABLE [dbo].[SupportCaseEvents] (
  [Id] uniqueidentifier NOT NULL,
  [RequestId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [FromState] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ToState] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_SupportCaseEvents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- SupportMessages
CREATE TABLE [dbo].[SupportMessages] (
  [Id] uniqueidentifier NOT NULL,
  [RequestId] uniqueidentifier NOT NULL,
  [ActorId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Body] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [IsInternal] bit NOT NULL,
  [SentAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_SupportMessages] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_SupportMessages_Id_RequestId] UNIQUE NONCLUSTERED ([Id] ASC, [RequestId] ASC)
);
GO

-- SupportRequests
CREATE TABLE [dbo].[SupportRequests] (
  [Id] uniqueidentifier NOT NULL,
  [RequesterId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Subject] nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Status] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CommandId] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NULL,
  [OrganizationId] uniqueidentifier NULL,
  [AssignedToUserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Priority] nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  CONSTRAINT [PK_SupportRequests] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- TicketRequiredDocuments
CREATE TABLE [dbo].[TicketRequiredDocuments] (
  [TicketServiceId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK_TicketRequiredDocuments] PRIMARY KEY CLUSTERED ([TicketServiceId] ASC, [Position] ASC)
);
GO

-- TicketServices
CREATE TABLE [dbo].[TicketServices] (
  [Id] uniqueidentifier NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [OrganizationId] uniqueidentifier NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Description] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Category] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Instructions] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [DurationMinutes] int NULL,
  [Capacity] int NULL,
  [BufferMinutes] int NULL,
  [Active] bit NOT NULL,
  [Available] bit NOT NULL,
  [IsPublished] bit NOT NULL,
  [IsRemoved] bit NOT NULL,
  [Status] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [SourceUrl] nvarchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [VerificationStatus] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [VerifiedAt] datetimeoffset(7) NULL,
  [VerifiedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Fee] decimal(28,10) NULL,
  [Currency] varchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ConfiguredById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ConfiguredAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CategoryId] uniqueidentifier NULL,
  [OperatingScheduleId] uniqueidentifier NULL,
  [CategoryNamespace] varchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF136_TicketServices_CategoryNamespace] DEFAULT ('service-category'),
  CONSTRAINT [PK_TicketServices] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_TicketServices_Id_BranchId] UNIQUE NONCLUSTERED ([Id] ASC, [BranchId] ASC),
  CONSTRAINT [AK_TicketServices_Id_BranchId_OrganizationId] UNIQUE NONCLUSTERED ([Id] ASC, [BranchId] ASC, [OrganizationId] ASC)
);
GO

-- UnresolvedCatalogBranches
CREATE TABLE [dbo].[UnresolvedCatalogBranches] (
  [Id] uniqueidentifier NOT NULL,
  [SourceSnapshotId] uniqueidentifier NOT NULL,
  [LegacyId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [LegacyOrganizationId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [OrganizationId] uniqueidentifier NULL,
  [Reason] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ResolvedBranchId] uniqueidentifier NULL,
  [ResolvedAt] datetimeoffset(7) NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_UnresolvedCatalogBranches] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- UserAccessibilityPreferences
CREATE TABLE [dbo].[UserAccessibilityPreferences] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Size] nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Contrast] bit NOT NULL,
  [Motion] bit NOT NULL,
  [Focus] bit NOT NULL,
  [Magnify] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  CONSTRAINT [PK_UserAccessibilityPreferences] PRIMARY KEY CLUSTERED ([UserId] ASC)
);
GO

-- UserAccessNeeds
CREATE TABLE [dbo].[UserAccessNeeds] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [GuidanceMethod] nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_UserAccessNeeds] PRIMARY KEY CLUSTERED ([UserId] ASC)
);
GO

-- UserAccessNeedSelections
CREATE TABLE [dbo].[UserAccessNeedSelections] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Kind] nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Code] nvarchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT [PK_UserAccessNeedSelections] PRIMARY KEY NONCLUSTERED ([UserId] ASC, [Kind] ASC, [Code] ASC)
);
GO

-- UserCareerSkills
CREATE TABLE [dbo].[UserCareerSkills] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Position] int NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_UserCareerSkills] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- UserCvDocuments
CREATE TABLE [dbo].[UserCvDocuments] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [StorageKey] varchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [OriginalName] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [MediaType] varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Size] bigint NOT NULL,
  [Sha256] binary(32) NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [IsCurrent] bit NOT NULL,
  [DeletionPending] bit NOT NULL,
  CONSTRAINT [PK_UserCvDocuments] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- UserDisplayPreferences
CREATE TABLE [dbo].[UserDisplayPreferences] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Language] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Theme] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_UserDisplayPreferences] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- UserProfiles
CREATE TABLE [dbo].[UserProfiles] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ContactPhone] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [City] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EducationLevel] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [University] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Major] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [GraduationYear] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Gpa] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [EmploymentStatus] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [YearsExperience] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Skills] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [LinkedinUrl] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PortfolioUrl] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ProfessionalSummary] nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [CareerPresent] bit NOT NULL CONSTRAINT [DF136_UserProfiles_CareerPresent] DEFAULT ((0)),
  CONSTRAINT [PK_UserProfiles] PRIMARY KEY CLUSTERED ([UserId] ASC)
);
GO

-- UserRecentPlaces
CREATE TABLE [dbo].[UserRecentPlaces] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [ViewedAt] datetimeoffset(7) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_UserRecentPlaces] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- UserRegistrations
CREATE TABLE [dbo].[UserRegistrations] (
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RequestedAt] datetimeoffset(7) NOT NULL,
  [ConfirmedAt] datetimeoffset(7) NULL,
  [ConsentDocumentHash] binary(32) NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  CONSTRAINT [PK_UserRegistrations] PRIMARY KEY CLUSTERED ([UserId] ASC)
);
GO

-- VacancyQuestions
CREATE TABLE [dbo].[VacancyQuestions] (
  [Id] uniqueidentifier NOT NULL,
  [VacancyId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Label] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Required] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_VacancyQuestions] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [AK_VacancyQuestions_Id_VacancyId] UNIQUE NONCLUSTERED ([Id] ASC, [VacancyId] ASC)
);
GO

-- VisitReviews
CREATE TABLE [dbo].[VisitReviews] (
  [Id] uniqueidentifier NOT NULL,
  [UserId] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [BranchId] uniqueidentifier NOT NULL,
  [BookingId] uniqueidentifier NOT NULL,
  [Rating] int NOT NULL,
  [Title] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Comment] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [InformationAccuracy] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Recommended] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [PhotoMediaId] uniqueidentifier NULL,
  [State] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [ModerationLocked] bit NOT NULL,
  [ReviewedById] nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [ReviewedAt] datetimeoffset(7) NULL,
  [IsDeleted] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_VisitReviews] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- WeeklyHours
CREATE TABLE [dbo].[WeeklyHours] (
  [ScheduleId] uniqueidentifier NOT NULL,
  [Day] int NOT NULL,
  [IsOpen] bit NOT NULL,
  CONSTRAINT [PK_WeeklyHours] PRIMARY KEY CLUSTERED ([ScheduleId] ASC, [Day] ASC)
);
GO

-- WorkflowDefinitions
CREATE TABLE [dbo].[WorkflowDefinitions] (
  [Id] uniqueidentifier NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [EntityType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Enabled] bit NOT NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_WorkflowDefinitions] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- WorkflowStages
CREATE TABLE [dbo].[WorkflowStages] (
  [Id] uniqueidentifier NOT NULL,
  [WorkflowId] uniqueidentifier NOT NULL,
  [Position] int NOT NULL,
  [Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [Name] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [RequiredPermission] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
  [Version] uniqueidentifier NOT NULL,
  [CreatedAt] datetimeoffset(7) NOT NULL,
  [UpdatedAt] datetimeoffset(7) NOT NULL,
  CONSTRAINT [PK_WorkflowStages] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- 02 / INDEXES (unique indexes are created before foreign keys)

CREATE NONCLUSTERED INDEX [IX_AccessibilityReportEvents_ActorId]
ON [dbo].[AccessibilityReportEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReportEvents_CreatedAt]
ON [dbo].[AccessibilityReportEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReportEvents_ReportId_CreatedAt]
ON [dbo].[AccessibilityReportEvents] ([ReportId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReportMedia_CreatedAt]
ON [dbo].[AccessibilityReportMedia] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReportMedia_MediaAssetId]
ON [dbo].[AccessibilityReportMedia] ([MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_AccessibilityReportMedia_ReportId_MediaAssetId]
ON [dbo].[AccessibilityReportMedia] ([ReportId] ASC, [MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReports_BookingId]
ON [dbo].[AccessibilityReports] ([BookingId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReports_BranchId_State]
ON [dbo].[AccessibilityReports] ([BranchId] ASC, [State] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReports_CreatedAt]
ON [dbo].[AccessibilityReports] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReports_ReviewedById]
ON [dbo].[AccessibilityReports] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccessibilityReports_UserId_CreatedAt]
ON [dbo].[AccessibilityReports] ([UserId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_AccommodationNeeds_Booking_Kind]
ON [dbo].[AccommodationNeeds] ([BookingId] ASC, [NeedKind] ASC)
WHERE ([ScopeKind]='booking')
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_AccommodationNeeds_Interview_Kind]
ON [dbo].[AccommodationNeeds] ([InterviewId] ASC, [NeedKind] ASC)
WHERE ([ScopeKind]='interview')
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccommodationNeeds_Scope_Created]
ON [dbo].[AccommodationNeeds] ([ScopeKind] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccountSecurityStates_CreatedAt]
ON [dbo].[AccountSecurityStates] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_AccountSecurityStates_UserId]
ON [dbo].[AccountSecurityStates] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccountSessions_CreatedAt]
ON [dbo].[AccountSessions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccountSessions_ExpiresAt]
ON [dbo].[AccountSessions] ([ExpiresAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_AccountSessions_HandleHash]
ON [dbo].[AccountSessions] ([HandleHash] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AccountSessions_UserId_RevokedAt]
ON [dbo].[AccountSessions] ([UserId] ASC, [RevokedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiAnalysisJobs_BranchId_CreatedAt]
ON [dbo].[AiAnalysisJobs] ([BranchId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiAnalysisJobs_CreatedAt]
ON [dbo].[AiAnalysisJobs] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiAnalysisJobs_ProviderConfigurationId]
ON [dbo].[AiAnalysisJobs] ([ProviderConfigurationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiAnalysisJobs_UserId_CreatedAt]
ON [dbo].[AiAnalysisJobs] ([UserId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiPromptTemplates_CreatedAt]
ON [dbo].[AiPromptTemplates] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_AiPromptTemplates_Key_Language]
ON [dbo].[AiPromptTemplates] ([Key] ASC, [Language] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiPromptTemplates_ProviderConfigurationId]
ON [dbo].[AiPromptTemplates] ([ProviderConfigurationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AiProviderConfigurations_CreatedAt]
ON [dbo].[AiProviderConfigurations] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_AiProviderConfigurations_Provider]
ON [dbo].[AiProviderConfigurations] ([Provider] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_AnnouncementReads_AnnouncementId_UserId]
ON [dbo].[AnnouncementReads] ([AnnouncementId] ASC, [UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AnnouncementReads_CreatedAt]
ON [dbo].[AnnouncementReads] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AnnouncementReads_UserId]
ON [dbo].[AnnouncementReads] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Announcements_CreatedAt]
ON [dbo].[Announcements] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Announcements_CreatedById]
ON [dbo].[Announcements] ([CreatedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Announcements_Enabled_StartsAt_EndsAt]
ON [dbo].[Announcements] ([Enabled] ASC, [StartsAt] ASC, [EndsAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ApplicationAnswers_ApplicationId_QuestionId]
ON [dbo].[ApplicationAnswers] ([ApplicationId] ASC, [QuestionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ApplicationAnswers_CreatedAt]
ON [dbo].[ApplicationAnswers] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ApplicationAnswers_ApplicationId_VacancyId]
ON [dbo].[ApplicationAnswers] ([ApplicationId] ASC, [VacancyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ApplicationAnswers_VacancyId]
ON [dbo].[ApplicationAnswers] ([VacancyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ApplicationAnswers_QuestionId_VacancyId]
ON [dbo].[ApplicationAnswers] ([QuestionId] ASC, [VacancyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ApplicationProfileSnapshots_ApplicationId]
ON [dbo].[ApplicationProfileSnapshots] ([ApplicationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ApplicationProfileSnapshots_CreatedAt]
ON [dbo].[ApplicationProfileSnapshots] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ApplicationProfileSnapshots_CvMediaId]
ON [dbo].[ApplicationProfileSnapshots] ([CvMediaId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AspNetRoleClaims_RoleId]
ON [dbo].[AspNetRoleClaims] ([RoleId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [RoleNameIndex]
ON [dbo].[AspNetRoles] ([NormalizedName] ASC)
WHERE ([NormalizedName] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AspNetUserClaims_UserId]
ON [dbo].[AspNetUserClaims] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AspNetUserLogins_UserId]
ON [dbo].[AspNetUserLogins] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AspNetUserRoles_RoleId]
ON [dbo].[AspNetUserRoles] ([RoleId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [EmailIndex]
ON [dbo].[AspNetUsers] ([NormalizedEmail] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UserNameIndex]
ON [dbo].[AspNetUsers] ([NormalizedUserName] ASC)
WHERE ([NormalizedUserName] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AuditEvents_ActorId_OccurredAt]
ON [dbo].[AuditEvents] ([ActorId] ASC, [OccurredAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AuditEvents_ResourceType_ResourceId_OccurredAt]
ON [dbo].[AuditEvents] ([ResourceType] ASC, [ResourceId] ASC, [OccurredAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AutomationDefinitions_CreatedAt]
ON [dbo].[AutomationDefinitions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AutomationDefinitions_Trigger_Enabled]
ON [dbo].[AutomationDefinitions] ([Trigger] ASC, [Enabled] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AutomationRuns_CreatedAt]
ON [dbo].[AutomationRuns] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_AutomationRuns_DefinitionId_CreatedAt]
ON [dbo].[AutomationRuns] ([DefinitionId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BookingEvents_ActorId]
ON [dbo].[BookingEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BookingEvents_BookingId_At_Id]
ON [dbo].[BookingEvents] ([BookingId] ASC, [At] ASC, [Id] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_BranchId_OrganizationId]
ON [dbo].[Bookings] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_BranchId_StartsAt_EndsAt]
ON [dbo].[Bookings] ([BranchId] ASC, [StartsAt] ASC, [EndsAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_OrganizationId_CreatedAt_Id]
ON [dbo].[Bookings] ([OrganizationId] ASC, [CreatedAt] ASC, [Id] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Bookings_Reference]
ON [dbo].[Bookings] ([Reference] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_ServiceId_BranchId_OrganizationId]
ON [dbo].[Bookings] ([ServiceId] ASC, [BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_Status_HoldExpiresAt]
ON [dbo].[Bookings] ([Status] ASC, [HoldExpiresAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Bookings_UserId_CommandId]
ON [dbo].[Bookings] ([UserId] ASC, [CommandId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_UserId_StartsAt_EndsAt]
ON [dbo].[Bookings] ([UserId] ASC, [StartsAt] ASC, [EndsAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_VerifiedById]
ON [dbo].[Bookings] ([VerifiedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_Proposal_IX_BookingProposals_BranchId_OrganizationId]
ON [dbo].[Bookings] ([ProposalBranchId] ASC, [ProposalOrganizationId] ASC)
WHERE ([ProposalPresent]=(1))
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Bookings_Proposal_IX_BookingProposals_ServiceId_BranchId_OrganizationId]
ON [dbo].[Bookings] ([ProposalServiceId] ASC, [ProposalBranchId] ASC, [ProposalOrganizationId] ASC)
WHERE ([ProposalPresent]=(1))
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchAccessibilityAssessments_BranchId_CreatedAt]
ON [dbo].[BranchAccessibilityAssessments] ([BranchId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchAccessibilityAssessments_CreatedAt]
ON [dbo].[BranchAccessibilityAssessments] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchAccessibilityAssessments_VerifiedById]
ON [dbo].[BranchAccessibilityAssessments] ([VerifiedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Branches_OrganizationId_Status_IsPublished_Active_IsDeleted]
ON [dbo].[Branches] ([OrganizationId] ASC, [Status] ASC, [IsPublished] ASC, [Active] ASC, [IsDeleted] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Branches_CreatedByUserId_CreationKey]
ON [dbo].[Branches] ([CreatedByUserId] ASC, [CreationKey] ASC)
WHERE ([CreatedByUserId] IS NOT NULL AND [CreationKey] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Branches_OperatingScheduleId_Id]
ON [dbo].[Branches] ([OperatingScheduleId] ASC, [Id] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_BranchFacilities_BranchId_FeatureId]
ON [dbo].[BranchFacilities] ([BranchId] ASC, [FeatureId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchFacilities_CreatedAt]
ON [dbo].[BranchFacilities] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchFacilities_EvidenceMediaId]
ON [dbo].[BranchFacilities] ([EvidenceMediaId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchFacilities_FeatureId]
ON [dbo].[BranchFacilities] ([FeatureId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchFacilities_VerifiedById]
ON [dbo].[BranchFacilities] ([VerifiedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchFacilities_FeatureNamespace]
ON [dbo].[BranchFacilities] ([FeatureNamespace] ASC, [FeatureId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_BranchFloors_BranchId_Key]
ON [dbo].[BranchFloors] ([BranchId] ASC, [Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchFloors_CreatedAt]
ON [dbo].[BranchFloors] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_BranchMedia_BranchId_MediaAssetId]
ON [dbo].[BranchMedia] ([BranchId] ASC, [MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchMedia_BranchId_Position]
ON [dbo].[BranchMedia] ([BranchId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchMedia_CreatedAt]
ON [dbo].[BranchMedia] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchMedia_MediaAssetId]
ON [dbo].[BranchMedia] ([MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchReviewDecisions_ActorId]
ON [dbo].[BranchReviewDecisions] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchReviewDecisions_BranchId_CreatedAt]
ON [dbo].[BranchReviewDecisions] ([BranchId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchReviewDecisions_CreatedAt]
ON [dbo].[BranchReviewDecisions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchServices_BranchId_OrganizationId]
ON [dbo].[BranchServices] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BranchServices_ServiceId_OrganizationId]
ON [dbo].[BranchServices] ([ServiceId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BusinessRules_CreatedAt]
ON [dbo].[BusinessRules] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_BusinessRules_EntityType_Enabled]
ON [dbo].[BusinessRules] ([EntityType] ASC, [Enabled] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogImportBatches_ApprovedById]
ON [dbo].[CatalogImportBatches] ([ApprovedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogImportBatches_CreatedAt]
ON [dbo].[CatalogImportBatches] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_CatalogImportBatches_Reference]
ON [dbo].[CatalogImportBatches] ([Reference] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogServices_OrganizationId]
ON [dbo].[CatalogServices] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogServices_CategoryId]
ON [dbo].[CatalogServices] ([CategoryId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogServices_CategoryNamespace]
ON [dbo].[CatalogServices] ([CategoryNamespace] ASC, [CategoryId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSources_BatchId]
ON [dbo].[CatalogSources] ([BatchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSources_CreatedAt]
ON [dbo].[CatalogSources] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_BranchId]
ON [dbo].[CatalogSourceSnapshots] ([BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_CreatedAt]
ON [dbo].[CatalogSourceSnapshots] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_Kind_LegacyId]
ON [dbo].[CatalogSourceSnapshots] ([Kind] ASC, [LegacyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_OrganizationId]
ON [dbo].[CatalogSourceSnapshots] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_ResolutionState]
ON [dbo].[CatalogSourceSnapshots] ([ResolutionState] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_ServiceId]
ON [dbo].[CatalogSourceSnapshots] ([ServiceId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_SourceId_Kind_LegacyId_ContentHash]
ON [dbo].[CatalogSourceSnapshots] ([SourceId] ASC, [Kind] ASC, [LegacyId] ASC, [ContentHash] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogSourceSnapshots_TicketServiceId]
ON [dbo].[CatalogSourceSnapshots] ([TicketServiceId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_CatalogTerms_Namespace_Code]
ON [dbo].[CatalogTerms] ([Namespace] ASC, [Code] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogTerms_Namespace_Parent]
ON [dbo].[CatalogTerms] ([Namespace] ASC, [ParentId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_CatalogTerms_Namespace_Created]
ON [dbo].[CatalogTerms] ([Namespace] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ConfigurationVersions_AuthorId]
ON [dbo].[ConfigurationVersions] ([AuthorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ConfigurationVersions_CreatedAt]
ON [dbo].[ConfigurationVersions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ConfigurationVersions_ResourceType_ResourceKey_Number]
ON [dbo].[ConfigurationVersions] ([ResourceType] ASC, [ResourceKey] ASC, [Number] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ContentEntries_CreatedAt]
ON [dbo].[ContentEntries] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ContentEntries_Route_Language_Key]
ON [dbo].[ContentEntries] ([Route] ASC, [Language] ASC, [Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DeliveryOutbox_CreatedAt]
ON [dbo].[DeliveryOutbox] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DeliveryOutbox_RecipientUserId]
ON [dbo].[DeliveryOutbox] ([RecipientUserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DeliveryOutbox_State_NextAttemptAt]
ON [dbo].[DeliveryOutbox] ([State] ASC, [NextAttemptAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DeliveryOutbox_TemplateId]
ON [dbo].[DeliveryOutbox] ([TemplateId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DomainFormAnswers_DefinitionVersionId]
ON [dbo].[DomainFormAnswers] ([DefinitionVersionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DomainFormAnswers_OwnerId_Target_ResourceId_CreatedAt]
ON [dbo].[DomainFormAnswers] ([OwnerId] ASC, [Target] ASC, [ResourceId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DynamicFormDefinitions_CreatedAt]
ON [dbo].[DynamicFormDefinitions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_DynamicFormDefinitions_Route]
ON [dbo].[DynamicFormDefinitions] ([Route] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DynamicFormFields_CreatedAt]
ON [dbo].[DynamicFormFields] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_DynamicFormFields_FormId_Key]
ON [dbo].[DynamicFormFields] ([FormId] ASC, [Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_DynamicFormFields_FormId_Position]
ON [dbo].[DynamicFormFields] ([FormId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_DynamicFormOptions_CreatedAt]
ON [dbo].[DynamicFormOptions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_DynamicFormOptions_FieldId_Position]
ON [dbo].[DynamicFormOptions] ([FieldId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamAnswers_CreatedAt]
ON [dbo].[ExamAnswers] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamAnswers_OptionId_QuestionId]
ON [dbo].[ExamAnswers] ([OptionId] ASC, [QuestionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ExamAnswers_QuestionId]
ON [dbo].[ExamAnswers] ([QuestionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamEvents_ActorId]
ON [dbo].[ExamEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamEvents_CreatedAt]
ON [dbo].[ExamEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamEvents_ExamId_CreatedAt]
ON [dbo].[ExamEvents] ([ExamId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamOptions_CreatedAt]
ON [dbo].[ExamOptions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ExamOptions_QuestionId_Position]
ON [dbo].[ExamOptions] ([QuestionId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ExamQuestions_CreatedAt]
ON [dbo].[ExamQuestions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ExamQuestions_ExamId_Position]
ON [dbo].[ExamQuestions] ([ExamId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_FeatureFlags_CreatedAt]
ON [dbo].[FeatureFlags] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_FeatureFlags_Key]
ON [dbo].[FeatureFlags] ([Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HistoricalServiceActors_CreatedAt]
ON [dbo].[HistoricalServiceActors] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HistoricalServiceActors_SourceSnapshotId]
ON [dbo].[HistoricalServiceActors] ([SourceSnapshotId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HistoricalServiceActors_TicketServiceId]
ON [dbo].[HistoricalServiceActors] ([TicketServiceId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HistoricalServiceActors_VerifiedUserId]
ON [dbo].[HistoricalServiceActors] ([VerifiedUserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HoursChangeRequests_BeforeScheduleId_BranchId]
ON [dbo].[HoursChangeRequests] ([BeforeScheduleId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_HoursChangeRequests_BranchId]
ON [dbo].[HoursChangeRequests] ([BranchId] ASC)
WHERE ([Status]='pending')
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HoursChangeRequests_ProposedScheduleId_BranchId]
ON [dbo].[HoursChangeRequests] ([ProposedScheduleId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HoursChangeRequests_RequestedById]
ON [dbo].[HoursChangeRequests] ([RequestedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_HoursChangeRequests_ReviewedById]
ON [dbo].[HoursChangeRequests] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_InterviewEvents_ActorId]
ON [dbo].[InterviewEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_InterviewEvents_CreatedAt]
ON [dbo].[InterviewEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_InterviewEvents_InterviewId_CreatedAt]
ON [dbo].[InterviewEvents] ([InterviewId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_InterviewMeetings_CreatedAt]
ON [dbo].[InterviewMeetings] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_InterviewMeetings_InterviewId]
ON [dbo].[InterviewMeetings] ([InterviewId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_InvoiceLines_CreatedAt]
ON [dbo].[InvoiceLines] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_InvoiceLines_InvoiceId_Position]
ON [dbo].[InvoiceLines] ([InvoiceId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Invoices_CreatedAt]
ON [dbo].[Invoices] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Invoices_Number]
ON [dbo].[Invoices] ([Number] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Invoices_OrganizationId_CreatedAt]
ON [dbo].[Invoices] ([OrganizationId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Invoices_SubscriptionId_OrganizationId]
ON [dbo].[Invoices] ([SubscriptionId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobApplications_CreatedAt]
ON [dbo].[JobApplications] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobApplications_OrganizationId]
ON [dbo].[JobApplications] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobApplications_UserId_CreatedAt]
ON [dbo].[JobApplications] ([UserId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobApplications_VacancyId_Decision]
ON [dbo].[JobApplications] ([VacancyId] ASC, [Decision] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobApplications_VacancyId_OrganizationId]
ON [dbo].[JobApplications] ([VacancyId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_JobApplications_UserId_VacancyId]
ON [dbo].[JobApplications] ([UserId] ASC, [VacancyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_JobInterviews_ApplicationId_Round]
ON [dbo].[JobInterviews] ([ApplicationId] ASC, [Round] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_ApplicationId_OrganizationId_UserId]
ON [dbo].[JobInterviews] ([ApplicationId] ASC, [OrganizationId] ASC, [UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_BookingId_UserId_BranchId]
ON [dbo].[JobInterviews] ([BookingId] ASC, [UserId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_CreatedAt]
ON [dbo].[JobInterviews] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_InterviewerId_StartsAt_EndsAt]
ON [dbo].[JobInterviews] ([InterviewerId] ASC, [StartsAt] ASC, [EndsAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_OrganizationId]
ON [dbo].[JobInterviews] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_UserId]
ON [dbo].[JobInterviews] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobInterviews_BranchId_OrganizationId]
ON [dbo].[JobInterviews] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobOfferEvents_ActorId]
ON [dbo].[JobOfferEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobOfferEvents_CreatedAt]
ON [dbo].[JobOfferEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobOfferEvents_OfferId_CreatedAt]
ON [dbo].[JobOfferEvents] ([OfferId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobOffers_ApplicationId_CreatedAt]
ON [dbo].[JobOffers] ([ApplicationId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobOffers_CreatedAt]
ON [dbo].[JobOffers] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobVacancies_BranchId_OrganizationId]
ON [dbo].[JobVacancies] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobVacancies_CreatedAt]
ON [dbo].[JobVacancies] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobVacancies_OrganizationId_State]
ON [dbo].[JobVacancies] ([OrganizationId] ASC, [State] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobVacancies_ReviewedById]
ON [dbo].[JobVacancies] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_JobVacancies_State_ClosingDate]
ON [dbo].[JobVacancies] ([State] ASC, [ClosingDate] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_LocalizedTexts_Kind_Legacy]
ON [dbo].[LocalizedTexts] ([ResourceKind] ASC, [LegacyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_LocalizedTexts_Target_Language]
ON [dbo].[LocalizedTexts] ([ResourceKind] ASC, [TargetId] ASC, [Language] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_LocalizedTexts_Owner_Kind]
ON [dbo].[LocalizedTexts] ([OrganizationId] ASC, [ResourceKind] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MaintenanceWindows_CreatedAt]
ON [dbo].[MaintenanceWindows] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MaintenanceWindows_Enabled_StartsAt]
ON [dbo].[MaintenanceWindows] ([Enabled] ASC, [StartsAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MediaAssets_CreatedAt]
ON [dbo].[MediaAssets] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_MediaAssets_StorageKey]
ON [dbo].[MediaAssets] ([StorageKey] ASC)
WHERE ([StorageKey] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MediaAssets_UploadedById]
ON [dbo].[MediaAssets] ([UploadedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MembershipBranches_BranchId_OrganizationId]
ON [dbo].[MembershipBranches] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MembershipBranches_MembershipId_OrganizationId]
ON [dbo].[MembershipBranches] ([MembershipId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_MessageTemplates_CreatedAt]
ON [dbo].[MessageTemplates] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_MessageTemplates_Key_Channel_Language]
ON [dbo].[MessageTemplates] ([Key] ASC, [Channel] ASC, [Language] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationEdges_CreatedAt]
ON [dbo].[NavigationEdges] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationEdges_FromNodeId_NavigationVersionId]
ON [dbo].[NavigationEdges] ([FromNodeId] ASC, [NavigationVersionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_NavigationEdges_NavigationVersionId_FromNodeId_ToNodeId]
ON [dbo].[NavigationEdges] ([NavigationVersionId] ASC, [FromNodeId] ASC, [ToNodeId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationEdges_ToNodeId_NavigationVersionId]
ON [dbo].[NavigationEdges] ([ToNodeId] ASC, [NavigationVersionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneys_BookingId]
ON [dbo].[NavigationJourneys] ([BookingId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneys_BranchId]
ON [dbo].[NavigationJourneys] ([BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneys_CreatedAt]
ON [dbo].[NavigationJourneys] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneys_NavigationVersionId]
ON [dbo].[NavigationJourneys] ([NavigationVersionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneys_UserId_StartedAt]
ON [dbo].[NavigationJourneys] ([UserId] ASC, [StartedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneySteps_CreatedAt]
ON [dbo].[NavigationJourneySteps] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_NavigationJourneySteps_JourneyId_Position]
ON [dbo].[NavigationJourneySteps] ([JourneyId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationJourneySteps_NodeId]
ON [dbo].[NavigationJourneySteps] ([NodeId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationMenuItems_CreatedAt]
ON [dbo].[NavigationMenuItems] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_NavigationMenuItems_Key_Language]
ON [dbo].[NavigationMenuItems] ([Key] ASC, [Language] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationMenuItems_ParentId_Position]
ON [dbo].[NavigationMenuItems] ([ParentId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationNodes_CreatedAt]
ON [dbo].[NavigationNodes] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationNodes_FloorId]
ON [dbo].[NavigationNodes] ([FloorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_NavigationNodes_NavigationVersionId_Key]
ON [dbo].[NavigationNodes] ([NavigationVersionId] ASC, [Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_NavigationVersions_BranchId_Number]
ON [dbo].[NavigationVersions] ([BranchId] ASC, [Number] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationVersions_CreatedAt]
ON [dbo].[NavigationVersions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationVersions_CreatedById]
ON [dbo].[NavigationVersions] ([CreatedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_NavigationVersions_PublishedById]
ON [dbo].[NavigationVersions] ([PublishedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OperatingSchedules_BranchId]
ON [dbo].[OperatingSchedules] ([BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OperatingSchedules_CreatedById]
ON [dbo].[OperatingSchedules] ([CreatedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationDocuments_CreatedAt]
ON [dbo].[OrganizationDocuments] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationDocuments_MediaAssetId]
ON [dbo].[OrganizationDocuments] ([MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationDocuments_OrganizationId_State]
ON [dbo].[OrganizationDocuments] ([OrganizationId] ASC, [State] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationDocuments_ReviewedById]
ON [dbo].[OrganizationDocuments] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationDocuments_OrganizationId_State_ExpiresOn]
ON [dbo].[OrganizationDocuments] ([OrganizationId] ASC, [State] ASC, [ExpiresOn] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationDocuments_ReplacedByDocumentId]
ON [dbo].[OrganizationDocuments] ([ReplacedByDocumentId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationLegalProfiles_CreatedAt]
ON [dbo].[OrganizationLegalProfiles] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_OrganizationLegalProfiles_OrganizationId]
ON [dbo].[OrganizationLegalProfiles] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationMemberships_OrganizationId]
ON [dbo].[OrganizationMemberships] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationMemberships_UserId_Active]
ON [dbo].[OrganizationMemberships] ([UserId] ASC, [Active] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_OrganizationMemberships_UserId_OrganizationId]
ON [dbo].[OrganizationMemberships] ([UserId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_OrganizationMemberships_UserId]
ON [dbo].[OrganizationMemberships] ([UserId] ASC)
WHERE ([Active]=(1))
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationNotifications_BranchId_OrganizationId]
ON [dbo].[OrganizationNotifications] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationNotifications_CreatedById]
ON [dbo].[OrganizationNotifications] ([CreatedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationNotifications_OrganizationId_IsDeleted_CreatedAt_Id]
ON [dbo].[OrganizationNotifications] ([OrganizationId] ASC, [IsDeleted] ASC, [CreatedAt] ASC, [Id] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationRegistrationDecisions_ActorId]
ON [dbo].[OrganizationRegistrationDecisions] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationRegistrationDecisions_CreatedAt]
ON [dbo].[OrganizationRegistrationDecisions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationRegistrationDecisions_RequestId_CreatedAt]
ON [dbo].[OrganizationRegistrationDecisions] ([RequestId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationRegistrationRequests_OrganizationId]
ON [dbo].[OrganizationRegistrationRequests] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OrganizationRegistrationRequests_State_RequestedAt]
ON [dbo].[OrganizationRegistrationRequests] ([State] ASC, [RequestedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_OrganizationRegistrationRequests_UserId]
ON [dbo].[OrganizationRegistrationRequests] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Organizations_Status_ApprovalStatus_IsDeleted]
ON [dbo].[Organizations] ([Status] ASC, [ApprovalStatus] ASC, [IsDeleted] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Organizations_CreatedByUserId_CreationKey]
ON [dbo].[Organizations] ([CreatedByUserId] ASC, [CreationKey] ASC)
WHERE ([CreatedByUserId] IS NOT NULL AND [CreationKey] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Organizations_RepresentativeUserId]
ON [dbo].[Organizations] ([RepresentativeUserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OutdoorTrackingSessions_BookingId_State]
ON [dbo].[OutdoorTrackingSessions] ([BookingId] ASC, [State] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OutdoorTrackingSessions_BranchId_State]
ON [dbo].[OutdoorTrackingSessions] ([BranchId] ASC, [State] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OutdoorTrackingSessions_ExpiresAt]
ON [dbo].[OutdoorTrackingSessions] ([ExpiresAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_OutdoorTrackingSessions_UserId]
ON [dbo].[OutdoorTrackingSessions] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PaymentProviderEvents_CreatedAt]
ON [dbo].[PaymentProviderEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_PaymentProviderEvents_Provider_ExternalId]
ON [dbo].[PaymentProviderEvents] ([Provider] ASC, [ExternalId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PaymentProviderEvents_TransactionId]
ON [dbo].[PaymentProviderEvents] ([TransactionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PaymentTransactions_CreatedAt]
ON [dbo].[PaymentTransactions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PaymentTransactions_InvoiceId_CreatedAt]
ON [dbo].[PaymentTransactions] ([InvoiceId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_PaymentTransactions_Provider_IdempotencyKey]
ON [dbo].[PaymentTransactions] ([Provider] ASC, [IdempotencyKey] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_PaymentTransactions_Provider_ProviderReference]
ON [dbo].[PaymentTransactions] ([Provider] ASC, [ProviderReference] ASC)
WHERE ([ProviderReference] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_PermissionDefinitions_Code]
ON [dbo].[PermissionDefinitions] ([Code] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PermissionDefinitions_CreatedAt]
ON [dbo].[PermissionDefinitions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PersonalNotifications_Recipient_Source_Created_Id]
ON [dbo].[PersonalNotifications] ([RecipientUserId] ASC, [SourceKind] ASC, [CreatedAt] ASC, [Id] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlaceSubmissions_BranchId]
ON [dbo].[PlaceSubmissions] ([BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlaceSubmissions_CreatedAt]
ON [dbo].[PlaceSubmissions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlaceSubmissions_ReviewedById]
ON [dbo].[PlaceSubmissions] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlaceSubmissions_State_CreatedAt]
ON [dbo].[PlaceSubmissions] ([State] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlaceSubmissions_UserId_CreatedAt]
ON [dbo].[PlaceSubmissions] ([UserId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlanEntitlements_CreatedAt]
ON [dbo].[PlanEntitlements] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_PlanEntitlements_PlanId_Code]
ON [dbo].[PlanEntitlements] ([PlanId] ASC, [Code] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlanPrices_CreatedAt]
ON [dbo].[PlanPrices] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlanPrices_PlanId_BillingCycle_Currency]
ON [dbo].[PlanPrices] ([PlanId] ASC, [BillingCycle] ASC, [Currency] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlatformSettings_CreatedAt]
ON [dbo].[PlatformSettings] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_PlatformSettings_Key]
ON [dbo].[PlatformSettings] ([Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PlatformSettings_UpdatedById]
ON [dbo].[PlatformSettings] ([UpdatedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PrivilegedAccessRequests_CreatedAt]
ON [dbo].[PrivilegedAccessRequests] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PrivilegedAccessRequests_RequestedById]
ON [dbo].[PrivilegedAccessRequests] ([RequestedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PrivilegedAccessRequests_ReviewedById]
ON [dbo].[PrivilegedAccessRequests] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_PrivilegedAccessRequests_TargetUserId_State]
ON [dbo].[PrivilegedAccessRequests] ([TargetUserId] ASC, [State] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEntries_BookingId_UserId_BranchId]
ON [dbo].[QueueEntries] ([BookingId] ASC, [UserId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEntries_BranchId_State_JoinedAt]
ON [dbo].[QueueEntries] ([BranchId] ASC, [State] ASC, [JoinedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEntries_CreatedAt]
ON [dbo].[QueueEntries] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEntries_TicketServiceId_BranchId]
ON [dbo].[QueueEntries] ([TicketServiceId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEntries_UserId_JoinedAt]
ON [dbo].[QueueEntries] ([UserId] ASC, [JoinedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEvents_ActorId]
ON [dbo].[QueueEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEvents_CreatedAt]
ON [dbo].[QueueEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_QueueEvents_QueueEntryId_CreatedAt]
ON [dbo].[QueueEvents] ([QueueEntryId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RecruitmentApplicationEvents_ActorId]
ON [dbo].[RecruitmentApplicationEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RecruitmentApplicationEvents_ApplicationId_CreatedAt]
ON [dbo].[RecruitmentApplicationEvents] ([ApplicationId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RecruitmentApplicationEvents_CreatedAt]
ON [dbo].[RecruitmentApplicationEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RecruitmentExams_ApplicationId_CreatedAt]
ON [dbo].[RecruitmentExams] ([ApplicationId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RecruitmentExams_CreatedAt]
ON [dbo].[RecruitmentExams] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RecruitmentExams_State_DeadlineAt]
ON [dbo].[RecruitmentExams] ([State] ASC, [DeadlineAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReportRuns_CreatedAt]
ON [dbo].[ReportRuns] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReportRuns_MediaAssetId]
ON [dbo].[ReportRuns] ([MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReportRuns_RequestedById_CreatedAt]
ON [dbo].[ReportRuns] ([RequestedById] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReportRuns_ScheduleId]
ON [dbo].[ReportRuns] ([ScheduleId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RequirementDefinitions_CreatedAt]
ON [dbo].[RequirementDefinitions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_RequirementDefinitions_EntityType_Key]
ON [dbo].[RequirementDefinitions] ([EntityType] ASC, [Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReviewAccessibilityFeatures_CreatedAt]
ON [dbo].[ReviewAccessibilityFeatures] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_ReviewAccessibilityFeatures_ReviewId_FeatureKey]
ON [dbo].[ReviewAccessibilityFeatures] ([ReviewId] ASC, [FeatureKey] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReviewModerationEvents_ActorId]
ON [dbo].[ReviewModerationEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReviewModerationEvents_CreatedAt]
ON [dbo].[ReviewModerationEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ReviewModerationEvents_ReviewId_CreatedAt]
ON [dbo].[ReviewModerationEvents] ([ReviewId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RolePermissions_CreatedAt]
ON [dbo].[RolePermissions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RolePermissions_PermissionId]
ON [dbo].[RolePermissions] ([PermissionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_RolePermissions_RoleId_PermissionId]
ON [dbo].[RolePermissions] ([RoleId] ASC, [PermissionId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RuntimeIncidents_Code_OccurredAt]
ON [dbo].[RuntimeIncidents] ([Code] ASC, [OccurredAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RuntimeIncidents_CreatedAt]
ON [dbo].[RuntimeIncidents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_RuntimeIncidents_OccurredAt]
ON [dbo].[RuntimeIncidents] ([OccurredAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_SavedItems_User_Kind_Target]
ON [dbo].[SavedItems] ([UserId] ASC, [Kind] ASC, [TargetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_SavedItems_Kind_Legacy]
ON [dbo].[SavedItems] ([Kind] ASC, [LegacyId] ASC)
WHERE ([LegacyId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SavedItems_OrganizationId]
ON [dbo].[SavedItems] ([OrganizationId] ASC)
WHERE ([OrganizationId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SavedItems_CatalogServiceId]
ON [dbo].[SavedItems] ([CatalogServiceId] ASC)
WHERE ([CatalogServiceId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SavedItems_TicketServiceId]
ON [dbo].[SavedItems] ([TicketServiceId] ASC)
WHERE ([TicketServiceId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SavedItems_BranchId]
ON [dbo].[SavedItems] ([BranchId] ASC)
WHERE ([BranchId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ScheduledReports_CreatedAt]
ON [dbo].[ScheduledReports] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ScheduledReports_Enabled_NextRunAt]
ON [dbo].[ScheduledReports] ([Enabled] ASC, [NextRunAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ScheduledReports_OwnerId]
ON [dbo].[ScheduledReports] ([OwnerId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SecurityEvents_ActorId]
ON [dbo].[SecurityEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SecurityEvents_CreatedAt]
ON [dbo].[SecurityEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SecurityEvents_Event_OccurredAt]
ON [dbo].[SecurityEvents] ([Event] ASC, [OccurredAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SecurityEvents_UserId_OccurredAt]
ON [dbo].[SecurityEvents] ([UserId] ASC, [OccurredAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ServiceAvailability_CreatedAt]
ON [dbo].[ServiceAvailability] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_ServiceAvailability_TicketServiceId_StartsAt_EndsAt]
ON [dbo].[ServiceAvailability] ([TicketServiceId] ASC, [StartsAt] ASC, [EndsAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_SpecialHours_ScheduleId_Date]
ON [dbo].[SpecialHours] ([ScheduleId] ASC, [Date] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_StripeCheckoutAttempts_PaymentIntentId]
ON [dbo].[StripeCheckoutAttempts] ([PaymentIntentId] ASC)
WHERE ([PaymentIntentId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_StripeCheckoutAttempts_PlanPriceId]
ON [dbo].[StripeCheckoutAttempts] ([PlanPriceId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_StripeCheckoutAttempts_SessionId]
ON [dbo].[StripeCheckoutAttempts] ([SessionId] ASC)
WHERE ([SessionId] IS NOT NULL)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SubscriptionGrantHistory_ActorId]
ON [dbo].[SubscriptionGrantHistory] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SubscriptionGrantHistory_SubscriptionId_At]
ON [dbo].[SubscriptionGrantHistory] ([SubscriptionId] ASC, [At] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_SubscriptionPlans_Code]
ON [dbo].[SubscriptionPlans] ([Code] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SubscriptionPlans_CreatedAt]
ON [dbo].[SubscriptionPlans] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Subscriptions_OrganizationId_Origin]
ON [dbo].[Subscriptions] ([OrganizationId] ASC, [Origin] ASC)
WHERE ([Origin]='admin-grant')
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Subscriptions_OrganizationId_Status_UpdatedAt]
ON [dbo].[Subscriptions] ([OrganizationId] ASC, [Status] ASC, [UpdatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_Subscriptions_PlanId]
ON [dbo].[Subscriptions] ([PlanId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SubscriptionUsage_CreatedAt]
ON [dbo].[SubscriptionUsage] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_SubscriptionUsage_SubscriptionId_Feature_PeriodStart]
ON [dbo].[SubscriptionUsage] ([SubscriptionId] ASC, [Feature] ASC, [PeriodStart] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportAttachments_CreatedAt]
ON [dbo].[SupportAttachments] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportAttachments_MediaAssetId]
ON [dbo].[SupportAttachments] ([MediaAssetId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportAttachments_MessageId_RequestId]
ON [dbo].[SupportAttachments] ([MessageId] ASC, [RequestId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportAttachments_RequestId]
ON [dbo].[SupportAttachments] ([RequestId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportCaseEvents_ActorId]
ON [dbo].[SupportCaseEvents] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportCaseEvents_CreatedAt]
ON [dbo].[SupportCaseEvents] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportCaseEvents_RequestId_CreatedAt]
ON [dbo].[SupportCaseEvents] ([RequestId] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportMessages_ActorId]
ON [dbo].[SupportMessages] ([ActorId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportMessages_CreatedAt]
ON [dbo].[SupportMessages] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportMessages_RequestId_SentAt]
ON [dbo].[SupportMessages] ([RequestId] ASC, [SentAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_SupportRequests_RequesterId_CommandId]
ON [dbo].[SupportRequests] ([RequesterId] ASC, [CommandId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportRequests_RequesterId_CreatedAt_Id]
ON [dbo].[SupportRequests] ([RequesterId] ASC, [CreatedAt] ASC, [Id] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportRequests_BranchId_OrganizationId]
ON [dbo].[SupportRequests] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportRequests_OrganizationId]
ON [dbo].[SupportRequests] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_SupportRequests_AssignedToUserId_Status_CreatedAt]
ON [dbo].[SupportRequests] ([AssignedToUserId] ASC, [Status] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_BranchId_IsRemoved_Active_IsPublished]
ON [dbo].[TicketServices] ([BranchId] ASC, [IsRemoved] ASC, [Active] ASC, [IsPublished] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_BranchId_OrganizationId]
ON [dbo].[TicketServices] ([BranchId] ASC, [OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_ConfiguredById]
ON [dbo].[TicketServices] ([ConfiguredById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_VerifiedById]
ON [dbo].[TicketServices] ([VerifiedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_CategoryId]
ON [dbo].[TicketServices] ([CategoryId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_OperatingScheduleId_BranchId]
ON [dbo].[TicketServices] ([OperatingScheduleId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_TicketServices_CategoryNamespace]
ON [dbo].[TicketServices] ([CategoryNamespace] ASC, [CategoryId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UnresolvedCatalogBranches_CreatedAt]
ON [dbo].[UnresolvedCatalogBranches] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UnresolvedCatalogBranches_LegacyId]
ON [dbo].[UnresolvedCatalogBranches] ([LegacyId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UnresolvedCatalogBranches_OrganizationId]
ON [dbo].[UnresolvedCatalogBranches] ([OrganizationId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UnresolvedCatalogBranches_ResolvedBranchId]
ON [dbo].[UnresolvedCatalogBranches] ([ResolvedBranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_UnresolvedCatalogBranches_SourceSnapshotId]
ON [dbo].[UnresolvedCatalogBranches] ([SourceSnapshotId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UserCareerSkills_CreatedAt]
ON [dbo].[UserCareerSkills] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_UserCareerSkills_UserId_Position]
ON [dbo].[UserCareerSkills] ([UserId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_UserCvDocuments_StorageKey]
ON [dbo].[UserCvDocuments] ([StorageKey] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_UserCvDocuments_UserId]
ON [dbo].[UserCvDocuments] ([UserId] ASC)
WHERE ([IsCurrent]=(1))
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UserCvDocuments_UserId_DeletionPending]
ON [dbo].[UserCvDocuments] ([UserId] ASC, [DeletionPending] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UserDisplayPreferences_CreatedAt]
ON [dbo].[UserDisplayPreferences] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_UserDisplayPreferences_UserId]
ON [dbo].[UserDisplayPreferences] ([UserId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UserRecentPlaces_BranchId]
ON [dbo].[UserRecentPlaces] ([BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UserRecentPlaces_CreatedAt]
ON [dbo].[UserRecentPlaces] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_UserRecentPlaces_UserId_BranchId]
ON [dbo].[UserRecentPlaces] ([UserId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_UserRecentPlaces_UserId_ViewedAt]
ON [dbo].[UserRecentPlaces] ([UserId] ASC, [ViewedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_VacancyQuestions_CreatedAt]
ON [dbo].[VacancyQuestions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_VacancyQuestions_VacancyId_Position]
ON [dbo].[VacancyQuestions] ([VacancyId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_VisitReviews_BookingId_UserId_BranchId]
ON [dbo].[VisitReviews] ([BookingId] ASC, [UserId] ASC, [BranchId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_VisitReviews_BranchId_State_CreatedAt]
ON [dbo].[VisitReviews] ([BranchId] ASC, [State] ASC, [CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_VisitReviews_CreatedAt]
ON [dbo].[VisitReviews] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_VisitReviews_PhotoMediaId]
ON [dbo].[VisitReviews] ([PhotoMediaId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_VisitReviews_ReviewedById]
ON [dbo].[VisitReviews] ([ReviewedById] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_VisitReviews_UserId_BookingId]
ON [dbo].[VisitReviews] ([UserId] ASC, [BookingId] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_WorkflowDefinitions_CreatedAt]
ON [dbo].[WorkflowDefinitions] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_WorkflowDefinitions_Key]
ON [dbo].[WorkflowDefinitions] ([Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE NONCLUSTERED INDEX [IX_WorkflowStages_CreatedAt]
ON [dbo].[WorkflowStages] ([CreatedAt] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_WorkflowStages_WorkflowId_Key]
ON [dbo].[WorkflowStages] ([WorkflowId] ASC, [Key] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_WorkflowStages_WorkflowId_Position]
ON [dbo].[WorkflowStages] ([WorkflowId] ASC, [Position] ASC)
WITH (IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

-- 03 / CHECK CONSTRAINTS

ALTER TABLE [dbo].[AccommodationNeeds] WITH CHECK ADD CONSTRAINT [CK_AccommodationNeeds_136_1] CHECK ([ScopeKind]='booking' AND [BookingId] IS NOT NULL AND [InterviewId] IS NULL OR [ScopeKind]='interview' AND [BookingId] IS NULL AND [InterviewId] IS NOT NULL);
ALTER TABLE [dbo].[AccommodationNeeds] CHECK CONSTRAINT [CK_AccommodationNeeds_136_1];
GO

ALTER TABLE [dbo].[AccountSessions] WITH CHECK ADD CONSTRAINT [CK_AccountSessions_Values] CHECK ([ExpiresAt]>[IssuedAt]);
ALTER TABLE [dbo].[AccountSessions] CHECK CONSTRAINT [CK_AccountSessions_Values];
GO

ALTER TABLE [dbo].[AiAnalysisJobs] WITH CHECK ADD CONSTRAINT [CK_AiAnalysisJobs_ResultJson] CHECK ([ResultJson] IS NULL OR isjson([ResultJson])=(1));
ALTER TABLE [dbo].[AiAnalysisJobs] CHECK CONSTRAINT [CK_AiAnalysisJobs_ResultJson];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [CK_Bookings_Duration] CHECK ([DurationMinutes]>=(15) AND [DurationMinutes]<=(120) AND ([BufferMinutes]>=(0) AND [BufferMinutes]<=(120)));
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [CK_Bookings_Duration];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [CK_Bookings_Period] CHECK ([EndsAt]>[StartsAt]);
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [CK_Bookings_Period];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [CK_Bookings_Status] CHECK ([Status]='waitlisted' OR [Status]='no-show' OR [Status]='cancelled' OR [Status]='completed' OR [Status]='in-progress' OR [Status]='confirmed' OR [Status]='pending');
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [CK_Bookings_Status];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [CK136_Bookings_3] CHECK ([ProposalPresent]=(0) AND [ProposalBranchId] IS NULL AND [ProposalOrganizationId] IS NULL AND [ProposalServiceId] IS NULL AND [ProposalDate] IS NULL AND [ProposalTime] IS NULL AND [ProposalRequiresAssistant] IS NULL AND [ProposalReason] IS NULL AND [ProposalCreatedAt] IS NULL AND [ProposalExpiresAt] IS NULL OR [ProposalPresent]=(1) AND [ProposalBranchId] IS NOT NULL AND [ProposalOrganizationId] IS NOT NULL AND [ProposalServiceId] IS NOT NULL AND [ProposalDate] IS NOT NULL AND [ProposalTime] IS NOT NULL AND [ProposalRequiresAssistant] IS NOT NULL AND [ProposalReason] IS NOT NULL AND [ProposalCreatedAt] IS NOT NULL AND [ProposalExpiresAt] IS NOT NULL);
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [CK136_Bookings_3];
GO

ALTER TABLE [dbo].[Branches] WITH CHECK ADD CONSTRAINT [CK_Branches_Latitude] CHECK ([Latitude] IS NULL OR [Latitude]>=(-90) AND [Latitude]<=(90));
ALTER TABLE [dbo].[Branches] CHECK CONSTRAINT [CK_Branches_Latitude];
GO

ALTER TABLE [dbo].[Branches] WITH CHECK ADD CONSTRAINT [CK_Branches_Longitude] CHECK ([Longitude] IS NULL OR [Longitude]>=(-180) AND [Longitude]<=(180));
ALTER TABLE [dbo].[Branches] CHECK CONSTRAINT [CK_Branches_Longitude];
GO

ALTER TABLE [dbo].[CatalogSourceSnapshots] WITH CHECK ADD CONSTRAINT [CK_CatalogSourceSnapshots_PayloadJson] CHECK (isjson([PayloadJson])=(1));
ALTER TABLE [dbo].[CatalogSourceSnapshots] CHECK CONSTRAINT [CK_CatalogSourceSnapshots_PayloadJson];
GO

ALTER TABLE [dbo].[CatalogTerms] WITH CHECK ADD CONSTRAINT [CK_CatalogTerms_136_1] CHECK ([Namespace]='service-category' OR [Namespace]='accessibility-feature');
ALTER TABLE [dbo].[CatalogTerms] CHECK CONSTRAINT [CK_CatalogTerms_136_1];
GO

ALTER TABLE [dbo].[CatalogTerms] WITH CHECK ADD CONSTRAINT [CK_CatalogTerms_136_2] CHECK ([Namespace]<>'accessibility-feature' OR [ParentId] IS NULL);
ALTER TABLE [dbo].[CatalogTerms] CHECK CONSTRAINT [CK_CatalogTerms_136_2];
GO

ALTER TABLE [dbo].[CatalogTerms] WITH CHECK ADD CONSTRAINT [CK_CatalogTerms_136_3] CHECK ([Namespace]<>'accessibility-feature' OR [Id] IS NOT NULL AND [Code] IS NOT NULL AND [Name] IS NOT NULL AND [Version] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[CatalogTerms] CHECK CONSTRAINT [CK_CatalogTerms_136_3];
GO

ALTER TABLE [dbo].[CatalogTerms] WITH CHECK ADD CONSTRAINT [CK_CatalogTerms_136_4] CHECK ([Namespace]<>'service-category' OR [Id] IS NOT NULL AND [Code] IS NOT NULL AND [Name] IS NOT NULL AND [Version] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[CatalogTerms] CHECK CONSTRAINT [CK_CatalogTerms_136_4];
GO

ALTER TABLE [dbo].[ConfigurationVersions] WITH CHECK ADD CONSTRAINT [CK_ConfigurationVersions_DefinitionJson] CHECK (isjson([DefinitionJson])=(1));
ALTER TABLE [dbo].[ConfigurationVersions] CHECK CONSTRAINT [CK_ConfigurationVersions_DefinitionJson];
GO

ALTER TABLE [dbo].[DeliveryOutbox] WITH CHECK ADD CONSTRAINT [CK_DeliveryOutbox_Values] CHECK ([Attempts]>=(0));
ALTER TABLE [dbo].[DeliveryOutbox] CHECK CONSTRAINT [CK_DeliveryOutbox_Values];
GO

ALTER TABLE [dbo].[ExamQuestions] WITH CHECK ADD CONSTRAINT [CK_ExamQuestions_Values] CHECK ([Points]>(0));
ALTER TABLE [dbo].[ExamQuestions] CHECK CONSTRAINT [CK_ExamQuestions_Values];
GO

ALTER TABLE [dbo].[FeatureFlags] WITH CHECK ADD CONSTRAINT [CK_FeatureFlags_Values] CHECK ([RolloutPercentage] IS NULL OR [RolloutPercentage]>=(0) AND [RolloutPercentage]<=(100));
ALTER TABLE [dbo].[FeatureFlags] CHECK CONSTRAINT [CK_FeatureFlags_Values];
GO

ALTER TABLE [dbo].[InvoiceLines] WITH CHECK ADD CONSTRAINT [CK_InvoiceLines_Values] CHECK ([Quantity]>(0) AND [UnitAmount]>=(0) AND [Total]>=(0));
ALTER TABLE [dbo].[InvoiceLines] CHECK CONSTRAINT [CK_InvoiceLines_Values];
GO

ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [CK_Invoices_Values] CHECK ([Total]>=(0));
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [CK_Invoices_Values];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [CK_JobInterviews_AccessibilitySnapshotJson] CHECK ([AccessibilitySnapshotJson] IS NULL OR isjson([AccessibilitySnapshotJson])=(1));
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [CK_JobInterviews_AccessibilitySnapshotJson];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [CK_JobInterviews_Values] CHECK ([EndsAt]>[StartsAt] AND [Round]>(0));
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [CK_JobInterviews_Values];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [CK_JobInterviews_VisitBranch] CHECK ([BookingId] IS NULL OR [BranchId] IS NOT NULL);
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [CK_JobInterviews_VisitBranch];
GO

ALTER TABLE [dbo].[JobVacancies] WITH CHECK ADD CONSTRAINT [CK_JobVacancies_Values] CHECK ([Positions]>=(1) AND [Positions]<=(10000));
ALTER TABLE [dbo].[JobVacancies] CHECK CONSTRAINT [CK_JobVacancies_Values];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [CK_LocalizedTexts_136_1] CHECK ([ResourceKind]='organization' AND [BranchId] IS NULL AND [CatalogServiceId] IS NULL AND [TicketServiceId] IS NULL AND [Instructions] IS NULL OR [ResourceKind]='branch' AND [BranchId] IS NOT NULL AND [CatalogServiceId] IS NULL AND [TicketServiceId] IS NULL AND [Instructions] IS NULL OR [ResourceKind]='catalog-service' AND [BranchId] IS NULL AND [CatalogServiceId] IS NOT NULL AND [TicketServiceId] IS NULL OR [ResourceKind]='ticket-service' AND [BranchId] IS NOT NULL AND [CatalogServiceId] IS NULL AND [TicketServiceId] IS NOT NULL);
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [CK_LocalizedTexts_136_1];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [CK_LocalizedTexts_136_2] CHECK ([ResourceKind]<>'organization' OR [LegacyId] IS NOT NULL AND [OrganizationId] IS NOT NULL AND [Language] IS NOT NULL AND [Name] IS NOT NULL AND [Version] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [CK_LocalizedTexts_136_2];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [CK_LocalizedTexts_136_3] CHECK ([ResourceKind]<>'branch' OR [LegacyId] IS NOT NULL AND [BranchId] IS NOT NULL AND [Language] IS NOT NULL AND [Name] IS NOT NULL AND [Version] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [CK_LocalizedTexts_136_3];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [CK_LocalizedTexts_136_4] CHECK ([ResourceKind]<>'catalog-service' OR [LegacyId] IS NOT NULL AND [CatalogServiceId] IS NOT NULL AND [Language] IS NOT NULL AND [Name] IS NOT NULL AND [Version] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [CK_LocalizedTexts_136_4];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [CK_LocalizedTexts_136_5] CHECK ([ResourceKind]<>'ticket-service' OR [LegacyId] IS NOT NULL AND [TicketServiceId] IS NOT NULL AND [Language] IS NOT NULL AND [Name] IS NOT NULL AND [Version] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [CK_LocalizedTexts_136_5];
GO

ALTER TABLE [dbo].[MaintenanceWindows] WITH CHECK ADD CONSTRAINT [CK_MaintenanceWindows_Values] CHECK ([EndsAt] IS NULL OR [EndsAt]>[StartsAt]);
ALTER TABLE [dbo].[MaintenanceWindows] CHECK CONSTRAINT [CK_MaintenanceWindows_Values];
GO

ALTER TABLE [dbo].[MediaAssets] WITH CHECK ADD CONSTRAINT [CK_MediaAssets_Values] CHECK ([Length]>=(0));
ALTER TABLE [dbo].[MediaAssets] CHECK CONSTRAINT [CK_MediaAssets_Values];
GO

ALTER TABLE [dbo].[NavigationEdges] WITH CHECK ADD CONSTRAINT [CK_NavigationEdges_Values] CHECK ([FromNodeId]<>[ToNodeId] AND ([Distance] IS NULL OR [Distance]>=(0)));
ALTER TABLE [dbo].[NavigationEdges] CHECK CONSTRAINT [CK_NavigationEdges_Values];
GO

ALTER TABLE [dbo].[OperatingPeriods] WITH CHECK ADD CONSTRAINT [CK_OperatingPeriods_Time] CHECK ([OpenMinute]>=(0) AND [CloseMinute]<=(1439) AND [CloseMinute]>[OpenMinute]);
ALTER TABLE [dbo].[OperatingPeriods] CHECK CONSTRAINT [CK_OperatingPeriods_Time];
GO

ALTER TABLE [dbo].[OrganizationRegistrationRequests] WITH CHECK ADD CONSTRAINT [CK_OrgRegistration_Document] CHECK (datalength([DocumentContent])>=(1) AND datalength([DocumentContent])<=(5242880));
ALTER TABLE [dbo].[OrganizationRegistrationRequests] CHECK CONSTRAINT [CK_OrgRegistration_Document];
GO

ALTER TABLE [dbo].[OrganizationRegistrationRequests] WITH CHECK ADD CONSTRAINT [CK_OrgRegistration_State] CHECK ([State]='rejected' OR [State]='approved' OR [State]='pending');
ALTER TABLE [dbo].[OrganizationRegistrationRequests] CHECK CONSTRAINT [CK_OrgRegistration_State];
GO

ALTER TABLE [dbo].[OutdoorTrackingSessions] WITH CHECK ADD CONSTRAINT [CK_OutdoorTracking_Position] CHECK ([Latitude] IS NULL AND [Longitude] IS NULL OR [Latitude]>=(-90) AND [Latitude]<=(90) AND ([Longitude]>=(-180) AND [Longitude]<=(180)));
ALTER TABLE [dbo].[OutdoorTrackingSessions] CHECK CONSTRAINT [CK_OutdoorTracking_Position];
GO

ALTER TABLE [dbo].[PaymentTransactions] WITH CHECK ADD CONSTRAINT [CK_PaymentTransactions_Values] CHECK ([Amount]>=(0));
ALTER TABLE [dbo].[PaymentTransactions] CHECK CONSTRAINT [CK_PaymentTransactions_Values];
GO

ALTER TABLE [dbo].[PersonalNotifications] WITH CHECK ADD CONSTRAINT [CK_PersonalNotifications_136_1] CHECK ([SourceKind]='user' AND [ResourceType] IS NULL AND [ResourceReference] IS NULL AND [UpdatedAt] IS NULL OR [SourceKind]='admin' AND [BookingReference] IS NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[PersonalNotifications] CHECK CONSTRAINT [CK_PersonalNotifications_136_1];
GO

ALTER TABLE [dbo].[PlanEntitlements] WITH CHECK ADD CONSTRAINT [CK_PlanEntitlements_Values] CHECK ([Limit] IS NULL OR [Limit]>=(0));
ALTER TABLE [dbo].[PlanEntitlements] CHECK CONSTRAINT [CK_PlanEntitlements_Values];
GO

ALTER TABLE [dbo].[PlanPrices] WITH CHECK ADD CONSTRAINT [CK_PlanPrices_Values] CHECK ([Amount]>=(0) AND ([ValidTo] IS NULL OR [ValidFrom] IS NULL OR [ValidTo]>[ValidFrom]));
ALTER TABLE [dbo].[PlanPrices] CHECK CONSTRAINT [CK_PlanPrices_Values];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [CK_QueueEntries_Values] CHECK ([Number]>(0));
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [CK_QueueEntries_Values];
GO

ALTER TABLE [dbo].[RecruitmentExams] WITH CHECK ADD CONSTRAINT [CK_RecruitmentExams_Values] CHECK ([DeadlineAt]>[StartsAt] AND ([DurationMinutes]>=(5) AND [DurationMinutes]<=(240)) AND ([MaxScore]>=(10) AND [MaxScore]<=(1000)) AND ([PassScore]>=(1) AND [PassScore]<=[MaxScore]));
ALTER TABLE [dbo].[RecruitmentExams] CHECK CONSTRAINT [CK_RecruitmentExams_Values];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [CK_SavedItems_136_1] CHECK ([Kind]='organization' AND [OrganizationId] IS NOT NULL AND [CatalogServiceId] IS NULL AND [TicketServiceId] IS NULL AND [BranchId] IS NULL OR [Kind]='catalog-service' AND [OrganizationId] IS NULL AND [CatalogServiceId] IS NOT NULL AND [TicketServiceId] IS NULL AND [BranchId] IS NULL OR [Kind]='service' AND [OrganizationId] IS NULL AND [CatalogServiceId] IS NULL AND [TicketServiceId] IS NOT NULL AND [BranchId] IS NULL OR [Kind]='branch' AND [OrganizationId] IS NULL AND [CatalogServiceId] IS NULL AND [TicketServiceId] IS NULL AND [BranchId] IS NOT NULL);
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [CK_SavedItems_136_1];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [CK_SavedItems_136_2] CHECK ([MigratedFromLegacy]=(0) AND [LegacyId] IS NULL AND [LegacyVersion] IS NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL OR [MigratedFromLegacy]=(1) AND [Kind]='branch' AND [LegacyId] IS NULL AND [LegacyVersion] IS NULL AND [CreatedAt] IS NULL AND [UpdatedAt] IS NULL OR [MigratedFromLegacy]=(1) AND [Kind]<>'branch' AND [LegacyId] IS NOT NULL AND [LegacyVersion] IS NOT NULL AND [CreatedAt] IS NOT NULL AND [UpdatedAt] IS NOT NULL);
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [CK_SavedItems_136_2];
GO

ALTER TABLE [dbo].[ServiceAvailability] WITH CHECK ADD CONSTRAINT [CK_ServiceAvailability_Values] CHECK ([EndsAt]>[StartsAt] AND ([Capacity] IS NULL OR [Capacity]>=(0)));
ALTER TABLE [dbo].[ServiceAvailability] CHECK CONSTRAINT [CK_ServiceAvailability_Values];
GO

ALTER TABLE [dbo].[SpecialOperatingPeriods] WITH CHECK ADD CONSTRAINT [CK_SpecialOperatingPeriods_Time] CHECK ([OpenMinute]>=(0) AND [CloseMinute]<=(1439) AND [CloseMinute]>[OpenMinute]);
ALTER TABLE [dbo].[SpecialOperatingPeriods] CHECK CONSTRAINT [CK_SpecialOperatingPeriods_Time];
GO

ALTER TABLE [dbo].[StripeCheckoutAttempts] WITH CHECK ADD CONSTRAINT [CK_StripeCheckout_Period] CHECK ([PeriodMonths]=(12) OR [PeriodMonths]=(1));
ALTER TABLE [dbo].[StripeCheckoutAttempts] CHECK CONSTRAINT [CK_StripeCheckout_Period];
GO

ALTER TABLE [dbo].[Subscriptions] WITH CHECK ADD CONSTRAINT [CK_Subscriptions_Dates] CHECK ([NonExpiring]=(1) AND [EndDate] IS NULL OR [NonExpiring]=(0) AND [EndDate] IS NOT NULL AND [EndDate]>[StartDate]);
ALTER TABLE [dbo].[Subscriptions] CHECK CONSTRAINT [CK_Subscriptions_Dates];
GO

ALTER TABLE [dbo].[Subscriptions] WITH CHECK ADD CONSTRAINT [CK136_Subscriptions_1] CHECK ([EntitlementPresent]=(0) AND [EntitlementBranches] IS NULL AND [EntitlementOrganizationUsers] IS NULL AND [EntitlementAiAnalysesPerMonth] IS NULL AND [EntitlementServiceManagement] IS NULL AND [EntitlementBookingManagement] IS NULL AND [EntitlementQueueManagement] IS NULL AND [EntitlementAccessibilityEvidence] IS NULL AND [EntitlementReporting] IS NULL AND [EntitlementAuditHistory] IS NULL OR [EntitlementPresent]=(1) AND [EntitlementBranches] IS NOT NULL AND [EntitlementOrganizationUsers] IS NOT NULL AND [EntitlementAiAnalysesPerMonth] IS NOT NULL AND [EntitlementServiceManagement] IS NOT NULL AND [EntitlementBookingManagement] IS NOT NULL AND [EntitlementQueueManagement] IS NOT NULL AND [EntitlementAccessibilityEvidence] IS NOT NULL AND [EntitlementReporting] IS NOT NULL AND [EntitlementAuditHistory] IS NOT NULL);
ALTER TABLE [dbo].[Subscriptions] CHECK CONSTRAINT [CK136_Subscriptions_1];
GO

ALTER TABLE [dbo].[Subscriptions] WITH CHECK ADD CONSTRAINT [CK136_Subscriptions_2] CHECK ([EntitlementPresent]=(0) OR [EntitlementBranches]>=(1) AND [EntitlementOrganizationUsers]>=(1) AND [EntitlementAiAnalysesPerMonth]>=(0));
ALTER TABLE [dbo].[Subscriptions] CHECK CONSTRAINT [CK136_Subscriptions_2];
GO

ALTER TABLE [dbo].[SubscriptionUsage] WITH CHECK ADD CONSTRAINT [CK_SubscriptionUsage_Values] CHECK ([Count]>=(0) AND [PeriodEnd]>[PeriodStart]);
ALTER TABLE [dbo].[SubscriptionUsage] CHECK CONSTRAINT [CK_SubscriptionUsage_Values];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [CK_SupportRequests_BranchScope] CHECK ([BranchId] IS NULL OR [OrganizationId] IS NOT NULL);
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [CK_SupportRequests_BranchScope];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [CK_SupportRequests_Description] CHECK (len(ltrim(rtrim([Description])))>=(1) AND len(ltrim(rtrim([Description])))<=(4000));
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [CK_SupportRequests_Description];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [CK_SupportRequests_Priority] CHECK ([Priority] IS NULL OR ([Priority]=N'Urgent' OR [Priority]=N'High' OR [Priority]=N'Medium' OR [Priority]=N'Low'));
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [CK_SupportRequests_Priority];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [CK_SupportRequests_Subject] CHECK (len(ltrim(rtrim([Subject])))>=(1) AND len(ltrim(rtrim([Subject])))<=(120));
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [CK_SupportRequests_Subject];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [CK_TicketServices_Buffer] CHECK ([BufferMinutes] IS NULL OR [BufferMinutes]>=(0) AND [BufferMinutes]<=(120));
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [CK_TicketServices_Buffer];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [CK_TicketServices_Capacity] CHECK ([Capacity] IS NULL OR [Capacity]>=(1) AND [Capacity]<=(100));
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [CK_TicketServices_Capacity];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [CK_TicketServices_Duration] CHECK ([DurationMinutes] IS NULL OR [DurationMinutes]>=(15) AND [DurationMinutes]<=(120));
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [CK_TicketServices_Duration];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [CK_TicketServices_Fee] CHECK ([Fee] IS NULL OR [Fee]>=(0));
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [CK_TicketServices_Fee];
GO

ALTER TABLE [dbo].[UserAccessibilityPreferences] WITH CHECK ADD CONSTRAINT [CK_UserAccessibilityPreferences_Size] CHECK ([Size]='xlarge' OR [Size]='large' OR [Size]='normal');
ALTER TABLE [dbo].[UserAccessibilityPreferences] CHECK CONSTRAINT [CK_UserAccessibilityPreferences_Size];
GO

ALTER TABLE [dbo].[UserAccessNeeds] WITH CHECK ADD CONSTRAINT [CK_UserAccessNeeds_Guidance] CHECK ([GuidanceMethod]='both' OR [GuidanceMethod]='voice' OR [GuidanceMethod]='text');
ALTER TABLE [dbo].[UserAccessNeeds] CHECK CONSTRAINT [CK_UserAccessNeeds_Guidance];
GO

ALTER TABLE [dbo].[UserAccessNeedSelections] WITH CHECK ADD CONSTRAINT [CK_UserAccessNeedSelections_Kind] CHECK ([Kind]='route' OR [Kind]='need');
ALTER TABLE [dbo].[UserAccessNeedSelections] CHECK CONSTRAINT [CK_UserAccessNeedSelections_Kind];
GO

ALTER TABLE [dbo].[UserCvDocuments] WITH CHECK ADD CONSTRAINT [CK_UserCvDocuments_Size] CHECK ([Size]>(0) AND [Size]<=(8388608));
ALTER TABLE [dbo].[UserCvDocuments] CHECK CONSTRAINT [CK_UserCvDocuments_Size];
GO

ALTER TABLE [dbo].[UserCvDocuments] WITH CHECK ADD CONSTRAINT [CK_UserCvDocuments_State] CHECK ([IsCurrent]=(0) OR [DeletionPending]=(0));
ALTER TABLE [dbo].[UserCvDocuments] CHECK CONSTRAINT [CK_UserCvDocuments_State];
GO

ALTER TABLE [dbo].[UserProfiles] WITH CHECK ADD CONSTRAINT [CK_UserProfiles_Name] CHECK (len(ltrim(rtrim([Name])))>=(1) AND len(ltrim(rtrim([Name])))<=(80));
ALTER TABLE [dbo].[UserProfiles] CHECK CONSTRAINT [CK_UserProfiles_Name];
GO

ALTER TABLE [dbo].[UserProfiles] WITH CHECK ADD CONSTRAINT [CK_UserProfiles_Phone] CHECK (len([ContactPhone])>=(8) AND len([ContactPhone])<=(25));
ALTER TABLE [dbo].[UserProfiles] CHECK CONSTRAINT [CK_UserProfiles_Phone];
GO

ALTER TABLE [dbo].[UserProfiles] WITH CHECK ADD CONSTRAINT [CK136_UserProfiles_2] CHECK ([CareerPresent]=(1) OR [City] IS NULL AND [EducationLevel] IS NULL AND [University] IS NULL AND [Major] IS NULL AND [GraduationYear] IS NULL AND [Gpa] IS NULL AND [EmploymentStatus] IS NULL AND [YearsExperience] IS NULL AND [Skills] IS NULL AND [LinkedinUrl] IS NULL AND [PortfolioUrl] IS NULL AND [ProfessionalSummary] IS NULL);
ALTER TABLE [dbo].[UserProfiles] CHECK CONSTRAINT [CK136_UserProfiles_2];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [CK_VisitReviews_Values] CHECK ([Rating]>=(1) AND [Rating]<=(5));
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [CK_VisitReviews_Values];
GO

ALTER TABLE [dbo].[WeeklyHours] WITH CHECK ADD CONSTRAINT [CK_WeeklyHours_Day] CHECK ([Day]>=(0) AND [Day]<=(6));
ALTER TABLE [dbo].[WeeklyHours] CHECK CONSTRAINT [CK_WeeklyHours_Day];
GO

-- 04 / FOREIGN KEYS

ALTER TABLE [dbo].[AccessibilityReportEvents] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReportEvents_AccessibilityReports_ReportId]
FOREIGN KEY ([ReportId])
REFERENCES [dbo].[AccessibilityReports] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReportEvents] CHECK CONSTRAINT [FK_AccessibilityReportEvents_AccessibilityReports_ReportId];
GO

ALTER TABLE [dbo].[AccessibilityReportEvents] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReportEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReportEvents] CHECK CONSTRAINT [FK_AccessibilityReportEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[AccessibilityReportMedia] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReportMedia_AccessibilityReports_ReportId]
FOREIGN KEY ([ReportId])
REFERENCES [dbo].[AccessibilityReports] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReportMedia] CHECK CONSTRAINT [FK_AccessibilityReportMedia_AccessibilityReports_ReportId];
GO

ALTER TABLE [dbo].[AccessibilityReportMedia] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReportMedia_MediaAssets_MediaAssetId]
FOREIGN KEY ([MediaAssetId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReportMedia] CHECK CONSTRAINT [FK_AccessibilityReportMedia_MediaAssets_MediaAssetId];
GO

ALTER TABLE [dbo].[AccessibilityReports] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReports_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReports] CHECK CONSTRAINT [FK_AccessibilityReports_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[AccessibilityReports] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReports_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReports] CHECK CONSTRAINT [FK_AccessibilityReports_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AccessibilityReports] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReports_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReports] CHECK CONSTRAINT [FK_AccessibilityReports_Bookings_BookingId];
GO

ALTER TABLE [dbo].[AccessibilityReports] WITH CHECK ADD CONSTRAINT [FK_AccessibilityReports_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccessibilityReports] CHECK CONSTRAINT [FK_AccessibilityReports_Branches_BranchId];
GO

ALTER TABLE [dbo].[AccommodationNeeds] WITH CHECK ADD CONSTRAINT [FK_AccommodationNeeds_Booking]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccommodationNeeds] CHECK CONSTRAINT [FK_AccommodationNeeds_Booking];
GO

ALTER TABLE [dbo].[AccommodationNeeds] WITH CHECK ADD CONSTRAINT [FK_AccommodationNeeds_Interview]
FOREIGN KEY ([InterviewId])
REFERENCES [dbo].[JobInterviews] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccommodationNeeds] CHECK CONSTRAINT [FK_AccommodationNeeds_Interview];
GO

ALTER TABLE [dbo].[AccountSecurityStates] WITH CHECK ADD CONSTRAINT [FK_AccountSecurityStates_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccountSecurityStates] CHECK CONSTRAINT [FK_AccountSecurityStates_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AccountSessions] WITH CHECK ADD CONSTRAINT [FK_AccountSessions_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AccountSessions] CHECK CONSTRAINT [FK_AccountSessions_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AiAnalysisJobs] WITH CHECK ADD CONSTRAINT [FK_AiAnalysisJobs_AiProviderConfigurations_ProviderConfigurationId]
FOREIGN KEY ([ProviderConfigurationId])
REFERENCES [dbo].[AiProviderConfigurations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AiAnalysisJobs] CHECK CONSTRAINT [FK_AiAnalysisJobs_AiProviderConfigurations_ProviderConfigurationId];
GO

ALTER TABLE [dbo].[AiAnalysisJobs] WITH CHECK ADD CONSTRAINT [FK_AiAnalysisJobs_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AiAnalysisJobs] CHECK CONSTRAINT [FK_AiAnalysisJobs_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AiAnalysisJobs] WITH CHECK ADD CONSTRAINT [FK_AiAnalysisJobs_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AiAnalysisJobs] CHECK CONSTRAINT [FK_AiAnalysisJobs_Branches_BranchId];
GO

ALTER TABLE [dbo].[AiPromptTemplates] WITH CHECK ADD CONSTRAINT [FK_AiPromptTemplates_AiProviderConfigurations_ProviderConfigurationId]
FOREIGN KEY ([ProviderConfigurationId])
REFERENCES [dbo].[AiProviderConfigurations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AiPromptTemplates] CHECK CONSTRAINT [FK_AiPromptTemplates_AiProviderConfigurations_ProviderConfigurationId];
GO

ALTER TABLE [dbo].[AnnouncementReads] WITH CHECK ADD CONSTRAINT [FK_AnnouncementReads_Announcements_AnnouncementId]
FOREIGN KEY ([AnnouncementId])
REFERENCES [dbo].[Announcements] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AnnouncementReads] CHECK CONSTRAINT [FK_AnnouncementReads_Announcements_AnnouncementId];
GO

ALTER TABLE [dbo].[AnnouncementReads] WITH CHECK ADD CONSTRAINT [FK_AnnouncementReads_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AnnouncementReads] CHECK CONSTRAINT [FK_AnnouncementReads_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[Announcements] WITH CHECK ADD CONSTRAINT [FK_Announcements_AspNetUsers_CreatedById]
FOREIGN KEY ([CreatedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Announcements] CHECK CONSTRAINT [FK_Announcements_AspNetUsers_CreatedById];
GO

ALTER TABLE [dbo].[ApplicationAnswers] WITH CHECK ADD CONSTRAINT [FK_ApplicationAnswers_JobApplications_ApplicationId]
FOREIGN KEY ([ApplicationId])
REFERENCES [dbo].[JobApplications] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationAnswers] CHECK CONSTRAINT [FK_ApplicationAnswers_JobApplications_ApplicationId];
GO

ALTER TABLE [dbo].[ApplicationAnswers] WITH CHECK ADD CONSTRAINT [FK_ApplicationAnswers_JobApplications_ApplicationId_VacancyId]
FOREIGN KEY ([ApplicationId], [VacancyId])
REFERENCES [dbo].[JobApplications] ([Id], [VacancyId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationAnswers] CHECK CONSTRAINT [FK_ApplicationAnswers_JobApplications_ApplicationId_VacancyId];
GO

ALTER TABLE [dbo].[ApplicationAnswers] WITH CHECK ADD CONSTRAINT [FK_ApplicationAnswers_JobVacancies_VacancyId]
FOREIGN KEY ([VacancyId])
REFERENCES [dbo].[JobVacancies] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationAnswers] CHECK CONSTRAINT [FK_ApplicationAnswers_JobVacancies_VacancyId];
GO

ALTER TABLE [dbo].[ApplicationAnswers] WITH CHECK ADD CONSTRAINT [FK_ApplicationAnswers_VacancyQuestions_QuestionId]
FOREIGN KEY ([QuestionId])
REFERENCES [dbo].[VacancyQuestions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationAnswers] CHECK CONSTRAINT [FK_ApplicationAnswers_VacancyQuestions_QuestionId];
GO

ALTER TABLE [dbo].[ApplicationAnswers] WITH CHECK ADD CONSTRAINT [FK_ApplicationAnswers_VacancyQuestions_QuestionId_VacancyId]
FOREIGN KEY ([QuestionId], [VacancyId])
REFERENCES [dbo].[VacancyQuestions] ([Id], [VacancyId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationAnswers] CHECK CONSTRAINT [FK_ApplicationAnswers_VacancyQuestions_QuestionId_VacancyId];
GO

ALTER TABLE [dbo].[ApplicationProfileSnapshots] WITH CHECK ADD CONSTRAINT [FK_ApplicationProfileSnapshots_JobApplications_ApplicationId]
FOREIGN KEY ([ApplicationId])
REFERENCES [dbo].[JobApplications] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationProfileSnapshots] CHECK CONSTRAINT [FK_ApplicationProfileSnapshots_JobApplications_ApplicationId];
GO

ALTER TABLE [dbo].[ApplicationProfileSnapshots] WITH CHECK ADD CONSTRAINT [FK_ApplicationProfileSnapshots_MediaAssets_CvMediaId]
FOREIGN KEY ([CvMediaId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ApplicationProfileSnapshots] CHECK CONSTRAINT [FK_ApplicationProfileSnapshots_MediaAssets_CvMediaId];
GO

ALTER TABLE [dbo].[AspNetRoleClaims] WITH CHECK ADD CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
FOREIGN KEY ([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetRoleClaims] CHECK CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId];
GO

ALTER TABLE [dbo].[AspNetUserClaims] WITH CHECK ADD CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserClaims] CHECK CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AspNetUserLogins] WITH CHECK ADD CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserLogins] CHECK CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AspNetUserRoles] WITH CHECK ADD CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
FOREIGN KEY ([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserRoles] CHECK CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId];
GO

ALTER TABLE [dbo].[AspNetUserRoles] WITH CHECK ADD CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserRoles] CHECK CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AspNetUserTokens] WITH CHECK ADD CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserTokens] CHECK CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[AutomationRuns] WITH CHECK ADD CONSTRAINT [FK_AutomationRuns_AutomationDefinitions_DefinitionId]
FOREIGN KEY ([DefinitionId])
REFERENCES [dbo].[AutomationDefinitions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AutomationRuns] CHECK CONSTRAINT [FK_AutomationRuns_AutomationDefinitions_DefinitionId];
GO

ALTER TABLE [dbo].[BookingEvents] WITH CHECK ADD CONSTRAINT [FK_BookingEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BookingEvents] CHECK CONSTRAINT [FK_BookingEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[BookingEvents] WITH CHECK ADD CONSTRAINT [FK_BookingEvents_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BookingEvents] CHECK CONSTRAINT [FK_BookingEvents_Bookings_BookingId];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [FK_Bookings_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [FK_Bookings_AspNetUsers_VerifiedById]
FOREIGN KEY ([VerifiedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_AspNetUsers_VerifiedById];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [FK_Bookings_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [FK_Bookings_Proposal_FK_BookingProposals_Branches_BranchId_OrganizationId]
FOREIGN KEY ([ProposalBranchId], [ProposalOrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_Proposal_FK_BookingProposals_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [FK_Bookings_Proposal_FK_BookingProposals_TicketServices_ServiceId_BranchId_OrganizationId]
FOREIGN KEY ([ProposalServiceId], [ProposalBranchId], [ProposalOrganizationId])
REFERENCES [dbo].[TicketServices] ([Id], [BranchId], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_Proposal_FK_BookingProposals_TicketServices_ServiceId_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[Bookings] WITH CHECK ADD CONSTRAINT [FK_Bookings_TicketServices_ServiceId_BranchId_OrganizationId]
FOREIGN KEY ([ServiceId], [BranchId], [OrganizationId])
REFERENCES [dbo].[TicketServices] ([Id], [BranchId], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_TicketServices_ServiceId_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[BranchAccessibilityAssessments] WITH CHECK ADD CONSTRAINT [FK_BranchAccessibilityAssessments_AspNetUsers_VerifiedById]
FOREIGN KEY ([VerifiedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchAccessibilityAssessments] CHECK CONSTRAINT [FK_BranchAccessibilityAssessments_AspNetUsers_VerifiedById];
GO

ALTER TABLE [dbo].[BranchAccessibilityAssessments] WITH CHECK ADD CONSTRAINT [FK_BranchAccessibilityAssessments_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchAccessibilityAssessments] CHECK CONSTRAINT [FK_BranchAccessibilityAssessments_Branches_BranchId];
GO

ALTER TABLE [dbo].[BranchDeclaredServices] WITH CHECK ADD CONSTRAINT [FK_BranchDeclaredServices_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchDeclaredServices] CHECK CONSTRAINT [FK_BranchDeclaredServices_Branches_BranchId];
GO

ALTER TABLE [dbo].[Branches] WITH CHECK ADD CONSTRAINT [FK_Branches_AspNetUsers_CreatedByUserId]
FOREIGN KEY ([CreatedByUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Branches] CHECK CONSTRAINT [FK_Branches_AspNetUsers_CreatedByUserId];
GO

ALTER TABLE [dbo].[Branches] WITH CHECK ADD CONSTRAINT [FK_Branches_OperatingSchedules_OperatingScheduleId_Id]
FOREIGN KEY ([OperatingScheduleId], [Id])
REFERENCES [dbo].[OperatingSchedules] ([Id], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Branches] CHECK CONSTRAINT [FK_Branches_OperatingSchedules_OperatingScheduleId_Id];
GO

ALTER TABLE [dbo].[Branches] WITH CHECK ADD CONSTRAINT [FK_Branches_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Branches] CHECK CONSTRAINT [FK_Branches_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[BranchFacilities] WITH CHECK ADD CONSTRAINT [FK_BranchFacilities_AspNetUsers_VerifiedById]
FOREIGN KEY ([VerifiedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchFacilities] CHECK CONSTRAINT [FK_BranchFacilities_AspNetUsers_VerifiedById];
GO

ALTER TABLE [dbo].[BranchFacilities] WITH CHECK ADD CONSTRAINT [FK_BranchFacilities_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchFacilities] CHECK CONSTRAINT [FK_BranchFacilities_Branches_BranchId];
GO

ALTER TABLE [dbo].[BranchFacilities] WITH CHECK ADD CONSTRAINT [FK_BranchFacilities_FeatureNamespace]
FOREIGN KEY ([FeatureNamespace], [FeatureId])
REFERENCES [dbo].[CatalogTerms] ([Namespace], [Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchFacilities] CHECK CONSTRAINT [FK_BranchFacilities_FeatureNamespace];
GO

ALTER TABLE [dbo].[BranchFacilities] WITH CHECK ADD CONSTRAINT [FK_BranchFacilities_MediaAssets_EvidenceMediaId]
FOREIGN KEY ([EvidenceMediaId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchFacilities] CHECK CONSTRAINT [FK_BranchFacilities_MediaAssets_EvidenceMediaId];
GO

ALTER TABLE [dbo].[BranchFloors] WITH CHECK ADD CONSTRAINT [FK_BranchFloors_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchFloors] CHECK CONSTRAINT [FK_BranchFloors_Branches_BranchId];
GO

ALTER TABLE [dbo].[BranchMedia] WITH CHECK ADD CONSTRAINT [FK_BranchMedia_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchMedia] CHECK CONSTRAINT [FK_BranchMedia_Branches_BranchId];
GO

ALTER TABLE [dbo].[BranchMedia] WITH CHECK ADD CONSTRAINT [FK_BranchMedia_MediaAssets_MediaAssetId]
FOREIGN KEY ([MediaAssetId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchMedia] CHECK CONSTRAINT [FK_BranchMedia_MediaAssets_MediaAssetId];
GO

ALTER TABLE [dbo].[BranchReviewDecisions] WITH CHECK ADD CONSTRAINT [FK_BranchReviewDecisions_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchReviewDecisions] CHECK CONSTRAINT [FK_BranchReviewDecisions_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[BranchReviewDecisions] WITH CHECK ADD CONSTRAINT [FK_BranchReviewDecisions_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchReviewDecisions] CHECK CONSTRAINT [FK_BranchReviewDecisions_Branches_BranchId];
GO

ALTER TABLE [dbo].[BranchServices] WITH CHECK ADD CONSTRAINT [FK_BranchServices_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchServices] CHECK CONSTRAINT [FK_BranchServices_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[BranchServices] WITH CHECK ADD CONSTRAINT [FK_BranchServices_CatalogServices_ServiceId_OrganizationId]
FOREIGN KEY ([ServiceId], [OrganizationId])
REFERENCES [dbo].[CatalogServices] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[BranchServices] CHECK CONSTRAINT [FK_BranchServices_CatalogServices_ServiceId_OrganizationId];
GO

ALTER TABLE [dbo].[CatalogImportBatches] WITH CHECK ADD CONSTRAINT [FK_CatalogImportBatches_AspNetUsers_ApprovedById]
FOREIGN KEY ([ApprovedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogImportBatches] CHECK CONSTRAINT [FK_CatalogImportBatches_AspNetUsers_ApprovedById];
GO

ALTER TABLE [dbo].[CatalogServices] WITH CHECK ADD CONSTRAINT [FK_CatalogServices_CategoryNamespace]
FOREIGN KEY ([CategoryNamespace], [CategoryId])
REFERENCES [dbo].[CatalogTerms] ([Namespace], [Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogServices] CHECK CONSTRAINT [FK_CatalogServices_CategoryNamespace];
GO

ALTER TABLE [dbo].[CatalogServices] WITH CHECK ADD CONSTRAINT [FK_CatalogServices_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogServices] CHECK CONSTRAINT [FK_CatalogServices_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[CatalogSources] WITH CHECK ADD CONSTRAINT [FK_CatalogSources_CatalogImportBatches_BatchId]
FOREIGN KEY ([BatchId])
REFERENCES [dbo].[CatalogImportBatches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogSources] CHECK CONSTRAINT [FK_CatalogSources_CatalogImportBatches_BatchId];
GO

ALTER TABLE [dbo].[CatalogSourceSnapshots] WITH CHECK ADD CONSTRAINT [FK_CatalogSourceSnapshots_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogSourceSnapshots] CHECK CONSTRAINT [FK_CatalogSourceSnapshots_Branches_BranchId];
GO

ALTER TABLE [dbo].[CatalogSourceSnapshots] WITH CHECK ADD CONSTRAINT [FK_CatalogSourceSnapshots_CatalogServices_ServiceId]
FOREIGN KEY ([ServiceId])
REFERENCES [dbo].[CatalogServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogSourceSnapshots] CHECK CONSTRAINT [FK_CatalogSourceSnapshots_CatalogServices_ServiceId];
GO

ALTER TABLE [dbo].[CatalogSourceSnapshots] WITH CHECK ADD CONSTRAINT [FK_CatalogSourceSnapshots_CatalogSources_SourceId]
FOREIGN KEY ([SourceId])
REFERENCES [dbo].[CatalogSources] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogSourceSnapshots] CHECK CONSTRAINT [FK_CatalogSourceSnapshots_CatalogSources_SourceId];
GO

ALTER TABLE [dbo].[CatalogSourceSnapshots] WITH CHECK ADD CONSTRAINT [FK_CatalogSourceSnapshots_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogSourceSnapshots] CHECK CONSTRAINT [FK_CatalogSourceSnapshots_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[CatalogSourceSnapshots] WITH CHECK ADD CONSTRAINT [FK_CatalogSourceSnapshots_TicketServices_TicketServiceId]
FOREIGN KEY ([TicketServiceId])
REFERENCES [dbo].[TicketServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogSourceSnapshots] CHECK CONSTRAINT [FK_CatalogSourceSnapshots_TicketServices_TicketServiceId];
GO

ALTER TABLE [dbo].[CatalogTerms] WITH CHECK ADD CONSTRAINT [FK_CatalogTerms_CategoryParent]
FOREIGN KEY ([Namespace], [ParentId])
REFERENCES [dbo].[CatalogTerms] ([Namespace], [Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[CatalogTerms] CHECK CONSTRAINT [FK_CatalogTerms_CategoryParent];
GO

ALTER TABLE [dbo].[ClosedDates] WITH CHECK ADD CONSTRAINT [FK_ClosedDates_OperatingSchedules_ScheduleId]
FOREIGN KEY ([ScheduleId])
REFERENCES [dbo].[OperatingSchedules] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ClosedDates] CHECK CONSTRAINT [FK_ClosedDates_OperatingSchedules_ScheduleId];
GO

ALTER TABLE [dbo].[ConfigurationVersions] WITH CHECK ADD CONSTRAINT [FK_ConfigurationVersions_AspNetUsers_AuthorId]
FOREIGN KEY ([AuthorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ConfigurationVersions] CHECK CONSTRAINT [FK_ConfigurationVersions_AspNetUsers_AuthorId];
GO

ALTER TABLE [dbo].[DeliveryOutbox] WITH CHECK ADD CONSTRAINT [FK_DeliveryOutbox_AspNetUsers_RecipientUserId]
FOREIGN KEY ([RecipientUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[DeliveryOutbox] CHECK CONSTRAINT [FK_DeliveryOutbox_AspNetUsers_RecipientUserId];
GO

ALTER TABLE [dbo].[DeliveryOutbox] WITH CHECK ADD CONSTRAINT [FK_DeliveryOutbox_MessageTemplates_TemplateId]
FOREIGN KEY ([TemplateId])
REFERENCES [dbo].[MessageTemplates] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[DeliveryOutbox] CHECK CONSTRAINT [FK_DeliveryOutbox_MessageTemplates_TemplateId];
GO

ALTER TABLE [dbo].[DomainFormAnswers] WITH CHECK ADD CONSTRAINT [FK_DomainFormAnswers_AspNetUsers_OwnerId]
FOREIGN KEY ([OwnerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[DomainFormAnswers] CHECK CONSTRAINT [FK_DomainFormAnswers_AspNetUsers_OwnerId];
GO

ALTER TABLE [dbo].[DomainFormAnswers] WITH CHECK ADD CONSTRAINT [FK_DomainFormAnswers_ConfigurationVersions_DefinitionVersionId]
FOREIGN KEY ([DefinitionVersionId])
REFERENCES [dbo].[ConfigurationVersions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[DomainFormAnswers] CHECK CONSTRAINT [FK_DomainFormAnswers_ConfigurationVersions_DefinitionVersionId];
GO

ALTER TABLE [dbo].[DynamicFormFields] WITH CHECK ADD CONSTRAINT [FK_DynamicFormFields_DynamicFormDefinitions_FormId]
FOREIGN KEY ([FormId])
REFERENCES [dbo].[DynamicFormDefinitions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[DynamicFormFields] CHECK CONSTRAINT [FK_DynamicFormFields_DynamicFormDefinitions_FormId];
GO

ALTER TABLE [dbo].[DynamicFormOptions] WITH CHECK ADD CONSTRAINT [FK_DynamicFormOptions_DynamicFormFields_FieldId]
FOREIGN KEY ([FieldId])
REFERENCES [dbo].[DynamicFormFields] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[DynamicFormOptions] CHECK CONSTRAINT [FK_DynamicFormOptions_DynamicFormFields_FieldId];
GO

ALTER TABLE [dbo].[ExamAnswers] WITH CHECK ADD CONSTRAINT [FK_ExamAnswers_ExamOptions_OptionId]
FOREIGN KEY ([OptionId])
REFERENCES [dbo].[ExamOptions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamAnswers] CHECK CONSTRAINT [FK_ExamAnswers_ExamOptions_OptionId];
GO

ALTER TABLE [dbo].[ExamAnswers] WITH CHECK ADD CONSTRAINT [FK_ExamAnswers_ExamOptions_OptionId_QuestionId]
FOREIGN KEY ([OptionId], [QuestionId])
REFERENCES [dbo].[ExamOptions] ([Id], [QuestionId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamAnswers] CHECK CONSTRAINT [FK_ExamAnswers_ExamOptions_OptionId_QuestionId];
GO

ALTER TABLE [dbo].[ExamAnswers] WITH CHECK ADD CONSTRAINT [FK_ExamAnswers_ExamQuestions_QuestionId]
FOREIGN KEY ([QuestionId])
REFERENCES [dbo].[ExamQuestions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamAnswers] CHECK CONSTRAINT [FK_ExamAnswers_ExamQuestions_QuestionId];
GO

ALTER TABLE [dbo].[ExamEvents] WITH CHECK ADD CONSTRAINT [FK_ExamEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamEvents] CHECK CONSTRAINT [FK_ExamEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[ExamEvents] WITH CHECK ADD CONSTRAINT [FK_ExamEvents_RecruitmentExams_ExamId]
FOREIGN KEY ([ExamId])
REFERENCES [dbo].[RecruitmentExams] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamEvents] CHECK CONSTRAINT [FK_ExamEvents_RecruitmentExams_ExamId];
GO

ALTER TABLE [dbo].[ExamOptions] WITH CHECK ADD CONSTRAINT [FK_ExamOptions_ExamQuestions_QuestionId]
FOREIGN KEY ([QuestionId])
REFERENCES [dbo].[ExamQuestions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamOptions] CHECK CONSTRAINT [FK_ExamOptions_ExamQuestions_QuestionId];
GO

ALTER TABLE [dbo].[ExamQuestions] WITH CHECK ADD CONSTRAINT [FK_ExamQuestions_RecruitmentExams_ExamId]
FOREIGN KEY ([ExamId])
REFERENCES [dbo].[RecruitmentExams] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ExamQuestions] CHECK CONSTRAINT [FK_ExamQuestions_RecruitmentExams_ExamId];
GO

ALTER TABLE [dbo].[HistoricalServiceActors] WITH CHECK ADD CONSTRAINT [FK_HistoricalServiceActors_AspNetUsers_VerifiedUserId]
FOREIGN KEY ([VerifiedUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HistoricalServiceActors] CHECK CONSTRAINT [FK_HistoricalServiceActors_AspNetUsers_VerifiedUserId];
GO

ALTER TABLE [dbo].[HistoricalServiceActors] WITH CHECK ADD CONSTRAINT [FK_HistoricalServiceActors_CatalogSourceSnapshots_SourceSnapshotId]
FOREIGN KEY ([SourceSnapshotId])
REFERENCES [dbo].[CatalogSourceSnapshots] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HistoricalServiceActors] CHECK CONSTRAINT [FK_HistoricalServiceActors_CatalogSourceSnapshots_SourceSnapshotId];
GO

ALTER TABLE [dbo].[HistoricalServiceActors] WITH CHECK ADD CONSTRAINT [FK_HistoricalServiceActors_TicketServices_TicketServiceId]
FOREIGN KEY ([TicketServiceId])
REFERENCES [dbo].[TicketServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HistoricalServiceActors] CHECK CONSTRAINT [FK_HistoricalServiceActors_TicketServices_TicketServiceId];
GO

ALTER TABLE [dbo].[HoursChangeRequests] WITH CHECK ADD CONSTRAINT [FK_HoursChangeRequests_AspNetUsers_RequestedById]
FOREIGN KEY ([RequestedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HoursChangeRequests] CHECK CONSTRAINT [FK_HoursChangeRequests_AspNetUsers_RequestedById];
GO

ALTER TABLE [dbo].[HoursChangeRequests] WITH CHECK ADD CONSTRAINT [FK_HoursChangeRequests_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HoursChangeRequests] CHECK CONSTRAINT [FK_HoursChangeRequests_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[HoursChangeRequests] WITH CHECK ADD CONSTRAINT [FK_HoursChangeRequests_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HoursChangeRequests] CHECK CONSTRAINT [FK_HoursChangeRequests_Branches_BranchId];
GO

ALTER TABLE [dbo].[HoursChangeRequests] WITH CHECK ADD CONSTRAINT [FK_HoursChangeRequests_OperatingSchedules_BeforeScheduleId_BranchId]
FOREIGN KEY ([BeforeScheduleId], [BranchId])
REFERENCES [dbo].[OperatingSchedules] ([Id], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HoursChangeRequests] CHECK CONSTRAINT [FK_HoursChangeRequests_OperatingSchedules_BeforeScheduleId_BranchId];
GO

ALTER TABLE [dbo].[HoursChangeRequests] WITH CHECK ADD CONSTRAINT [FK_HoursChangeRequests_OperatingSchedules_ProposedScheduleId_BranchId]
FOREIGN KEY ([ProposedScheduleId], [BranchId])
REFERENCES [dbo].[OperatingSchedules] ([Id], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HoursChangeRequests] CHECK CONSTRAINT [FK_HoursChangeRequests_OperatingSchedules_ProposedScheduleId_BranchId];
GO

ALTER TABLE [dbo].[InterviewEvents] WITH CHECK ADD CONSTRAINT [FK_InterviewEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[InterviewEvents] CHECK CONSTRAINT [FK_InterviewEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[InterviewEvents] WITH CHECK ADD CONSTRAINT [FK_InterviewEvents_JobInterviews_InterviewId]
FOREIGN KEY ([InterviewId])
REFERENCES [dbo].[JobInterviews] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[InterviewEvents] CHECK CONSTRAINT [FK_InterviewEvents_JobInterviews_InterviewId];
GO

ALTER TABLE [dbo].[InterviewMeetings] WITH CHECK ADD CONSTRAINT [FK_InterviewMeetings_JobInterviews_InterviewId]
FOREIGN KEY ([InterviewId])
REFERENCES [dbo].[JobInterviews] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[InterviewMeetings] CHECK CONSTRAINT [FK_InterviewMeetings_JobInterviews_InterviewId];
GO

ALTER TABLE [dbo].[InvoiceLines] WITH CHECK ADD CONSTRAINT [FK_InvoiceLines_Invoices_InvoiceId]
FOREIGN KEY ([InvoiceId])
REFERENCES [dbo].[Invoices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[InvoiceLines] CHECK CONSTRAINT [FK_InvoiceLines_Invoices_InvoiceId];
GO

ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoices_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Subscriptions_SubscriptionId]
FOREIGN KEY ([SubscriptionId])
REFERENCES [dbo].[Subscriptions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoices_Subscriptions_SubscriptionId];
GO

ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Subscriptions_SubscriptionId_OrganizationId]
FOREIGN KEY ([SubscriptionId], [OrganizationId])
REFERENCES [dbo].[Subscriptions] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoices_Subscriptions_SubscriptionId_OrganizationId];
GO

ALTER TABLE [dbo].[JobApplications] WITH CHECK ADD CONSTRAINT [FK_JobApplications_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobApplications] CHECK CONSTRAINT [FK_JobApplications_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[JobApplications] WITH CHECK ADD CONSTRAINT [FK_JobApplications_JobVacancies_VacancyId]
FOREIGN KEY ([VacancyId])
REFERENCES [dbo].[JobVacancies] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobApplications] CHECK CONSTRAINT [FK_JobApplications_JobVacancies_VacancyId];
GO

ALTER TABLE [dbo].[JobApplications] WITH CHECK ADD CONSTRAINT [FK_JobApplications_JobVacancies_VacancyId_OrganizationId]
FOREIGN KEY ([VacancyId], [OrganizationId])
REFERENCES [dbo].[JobVacancies] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobApplications] CHECK CONSTRAINT [FK_JobApplications_JobVacancies_VacancyId_OrganizationId];
GO

ALTER TABLE [dbo].[JobApplications] WITH CHECK ADD CONSTRAINT [FK_JobApplications_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobApplications] CHECK CONSTRAINT [FK_JobApplications_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_AspNetUsers_InterviewerId]
FOREIGN KEY ([InterviewerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_AspNetUsers_InterviewerId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_Bookings_BookingId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_Bookings_BookingId_UserId_BranchId]
FOREIGN KEY ([BookingId], [UserId], [BranchId])
REFERENCES [dbo].[Bookings] ([Id], [UserId], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_Bookings_BookingId_UserId_BranchId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_Branches_BranchId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_JobApplications_ApplicationId]
FOREIGN KEY ([ApplicationId])
REFERENCES [dbo].[JobApplications] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_JobApplications_ApplicationId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_JobApplications_ApplicationId_OrganizationId_UserId]
FOREIGN KEY ([ApplicationId], [OrganizationId], [UserId])
REFERENCES [dbo].[JobApplications] ([Id], [OrganizationId], [UserId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_JobApplications_ApplicationId_OrganizationId_UserId];
GO

ALTER TABLE [dbo].[JobInterviews] WITH CHECK ADD CONSTRAINT [FK_JobInterviews_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobInterviews] CHECK CONSTRAINT [FK_JobInterviews_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[JobOfferEvents] WITH CHECK ADD CONSTRAINT [FK_JobOfferEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobOfferEvents] CHECK CONSTRAINT [FK_JobOfferEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[JobOfferEvents] WITH CHECK ADD CONSTRAINT [FK_JobOfferEvents_JobOffers_OfferId]
FOREIGN KEY ([OfferId])
REFERENCES [dbo].[JobOffers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobOfferEvents] CHECK CONSTRAINT [FK_JobOfferEvents_JobOffers_OfferId];
GO

ALTER TABLE [dbo].[JobOffers] WITH CHECK ADD CONSTRAINT [FK_JobOffers_JobApplications_ApplicationId]
FOREIGN KEY ([ApplicationId])
REFERENCES [dbo].[JobApplications] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobOffers] CHECK CONSTRAINT [FK_JobOffers_JobApplications_ApplicationId];
GO

ALTER TABLE [dbo].[JobVacancies] WITH CHECK ADD CONSTRAINT [FK_JobVacancies_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobVacancies] CHECK CONSTRAINT [FK_JobVacancies_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[JobVacancies] WITH CHECK ADD CONSTRAINT [FK_JobVacancies_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobVacancies] CHECK CONSTRAINT [FK_JobVacancies_Branches_BranchId];
GO

ALTER TABLE [dbo].[JobVacancies] WITH CHECK ADD CONSTRAINT [FK_JobVacancies_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobVacancies] CHECK CONSTRAINT [FK_JobVacancies_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[JobVacancies] WITH CHECK ADD CONSTRAINT [FK_JobVacancies_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[JobVacancies] CHECK CONSTRAINT [FK_JobVacancies_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [FK_LocalizedTexts_BranchOwner]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [FK_LocalizedTexts_BranchOwner];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [FK_LocalizedTexts_Organization]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [FK_LocalizedTexts_Organization];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [FK_LocalizedTexts_ServiceOwner]
FOREIGN KEY ([CatalogServiceId], [OrganizationId])
REFERENCES [dbo].[CatalogServices] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [FK_LocalizedTexts_ServiceOwner];
GO

ALTER TABLE [dbo].[LocalizedTexts] WITH CHECK ADD CONSTRAINT [FK_LocalizedTexts_TicketOwner]
FOREIGN KEY ([TicketServiceId], [BranchId], [OrganizationId])
REFERENCES [dbo].[TicketServices] ([Id], [BranchId], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LocalizedTexts] CHECK CONSTRAINT [FK_LocalizedTexts_TicketOwner];
GO

ALTER TABLE [dbo].[MediaAssets] WITH CHECK ADD CONSTRAINT [FK_MediaAssets_AspNetUsers_UploadedById]
FOREIGN KEY ([UploadedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[MediaAssets] CHECK CONSTRAINT [FK_MediaAssets_AspNetUsers_UploadedById];
GO

ALTER TABLE [dbo].[MembershipBranches] WITH CHECK ADD CONSTRAINT [FK_MembershipBranches_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[MembershipBranches] CHECK CONSTRAINT [FK_MembershipBranches_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[MembershipBranches] WITH CHECK ADD CONSTRAINT [FK_MembershipBranches_OrganizationMemberships_MembershipId_OrganizationId]
FOREIGN KEY ([MembershipId], [OrganizationId])
REFERENCES [dbo].[OrganizationMemberships] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[MembershipBranches] CHECK CONSTRAINT [FK_MembershipBranches_OrganizationMemberships_MembershipId_OrganizationId];
GO

ALTER TABLE [dbo].[NavigationEdges] WITH CHECK ADD CONSTRAINT [FK_NavigationEdges_NavigationNodes_FromNodeId]
FOREIGN KEY ([FromNodeId])
REFERENCES [dbo].[NavigationNodes] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationEdges] CHECK CONSTRAINT [FK_NavigationEdges_NavigationNodes_FromNodeId];
GO

ALTER TABLE [dbo].[NavigationEdges] WITH CHECK ADD CONSTRAINT [FK_NavigationEdges_NavigationNodes_FromNodeId_NavigationVersionId]
FOREIGN KEY ([FromNodeId], [NavigationVersionId])
REFERENCES [dbo].[NavigationNodes] ([Id], [NavigationVersionId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationEdges] CHECK CONSTRAINT [FK_NavigationEdges_NavigationNodes_FromNodeId_NavigationVersionId];
GO

ALTER TABLE [dbo].[NavigationEdges] WITH CHECK ADD CONSTRAINT [FK_NavigationEdges_NavigationNodes_ToNodeId]
FOREIGN KEY ([ToNodeId])
REFERENCES [dbo].[NavigationNodes] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationEdges] CHECK CONSTRAINT [FK_NavigationEdges_NavigationNodes_ToNodeId];
GO

ALTER TABLE [dbo].[NavigationEdges] WITH CHECK ADD CONSTRAINT [FK_NavigationEdges_NavigationNodes_ToNodeId_NavigationVersionId]
FOREIGN KEY ([ToNodeId], [NavigationVersionId])
REFERENCES [dbo].[NavigationNodes] ([Id], [NavigationVersionId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationEdges] CHECK CONSTRAINT [FK_NavigationEdges_NavigationNodes_ToNodeId_NavigationVersionId];
GO

ALTER TABLE [dbo].[NavigationEdges] WITH CHECK ADD CONSTRAINT [FK_NavigationEdges_NavigationVersions_NavigationVersionId]
FOREIGN KEY ([NavigationVersionId])
REFERENCES [dbo].[NavigationVersions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationEdges] CHECK CONSTRAINT [FK_NavigationEdges_NavigationVersions_NavigationVersionId];
GO

ALTER TABLE [dbo].[NavigationJourneys] WITH CHECK ADD CONSTRAINT [FK_NavigationJourneys_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationJourneys] CHECK CONSTRAINT [FK_NavigationJourneys_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[NavigationJourneys] WITH CHECK ADD CONSTRAINT [FK_NavigationJourneys_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationJourneys] CHECK CONSTRAINT [FK_NavigationJourneys_Bookings_BookingId];
GO

ALTER TABLE [dbo].[NavigationJourneys] WITH CHECK ADD CONSTRAINT [FK_NavigationJourneys_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationJourneys] CHECK CONSTRAINT [FK_NavigationJourneys_Branches_BranchId];
GO

ALTER TABLE [dbo].[NavigationJourneys] WITH CHECK ADD CONSTRAINT [FK_NavigationJourneys_NavigationVersions_NavigationVersionId]
FOREIGN KEY ([NavigationVersionId])
REFERENCES [dbo].[NavigationVersions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationJourneys] CHECK CONSTRAINT [FK_NavigationJourneys_NavigationVersions_NavigationVersionId];
GO

ALTER TABLE [dbo].[NavigationJourneySteps] WITH CHECK ADD CONSTRAINT [FK_NavigationJourneySteps_NavigationJourneys_JourneyId]
FOREIGN KEY ([JourneyId])
REFERENCES [dbo].[NavigationJourneys] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationJourneySteps] CHECK CONSTRAINT [FK_NavigationJourneySteps_NavigationJourneys_JourneyId];
GO

ALTER TABLE [dbo].[NavigationJourneySteps] WITH CHECK ADD CONSTRAINT [FK_NavigationJourneySteps_NavigationNodes_NodeId]
FOREIGN KEY ([NodeId])
REFERENCES [dbo].[NavigationNodes] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationJourneySteps] CHECK CONSTRAINT [FK_NavigationJourneySteps_NavigationNodes_NodeId];
GO

ALTER TABLE [dbo].[NavigationMenuItems] WITH CHECK ADD CONSTRAINT [FK_NavigationMenuItems_NavigationMenuItems_ParentId]
FOREIGN KEY ([ParentId])
REFERENCES [dbo].[NavigationMenuItems] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationMenuItems] CHECK CONSTRAINT [FK_NavigationMenuItems_NavigationMenuItems_ParentId];
GO

ALTER TABLE [dbo].[NavigationNodes] WITH CHECK ADD CONSTRAINT [FK_NavigationNodes_BranchFloors_FloorId]
FOREIGN KEY ([FloorId])
REFERENCES [dbo].[BranchFloors] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationNodes] CHECK CONSTRAINT [FK_NavigationNodes_BranchFloors_FloorId];
GO

ALTER TABLE [dbo].[NavigationNodes] WITH CHECK ADD CONSTRAINT [FK_NavigationNodes_NavigationVersions_NavigationVersionId]
FOREIGN KEY ([NavigationVersionId])
REFERENCES [dbo].[NavigationVersions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationNodes] CHECK CONSTRAINT [FK_NavigationNodes_NavigationVersions_NavigationVersionId];
GO

ALTER TABLE [dbo].[NavigationVersions] WITH CHECK ADD CONSTRAINT [FK_NavigationVersions_AspNetUsers_CreatedById]
FOREIGN KEY ([CreatedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationVersions] CHECK CONSTRAINT [FK_NavigationVersions_AspNetUsers_CreatedById];
GO

ALTER TABLE [dbo].[NavigationVersions] WITH CHECK ADD CONSTRAINT [FK_NavigationVersions_AspNetUsers_PublishedById]
FOREIGN KEY ([PublishedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationVersions] CHECK CONSTRAINT [FK_NavigationVersions_AspNetUsers_PublishedById];
GO

ALTER TABLE [dbo].[NavigationVersions] WITH CHECK ADD CONSTRAINT [FK_NavigationVersions_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[NavigationVersions] CHECK CONSTRAINT [FK_NavigationVersions_Branches_BranchId];
GO

ALTER TABLE [dbo].[OperatingPeriods] WITH CHECK ADD CONSTRAINT [FK_OperatingPeriods_WeeklyHours_ScheduleId_Day]
FOREIGN KEY ([ScheduleId], [Day])
REFERENCES [dbo].[WeeklyHours] ([ScheduleId], [Day])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OperatingPeriods] CHECK CONSTRAINT [FK_OperatingPeriods_WeeklyHours_ScheduleId_Day];
GO

ALTER TABLE [dbo].[OperatingSchedules] WITH CHECK ADD CONSTRAINT [FK_OperatingSchedules_AspNetUsers_CreatedById]
FOREIGN KEY ([CreatedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OperatingSchedules] CHECK CONSTRAINT [FK_OperatingSchedules_AspNetUsers_CreatedById];
GO

ALTER TABLE [dbo].[OperatingSchedules] WITH CHECK ADD CONSTRAINT [FK_OperatingSchedules_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OperatingSchedules] CHECK CONSTRAINT [FK_OperatingSchedules_Branches_BranchId];
GO

ALTER TABLE [dbo].[OrganizationDocuments] WITH CHECK ADD CONSTRAINT [FK_OrganizationDocuments_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationDocuments] CHECK CONSTRAINT [FK_OrganizationDocuments_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[OrganizationDocuments] WITH CHECK ADD CONSTRAINT [FK_OrganizationDocuments_MediaAssets_MediaAssetId]
FOREIGN KEY ([MediaAssetId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationDocuments] CHECK CONSTRAINT [FK_OrganizationDocuments_MediaAssets_MediaAssetId];
GO

ALTER TABLE [dbo].[OrganizationDocuments] WITH CHECK ADD CONSTRAINT [FK_OrganizationDocuments_OrganizationDocuments_ReplacedByDocumentId]
FOREIGN KEY ([ReplacedByDocumentId])
REFERENCES [dbo].[OrganizationDocuments] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationDocuments] CHECK CONSTRAINT [FK_OrganizationDocuments_OrganizationDocuments_ReplacedByDocumentId];
GO

ALTER TABLE [dbo].[OrganizationDocuments] WITH CHECK ADD CONSTRAINT [FK_OrganizationDocuments_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationDocuments] CHECK CONSTRAINT [FK_OrganizationDocuments_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[OrganizationLegalProfiles] WITH CHECK ADD CONSTRAINT [FK_OrganizationLegalProfiles_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationLegalProfiles] CHECK CONSTRAINT [FK_OrganizationLegalProfiles_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[OrganizationMemberships] WITH CHECK ADD CONSTRAINT [FK_OrganizationMemberships_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationMemberships] CHECK CONSTRAINT [FK_OrganizationMemberships_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[OrganizationMemberships] WITH CHECK ADD CONSTRAINT [FK_OrganizationMemberships_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationMemberships] CHECK CONSTRAINT [FK_OrganizationMemberships_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[OrganizationNotifications] WITH CHECK ADD CONSTRAINT [FK_OrganizationNotifications_AspNetUsers_CreatedById]
FOREIGN KEY ([CreatedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationNotifications] CHECK CONSTRAINT [FK_OrganizationNotifications_AspNetUsers_CreatedById];
GO

ALTER TABLE [dbo].[OrganizationNotifications] WITH CHECK ADD CONSTRAINT [FK_OrganizationNotifications_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationNotifications] CHECK CONSTRAINT [FK_OrganizationNotifications_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[OrganizationNotifications] WITH CHECK ADD CONSTRAINT [FK_OrganizationNotifications_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationNotifications] CHECK CONSTRAINT [FK_OrganizationNotifications_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[OrganizationRegistrationDecisions] WITH CHECK ADD CONSTRAINT [FK_OrganizationRegistrationDecisions_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationRegistrationDecisions] CHECK CONSTRAINT [FK_OrganizationRegistrationDecisions_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[OrganizationRegistrationDecisions] WITH CHECK ADD CONSTRAINT [FK_OrganizationRegistrationDecisions_OrganizationRegistrationRequests_RequestId]
FOREIGN KEY ([RequestId])
REFERENCES [dbo].[OrganizationRegistrationRequests] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationRegistrationDecisions] CHECK CONSTRAINT [FK_OrganizationRegistrationDecisions_OrganizationRegistrationRequests_RequestId];
GO

ALTER TABLE [dbo].[OrganizationRegistrationRequests] WITH CHECK ADD CONSTRAINT [FK_OrganizationRegistrationRequests_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationRegistrationRequests] CHECK CONSTRAINT [FK_OrganizationRegistrationRequests_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[OrganizationRegistrationRequests] WITH CHECK ADD CONSTRAINT [FK_OrganizationRegistrationRequests_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OrganizationRegistrationRequests] CHECK CONSTRAINT [FK_OrganizationRegistrationRequests_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[Organizations] WITH CHECK ADD CONSTRAINT [FK_Organizations_AspNetUsers_CreatedByUserId]
FOREIGN KEY ([CreatedByUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Organizations] CHECK CONSTRAINT [FK_Organizations_AspNetUsers_CreatedByUserId];
GO

ALTER TABLE [dbo].[Organizations] WITH CHECK ADD CONSTRAINT [FK_Organizations_AspNetUsers_RepresentativeUserId]
FOREIGN KEY ([RepresentativeUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Organizations] CHECK CONSTRAINT [FK_Organizations_AspNetUsers_RepresentativeUserId];
GO

ALTER TABLE [dbo].[OutdoorTrackingSessions] WITH CHECK ADD CONSTRAINT [FK_OutdoorTrackingSessions_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OutdoorTrackingSessions] CHECK CONSTRAINT [FK_OutdoorTrackingSessions_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[OutdoorTrackingSessions] WITH CHECK ADD CONSTRAINT [FK_OutdoorTrackingSessions_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OutdoorTrackingSessions] CHECK CONSTRAINT [FK_OutdoorTrackingSessions_Bookings_BookingId];
GO

ALTER TABLE [dbo].[OutdoorTrackingSessions] WITH CHECK ADD CONSTRAINT [FK_OutdoorTrackingSessions_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[OutdoorTrackingSessions] CHECK CONSTRAINT [FK_OutdoorTrackingSessions_Branches_BranchId];
GO

ALTER TABLE [dbo].[PaymentProviderEvents] WITH CHECK ADD CONSTRAINT [FK_PaymentProviderEvents_PaymentTransactions_TransactionId]
FOREIGN KEY ([TransactionId])
REFERENCES [dbo].[PaymentTransactions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PaymentProviderEvents] CHECK CONSTRAINT [FK_PaymentProviderEvents_PaymentTransactions_TransactionId];
GO

ALTER TABLE [dbo].[PaymentTransactions] WITH CHECK ADD CONSTRAINT [FK_PaymentTransactions_Invoices_InvoiceId]
FOREIGN KEY ([InvoiceId])
REFERENCES [dbo].[Invoices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PaymentTransactions] CHECK CONSTRAINT [FK_PaymentTransactions_Invoices_InvoiceId];
GO

ALTER TABLE [dbo].[PersonalNotifications] WITH CHECK ADD CONSTRAINT [FK_PersonalNotifications_User]
FOREIGN KEY ([RecipientUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PersonalNotifications] CHECK CONSTRAINT [FK_PersonalNotifications_User];
GO

ALTER TABLE [dbo].[PlaceSubmissions] WITH CHECK ADD CONSTRAINT [FK_PlaceSubmissions_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PlaceSubmissions] CHECK CONSTRAINT [FK_PlaceSubmissions_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[PlaceSubmissions] WITH CHECK ADD CONSTRAINT [FK_PlaceSubmissions_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PlaceSubmissions] CHECK CONSTRAINT [FK_PlaceSubmissions_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[PlaceSubmissions] WITH CHECK ADD CONSTRAINT [FK_PlaceSubmissions_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PlaceSubmissions] CHECK CONSTRAINT [FK_PlaceSubmissions_Branches_BranchId];
GO

ALTER TABLE [dbo].[PlanEntitlements] WITH CHECK ADD CONSTRAINT [FK_PlanEntitlements_SubscriptionPlans_PlanId]
FOREIGN KEY ([PlanId])
REFERENCES [dbo].[SubscriptionPlans] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PlanEntitlements] CHECK CONSTRAINT [FK_PlanEntitlements_SubscriptionPlans_PlanId];
GO

ALTER TABLE [dbo].[PlanPrices] WITH CHECK ADD CONSTRAINT [FK_PlanPrices_SubscriptionPlans_PlanId]
FOREIGN KEY ([PlanId])
REFERENCES [dbo].[SubscriptionPlans] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PlanPrices] CHECK CONSTRAINT [FK_PlanPrices_SubscriptionPlans_PlanId];
GO

ALTER TABLE [dbo].[PlatformSettings] WITH CHECK ADD CONSTRAINT [FK_PlatformSettings_AspNetUsers_UpdatedById]
FOREIGN KEY ([UpdatedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PlatformSettings] CHECK CONSTRAINT [FK_PlatformSettings_AspNetUsers_UpdatedById];
GO

ALTER TABLE [dbo].[PrivilegedAccessRequests] WITH CHECK ADD CONSTRAINT [FK_PrivilegedAccessRequests_AspNetUsers_RequestedById]
FOREIGN KEY ([RequestedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PrivilegedAccessRequests] CHECK CONSTRAINT [FK_PrivilegedAccessRequests_AspNetUsers_RequestedById];
GO

ALTER TABLE [dbo].[PrivilegedAccessRequests] WITH CHECK ADD CONSTRAINT [FK_PrivilegedAccessRequests_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PrivilegedAccessRequests] CHECK CONSTRAINT [FK_PrivilegedAccessRequests_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[PrivilegedAccessRequests] WITH CHECK ADD CONSTRAINT [FK_PrivilegedAccessRequests_AspNetUsers_TargetUserId]
FOREIGN KEY ([TargetUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PrivilegedAccessRequests] CHECK CONSTRAINT [FK_PrivilegedAccessRequests_AspNetUsers_TargetUserId];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [FK_QueueEntries_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [FK_QueueEntries_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [FK_QueueEntries_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [FK_QueueEntries_Bookings_BookingId];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [FK_QueueEntries_Bookings_BookingId_UserId_BranchId]
FOREIGN KEY ([BookingId], [UserId], [BranchId])
REFERENCES [dbo].[Bookings] ([Id], [UserId], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [FK_QueueEntries_Bookings_BookingId_UserId_BranchId];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [FK_QueueEntries_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [FK_QueueEntries_Branches_BranchId];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [FK_QueueEntries_TicketServices_TicketServiceId]
FOREIGN KEY ([TicketServiceId])
REFERENCES [dbo].[TicketServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [FK_QueueEntries_TicketServices_TicketServiceId];
GO

ALTER TABLE [dbo].[QueueEntries] WITH CHECK ADD CONSTRAINT [FK_QueueEntries_TicketServices_TicketServiceId_BranchId]
FOREIGN KEY ([TicketServiceId], [BranchId])
REFERENCES [dbo].[TicketServices] ([Id], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEntries] CHECK CONSTRAINT [FK_QueueEntries_TicketServices_TicketServiceId_BranchId];
GO

ALTER TABLE [dbo].[QueueEvents] WITH CHECK ADD CONSTRAINT [FK_QueueEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEvents] CHECK CONSTRAINT [FK_QueueEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[QueueEvents] WITH CHECK ADD CONSTRAINT [FK_QueueEvents_QueueEntries_QueueEntryId]
FOREIGN KEY ([QueueEntryId])
REFERENCES [dbo].[QueueEntries] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[QueueEvents] CHECK CONSTRAINT [FK_QueueEvents_QueueEntries_QueueEntryId];
GO

ALTER TABLE [dbo].[RecruitmentApplicationEvents] WITH CHECK ADD CONSTRAINT [FK_RecruitmentApplicationEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[RecruitmentApplicationEvents] CHECK CONSTRAINT [FK_RecruitmentApplicationEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[RecruitmentApplicationEvents] WITH CHECK ADD CONSTRAINT [FK_RecruitmentApplicationEvents_JobApplications_ApplicationId]
FOREIGN KEY ([ApplicationId])
REFERENCES [dbo].[JobApplications] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[RecruitmentApplicationEvents] CHECK CONSTRAINT [FK_RecruitmentApplicationEvents_JobApplications_ApplicationId];
GO

ALTER TABLE [dbo].[RecruitmentExams] WITH CHECK ADD CONSTRAINT [FK_RecruitmentExams_JobApplications_ApplicationId]
FOREIGN KEY ([ApplicationId])
REFERENCES [dbo].[JobApplications] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[RecruitmentExams] CHECK CONSTRAINT [FK_RecruitmentExams_JobApplications_ApplicationId];
GO

ALTER TABLE [dbo].[ReportRuns] WITH CHECK ADD CONSTRAINT [FK_ReportRuns_AspNetUsers_RequestedById]
FOREIGN KEY ([RequestedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ReportRuns] CHECK CONSTRAINT [FK_ReportRuns_AspNetUsers_RequestedById];
GO

ALTER TABLE [dbo].[ReportRuns] WITH CHECK ADD CONSTRAINT [FK_ReportRuns_MediaAssets_MediaAssetId]
FOREIGN KEY ([MediaAssetId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ReportRuns] CHECK CONSTRAINT [FK_ReportRuns_MediaAssets_MediaAssetId];
GO

ALTER TABLE [dbo].[ReportRuns] WITH CHECK ADD CONSTRAINT [FK_ReportRuns_ScheduledReports_ScheduleId]
FOREIGN KEY ([ScheduleId])
REFERENCES [dbo].[ScheduledReports] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ReportRuns] CHECK CONSTRAINT [FK_ReportRuns_ScheduledReports_ScheduleId];
GO

ALTER TABLE [dbo].[ReviewAccessibilityFeatures] WITH CHECK ADD CONSTRAINT [FK_ReviewAccessibilityFeatures_VisitReviews_ReviewId]
FOREIGN KEY ([ReviewId])
REFERENCES [dbo].[VisitReviews] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ReviewAccessibilityFeatures] CHECK CONSTRAINT [FK_ReviewAccessibilityFeatures_VisitReviews_ReviewId];
GO

ALTER TABLE [dbo].[ReviewModerationEvents] WITH CHECK ADD CONSTRAINT [FK_ReviewModerationEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ReviewModerationEvents] CHECK CONSTRAINT [FK_ReviewModerationEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[ReviewModerationEvents] WITH CHECK ADD CONSTRAINT [FK_ReviewModerationEvents_VisitReviews_ReviewId]
FOREIGN KEY ([ReviewId])
REFERENCES [dbo].[VisitReviews] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ReviewModerationEvents] CHECK CONSTRAINT [FK_ReviewModerationEvents_VisitReviews_ReviewId];
GO

ALTER TABLE [dbo].[RolePermissions] WITH CHECK ADD CONSTRAINT [FK_RolePermissions_AspNetRoles_RoleId]
FOREIGN KEY ([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[RolePermissions] CHECK CONSTRAINT [FK_RolePermissions_AspNetRoles_RoleId];
GO

ALTER TABLE [dbo].[RolePermissions] WITH CHECK ADD CONSTRAINT [FK_RolePermissions_PermissionDefinitions_PermissionId]
FOREIGN KEY ([PermissionId])
REFERENCES [dbo].[PermissionDefinitions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[RolePermissions] CHECK CONSTRAINT [FK_RolePermissions_PermissionDefinitions_PermissionId];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [FK_SavedItems_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [FK_SavedItems_BranchId];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [FK_SavedItems_CatalogServiceId]
FOREIGN KEY ([CatalogServiceId])
REFERENCES [dbo].[CatalogServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [FK_SavedItems_CatalogServiceId];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [FK_SavedItems_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [FK_SavedItems_OrganizationId];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [FK_SavedItems_TicketServiceId]
FOREIGN KEY ([TicketServiceId])
REFERENCES [dbo].[TicketServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [FK_SavedItems_TicketServiceId];
GO

ALTER TABLE [dbo].[SavedItems] WITH CHECK ADD CONSTRAINT [FK_SavedItems_User]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SavedItems] CHECK CONSTRAINT [FK_SavedItems_User];
GO

ALTER TABLE [dbo].[ScheduledReports] WITH CHECK ADD CONSTRAINT [FK_ScheduledReports_AspNetUsers_OwnerId]
FOREIGN KEY ([OwnerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ScheduledReports] CHECK CONSTRAINT [FK_ScheduledReports_AspNetUsers_OwnerId];
GO

ALTER TABLE [dbo].[SecurityEvents] WITH CHECK ADD CONSTRAINT [FK_SecurityEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SecurityEvents] CHECK CONSTRAINT [FK_SecurityEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[SecurityEvents] WITH CHECK ADD CONSTRAINT [FK_SecurityEvents_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SecurityEvents] CHECK CONSTRAINT [FK_SecurityEvents_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[ServiceAvailability] WITH CHECK ADD CONSTRAINT [FK_ServiceAvailability_TicketServices_TicketServiceId]
FOREIGN KEY ([TicketServiceId])
REFERENCES [dbo].[TicketServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ServiceAvailability] CHECK CONSTRAINT [FK_ServiceAvailability_TicketServices_TicketServiceId];
GO

ALTER TABLE [dbo].[SpecialHours] WITH CHECK ADD CONSTRAINT [FK_SpecialHours_OperatingSchedules_ScheduleId]
FOREIGN KEY ([ScheduleId])
REFERENCES [dbo].[OperatingSchedules] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SpecialHours] CHECK CONSTRAINT [FK_SpecialHours_OperatingSchedules_ScheduleId];
GO

ALTER TABLE [dbo].[SpecialOperatingPeriods] WITH CHECK ADD CONSTRAINT [FK_SpecialOperatingPeriods_SpecialHours_SpecialHoursId]
FOREIGN KEY ([SpecialHoursId])
REFERENCES [dbo].[SpecialHours] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SpecialOperatingPeriods] CHECK CONSTRAINT [FK_SpecialOperatingPeriods_SpecialHours_SpecialHoursId];
GO

ALTER TABLE [dbo].[StripeCheckoutAttempts] WITH CHECK ADD CONSTRAINT [FK_StripeCheckoutAttempts_PaymentTransactions_PaymentId]
FOREIGN KEY ([PaymentId])
REFERENCES [dbo].[PaymentTransactions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[StripeCheckoutAttempts] CHECK CONSTRAINT [FK_StripeCheckoutAttempts_PaymentTransactions_PaymentId];
GO

ALTER TABLE [dbo].[StripeCheckoutAttempts] WITH CHECK ADD CONSTRAINT [FK_StripeCheckoutAttempts_PlanPrices_PlanPriceId]
FOREIGN KEY ([PlanPriceId])
REFERENCES [dbo].[PlanPrices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[StripeCheckoutAttempts] CHECK CONSTRAINT [FK_StripeCheckoutAttempts_PlanPrices_PlanPriceId];
GO

ALTER TABLE [dbo].[SubscriptionGrantHistory] WITH CHECK ADD CONSTRAINT [FK_SubscriptionGrantHistory_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SubscriptionGrantHistory] CHECK CONSTRAINT [FK_SubscriptionGrantHistory_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[SubscriptionGrantHistory] WITH CHECK ADD CONSTRAINT [FK_SubscriptionGrantHistory_Subscriptions_SubscriptionId]
FOREIGN KEY ([SubscriptionId])
REFERENCES [dbo].[Subscriptions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SubscriptionGrantHistory] CHECK CONSTRAINT [FK_SubscriptionGrantHistory_Subscriptions_SubscriptionId];
GO

ALTER TABLE [dbo].[Subscriptions] WITH CHECK ADD CONSTRAINT [FK_Subscriptions_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Subscriptions] CHECK CONSTRAINT [FK_Subscriptions_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[Subscriptions] WITH CHECK ADD CONSTRAINT [FK_Subscriptions_SubscriptionPlans_PlanId]
FOREIGN KEY ([PlanId])
REFERENCES [dbo].[SubscriptionPlans] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Subscriptions] CHECK CONSTRAINT [FK_Subscriptions_SubscriptionPlans_PlanId];
GO

ALTER TABLE [dbo].[SubscriptionUsage] WITH CHECK ADD CONSTRAINT [FK_SubscriptionUsage_Subscriptions_SubscriptionId]
FOREIGN KEY ([SubscriptionId])
REFERENCES [dbo].[Subscriptions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SubscriptionUsage] CHECK CONSTRAINT [FK_SubscriptionUsage_Subscriptions_SubscriptionId];
GO

ALTER TABLE [dbo].[SupportAttachments] WITH CHECK ADD CONSTRAINT [FK_SupportAttachments_MediaAssets_MediaAssetId]
FOREIGN KEY ([MediaAssetId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportAttachments] CHECK CONSTRAINT [FK_SupportAttachments_MediaAssets_MediaAssetId];
GO

ALTER TABLE [dbo].[SupportAttachments] WITH CHECK ADD CONSTRAINT [FK_SupportAttachments_SupportMessages_MessageId]
FOREIGN KEY ([MessageId])
REFERENCES [dbo].[SupportMessages] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportAttachments] CHECK CONSTRAINT [FK_SupportAttachments_SupportMessages_MessageId];
GO

ALTER TABLE [dbo].[SupportAttachments] WITH CHECK ADD CONSTRAINT [FK_SupportAttachments_SupportMessages_MessageId_RequestId]
FOREIGN KEY ([MessageId], [RequestId])
REFERENCES [dbo].[SupportMessages] ([Id], [RequestId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportAttachments] CHECK CONSTRAINT [FK_SupportAttachments_SupportMessages_MessageId_RequestId];
GO

ALTER TABLE [dbo].[SupportAttachments] WITH CHECK ADD CONSTRAINT [FK_SupportAttachments_SupportRequests_RequestId]
FOREIGN KEY ([RequestId])
REFERENCES [dbo].[SupportRequests] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportAttachments] CHECK CONSTRAINT [FK_SupportAttachments_SupportRequests_RequestId];
GO

ALTER TABLE [dbo].[SupportCaseEvents] WITH CHECK ADD CONSTRAINT [FK_SupportCaseEvents_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportCaseEvents] CHECK CONSTRAINT [FK_SupportCaseEvents_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[SupportCaseEvents] WITH CHECK ADD CONSTRAINT [FK_SupportCaseEvents_SupportRequests_RequestId]
FOREIGN KEY ([RequestId])
REFERENCES [dbo].[SupportRequests] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportCaseEvents] CHECK CONSTRAINT [FK_SupportCaseEvents_SupportRequests_RequestId];
GO

ALTER TABLE [dbo].[SupportMessages] WITH CHECK ADD CONSTRAINT [FK_SupportMessages_AspNetUsers_ActorId]
FOREIGN KEY ([ActorId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportMessages] CHECK CONSTRAINT [FK_SupportMessages_AspNetUsers_ActorId];
GO

ALTER TABLE [dbo].[SupportMessages] WITH CHECK ADD CONSTRAINT [FK_SupportMessages_SupportRequests_RequestId]
FOREIGN KEY ([RequestId])
REFERENCES [dbo].[SupportRequests] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportMessages] CHECK CONSTRAINT [FK_SupportMessages_SupportRequests_RequestId];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [FK_SupportRequests_AspNetUsers_AssignedToUserId]
FOREIGN KEY ([AssignedToUserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [FK_SupportRequests_AspNetUsers_AssignedToUserId];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [FK_SupportRequests_AspNetUsers_RequesterId]
FOREIGN KEY ([RequesterId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [FK_SupportRequests_AspNetUsers_RequesterId];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [FK_SupportRequests_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [FK_SupportRequests_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[SupportRequests] WITH CHECK ADD CONSTRAINT [FK_SupportRequests_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[SupportRequests] CHECK CONSTRAINT [FK_SupportRequests_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[TicketRequiredDocuments] WITH CHECK ADD CONSTRAINT [FK_TicketRequiredDocuments_TicketServices_TicketServiceId]
FOREIGN KEY ([TicketServiceId])
REFERENCES [dbo].[TicketServices] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TicketRequiredDocuments] CHECK CONSTRAINT [FK_TicketRequiredDocuments_TicketServices_TicketServiceId];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [FK_TicketServices_AspNetUsers_ConfiguredById]
FOREIGN KEY ([ConfiguredById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [FK_TicketServices_AspNetUsers_ConfiguredById];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [FK_TicketServices_AspNetUsers_VerifiedById]
FOREIGN KEY ([VerifiedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [FK_TicketServices_AspNetUsers_VerifiedById];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [FK_TicketServices_Branches_BranchId_OrganizationId]
FOREIGN KEY ([BranchId], [OrganizationId])
REFERENCES [dbo].[Branches] ([Id], [OrganizationId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [FK_TicketServices_Branches_BranchId_OrganizationId];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [FK_TicketServices_CategoryNamespace]
FOREIGN KEY ([CategoryNamespace], [CategoryId])
REFERENCES [dbo].[CatalogTerms] ([Namespace], [Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [FK_TicketServices_CategoryNamespace];
GO

ALTER TABLE [dbo].[TicketServices] WITH CHECK ADD CONSTRAINT [FK_TicketServices_OperatingSchedules_OperatingScheduleId_BranchId]
FOREIGN KEY ([OperatingScheduleId], [BranchId])
REFERENCES [dbo].[OperatingSchedules] ([Id], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TicketServices] CHECK CONSTRAINT [FK_TicketServices_OperatingSchedules_OperatingScheduleId_BranchId];
GO

ALTER TABLE [dbo].[UnresolvedCatalogBranches] WITH CHECK ADD CONSTRAINT [FK_UnresolvedCatalogBranches_Branches_ResolvedBranchId]
FOREIGN KEY ([ResolvedBranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UnresolvedCatalogBranches] CHECK CONSTRAINT [FK_UnresolvedCatalogBranches_Branches_ResolvedBranchId];
GO

ALTER TABLE [dbo].[UnresolvedCatalogBranches] WITH CHECK ADD CONSTRAINT [FK_UnresolvedCatalogBranches_CatalogSourceSnapshots_SourceSnapshotId]
FOREIGN KEY ([SourceSnapshotId])
REFERENCES [dbo].[CatalogSourceSnapshots] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UnresolvedCatalogBranches] CHECK CONSTRAINT [FK_UnresolvedCatalogBranches_CatalogSourceSnapshots_SourceSnapshotId];
GO

ALTER TABLE [dbo].[UnresolvedCatalogBranches] WITH CHECK ADD CONSTRAINT [FK_UnresolvedCatalogBranches_Organizations_OrganizationId]
FOREIGN KEY ([OrganizationId])
REFERENCES [dbo].[Organizations] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UnresolvedCatalogBranches] CHECK CONSTRAINT [FK_UnresolvedCatalogBranches_Organizations_OrganizationId];
GO

ALTER TABLE [dbo].[UserAccessibilityPreferences] WITH CHECK ADD CONSTRAINT [FK_UserAccessibilityPreferences_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserAccessibilityPreferences] CHECK CONSTRAINT [FK_UserAccessibilityPreferences_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[UserAccessNeeds] WITH CHECK ADD CONSTRAINT [FK_UserAccessNeeds_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserAccessNeeds] CHECK CONSTRAINT [FK_UserAccessNeeds_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[UserAccessNeedSelections] WITH CHECK ADD CONSTRAINT [FK_UserAccessNeedSelections_UserAccessNeeds_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[UserAccessNeeds] ([UserId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserAccessNeedSelections] CHECK CONSTRAINT [FK_UserAccessNeedSelections_UserAccessNeeds_UserId];
GO

ALTER TABLE [dbo].[UserCareerSkills] WITH CHECK ADD CONSTRAINT [FK_UserCareerSkills_UserProfiles_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[UserProfiles] ([UserId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserCareerSkills] CHECK CONSTRAINT [FK_UserCareerSkills_UserProfiles_UserId];
GO

ALTER TABLE [dbo].[UserCvDocuments] WITH CHECK ADD CONSTRAINT [FK_UserCvDocuments_UserProfiles_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[UserProfiles] ([UserId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserCvDocuments] CHECK CONSTRAINT [FK_UserCvDocuments_UserProfiles_UserId];
GO

ALTER TABLE [dbo].[UserDisplayPreferences] WITH CHECK ADD CONSTRAINT [FK_UserDisplayPreferences_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserDisplayPreferences] CHECK CONSTRAINT [FK_UserDisplayPreferences_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[UserProfiles] WITH CHECK ADD CONSTRAINT [FK_UserProfiles_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserProfiles] CHECK CONSTRAINT [FK_UserProfiles_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[UserRecentPlaces] WITH CHECK ADD CONSTRAINT [FK_UserRecentPlaces_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserRecentPlaces] CHECK CONSTRAINT [FK_UserRecentPlaces_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[UserRecentPlaces] WITH CHECK ADD CONSTRAINT [FK_UserRecentPlaces_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserRecentPlaces] CHECK CONSTRAINT [FK_UserRecentPlaces_Branches_BranchId];
GO

ALTER TABLE [dbo].[UserRegistrations] WITH CHECK ADD CONSTRAINT [FK_UserRegistrations_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserRegistrations] CHECK CONSTRAINT [FK_UserRegistrations_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[VacancyQuestions] WITH CHECK ADD CONSTRAINT [FK_VacancyQuestions_JobVacancies_VacancyId]
FOREIGN KEY ([VacancyId])
REFERENCES [dbo].[JobVacancies] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VacancyQuestions] CHECK CONSTRAINT [FK_VacancyQuestions_JobVacancies_VacancyId];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [FK_VisitReviews_AspNetUsers_ReviewedById]
FOREIGN KEY ([ReviewedById])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [FK_VisitReviews_AspNetUsers_ReviewedById];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [FK_VisitReviews_AspNetUsers_UserId]
FOREIGN KEY ([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [FK_VisitReviews_AspNetUsers_UserId];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [FK_VisitReviews_Bookings_BookingId]
FOREIGN KEY ([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [FK_VisitReviews_Bookings_BookingId];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [FK_VisitReviews_Bookings_BookingId_UserId_BranchId]
FOREIGN KEY ([BookingId], [UserId], [BranchId])
REFERENCES [dbo].[Bookings] ([Id], [UserId], [BranchId])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [FK_VisitReviews_Bookings_BookingId_UserId_BranchId];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [FK_VisitReviews_Branches_BranchId]
FOREIGN KEY ([BranchId])
REFERENCES [dbo].[Branches] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [FK_VisitReviews_Branches_BranchId];
GO

ALTER TABLE [dbo].[VisitReviews] WITH CHECK ADD CONSTRAINT [FK_VisitReviews_MediaAssets_PhotoMediaId]
FOREIGN KEY ([PhotoMediaId])
REFERENCES [dbo].[MediaAssets] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[VisitReviews] CHECK CONSTRAINT [FK_VisitReviews_MediaAssets_PhotoMediaId];
GO

ALTER TABLE [dbo].[WeeklyHours] WITH CHECK ADD CONSTRAINT [FK_WeeklyHours_OperatingSchedules_ScheduleId]
FOREIGN KEY ([ScheduleId])
REFERENCES [dbo].[OperatingSchedules] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[WeeklyHours] CHECK CONSTRAINT [FK_WeeklyHours_OperatingSchedules_ScheduleId];
GO

ALTER TABLE [dbo].[WorkflowStages] WITH CHECK ADD CONSTRAINT [FK_WorkflowStages_WorkflowDefinitions_WorkflowId]
FOREIGN KEY ([WorkflowId])
REFERENCES [dbo].[WorkflowDefinitions] ([Id])
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[WorkflowStages] CHECK CONSTRAINT [FK_WorkflowStages_WorkflowDefinitions_WorkflowId];
GO
