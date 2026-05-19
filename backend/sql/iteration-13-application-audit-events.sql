USE WonderlandDB;
GO

IF OBJECT_ID('dbo.ApplicationAuditEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ApplicationAuditEvents
    (
        ApplicationAuditEventId INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_ApplicationAuditEvents PRIMARY KEY,

        EventCategory NVARCHAR(100) NOT NULL,
        EventType NVARCHAR(150) NOT NULL,

        ActorUserId INT NULL,
        ActorRole NVARCHAR(50) NULL,
        ActorEmail NVARCHAR(256) NULL,

        TargetEntityType NVARCHAR(100) NULL,
        TargetEntityId INT NULL,
        TargetEntityReference NVARCHAR(150) NULL,

        ActionStatus NVARCHAR(50) NOT NULL
            CONSTRAINT DF_ApplicationAuditEvents_ActionStatus DEFAULT ('Succeeded'),

        EventSummary NVARCHAR(1000) NOT NULL,
        DetailsJson NVARCHAR(MAX) NULL,

        RequestMethod NVARCHAR(20) NULL,
        RequestPath NVARCHAR(500) NULL,
        IpAddress NVARCHAR(100) NULL,
        UserAgent NVARCHAR(1000) NULL,

        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_ApplicationAuditEvents_CreatedAt DEFAULT SYSDATETIME()
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_CreatedAt'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_CreatedAt
    ON dbo.ApplicationAuditEvents (CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_EventType'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_EventType
    ON dbo.ApplicationAuditEvents (EventType, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_ActorUserId'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_ActorUserId
    ON dbo.ApplicationAuditEvents (ActorUserId, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_Target'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_Target
    ON dbo.ApplicationAuditEvents (TargetEntityType, TargetEntityId, CreatedAt DESC);
END;
GO