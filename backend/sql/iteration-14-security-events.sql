USE WonderlandDB;
GO

IF OBJECT_ID('dbo.SecurityEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SecurityEvents
    (
        SecurityEventId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SecurityEvents PRIMARY KEY,
        EventCategory NVARCHAR(100) NOT NULL,
        EventType NVARCHAR(150) NOT NULL,
        Severity NVARCHAR(20) NOT NULL,
        ActorUserId INT NULL,
        ActorRole NVARCHAR(50) NULL,
        ActorEmail NVARCHAR(256) NULL,
        ActionStatus NVARCHAR(50) NOT NULL,
        EventSummary NVARCHAR(1000) NOT NULL,
        DetailsJson NVARCHAR(MAX) NULL,
        RequestMethod NVARCHAR(20) NULL,
        RequestPath NVARCHAR(500) NULL,
        IpAddress NVARCHAR(100) NULL,
        UserAgent NVARCHAR(1000) NULL,
        SourceApplicationAuditEventId INT NULL,
        CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SecurityEvents_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_SecurityEvents_Severity CHECK (Severity IN ('Low', 'Medium', 'High', 'Critical'))
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SecurityEvents_CreatedAt'
      AND object_id = OBJECT_ID('dbo.SecurityEvents')
)
BEGIN
    CREATE INDEX IX_SecurityEvents_CreatedAt
    ON dbo.SecurityEvents (CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SecurityEvents_Severity_Category'
      AND object_id = OBJECT_ID('dbo.SecurityEvents')
)
BEGIN
    CREATE INDEX IX_SecurityEvents_Severity_Category
    ON dbo.SecurityEvents (Severity, EventCategory, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SecurityEvents_ActorRole'
      AND object_id = OBJECT_ID('dbo.SecurityEvents')
)
BEGIN
    CREATE INDEX IX_SecurityEvents_ActorRole
    ON dbo.SecurityEvents (ActorRole, CreatedAt DESC);
END;
GO

CREATE OR ALTER VIEW dbo.vwSecurityEventSummary
AS
SELECT
    CAST(CreatedAt AS DATE) AS EventDate,
    EventCategory,
    EventType,
    Severity,
    ActorRole,
    ActionStatus,
    COUNT_BIG(*) AS EventCount
FROM dbo.SecurityEvents
GROUP BY
    CAST(CreatedAt AS DATE),
    EventCategory,
    EventType,
    Severity,
    ActorRole,
    ActionStatus;
GO
