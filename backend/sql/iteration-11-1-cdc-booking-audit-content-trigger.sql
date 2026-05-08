USE WonderlandDB;
GO

/* =========================================================
   Iteration 11.1: CDC Booking Audit + Content Trigger Example
   Safe to run multiple times.
   ========================================================= */

-- Booking audit should now use CDC, not booking triggers.
IF OBJECT_ID('dbo.TR_Bookings_Audit_Insert', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER dbo.TR_Bookings_Audit_Insert;
END
GO

IF OBJECT_ID('dbo.TR_Bookings_Audit_StatusUpdate', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER dbo.TR_Bookings_Audit_StatusUpdate;
END
GO

-- Enable CDC at database level.
IF EXISTS (
    SELECT 1
    FROM sys.databases
    WHERE name = DB_NAME()
      AND is_cdc_enabled = 0
)
BEGIN
    EXEC sys.sp_cdc_enable_db;
END
GO

-- Enable CDC for dbo.Bookings.
IF NOT EXISTS (
    SELECT 1
    FROM cdc.change_tables
    WHERE source_object_id = OBJECT_ID('dbo.Bookings')
)
BEGIN
    EXEC sys.sp_cdc_enable_table
        @source_schema = N'dbo',
        @source_name = N'Bookings',
        @role_name = NULL,
        @supports_net_changes = 0;
END
GO

-- Separate trigger learning example:
-- content approval audit events for rides/accommodations.
IF OBJECT_ID('dbo.ContentAuditEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentAuditEvents
    (
        ContentAuditEventId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContentAuditEvents PRIMARY KEY,
        EntityType NVARCHAR(50) NOT NULL,
        EntityId INT NOT NULL,
        EntityName NVARCHAR(200) NOT NULL,
        EventType NVARCHAR(100) NOT NULL,
        OldApprovalStatus NVARCHAR(50) NULL,
        NewApprovalStatus NVARCHAR(50) NULL,
        EventSummary NVARCHAR(1000) NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ContentAuditEvents_CreatedAt DEFAULT SYSDATETIME()
    );
END
GO

CREATE OR ALTER TRIGGER dbo.TR_Rides_ContentAudit_ApprovalStatusUpdate
ON dbo.Rides
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(ApprovalStatus)
    BEGIN
        INSERT INTO dbo.ContentAuditEvents
            (
                EntityType,
                EntityId,
                EntityName,
                EventType,
                OldApprovalStatus,
                NewApprovalStatus,
                EventSummary,
                CreatedAt
            )
        SELECT
            'Ride',
            i.RideId,
            i.Name,
            CASE
                WHEN i.ApprovalStatus = 'Approved' THEN 'RideApproved'
                WHEN i.ApprovalStatus = 'Rejected' THEN 'RideRejected'
                ELSE 'RideApprovalStatusChanged'
            END,
            d.ApprovalStatus,
            i.ApprovalStatus,
            CONCAT('Ride ', i.Name, ' approval status changed from ', d.ApprovalStatus, ' to ', i.ApprovalStatus),
            SYSDATETIME()
        FROM inserted i
        INNER JOIN deleted d ON d.RideId = i.RideId
        WHERE ISNULL(i.ApprovalStatus, '') <> ISNULL(d.ApprovalStatus, '');
    END
END
GO

CREATE OR ALTER TRIGGER dbo.TR_Accommodations_ContentAudit_ApprovalStatusUpdate
ON dbo.Accommodations
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(ApprovalStatus)
    BEGIN
        INSERT INTO dbo.ContentAuditEvents
            (
                EntityType,
                EntityId,
                EntityName,
                EventType,
                OldApprovalStatus,
                NewApprovalStatus,
                EventSummary,
                CreatedAt
            )
        SELECT
            'Accommodation',
            i.AccommodationId,
            i.Name,
            CASE
                WHEN i.ApprovalStatus = 'Approved' THEN 'AccommodationApproved'
                WHEN i.ApprovalStatus = 'Rejected' THEN 'AccommodationRejected'
                ELSE 'AccommodationApprovalStatusChanged'
            END,
            d.ApprovalStatus,
            i.ApprovalStatus,
            CONCAT('Accommodation ', i.Name, ' approval status changed from ', d.ApprovalStatus, ' to ', i.ApprovalStatus),
            SYSDATETIME()
        FROM inserted i
        INNER JOIN deleted d ON d.AccommodationId = i.AccommodationId
        WHERE ISNULL(i.ApprovalStatus, '') <> ISNULL(d.ApprovalStatus, '');
    END
END
GO

SELECT
    DB_NAME() AS DatabaseName,
    is_cdc_enabled AS IsCdcEnabled
FROM sys.databases
WHERE name = DB_NAME();

SELECT
    capture_instance,
    source_object_id
FROM cdc.change_tables
WHERE source_object_id = OBJECT_ID('dbo.Bookings');

SELECT 'Iteration 11.1 CDC booking audit and content trigger migration completed successfully' AS Message;
GO
