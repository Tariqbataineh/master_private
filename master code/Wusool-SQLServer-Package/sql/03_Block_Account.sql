USE [WusoolDb];
GO
CREATE OR ALTER PROCEDURE dbo.BlockAccount
    @AdminId nvarchar(128),
    @AccountId nvarchar(128),
    @Reason nvarchar(1000),
    @ExpectedRevision int
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF NULLIF(LTRIM(RTRIM(@Reason)), N'') IS NULL THROW 51001, 'REASON_REQUIRED', 1;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- @AdminId must come from authenticated server identity, never a client-supplied ID.
        IF NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WITH (UPDLOCK,HOLDLOCK)
            WHERE Id=@AdminId AND RoleCode=N'Admin' AND Status=N'active' AND IsDeleted=0)
            THROW 51002, 'FORBIDDEN', 1;
        IF EXISTS (SELECT 1 FROM dbo.AspNetUsers WITH (UPDLOCK,HOLDLOCK)
            WHERE Id=@AccountId AND RoleCode=N'Admin') THROW 51003, 'ADMIN_PROTECTED', 1;
        UPDATE dbo.AspNetUsers SET Status=N'blocked', BlockedAt=SYSUTCDATETIME(),
            BlockedById=@AdminId, BlockReason=@Reason, Revision=Revision+1,
            UpdatedAt=SYSUTCDATETIME(), SecurityStamp=CONVERT(nvarchar(36),NEWID()),
            ConcurrencyStamp=CONVERT(nvarchar(36),NEWID())
        WHERE Id=@AccountId AND Revision=@ExpectedRevision AND IsDeleted=0;
        IF @@ROWCOUNT<>1 THROW 51004, 'NOT_FOUND_OR_CONFLICT', 1;
        UPDATE dbo.DeviceSessions SET RevokedAt=SYSUTCDATETIME(), Revision=Revision+1,
            UpdatedAt=SYSUTCDATETIME() WHERE AccountId=@AccountId AND RevokedAt IS NULL;
        UPDATE dbo.AccessChallenges SET ConsumedAt=SYSUTCDATETIME(), Revision=Revision+1,
            UpdatedAt=SYSUTCDATETIME() WHERE AccountId=@AccountId AND ConsumedAt IS NULL;
        INSERT dbo.AuditEvents (Id,ActorId,Actor,Action,EntityType,EntityId,Reason,Timestamp,Status)
            SELECT CONVERT(nvarchar(36),NEWID()),@AdminId,Name,N'account-blocked',N'accounts',@AccountId,
                @Reason,SYSUTCDATETIME(),N'blocked' FROM dbo.AspNetUsers WHERE Id=@AdminId;
        UPDATE dbo.SyncRevisions SET Version=Version+1,UpdatedAt=SYSUTCDATETIME() WHERE Id=1;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
-- Never grant this procedure directly to end users. Login and EVERY authenticated
-- request must also check current account state; a flag alone cannot reject a cookie.
