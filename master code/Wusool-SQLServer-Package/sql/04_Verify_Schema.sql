USE [WusoolDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT OFF;
IF (SELECT COUNT(*) FROM sys.tables WHERE schema_id=SCHEMA_ID(N'dbo') AND name IN
    (N'AspNetUsers',N'Organizations',N'Branches',N'BranchServices',N'Bookings',N'Reviews'))<>6
    THROW 51100, 'Core tables missing.', 1;
BEGIN TRANSACTION;
BEGIN TRY
    INSERT dbo.AspNetUsers (Id,UserName,NormalizedUserName,Email,NormalizedEmail,Name,RoleCode,Status,ApprovalStatus)
    VALUES (N'__verify_user',N'verify.user@example.invalid',N'VERIFY.USER@EXAMPLE.INVALID',N'verify.user@example.invalid',N'VERIFY.USER@EXAMPLE.INVALID',N'Test user',N'User',N'active',NULL),
    (N'__verify_org',N'verify.org@example.invalid',N'VERIFY.ORG@EXAMPLE.INVALID',N'verify.org@example.invalid',N'VERIFY.ORG@EXAMPLE.INVALID',N'Test organization',N'Organization',N'active',N'approved');
    INSERT dbo.Organizations (Id,AccountId) VALUES (N'__verify_org',N'__verify_org');
    INSERT dbo.Branches (Id,OrganizationId,Name,Status) VALUES
        (N'__verify_branch1',N'__verify_org',N'Test branch 1',N'draft'),
        (N'__verify_branch2',N'__verify_org',N'Test branch 2',N'draft');
    INSERT dbo.BranchServices (Id,BranchId,Name,NormalizedName)
        VALUES (N'__verify_service',N'__verify_branch1',N'Service',N'SERVICE');
    INSERT dbo.Bookings (Id,BranchId,OrganizationId,UserId,VisitDate,VisitTime,Reference,Status,JourneyState)
        VALUES (N'__verify_booking',N'__verify_branch1',N'__verify_org',N'__verify_user','2030-01-01','09:00',N'__VERIFY_REF',N'completed',N'completed');
    UPDATE dbo.Bookings SET ServiceId=N'__verify_service' WHERE Id=N'__verify_booking';
    BEGIN TRY
        UPDATE dbo.Bookings SET BranchId=N'__verify_branch2' WHERE Id=N'__verify_booking';
        THROW 51101, 'Cross-branch service was accepted.', 1;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER()<>547 THROW;
    END CATCH;
    INSERT dbo.Reviews (Id,BookingId,BranchId,UserId,Rating,Status)
        VALUES (N'__verify_review',N'__verify_booking',N'__verify_branch1',N'__verify_user',5,N'Visible');
    BEGIN TRY
        INSERT dbo.Reviews (Id,BookingId,BranchId,UserId,Rating,Status)
            VALUES (N'__verify_review2',N'__verify_booking',N'__verify_branch1',N'__verify_user',5,N'Visible');
        THROW 51102, 'Duplicate review was accepted.', 1;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() NOT IN (2601,2627) THROW;
    END CATCH;
    BEGIN TRY
        UPDATE dbo.Bookings SET DurationMinutes=1 WHERE Id=N'__verify_booking';
        THROW 51103, 'Invalid visit duration was accepted.', 1;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER()<>547 THROW;
    END CATCH;
    ROLLBACK TRANSACTION;
    PRINT 'PASS: core inserts, branch/service ownership, review uniqueness, duration constraints. Test rows rolled back.';
END TRY
BEGIN CATCH
    IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
