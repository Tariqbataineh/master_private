-- Fresh database install. No DROP, no sample accounts, no passwords. SQL Server 2019+.

USE [master];
GO
IF DB_ID(N'WusoolDb') IS NULL EXEC(N'CREATE DATABASE [WusoolDb] COLLATE Latin1_General_100_CI_AS_SC');
GO
USE [WusoolDb];
GO
SET XACT_ABORT ON;
IF OBJECT_ID(N'dbo.AspNetUsers',N'U') IS NOT NULL THROW 51000, 'Schema already exists. Use reviewed migrations, not this installer.', 1;
GO
BEGIN TRANSACTION;

CREATE TABLE [dbo].[AspNetUsers] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_AspNetUsers_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AspNetUsers_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AspNetUsers_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_AspNetUsers_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [UserName] nvarchar(256) NOT NULL,
    [NormalizedUserName] nvarchar(256) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [NormalizedEmail] nvarchar(256) NOT NULL,
    [EmailConfirmed] bit NOT NULL CONSTRAINT [DF_AspNetUsers_EmailConfirmed] DEFAULT (0),
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(50) NULL,
    [PhoneNumberConfirmed] bit NOT NULL CONSTRAINT [DF_AspNetUsers_PhoneNumberConfirmed] DEFAULT (0),
    [TwoFactorEnabled] bit NOT NULL CONSTRAINT [DF_AspNetUsers_TwoFactorEnabled] DEFAULT (0),
    [LockoutEnd] datetimeoffset(7) NULL,
    [LockoutEnabled] bit NOT NULL CONSTRAINT [DF_AspNetUsers_LockoutEnabled] DEFAULT (1),
    [AccessFailedCount] int NOT NULL CONSTRAINT [DF_AspNetUsers_AccessFailedCount] DEFAULT (0),
    [Name] nvarchar(500) NOT NULL,
    [ContactPhone] nvarchar(500) NULL,
    [Status] nvarchar(500) NOT NULL CONSTRAINT [DF_AspNetUsers_Status] DEFAULT (N'pending'),
    [ApprovalStatus] nvarchar(500) NULL,
    [RequiresInitialSetup] bit NULL,
    [Type] nvarchar(500) NULL,
    [OrganizationType] nvarchar(500) NULL,
    [OrganizationCategory] nvarchar(500) NULL,
    [City] nvarchar(500) NULL,
    [Address] nvarchar(500) NULL,
    [Latitude] decimal(10,7) NULL,
    [Longitude] decimal(10,7) NULL,
    [CountryCode] nvarchar(500) NULL,
    [Governorate] nvarchar(500) NULL,
    [GooglePlaceId] nvarchar(128) NULL,
    [Website] nvarchar(500) NULL,
    [AccessibilityPreferencesJson] nvarchar(max) NULL,
    [ProfileJson] nvarchar(max) NULL,
    [PreferencesJson] nvarchar(max) NULL,
    [SettingsJson] nvarchar(max) NULL,
    [RepresentativeName] nvarchar(500) NULL,
    [JobTitle] nvarchar(500) NULL,
    [ManagerName] nvarchar(500) NULL,
    [ManagerPosition] nvarchar(500) NULL,
    [ManagerEmail] nvarchar(500) NULL,
    [ManagerPhone] nvarchar(500) NULL,
    [RegistrationNumber] nvarchar(500) NULL,
    [Logo] nvarchar(500) NULL,
    [DocumentName] nvarchar(500) NULL,
    [DocumentId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [DocumentStatus] nvarchar(500) NULL,
    [RoleCode] nvarchar(20) NOT NULL CONSTRAINT [DF_AspNetUsers_RoleCode] DEFAULT (N'User'),
    [BlockedAt] datetimeoffset(7) NULL,
    [BlockedById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [BlockReason] nvarchar(1000) NULL,
    [TermsAcceptedAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_AspNetUsers_0] CHECK ([RoleCode] IN (N'User',N'Organization',N'Admin')),
    CONSTRAINT [CK_AspNetUsers_1] CHECK ([Status] IN (N'active',N'pending',N'rejected',N'blocked',N'suspended',N'disabled')),
    CONSTRAINT [CK_AspNetUsers_2] CHECK ([ApprovalStatus] IS NULL OR [ApprovalStatus] IN (N'pending',N'approved',N'rejected')),
    CONSTRAINT [CK_AspNetUsers_3] CHECK ([AccessibilityPreferencesJson] IS NULL OR ISJSON([AccessibilityPreferencesJson]) = 1),
    CONSTRAINT [CK_AspNetUsers_4] CHECK ([ProfileJson] IS NULL OR ISJSON([ProfileJson]) = 1),
    CONSTRAINT [CK_AspNetUsers_5] CHECK ([PreferencesJson] IS NULL OR ISJSON([PreferencesJson]) = 1),
    CONSTRAINT [CK_AspNetUsers_6] CHECK ([SettingsJson] IS NULL OR ISJSON([SettingsJson]) = 1),
    CONSTRAINT [CK_AspNetUsers_7] CHECK (([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL AND [Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180)),
    CONSTRAINT [CK_AspNetUsers_8] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[AspNetRoles] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);

CREATE TABLE [dbo].[AspNetUserRoles] (
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [RoleId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId])
);

CREATE TABLE [dbo].[AspNetUserClaims] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id])
);

CREATE TABLE [dbo].[AspNetRoleClaims] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [RoleId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id])
);

CREATE TABLE [dbo].[AspNetUserLogins] (
    [LoginProvider] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ProviderKey] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey])
);

CREATE TABLE [dbo].[AspNetUserTokens] (
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [LoginProvider] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Name] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name])
);

