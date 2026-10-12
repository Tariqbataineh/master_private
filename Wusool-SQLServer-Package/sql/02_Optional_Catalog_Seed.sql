-- Optional catalog seed copied from the supplied frontend. No user/organization/demo bookings.
USE [WusoolDb];
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'accessibleEntrance')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'accessibleEntrance',N'accessibleEntrance',N'Accessible Entrance',N'Step-free main entrance for visitors.',N'bi-door-open',N'Entrance',8,1,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'entranceRamp')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'entranceRamp',N'entranceRamp',N'Entrance Ramp',N'Ramp with safe slope and handrails.',N'bi-signpost-split',N'Entrance',8,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'accessibleParking')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'accessibleParking',N'accessibleParking',N'Accessible Parking',N'Reserved parking near the entrance.',N'bi-p-square',N'Parking',6,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'elevator')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'elevator',N'elevator',N'Elevator',N'Accessible elevator for upper floors.',N'bi-arrow-down-up',N'Interior',7,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'accessibleRestroom')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'accessibleRestroom',N'accessibleRestroom',N'Accessible Restroom',N'Restroom designed for wheelchair users.',N'bi-person-wheelchair',N'Restroom',7,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'widePathways')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'widePathways',N'widePathways',N'Wide Pathways',N'Clear internal paths with enough width.',N'bi-arrows-expand',N'Interior',5,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'automaticDoors')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'automaticDoors',N'automaticDoors',N'Automatic Doors',N'Automatic or easy-to-open doors.',N'bi-door-closed',N'Entrance',5,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'tactilePaving')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'tactilePaving',N'tactilePaving',N'Tactile Paving',N'Tactile guidance for visually impaired visitors.',N'bi-grid-3x3-gap',N'Navigation',5,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'brailleSigns')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'brailleSigns',N'brailleSigns',N'Braille Signs',N'Important signs include Braille information.',N'bi-badge-3d',N'Navigation',4,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'hearingSupport')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'hearingSupport',N'hearingSupport',N'Hearing Support',N'Visual alerts or hearing assistance available.',N'bi-ear',N'Service',4,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'wheelchairAvailable')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'wheelchairAvailable',N'wheelchairAvailable',N'Wheelchair Available',N'A wheelchair can be requested at the branch.',N'bi-person-wheelchair',N'Service',4,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.AccessibilityRequirements WHERE Id=N'staffAssistance')
INSERT dbo.AccessibilityRequirements (Id,[Key],Title,Description,Icon,Category,Weight,Required,Enabled) VALUES (N'staffAssistance',N'staffAssistance',N'Staff Assistance',N'Staff members can provide accessibility support.',N'bi-people',N'Service',4,0,1);
IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE Id=N'single')
INSERT dbo.Plans (Id,Name,MonthlyPrice,AnnualDiscount,BranchLimit,Currency,Active) VALUES (N'single',N'Single Branch',25,0.1,1,N'JOD',1);
IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE Id=N'multi')
INSERT dbo.Plans (Id,Name,MonthlyPrice,AnnualDiscount,BranchLimit,Currency,Active) VALUES (N'multi',N'Multi Branch',75,0.1,5,N'JOD',1);
IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE Id=N'enterprise')
INSERT dbo.Plans (Id,Name,MonthlyPrice,AnnualDiscount,BranchLimit,Currency,Active) VALUES (N'enterprise',N'Enterprise',150,0.1,15,N'JOD',1);
COMMIT TRANSACTION;
GO
-- Review these demo plan prices before enabling real checkout. They are not verified production pricing.