CREATE TABLE [dbo].[Organizations] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Organizations_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Organizations_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Organizations_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Organizations_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [HoursRevision] int NOT NULL CONSTRAINT [DF_Organizations_HoursRevision] DEFAULT (0),
    [HoursUpdatedAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_Organizations] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Organizations_0] CHECK ([Id] = [AccountId]),
    CONSTRAINT [CK_Organizations_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[OrganizationMemberships] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_OrganizationMemberships_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationMemberships_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationMemberships_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_OrganizationMemberships_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Role] nvarchar(30) NOT NULL CONSTRAINT [DF_OrganizationMemberships_Role] DEFAULT (N'owner'),
    [Active] bit NOT NULL CONSTRAINT [DF_OrganizationMemberships_Active] DEFAULT (1),
    CONSTRAINT [PK_OrganizationMemberships] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_OrganizationMemberships_0] CHECK ([Role] IN (N'owner',N'manager',N'staff')),
    CONSTRAINT [CK_OrganizationMemberships_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[OrganizationApplications] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_OrganizationApplications_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationApplications_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationApplications_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_OrganizationApplications_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Status] nvarchar(30) NOT NULL CONSTRAINT [DF_OrganizationApplications_Status] DEFAULT (N'pending'),
    [SubmittedById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ReviewedById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [ReviewedAt] datetimeoffset(7) NULL,
    [Reason] nvarchar(1000) NULL,
    [SnapshotJson] nvarchar(max) NULL,
    CONSTRAINT [PK_OrganizationApplications] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_OrganizationApplications_0] CHECK ([SnapshotJson] IS NULL OR ISJSON([SnapshotJson]) = 1),
    CONSTRAINT [CK_OrganizationApplications_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Branches] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Branches_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Branches_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Branches_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Branches_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Name] nvarchar(120) NOT NULL,
    [BranchType] nvarchar(500) NULL,
    [Type] nvarchar(500) NULL,
    [Description] nvarchar(500) NULL,
    [Phone] nvarchar(500) NULL,
    [Email] nvarchar(500) NULL,
    [City] nvarchar(500) NULL,
    [District] nvarchar(500) NULL,
    [Area] nvarchar(500) NULL,
    [Address] nvarchar(500) NULL,
    [Latitude] decimal(10,7) NULL,
    [Longitude] decimal(10,7) NULL,
    [CountryCode] nvarchar(500) NULL,
    [Governorate] nvarchar(500) NULL,
    [GooglePlaceId] nvarchar(128) NULL,
    [AccessibilityFeaturesJson] nvarchar(max) NULL,
    [OperationalAvailabilityJson] nvarchar(max) NULL,
    [Status] nvarchar(500) NOT NULL,
    [AccessibilityScore] decimal(18,6) NULL,
    [Score] decimal(18,6) NULL,
    [ScoreSource] nvarchar(500) NULL,
    [EvidenceStatus] nvarchar(500) NULL,
    [IsPublished] bit NULL,
    [ReviewedBy] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [ReviewedAt] datetimeoffset(7) NULL,
    [ApprovedAt] datetimeoffset(7) NULL,
    [SubmittedAt] datetimeoffset(7) NULL,
    [StatusUpdatedAt] datetimeoffset(7) NULL,
    [AdminFeedback] nvarchar(1000) NULL,
    [HoursRevision] int NOT NULL,
    [HoursUpdatedAt] datetimeoffset(7) NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [TicketServicesConfigured] bit NOT NULL CONSTRAINT [DF_Branches_TicketServicesConfigured] DEFAULT (0),
    [BookingConfigurationJson] nvarchar(max) NULL,
    [ClosuresJson] nvarchar(max) NULL,
    [DetailsCompleted] bit NOT NULL CONSTRAINT [DF_Branches_DetailsCompleted] DEFAULT (0),
    [HoursCompleted] bit NOT NULL CONSTRAINT [DF_Branches_HoursCompleted] DEFAULT (0),
    [AccessibilityCompleted] bit NOT NULL CONSTRAINT [DF_Branches_AccessibilityCompleted] DEFAULT (0),
    [PhotosCompleted] bit NOT NULL CONSTRAINT [DF_Branches_PhotosCompleted] DEFAULT (0),
    [AiReviewCompleted] bit NOT NULL CONSTRAINT [DF_Branches_AiReviewCompleted] DEFAULT (0),
    [CurrentAnalysisId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    CONSTRAINT [PK_Branches] PRIMARY KEY ([Id]),
    CONSTRAINT [AK_Branches_0] UNIQUE ([Id], [OrganizationId]),
    CONSTRAINT [CK_Branches_0] CHECK ([Status] IN (N'draft',N'pending',N'approved',N'published',N'rejected',N'suspended',N'changes-requested')),
    CONSTRAINT [CK_Branches_1] CHECK ([AccessibilityScore] IS NULL OR [AccessibilityScore] BETWEEN 0 AND 100),
    CONSTRAINT [CK_Branches_2] CHECK ([AccessibilityFeaturesJson] IS NULL OR ISJSON([AccessibilityFeaturesJson]) = 1),
    CONSTRAINT [CK_Branches_3] CHECK ([OperationalAvailabilityJson] IS NULL OR ISJSON([OperationalAvailabilityJson]) = 1),
    CONSTRAINT [CK_Branches_4] CHECK ([BookingConfigurationJson] IS NULL OR ISJSON([BookingConfigurationJson]) = 1),
    CONSTRAINT [CK_Branches_5] CHECK ([ClosuresJson] IS NULL OR ISJSON([ClosuresJson]) = 1),
    CONSTRAINT [CK_Branches_6] CHECK (([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL AND [Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180)),
    CONSTRAINT [CK_Branches_7] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[OrganizationHours] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_OrganizationHours_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationHours_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationHours_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_OrganizationHours_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [DayOfWeek] tinyint NOT NULL,
    [IsOpen] bit NOT NULL CONSTRAINT [DF_OrganizationHours_IsOpen] DEFAULT (0),
    [OpenTime] time(0) NULL,
    [CloseTime] time(0) NULL,
    CONSTRAINT [PK_OrganizationHours] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_OrganizationHours_0] CHECK ([DayOfWeek] BETWEEN 0 AND 6),
    CONSTRAINT [CK_OrganizationHours_1] CHECK (([IsOpen] = 0 AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([IsOpen] = 1 AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])),
    CONSTRAINT [CK_OrganizationHours_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[OrganizationSpecialDates] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_OrganizationSpecialDates_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationSpecialDates_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OrganizationSpecialDates_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_OrganizationSpecialDates_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Date] date NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [OpenTime] time(0) NULL,
    [CloseTime] time(0) NULL,
    [Note] nvarchar(300) NULL,
    CONSTRAINT [PK_OrganizationSpecialDates] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_OrganizationSpecialDates_0] CHECK (([Status] = N'closed' AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([Status] = N'custom' AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])),
    CONSTRAINT [CK_OrganizationSpecialDates_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchHours] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchHours_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchHours_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchHours_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchHours_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [DayOfWeek] tinyint NOT NULL,
    [IsOpen] bit NOT NULL CONSTRAINT [DF_BranchHours_IsOpen] DEFAULT (0),
    [OpenTime] time(0) NULL,
    [CloseTime] time(0) NULL,
    CONSTRAINT [PK_BranchHours] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BranchHours_0] CHECK ([DayOfWeek] BETWEEN 0 AND 6),
    CONSTRAINT [CK_BranchHours_1] CHECK (([IsOpen] = 0 AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([IsOpen] = 1 AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])),
    CONSTRAINT [CK_BranchHours_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchSpecialDates] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchSpecialDates_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchSpecialDates_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchSpecialDates_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchSpecialDates_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Date] date NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [OpenTime] time(0) NULL,
    [CloseTime] time(0) NULL,
    [Note] nvarchar(300) NULL,
    CONSTRAINT [PK_BranchSpecialDates] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BranchSpecialDates_0] CHECK (([Status] = N'closed' AND [OpenTime] IS NULL AND [CloseTime] IS NULL) OR ([Status] = N'custom' AND [OpenTime] IS NOT NULL AND [CloseTime] IS NOT NULL AND [OpenTime] < [CloseTime])),
    CONSTRAINT [CK_BranchSpecialDates_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchServices] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchServices_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchServices_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchServices_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchServices_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Name] nvarchar(120) NOT NULL,
    [Description] nvarchar(500) NULL,
    [Active] bit NOT NULL CONSTRAINT [DF_BranchServices_Active] DEFAULT (1),
    [Available] bit NOT NULL CONSTRAINT [DF_BranchServices_Available] DEFAULT (1),
    [NormalizedName] nvarchar(120) NOT NULL,
    CONSTRAINT [PK_BranchServices] PRIMARY KEY ([Id]),
    CONSTRAINT [AK_BranchServices_0] UNIQUE ([Id], [BranchId]),
    CONSTRAINT [CK_BranchServices_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchLegacyServices] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchLegacyServices_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchLegacyServices_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchLegacyServices_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchLegacyServices_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Name] nvarchar(120) NOT NULL,
    [SortOrder] int NOT NULL CONSTRAINT [DF_BranchLegacyServices_SortOrder] DEFAULT (0),
    [LegacyPayloadJson] nvarchar(max) NULL,
    CONSTRAINT [PK_BranchLegacyServices] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BranchLegacyServices_0] CHECK ([LegacyPayloadJson] IS NULL OR ISJSON([LegacyPayloadJson]) = 1),
    CONSTRAINT [CK_BranchLegacyServices_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchDestinations] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchDestinations_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchDestinations_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchDestinations_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchDestinations_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Name] nvarchar(120) NOT NULL,
    [SortOrder] int NOT NULL CONSTRAINT [DF_BranchDestinations_SortOrder] DEFAULT (0),
    [LegacyPayloadJson] nvarchar(max) NULL,
    CONSTRAINT [PK_BranchDestinations] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BranchDestinations_0] CHECK ([LegacyPayloadJson] IS NULL OR ISJSON([LegacyPayloadJson]) = 1),
    CONSTRAINT [CK_BranchDestinations_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[AccessibilityRequirements] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_AccessibilityRequirements_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AccessibilityRequirements_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AccessibilityRequirements_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_AccessibilityRequirements_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Key] nvarchar(100) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Description] nvarchar(1000) NULL,
    [Icon] nvarchar(100) NULL,
    [Category] nvarchar(100) NULL,
    [Weight] decimal(9,4) NOT NULL CONSTRAINT [DF_AccessibilityRequirements_Weight] DEFAULT (1),
    [Required] bit NOT NULL CONSTRAINT [DF_AccessibilityRequirements_Required] DEFAULT (0),
    [Enabled] bit NOT NULL CONSTRAINT [DF_AccessibilityRequirements_Enabled] DEFAULT (1),
    CONSTRAINT [PK_AccessibilityRequirements] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_AccessibilityRequirements_0] CHECK ([Weight] >= 0),
    CONSTRAINT [CK_AccessibilityRequirements_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchAccessibility] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchAccessibility_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchAccessibility_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchAccessibility_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchAccessibility_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [RequirementId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Value] nvarchar(30) NOT NULL,
    [Notes] nvarchar(1000) NULL,
    CONSTRAINT [PK_BranchAccessibility] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BranchAccessibility_0] CHECK ([Value] IN (N'available',N'not-available',N'not-sure',N'yes',N'no',N'unknown')),
    CONSTRAINT [CK_BranchAccessibility_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Documents] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Documents_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Documents_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Documents_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Documents_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OwnerId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [CategoryKey] nvarchar(500) NULL,
    [Purpose] nvarchar(500) NULL,
    [Name] nvarchar(500) NOT NULL,
    [FileName] nvarchar(500) NOT NULL,
    [Url] nvarchar(500) NULL,
    [Type] nvarchar(500) NOT NULL,
    [Size] int NOT NULL,
    [Uploaded] bit NULL,
    [Status] nvarchar(500) NOT NULL,
    [MetadataJson] nvarchar(max) NULL,
    CONSTRAINT [PK_Documents] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Documents_0] CHECK ([Size] >= 0),
    CONSTRAINT [CK_Documents_1] CHECK ([Status] IN (N'uploaded',N'preview-only',N'approved',N'rejected')),
    CONSTRAINT [CK_Documents_2] CHECK ([MetadataJson] IS NULL OR ISJSON([MetadataJson]) = 1),
    CONSTRAINT [CK_Documents_3] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchPhotos] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchPhotos_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchPhotos_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchPhotos_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchPhotos_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [CategoryKey] nvarchar(500) NULL,
    [CategoryTitle] nvarchar(500) NULL,
    [Name] nvarchar(500) NULL,
    [Type] nvarchar(500) NULL,
    [Size] int NULL,
    [OriginalSize] int NULL,
    [CompressionSavedBytes] int NULL,
    [Url] nvarchar(500) NULL,
    [Uploaded] bit NULL,
    [UploadedAt] datetimeoffset(7) NULL,
    [Status] nvarchar(500) NULL,
    [DocumentId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [SortOrder] int NOT NULL CONSTRAINT [DF_BranchPhotos_SortOrder] DEFAULT (0),
    CONSTRAINT [PK_BranchPhotos] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BranchPhotos_0] CHECK ([CategoryKey] IN (N'main-entrance',N'entrance-route',N'internal-pathway',N'destination-area')),
    CONSTRAINT [CK_BranchPhotos_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BranchAnalyses] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BranchAnalyses_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchAnalyses_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BranchAnalyses_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BranchAnalyses_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Status] nvarchar(500) NULL,
    [Score] decimal(18,6) NULL,
    [Confidence] decimal(18,6) NULL,
    [Source] nvarchar(500) NULL,
    [IsDemo] bit NULL,
    [Model] nvarchar(500) NULL,
    [GeneratedAt] datetimeoffset(7) NULL,
    [Message] nvarchar(1000) NULL,
    [FindingsJson] nvarchar(max) NULL,
    [RecommendationsJson] nvarchar(max) NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_BranchAnalyses] PRIMARY KEY ([Id]),
    CONSTRAINT [AK_BranchAnalyses_0] UNIQUE ([Id], [BranchId]),
    CONSTRAINT [CK_BranchAnalyses_0] CHECK ([Score] IS NULL OR [Score] BETWEEN 0 AND 100),
    CONSTRAINT [CK_BranchAnalyses_1] CHECK ([Confidence] IS NULL OR [Confidence] BETWEEN 0 AND 1),
    CONSTRAINT [CK_BranchAnalyses_2] CHECK ([FindingsJson] IS NULL OR ISJSON([FindingsJson]) = 1),
    CONSTRAINT [CK_BranchAnalyses_3] CHECK ([RecommendationsJson] IS NULL OR ISJSON([RecommendationsJson]) = 1),
    CONSTRAINT [CK_BranchAnalyses_4] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Bookings] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Bookings_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Bookings_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Bookings_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Bookings_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [VisitDate] date NOT NULL,
    [VisitTime] time(0) NOT NULL,
    [TimeZone] nvarchar(500) NOT NULL CONSTRAINT [DF_Bookings_TimeZone] DEFAULT (N'Asia/Amman'),
    [RequiresAssistant] bit NULL,
    [SupportJson] nvarchar(max) NULL,
    [DurationMinutes] int NOT NULL CONSTRAINT [DF_Bookings_DurationMinutes] DEFAULT (30),
    [Purpose] nvarchar(1000) NULL,
    [VisitPurpose] nvarchar(1000) NULL,
    [Destination] nvarchar(500) NULL,
    [GuidanceMethod] nvarchar(500) NULL,
    [Reason] nvarchar(1000) NULL,
    [Reference] nvarchar(80) NOT NULL,
    [Status] nvarchar(500) NOT NULL CONSTRAINT [DF_Bookings_Status] DEFAULT (N'pending'),
    [JourneyState] nvarchar(500) NOT NULL CONSTRAINT [DF_Bookings_JourneyState] DEFAULT (N'not-started'),
    [LocationSnapshotJson] nvarchar(max) NULL,
    [DepartedAt] datetimeoffset(7) NULL,
    [ArrivedAt] datetimeoffset(7) NULL,
    [ReceivedAt] datetimeoffset(7) NULL,
    [CompletedAt] datetimeoffset(7) NULL,
    [CancelledAt] datetimeoffset(7) NULL,
    [CalledAt] datetimeoffset(7) NULL,
    [CancellationReason] nvarchar(1000) NULL,
    [ScheduleBlockedJson] nvarchar(max) NULL,
    [QrUsedAt] datetimeoffset(7) NULL,
    [ScheduleConflict] bit NULL,
    [ScheduleConflictAt] datetimeoffset(7) NULL,
    [ServiceId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [ServiceName] nvarchar(500) NULL,
    [ServiceSnapshotJson] nvarchar(max) NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [QueueNumber] int NULL,
    [QueueCalledById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [QueueCalledAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_Bookings] PRIMARY KEY ([Id]),
    CONSTRAINT [AK_Bookings_0] UNIQUE ([Id], [UserId], [BranchId]),
    CONSTRAINT [CK_Bookings_0] CHECK ([DurationMinutes] BETWEEN 15 AND 120),
    CONSTRAINT [CK_Bookings_1] CHECK ([TimeZone] = N'Asia/Amman'),
    CONSTRAINT [CK_Bookings_2] CHECK ([Status] IN (N'pending',N'confirmed',N'in-progress',N'completed',N'cancelled',N'no-show',N'waitlisted')),
    CONSTRAINT [CK_Bookings_3] CHECK ([JourneyState] IN (N'not-started',N'on-the-way',N'arrived',N'serving',N'completed',N'cancelled',N'no-show')),
    CONSTRAINT [CK_Bookings_4] CHECK ([SupportJson] IS NULL OR ISJSON([SupportJson]) = 1),
    CONSTRAINT [CK_Bookings_5] CHECK ([LocationSnapshotJson] IS NULL OR ISJSON([LocationSnapshotJson]) = 1),
    CONSTRAINT [CK_Bookings_6] CHECK ([ScheduleBlockedJson] IS NULL OR ISJSON([ScheduleBlockedJson]) = 1),
    CONSTRAINT [CK_Bookings_7] CHECK ([ServiceSnapshotJson] IS NULL OR ISJSON([ServiceSnapshotJson]) = 1),
    CONSTRAINT [CK_Bookings_8] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[BookingHistory] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_BookingHistory_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BookingHistory_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BookingHistory_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_BookingHistory_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Event] nvarchar(80) NOT NULL,
    [FromState] nvarchar(30) NULL,
    [ToState] nvarchar(30) NULL,
    [ActorId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [ActorRole] nvarchar(20) NULL,
    [ActorName] nvarchar(120) NULL,
    [Reason] nvarchar(1000) NULL,
    [At] datetimeoffset(7) NOT NULL CONSTRAINT [DF_BookingHistory_At] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_BookingHistory] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_BookingHistory_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[AppointmentProposals] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_AppointmentProposals_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AppointmentProposals_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AppointmentProposals_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_AppointmentProposals_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ServiceId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [ServiceName] nvarchar(120) NULL,
    [ServiceSnapshotJson] nvarchar(max) NULL,
    [VisitDate] date NOT NULL,
    [VisitTime] time(0) NOT NULL,
    [RequiresAssistant] bit NOT NULL CONSTRAINT [DF_AppointmentProposals_RequiresAssistant] DEFAULT (0),
    [DurationMinutes] int NOT NULL CONSTRAINT [DF_AppointmentProposals_DurationMinutes] DEFAULT (30),
    [Reason] nvarchar(1000) NULL,
    [ExpiresAt] datetimeoffset(7) NOT NULL,
    [Status] nvarchar(30) NOT NULL CONSTRAINT [DF_AppointmentProposals_Status] DEFAULT (N'pending'),
    [RespondedAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_AppointmentProposals] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_AppointmentProposals_0] CHECK ([Status] IN (N'pending',N'accepted',N'rejected',N'expired',N'superseded')),
    CONSTRAINT [CK_AppointmentProposals_1] CHECK ([DurationMinutes] BETWEEN 15 AND 120),
    CONSTRAINT [CK_AppointmentProposals_2] CHECK ([ServiceSnapshotJson] IS NULL OR ISJSON([ServiceSnapshotJson]) = 1),
    CONSTRAINT [CK_AppointmentProposals_3] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[VisitPasses] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_VisitPasses_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_VisitPasses_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_VisitPasses_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_VisitPasses_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [TokenHash] binary(32) NOT NULL,
    [ExpiresAt] datetimeoffset(7) NOT NULL,
    [VerifiedById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [VerifiedAt] datetimeoffset(7) NULL,
    [UsedAt] datetimeoffset(7) NULL,
    [RevokedAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_VisitPasses] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_VisitPasses_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Reviews] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Reviews_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Reviews_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Reviews_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Reviews_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Rating] int NOT NULL,
    [Comment] nvarchar(500) NULL,
    [Title] nvarchar(500) NULL,
    [Status] nvarchar(500) NOT NULL,
    [Flagged] bit NULL,
    [ModerationLocked] bit NULL,
    [ApprovedAt] datetimeoffset(7) NULL,
    [ApprovedBy] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [UserId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_Reviews] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Reviews_0] CHECK ([Rating] BETWEEN 1 AND 5),
    CONSTRAINT [CK_Reviews_1] CHECK ([Status] IN (N'Pending',N'Visible',N'Hidden',N'Rejected')),
    CONSTRAINT [CK_Reviews_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[SupportTickets] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_SupportTickets_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_SupportTickets_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_SupportTickets_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_SupportTickets_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [RequesterId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Kind] nvarchar(500) NOT NULL,
    [Subject] nvarchar(200) NULL,
    [Title] nvarchar(500) NULL,
    [Description] nvarchar(2000) NULL,
    [Category] nvarchar(500) NULL,
    [IssueType] nvarchar(500) NULL,
    [Priority] nvarchar(500) NOT NULL,
    [Status] nvarchar(500) NOT NULL,
    [AssignedTo] nvarchar(500) COLLATE Latin1_General_100_BIN2 NULL,
    [PlaceName] nvarchar(500) NULL,
    [City] nvarchar(500) NULL,
    [Address] nvarchar(500) NULL,
    [DetailsJson] nvarchar(max) NULL,
    CONSTRAINT [PK_SupportTickets] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_SupportTickets_0] CHECK ([Kind] IN (N'support',N'accessibility-report',N'place-suggestion')),
    CONSTRAINT [CK_SupportTickets_1] CHECK ([Status] IN (N'Open',N'In Progress',N'Resolved',N'Closed')),
    CONSTRAINT [CK_SupportTickets_2] CHECK ([Priority] IN (N'Low',N'Medium',N'High',N'Urgent')),
    CONSTRAINT [CK_SupportTickets_3] CHECK ([DetailsJson] IS NULL OR ISJSON([DetailsJson]) = 1),
    CONSTRAINT [CK_SupportTickets_4] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[TicketMessages] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_TicketMessages_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_TicketMessages_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_TicketMessages_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_TicketMessages_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [TicketId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ActorId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Message] nvarchar(4000) NOT NULL,
    [ActorName] nvarchar(120) NULL,
    [ActorRole] nvarchar(20) NULL,
    CONSTRAINT [PK_TicketMessages] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_TicketMessages_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[TicketAttachments] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_TicketAttachments_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_TicketAttachments_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_TicketAttachments_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_TicketAttachments_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [TicketId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [DocumentId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_TicketAttachments] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_TicketAttachments_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Plans] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Plans_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Plans_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Plans_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Plans_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Name] nvarchar(500) NOT NULL,
    [MonthlyPrice] decimal(18,2) NOT NULL,
    [AnnualDiscount] decimal(18,6) NOT NULL,
    [BranchLimit] int NOT NULL,
    [Currency] nvarchar(500) NOT NULL,
    [Active] bit NOT NULL,
    [Description] nvarchar(500) NULL,
    [FeaturesJson] nvarchar(max) NULL,
    CONSTRAINT [PK_Plans] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Plans_0] CHECK ([MonthlyPrice] >= 0 AND [AnnualDiscount] BETWEEN 0 AND 1 AND [BranchLimit] > 0),
    CONSTRAINT [CK_Plans_1] CHECK ([FeaturesJson] IS NULL OR ISJSON([FeaturesJson]) = 1),
    CONSTRAINT [CK_Plans_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Subscriptions] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Subscriptions_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Subscriptions_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Subscriptions_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Subscriptions_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [PlanId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [PlanName] nvarchar(500) NULL,
    [BillingCycle] nvarchar(500) NOT NULL,
    [Status] nvarchar(500) NOT NULL,
    [BranchLimit] int NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Currency] nvarchar(500) NOT NULL,
    [StartDate] datetimeoffset(7) NULL,
    [RenewalDate] datetimeoffset(7) NULL,
    [EndDate] datetimeoffset(7) NULL,
    [AutoRenew] bit NULL,
    [PaymentStatus] nvarchar(500) NULL,
    [DevelopmentOnly] bit NULL,
    CONSTRAINT [PK_Subscriptions] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Subscriptions_0] CHECK ([Status] IN (N'Active',N'Inactive',N'Cancelled',N'Expired',N'Pending')),
    CONSTRAINT [CK_Subscriptions_1] CHECK ([BillingCycle] IN (N'monthly',N'annual')),
    CONSTRAINT [CK_Subscriptions_2] CHECK ([Price] >= 0 AND [BranchLimit] > 0),
    CONSTRAINT [CK_Subscriptions_3] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[PaymentOperations] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_PaymentOperations_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_PaymentOperations_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_PaymentOperations_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_PaymentOperations_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [SubscriptionId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Provider] nvarchar(40) NOT NULL,
    [ProviderReference] nvarchar(200) NULL,
    [OperationKind] nvarchar(30) NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [Amount] decimal(18,2) NULL,
    [Currency] nvarchar(3) NOT NULL CONSTRAINT [DF_PaymentOperations_Currency] DEFAULT (N'JOD'),
    [ProviderPayloadJson] nvarchar(max) NULL,
    CONSTRAINT [PK_PaymentOperations] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_PaymentOperations_0] CHECK ([Amount] IS NULL OR [Amount] >= 0),
    CONSTRAINT [CK_PaymentOperations_1] CHECK ([ProviderPayloadJson] IS NULL OR ISJSON([ProviderPayloadJson]) = 1),
    CONSTRAINT [CK_PaymentOperations_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[HoursChangeRequests] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_HoursChangeRequests_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_HoursChangeRequests_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_HoursChangeRequests_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_HoursChangeRequests_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [ResourceName] nvarchar(500) NULL,
    [BeforeJson] nvarchar(max) NOT NULL,
    [ProposedJson] nvarchar(max) NOT NULL,
    [BaseHoursRevision] int NOT NULL,
    [Status] nvarchar(500) NOT NULL,
    [Reason] nvarchar(500) NULL,
    [ReviewedAt] datetimeoffset(7) NULL,
    [ReviewReason] nvarchar(500) NULL,
    [OrganizationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [RequestedById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ReviewedById] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    CONSTRAINT [PK_HoursChangeRequests] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_HoursChangeRequests_0] CHECK ([Status] IN (N'pending',N'approved',N'rejected',N'superseded')),
    CONSTRAINT [CK_HoursChangeRequests_1] CHECK ([BeforeJson] IS NULL OR ISJSON([BeforeJson]) = 1),
    CONSTRAINT [CK_HoursChangeRequests_2] CHECK ([ProposedJson] IS NULL OR ISJSON([ProposedJson]) = 1),
    CONSTRAINT [CK_HoursChangeRequests_3] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[HoursAffectedBookings] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_HoursAffectedBookings_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_HoursAffectedBookings_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_HoursAffectedBookings_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_HoursAffectedBookings_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [HoursChangeRequestId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_HoursAffectedBookings] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_HoursAffectedBookings_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[Notifications] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_Notifications_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Notifications_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_Notifications_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Notifications_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OwnerId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Kind] nvarchar(500) NOT NULL,
    [Title] nvarchar(500) NOT NULL,
    [Message] nvarchar(1000) NOT NULL,
    [Status] nvarchar(500) NOT NULL,
    [ActionUrl] nvarchar(500) NULL,
    [Date] nvarchar(500) NULL,
    [Time] nvarchar(500) NULL,
    [BranchName] nvarchar(500) NULL,
    [HoursChangeRequestId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Notifications_0] CHECK ([Status] IN (N'unread',N'read')),
    CONSTRAINT [CK_Notifications_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[NotificationReads] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_NotificationReads_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_NotificationReads_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_NotificationReads_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_NotificationReads_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [NotificationId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ReadAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_NotificationReads_ReadAt] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_NotificationReads] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_NotificationReads_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[SavedPlaces] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_SavedPlaces_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_SavedPlaces_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_SavedPlaces_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_SavedPlaces_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_SavedPlaces] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_SavedPlaces_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[DeviceSessions] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_DeviceSessions_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_DeviceSessions_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_DeviceSessions_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_DeviceSessions_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [SessionHash] binary(32) NOT NULL,
    [Device] nvarchar(300) NULL,
    [LastActive] datetimeoffset(7) NOT NULL,
    [ExpiresAt] datetimeoffset(7) NOT NULL,
    [RevokedAt] datetimeoffset(7) NULL,
    [SecurityStampSnapshot] nvarchar(256) NOT NULL,
    CONSTRAINT [PK_DeviceSessions] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_DeviceSessions_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[AccessChallenges] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_AccessChallenges_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AccessChallenges_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AccessChallenges_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_AccessChallenges_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Purpose] nvarchar(30) NOT NULL,
    [TokenHash] binary(32) NOT NULL,
    [ExpiresAt] datetimeoffset(7) NOT NULL,
    [ConsumedAt] datetimeoffset(7) NULL,
    [AttemptCount] int NOT NULL CONSTRAINT [DF_AccessChallenges_AttemptCount] DEFAULT (0),
    CONSTRAINT [PK_AccessChallenges] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_AccessChallenges_0] CHECK ([AttemptCount] >= 0),
    CONSTRAINT [CK_AccessChallenges_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[ImpersonationSessions] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_ImpersonationSessions_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_ImpersonationSessions_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_ImpersonationSessions_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_ImpersonationSessions_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AdminId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [TargetAccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Reason] nvarchar(1000) NOT NULL,
    [ExpiresAt] datetimeoffset(7) NOT NULL,
    [EndedAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_ImpersonationSessions] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_ImpersonationSessions_0] CHECK ([AdminId] <> [TargetAccountId]),
    CONSTRAINT [CK_ImpersonationSessions_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[AuditEvents] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_AuditEvents_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AuditEvents_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_AuditEvents_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_AuditEvents_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Actor] nvarchar(500) NULL,
    [Action] nvarchar(500) NULL,
    [EntityType] nvarchar(500) NULL,
    [EntityId] nvarchar(128) NULL,
    [Reason] nvarchar(1000) NULL,
    [Timestamp] datetimeoffset(7) NULL,
    [Status] nvarchar(500) NULL,
    [Score] decimal(18,6) NULL,
    [ActorId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    CONSTRAINT [PK_AuditEvents] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_AuditEvents_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[FrontendStates] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_FrontendStates_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_FrontendStates_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_FrontendStates_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_FrontendStates_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Scope] nvarchar(20) NOT NULL,
    [OwnerKey] nvarchar(128) NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Key] nvarchar(200) NOT NULL,
    [ValueJson] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_FrontendStates] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_FrontendStates_0] CHECK (([Scope] = N'global' AND [OwnerKey] = N'global' AND [AccountId] IS NULL) OR ([Scope] = N'account' AND [AccountId] IS NOT NULL AND [OwnerKey] = [AccountId])),
    CONSTRAINT [CK_FrontendStates_1] CHECK ([ValueJson] IS NULL OR ISJSON([ValueJson]) = 1),
    CONSTRAINT [CK_FrontendStates_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[OutboxMessages] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_OutboxMessages_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OutboxMessages_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_OutboxMessages_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_OutboxMessages_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [OwnerId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Kind] nvarchar(50) NOT NULL,
    [PayloadJson] nvarchar(max) NOT NULL,
    [Status] nvarchar(30) NOT NULL CONSTRAINT [DF_OutboxMessages_Status] DEFAULT (N'queued'),
    [AttemptCount] int NOT NULL CONSTRAINT [DF_OutboxMessages_AttemptCount] DEFAULT (0),
    [NextAttemptAt] datetimeoffset(7) NULL,
    [SentAt] datetimeoffset(7) NULL,
    [LastError] nvarchar(1000) NULL,
    CONSTRAINT [PK_OutboxMessages] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_OutboxMessages_0] CHECK ([PayloadJson] IS NULL OR ISJSON([PayloadJson]) = 1),
    CONSTRAINT [CK_OutboxMessages_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[IdempotencyRecords] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_IdempotencyRecords_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_IdempotencyRecords_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_IdempotencyRecords_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_IdempotencyRecords_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Operation] nvarchar(80) NOT NULL,
    [Key] nvarchar(128) NOT NULL,
    [RequestHash] binary(32) NOT NULL,
    [ResponseJson] nvarchar(max) NULL,
    [HttpStatus] int NULL,
    [ExpiresAt] datetimeoffset(7) NOT NULL,
    CONSTRAINT [PK_IdempotencyRecords] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_IdempotencyRecords_0] CHECK ([ResponseJson] IS NULL OR ISJSON([ResponseJson]) = 1),
    CONSTRAINT [CK_IdempotencyRecords_1] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[RuntimeErrors] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_RuntimeErrors_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_RuntimeErrors_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_RuntimeErrors_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_RuntimeErrors_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [Type] nvarchar(500) NULL,
    [Message] nvarchar(2000) NULL,
    [Source] nvarchar(500) NULL,
    [Line] int NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    CONSTRAINT [PK_RuntimeErrors] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_RuntimeErrors_0] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[ExternalJobs] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_ExternalJobs_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_ExternalJobs_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_ExternalJobs_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_ExternalJobs_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [AccountId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [BranchId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [BookingId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NULL,
    [Kind] nvarchar(50) NOT NULL,
    [Provider] nvarchar(50) NULL,
    [Status] nvarchar(30) NOT NULL,
    [RequestJson] nvarchar(max) NULL,
    [ResultJson] nvarchar(max) NULL,
    [FailureMessage] nvarchar(1000) NULL,
    [CompletedAt] datetimeoffset(7) NULL,
    CONSTRAINT [PK_ExternalJobs] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_ExternalJobs_0] CHECK ([RequestJson] IS NULL OR ISJSON([RequestJson]) = 1),
    CONSTRAINT [CK_ExternalJobs_1] CHECK ([ResultJson] IS NULL OR ISJSON([ResultJson]) = 1),
    CONSTRAINT [CK_ExternalJobs_2] CHECK ([Revision] >= 0)
);

CREATE TABLE [dbo].[SyncRevisions] (
    [Id] int NOT NULL,
    [Version] bigint NOT NULL CONSTRAINT [DF_SyncRevisions_Version] DEFAULT (0),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_SyncRevisions_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_SyncRevisions] PRIMARY KEY ([Id])
);

CREATE TABLE [dbo].[TicketMessageAttachments] (
    [Id] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [Revision] int NOT NULL CONSTRAINT [DF_TicketMessageAttachments_Revision] DEFAULT (1),
    [CreatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_TicketMessageAttachments_CreatedAt] DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetimeoffset(7) NOT NULL CONSTRAINT [DF_TicketMessageAttachments_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_TicketMessageAttachments_IsDeleted] DEFAULT (0),
    [RowVersion] rowversion NOT NULL,
    [MessageId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    [DocumentId] nvarchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
    CONSTRAINT [PK_TicketMessageAttachments] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_TicketMessageAttachments_0] CHECK ([Revision] >= 0)
);

ALTER TABLE [dbo].[AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_0] FOREIGN KEY ([BlockedById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_1] FOREIGN KEY ([DocumentId]) REFERENCES [dbo].[Documents] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_AspNetUsers_0] ON [dbo].[AspNetUsers] ([NormalizedEmail]) WHERE [NormalizedEmail] IS NOT NULL;

CREATE UNIQUE INDEX [IX_AspNetUsers_1] ON [dbo].[AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;

CREATE INDEX [IX_AspNetUsers_2] ON [dbo].[AspNetUsers] ([BlockedById]);

CREATE INDEX [IX_AspNetUsers_3] ON [dbo].[AspNetUsers] ([DocumentId]);

CREATE UNIQUE INDEX [IX_AspNetRoles_0] ON [dbo].[AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;

ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [FK_AspNetUserRoles_0] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [FK_AspNetUserRoles_1] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_AspNetUserRoles_0] ON [dbo].[AspNetUserRoles] ([RoleId]);

ALTER TABLE [dbo].[AspNetUserClaims] ADD CONSTRAINT [FK_AspNetUserClaims_0] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_AspNetUserClaims_0] ON [dbo].[AspNetUserClaims] ([UserId]);

ALTER TABLE [dbo].[AspNetRoleClaims] ADD CONSTRAINT [FK_AspNetRoleClaims_0] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_AspNetRoleClaims_0] ON [dbo].[AspNetRoleClaims] ([RoleId]);

ALTER TABLE [dbo].[AspNetUserLogins] ADD CONSTRAINT [FK_AspNetUserLogins_0] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_AspNetUserLogins_0] ON [dbo].[AspNetUserLogins] ([UserId]);

ALTER TABLE [dbo].[AspNetUserTokens] ADD CONSTRAINT [FK_AspNetUserTokens_0] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Organizations] ADD CONSTRAINT [FK_Organizations_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_Organizations_0] ON [dbo].[Organizations] ([AccountId]);

ALTER TABLE [dbo].[OrganizationMemberships] ADD CONSTRAINT [FK_OrganizationMemberships_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[OrganizationMemberships] ADD CONSTRAINT [FK_OrganizationMemberships_1] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_OrganizationMemberships_0] ON [dbo].[OrganizationMemberships] ([OrganizationId], [AccountId]);

CREATE INDEX [IX_OrganizationMemberships_1] ON [dbo].[OrganizationMemberships] ([AccountId]);

ALTER TABLE [dbo].[OrganizationApplications] ADD CONSTRAINT [FK_OrganizationApplications_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[OrganizationApplications] ADD CONSTRAINT [FK_OrganizationApplications_1] FOREIGN KEY ([SubmittedById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[OrganizationApplications] ADD CONSTRAINT [FK_OrganizationApplications_2] FOREIGN KEY ([ReviewedById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_OrganizationApplications_0] ON [dbo].[OrganizationApplications] ([OrganizationId]);

CREATE INDEX [IX_OrganizationApplications_1] ON [dbo].[OrganizationApplications] ([SubmittedById]);

CREATE INDEX [IX_OrganizationApplications_2] ON [dbo].[OrganizationApplications] ([ReviewedById]);

ALTER TABLE [dbo].[Branches] ADD CONSTRAINT [FK_Branches_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Branches] ADD CONSTRAINT [FK_Branches_1] FOREIGN KEY ([ReviewedBy]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Branches] ADD CONSTRAINT [FK_Branches_2] FOREIGN KEY ([CurrentAnalysisId], [Id]) REFERENCES [dbo].[BranchAnalyses] ([Id], [BranchId]) ON DELETE NO ACTION;

CREATE INDEX [IX_Branches_0] ON [dbo].[Branches] ([OrganizationId], [Status], [IsDeleted]);

CREATE INDEX [IX_Branches_1] ON [dbo].[Branches] ([ReviewedBy]);

CREATE INDEX [IX_Branches_2] ON [dbo].[Branches] ([CurrentAnalysisId], [Id]);

ALTER TABLE [dbo].[OrganizationHours] ADD CONSTRAINT [FK_OrganizationHours_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_OrganizationHours_0] ON [dbo].[OrganizationHours] ([OrganizationId], [DayOfWeek]);

ALTER TABLE [dbo].[OrganizationSpecialDates] ADD CONSTRAINT [FK_OrganizationSpecialDates_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_OrganizationSpecialDates_0] ON [dbo].[OrganizationSpecialDates] ([OrganizationId], [Date]);

ALTER TABLE [dbo].[BranchHours] ADD CONSTRAINT [FK_BranchHours_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_BranchHours_0] ON [dbo].[BranchHours] ([BranchId], [DayOfWeek]);

ALTER TABLE [dbo].[BranchSpecialDates] ADD CONSTRAINT [FK_BranchSpecialDates_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_BranchSpecialDates_0] ON [dbo].[BranchSpecialDates] ([BranchId], [Date]);

ALTER TABLE [dbo].[BranchServices] ADD CONSTRAINT [FK_BranchServices_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_BranchServices_0] ON [dbo].[BranchServices] ([BranchId], [NormalizedName]) WHERE [IsDeleted] = 0;

ALTER TABLE [dbo].[BranchLegacyServices] ADD CONSTRAINT [FK_BranchLegacyServices_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_BranchLegacyServices_0] ON [dbo].[BranchLegacyServices] ([BranchId], [Name]);

ALTER TABLE [dbo].[BranchDestinations] ADD CONSTRAINT [FK_BranchDestinations_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_BranchDestinations_0] ON [dbo].[BranchDestinations] ([BranchId], [Name]);

CREATE UNIQUE INDEX [IX_AccessibilityRequirements_0] ON [dbo].[AccessibilityRequirements] ([Key]);

ALTER TABLE [dbo].[BranchAccessibility] ADD CONSTRAINT [FK_BranchAccessibility_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[BranchAccessibility] ADD CONSTRAINT [FK_BranchAccessibility_1] FOREIGN KEY ([RequirementId]) REFERENCES [dbo].[AccessibilityRequirements] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_BranchAccessibility_0] ON [dbo].[BranchAccessibility] ([BranchId], [RequirementId]);

CREATE INDEX [IX_BranchAccessibility_1] ON [dbo].[BranchAccessibility] ([RequirementId]);

ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [FK_Documents_0] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [FK_Documents_1] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [FK_Documents_2] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_Documents_0] ON [dbo].[Documents] ([OwnerId], [CreatedAt]);

CREATE INDEX [IX_Documents_1] ON [dbo].[Documents] ([OrganizationId]);

CREATE INDEX [IX_Documents_2] ON [dbo].[Documents] ([BranchId]);

ALTER TABLE [dbo].[BranchPhotos] ADD CONSTRAINT [FK_BranchPhotos_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[BranchPhotos] ADD CONSTRAINT [FK_BranchPhotos_1] FOREIGN KEY ([DocumentId]) REFERENCES [dbo].[Documents] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_BranchPhotos_0] ON [dbo].[BranchPhotos] ([BranchId], [CategoryKey]);

CREATE INDEX [IX_BranchPhotos_1] ON [dbo].[BranchPhotos] ([DocumentId]);

ALTER TABLE [dbo].[BranchAnalyses] ADD CONSTRAINT [FK_BranchAnalyses_0] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_BranchAnalyses_0] ON [dbo].[BranchAnalyses] ([BranchId], [GeneratedAt]);

ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [FK_Bookings_0] FOREIGN KEY ([BranchId], [OrganizationId]) REFERENCES [dbo].[Branches] ([Id], [OrganizationId]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [FK_Bookings_1] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [FK_Bookings_2] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [FK_Bookings_3] FOREIGN KEY ([ServiceId], [BranchId]) REFERENCES [dbo].[BranchServices] ([Id], [BranchId]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [FK_Bookings_4] FOREIGN KEY ([QueueCalledById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_Bookings_0] ON [dbo].[Bookings] ([Reference]);

CREATE INDEX [IX_Bookings_1] ON [dbo].[Bookings] ([BranchId], [VisitDate], [VisitTime], [Status]);

CREATE INDEX [IX_Bookings_2] ON [dbo].[Bookings] ([UserId], [VisitDate], [Status]);

CREATE UNIQUE INDEX [IX_Bookings_3] ON [dbo].[Bookings] ([BranchId], [VisitDate], [QueueNumber]) WHERE [QueueNumber] IS NOT NULL AND [IsDeleted] = 0;

CREATE INDEX [IX_Bookings_4] ON [dbo].[Bookings] ([BranchId], [OrganizationId]);

CREATE INDEX [IX_Bookings_5] ON [dbo].[Bookings] ([OrganizationId]);

CREATE INDEX [IX_Bookings_6] ON [dbo].[Bookings] ([ServiceId], [BranchId]);

CREATE INDEX [IX_Bookings_7] ON [dbo].[Bookings] ([QueueCalledById]);

ALTER TABLE [dbo].[BookingHistory] ADD CONSTRAINT [FK_BookingHistory_0] FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[BookingHistory] ADD CONSTRAINT [FK_BookingHistory_1] FOREIGN KEY ([ActorId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_BookingHistory_0] ON [dbo].[BookingHistory] ([BookingId], [At]);

CREATE INDEX [IX_BookingHistory_1] ON [dbo].[BookingHistory] ([ActorId]);

ALTER TABLE [dbo].[AppointmentProposals] ADD CONSTRAINT [FK_AppointmentProposals_0] FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[AppointmentProposals] ADD CONSTRAINT [FK_AppointmentProposals_1] FOREIGN KEY ([BranchId], [OrganizationId]) REFERENCES [dbo].[Branches] ([Id], [OrganizationId]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[AppointmentProposals] ADD CONSTRAINT [FK_AppointmentProposals_2] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[AppointmentProposals] ADD CONSTRAINT [FK_AppointmentProposals_3] FOREIGN KEY ([ServiceId], [BranchId]) REFERENCES [dbo].[BranchServices] ([Id], [BranchId]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_AppointmentProposals_0] ON [dbo].[AppointmentProposals] ([BookingId]) WHERE [Status] = N'pending' AND [IsDeleted] = 0;

CREATE INDEX [IX_AppointmentProposals_1] ON [dbo].[AppointmentProposals] ([BranchId], [OrganizationId]);

CREATE INDEX [IX_AppointmentProposals_2] ON [dbo].[AppointmentProposals] ([UserId]);

CREATE INDEX [IX_AppointmentProposals_3] ON [dbo].[AppointmentProposals] ([ServiceId], [BranchId]);

ALTER TABLE [dbo].[VisitPasses] ADD CONSTRAINT [FK_VisitPasses_0] FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[VisitPasses] ADD CONSTRAINT [FK_VisitPasses_1] FOREIGN KEY ([VerifiedById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_VisitPasses_0] ON [dbo].[VisitPasses] ([TokenHash]);

CREATE UNIQUE INDEX [IX_VisitPasses_1] ON [dbo].[VisitPasses] ([BookingId]) WHERE [RevokedAt] IS NULL AND [UsedAt] IS NULL AND [IsDeleted] = 0;

CREATE INDEX [IX_VisitPasses_2] ON [dbo].[VisitPasses] ([VerifiedById]);

ALTER TABLE [dbo].[Reviews] ADD CONSTRAINT [FK_Reviews_0] FOREIGN KEY ([BookingId], [UserId], [BranchId]) REFERENCES [dbo].[Bookings] ([Id], [UserId], [BranchId]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Reviews] ADD CONSTRAINT [FK_Reviews_1] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Reviews] ADD CONSTRAINT [FK_Reviews_2] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Reviews] ADD CONSTRAINT [FK_Reviews_3] FOREIGN KEY ([ApprovedBy]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_Reviews_0] ON [dbo].[Reviews] ([BookingId]) WHERE [IsDeleted] = 0;

CREATE INDEX [IX_Reviews_1] ON [dbo].[Reviews] ([BranchId], [Status], [IsDeleted]);

CREATE INDEX [IX_Reviews_2] ON [dbo].[Reviews] ([BookingId], [UserId], [BranchId]);

CREATE INDEX [IX_Reviews_3] ON [dbo].[Reviews] ([UserId]);

CREATE INDEX [IX_Reviews_4] ON [dbo].[Reviews] ([ApprovedBy]);

ALTER TABLE [dbo].[SupportTickets] ADD CONSTRAINT [FK_SupportTickets_0] FOREIGN KEY ([RequesterId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[SupportTickets] ADD CONSTRAINT [FK_SupportTickets_1] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[SupportTickets] ADD CONSTRAINT [FK_SupportTickets_2] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[SupportTickets] ADD CONSTRAINT [FK_SupportTickets_3] FOREIGN KEY ([AssignedTo]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_SupportTickets_0] ON [dbo].[SupportTickets] ([RequesterId], [Status]);

CREATE INDEX [IX_SupportTickets_1] ON [dbo].[SupportTickets] ([OrganizationId]);

CREATE INDEX [IX_SupportTickets_2] ON [dbo].[SupportTickets] ([BranchId]);

CREATE INDEX [IX_SupportTickets_3] ON [dbo].[SupportTickets] ([AssignedTo]);

ALTER TABLE [dbo].[TicketMessages] ADD CONSTRAINT [FK_TicketMessages_0] FOREIGN KEY ([TicketId]) REFERENCES [dbo].[SupportTickets] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[TicketMessages] ADD CONSTRAINT [FK_TicketMessages_1] FOREIGN KEY ([ActorId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_TicketMessages_0] ON [dbo].[TicketMessages] ([TicketId], [CreatedAt]);

CREATE INDEX [IX_TicketMessages_1] ON [dbo].[TicketMessages] ([ActorId]);

ALTER TABLE [dbo].[TicketAttachments] ADD CONSTRAINT [FK_TicketAttachments_0] FOREIGN KEY ([TicketId]) REFERENCES [dbo].[SupportTickets] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[TicketAttachments] ADD CONSTRAINT [FK_TicketAttachments_1] FOREIGN KEY ([DocumentId]) REFERENCES [dbo].[Documents] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_TicketAttachments_0] ON [dbo].[TicketAttachments] ([TicketId], [DocumentId]);

CREATE INDEX [IX_TicketAttachments_1] ON [dbo].[TicketAttachments] ([DocumentId]);

CREATE UNIQUE INDEX [IX_Plans_0] ON [dbo].[Plans] ([Name]);

ALTER TABLE [dbo].[Subscriptions] ADD CONSTRAINT [FK_Subscriptions_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Subscriptions] ADD CONSTRAINT [FK_Subscriptions_1] FOREIGN KEY ([PlanId]) REFERENCES [dbo].[Plans] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_Subscriptions_0] ON [dbo].[Subscriptions] ([OrganizationId]) WHERE [Status] = N'Active' AND [IsDeleted] = 0;

CREATE INDEX [IX_Subscriptions_1] ON [dbo].[Subscriptions] ([PlanId]);

ALTER TABLE [dbo].[PaymentOperations] ADD CONSTRAINT [FK_PaymentOperations_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[PaymentOperations] ADD CONSTRAINT [FK_PaymentOperations_1] FOREIGN KEY ([SubscriptionId]) REFERENCES [dbo].[Subscriptions] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_PaymentOperations_0] ON [dbo].[PaymentOperations] ([Provider], [ProviderReference]) WHERE [ProviderReference] IS NOT NULL;

CREATE INDEX [IX_PaymentOperations_1] ON [dbo].[PaymentOperations] ([OrganizationId]);

CREATE INDEX [IX_PaymentOperations_2] ON [dbo].[PaymentOperations] ([SubscriptionId]);

ALTER TABLE [dbo].[HoursChangeRequests] ADD CONSTRAINT [FK_HoursChangeRequests_0] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[HoursChangeRequests] ADD CONSTRAINT [FK_HoursChangeRequests_1] FOREIGN KEY ([BranchId], [OrganizationId]) REFERENCES [dbo].[Branches] ([Id], [OrganizationId]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[HoursChangeRequests] ADD CONSTRAINT [FK_HoursChangeRequests_2] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[HoursChangeRequests] ADD CONSTRAINT [FK_HoursChangeRequests_3] FOREIGN KEY ([ReviewedById]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_HoursChangeRequests_0] ON [dbo].[HoursChangeRequests] ([OrganizationId], [BranchId], [Status]);

CREATE UNIQUE INDEX [IX_HoursChangeRequests_1] ON [dbo].[HoursChangeRequests] ([BranchId]) WHERE [BranchId] IS NOT NULL AND [Status] = N'pending' AND [IsDeleted] = 0;

CREATE UNIQUE INDEX [IX_HoursChangeRequests_2] ON [dbo].[HoursChangeRequests] ([OrganizationId]) WHERE [BranchId] IS NULL AND [Status] = N'pending' AND [IsDeleted] = 0;

CREATE INDEX [IX_HoursChangeRequests_3] ON [dbo].[HoursChangeRequests] ([BranchId], [OrganizationId]);

CREATE INDEX [IX_HoursChangeRequests_4] ON [dbo].[HoursChangeRequests] ([RequestedById]);

CREATE INDEX [IX_HoursChangeRequests_5] ON [dbo].[HoursChangeRequests] ([ReviewedById]);

ALTER TABLE [dbo].[HoursAffectedBookings] ADD CONSTRAINT [FK_HoursAffectedBookings_0] FOREIGN KEY ([HoursChangeRequestId]) REFERENCES [dbo].[HoursChangeRequests] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[HoursAffectedBookings] ADD CONSTRAINT [FK_HoursAffectedBookings_1] FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_HoursAffectedBookings_0] ON [dbo].[HoursAffectedBookings] ([HoursChangeRequestId], [BookingId]);

CREATE INDEX [IX_HoursAffectedBookings_1] ON [dbo].[HoursAffectedBookings] ([BookingId]);

ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [FK_Notifications_0] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [FK_Notifications_1] FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [FK_Notifications_2] FOREIGN KEY ([HoursChangeRequestId]) REFERENCES [dbo].[HoursChangeRequests] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_Notifications_0] ON [dbo].[Notifications] ([OwnerId], [Status], [CreatedAt]);

CREATE INDEX [IX_Notifications_1] ON [dbo].[Notifications] ([BookingId]);

CREATE INDEX [IX_Notifications_2] ON [dbo].[Notifications] ([HoursChangeRequestId]);

ALTER TABLE [dbo].[NotificationReads] ADD CONSTRAINT [FK_NotificationReads_0] FOREIGN KEY ([NotificationId]) REFERENCES [dbo].[Notifications] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[NotificationReads] ADD CONSTRAINT [FK_NotificationReads_1] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_NotificationReads_0] ON [dbo].[NotificationReads] ([NotificationId], [AccountId]);

CREATE INDEX [IX_NotificationReads_1] ON [dbo].[NotificationReads] ([AccountId]);

ALTER TABLE [dbo].[SavedPlaces] ADD CONSTRAINT [FK_SavedPlaces_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[SavedPlaces] ADD CONSTRAINT [FK_SavedPlaces_1] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_SavedPlaces_0] ON [dbo].[SavedPlaces] ([AccountId], [BranchId]);

CREATE INDEX [IX_SavedPlaces_1] ON [dbo].[SavedPlaces] ([BranchId]);

ALTER TABLE [dbo].[DeviceSessions] ADD CONSTRAINT [FK_DeviceSessions_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_DeviceSessions_0] ON [dbo].[DeviceSessions] ([SessionHash]);

CREATE INDEX [IX_DeviceSessions_1] ON [dbo].[DeviceSessions] ([AccountId], [RevokedAt]);

ALTER TABLE [dbo].[AccessChallenges] ADD CONSTRAINT [FK_AccessChallenges_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_AccessChallenges_0] ON [dbo].[AccessChallenges] ([TokenHash]);

CREATE INDEX [IX_AccessChallenges_1] ON [dbo].[AccessChallenges] ([AccountId]);

ALTER TABLE [dbo].[ImpersonationSessions] ADD CONSTRAINT [FK_ImpersonationSessions_0] FOREIGN KEY ([AdminId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[ImpersonationSessions] ADD CONSTRAINT [FK_ImpersonationSessions_1] FOREIGN KEY ([TargetAccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_ImpersonationSessions_0] ON [dbo].[ImpersonationSessions] ([AdminId]);

CREATE INDEX [IX_ImpersonationSessions_1] ON [dbo].[ImpersonationSessions] ([TargetAccountId]);

ALTER TABLE [dbo].[AuditEvents] ADD CONSTRAINT [FK_AuditEvents_0] FOREIGN KEY ([ActorId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_AuditEvents_0] ON [dbo].[AuditEvents] ([EntityType], [EntityId], [Timestamp]);

CREATE INDEX [IX_AuditEvents_1] ON [dbo].[AuditEvents] ([ActorId], [Timestamp]);

ALTER TABLE [dbo].[FrontendStates] ADD CONSTRAINT [FK_FrontendStates_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_FrontendStates_0] ON [dbo].[FrontendStates] ([Scope], [OwnerKey], [Key]);

CREATE INDEX [IX_FrontendStates_1] ON [dbo].[FrontendStates] ([AccountId]);

ALTER TABLE [dbo].[OutboxMessages] ADD CONSTRAINT [FK_OutboxMessages_0] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_OutboxMessages_0] ON [dbo].[OutboxMessages] ([Status], [NextAttemptAt]);

CREATE INDEX [IX_OutboxMessages_1] ON [dbo].[OutboxMessages] ([OwnerId]);

ALTER TABLE [dbo].[IdempotencyRecords] ADD CONSTRAINT [FK_IdempotencyRecords_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_IdempotencyRecords_0] ON [dbo].[IdempotencyRecords] ([AccountId], [Operation], [Key]);

ALTER TABLE [dbo].[RuntimeErrors] ADD CONSTRAINT [FK_RuntimeErrors_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_RuntimeErrors_0] ON [dbo].[RuntimeErrors] ([CreatedAt]);

CREATE INDEX [IX_RuntimeErrors_1] ON [dbo].[RuntimeErrors] ([AccountId]);

ALTER TABLE [dbo].[ExternalJobs] ADD CONSTRAINT [FK_ExternalJobs_0] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[ExternalJobs] ADD CONSTRAINT [FK_ExternalJobs_1] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[ExternalJobs] ADD CONSTRAINT [FK_ExternalJobs_2] FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]) ON DELETE NO ACTION;

CREATE INDEX [IX_ExternalJobs_0] ON [dbo].[ExternalJobs] ([AccountId], [Kind], [CreatedAt]);

CREATE INDEX [IX_ExternalJobs_1] ON [dbo].[ExternalJobs] ([BranchId]);

CREATE INDEX [IX_ExternalJobs_2] ON [dbo].[ExternalJobs] ([BookingId]);

ALTER TABLE [dbo].[TicketMessageAttachments] ADD CONSTRAINT [FK_TicketMessageAttachments_0] FOREIGN KEY ([MessageId]) REFERENCES [dbo].[TicketMessages] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [dbo].[TicketMessageAttachments] ADD CONSTRAINT [FK_TicketMessageAttachments_1] FOREIGN KEY ([DocumentId]) REFERENCES [dbo].[Documents] ([Id]) ON DELETE NO ACTION;

CREATE UNIQUE INDEX [IX_TicketMessageAttachments_0] ON [dbo].[TicketMessageAttachments] ([MessageId], [DocumentId]);

CREATE INDEX [IX_TicketMessageAttachments_1] ON [dbo].[TicketMessageAttachments] ([DocumentId]);

INSERT INTO dbo.SyncRevisions (Id,Version) VALUES (1,0);

COMMIT TRANSACTION;
GO