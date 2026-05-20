USE master;
GO

IF DB_ID(N'WonderlandDW') IS NULL
BEGIN
    CREATE DATABASE WonderlandDW;
END;
GO

USE WonderlandDW;
GO

/* =========================================================
   Iteration 15: Data Warehouse Foundation

   Purpose:
   - Create the first Wonderland data warehouse database.
   - Separate OLTP application data in WonderlandDB from analytics data in WonderlandDW.
   - Build a small star schema for application audit and security monitoring events.
   - Provide a repeatable load procedure from WonderlandDB to WonderlandDW.
   - Provide validation queries for source-to-DW row counts.

   Source database:
   - WonderlandDB.dbo.Users
   - WonderlandDB.dbo.ApplicationAuditEvents
   - WonderlandDB.dbo.SecurityEvents

   This script is safe to run multiple times.
   ========================================================= */

IF OBJECT_ID(N'dbo.DimDate', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimDate (
        DateKey INT NOT NULL CONSTRAINT PK_DimDate PRIMARY KEY,
        DateValue DATE NOT NULL CONSTRAINT UQ_DimDate_DateValue UNIQUE,
        CalendarYear INT NOT NULL,
        CalendarQuarter INT NOT NULL,
        MonthNumber INT NOT NULL,
        MonthName NVARCHAR(20) NOT NULL,
        DayOfMonth INT NOT NULL,
        DayOfWeekName NVARCHAR(20) NOT NULL,
        IsWeekend BIT NOT NULL,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimDate_DwInsertedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.DimRole', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimRole (
        RoleKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimRole PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL CONSTRAINT UQ_DimRole_RoleName UNIQUE,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimRole_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.DimUser', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimUser (
        UserKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimUser PRIMARY KEY,
        SourceUserId INT NOT NULL CONSTRAINT UQ_DimUser_SourceUserId UNIQUE,
        Email NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(100) NULL,
        LastName NVARCHAR(100) NULL,
        FullName NVARCHAR(250) NULL,
        RoleName NVARCHAR(50) NULL,
        SourceCreatedAt DATETIME2 NULL,
        SourceUpdatedAt DATETIME2 NULL,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimUser_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.DimActionType', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimActionType (
        ActionTypeKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimActionType PRIMARY KEY,
        ActionTypeName NVARCHAR(150) NOT NULL CONSTRAINT UQ_DimActionType_ActionTypeName UNIQUE,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimActionType_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.DimEntityType', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimEntityType (
        EntityTypeKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimEntityType PRIMARY KEY,
        EntityTypeName NVARCHAR(100) NOT NULL CONSTRAINT UQ_DimEntityType_EntityTypeName UNIQUE,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimEntityType_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.DimOutcome', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimOutcome (
        OutcomeKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimOutcome PRIMARY KEY,
        OutcomeName NVARCHAR(50) NOT NULL CONSTRAINT UQ_DimOutcome_OutcomeName UNIQUE,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimOutcome_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.DimSecuritySeverity', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimSecuritySeverity (
        SecuritySeverityKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimSecuritySeverity PRIMARY KEY,
        SeverityName NVARCHAR(20) NOT NULL CONSTRAINT UQ_DimSecuritySeverity_SeverityName UNIQUE,
        SeverityRank INT NOT NULL,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimSecuritySeverity_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.DimSecurityCategory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DimSecurityCategory (
        SecurityCategoryKey INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DimSecurityCategory PRIMARY KEY,
        CategoryName NVARCHAR(100) NOT NULL CONSTRAINT UQ_DimSecurityCategory_CategoryName UNIQUE,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DimSecurityCategory_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.FactApplicationAuditEvent', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FactApplicationAuditEvent (
        ApplicationAuditFactKey BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_FactApplicationAuditEvent PRIMARY KEY,
        SourceApplicationAuditEventId INT NOT NULL CONSTRAINT UQ_FactApplicationAuditEvent_SourceApplicationAuditEventId UNIQUE,
        DateKey INT NOT NULL,
        EventTimestamp DATETIME2 NOT NULL,
        ActorUserKey INT NOT NULL,
        ActorRoleKey INT NOT NULL,
        ActionTypeKey INT NOT NULL,
        EntityTypeKey INT NOT NULL,
        OutcomeKey INT NOT NULL,
        EventCategory NVARCHAR(100) NOT NULL,
        TargetEntityId INT NULL,
        TargetEntityReference NVARCHAR(150) NULL,
        EventSummary NVARCHAR(1000) NOT NULL,
        DetailsJson NVARCHAR(MAX) NULL,
        RequestMethod NVARCHAR(20) NULL,
        RequestPath NVARCHAR(500) NULL,
        IpAddress NVARCHAR(100) NULL,
        UserAgent NVARCHAR(1000) NULL,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_FactApplicationAuditEvent_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL,
        CONSTRAINT FK_FactApplicationAuditEvent_DimDate FOREIGN KEY (DateKey) REFERENCES dbo.DimDate(DateKey),
        CONSTRAINT FK_FactApplicationAuditEvent_DimUser FOREIGN KEY (ActorUserKey) REFERENCES dbo.DimUser(UserKey),
        CONSTRAINT FK_FactApplicationAuditEvent_DimRole FOREIGN KEY (ActorRoleKey) REFERENCES dbo.DimRole(RoleKey),
        CONSTRAINT FK_FactApplicationAuditEvent_DimActionType FOREIGN KEY (ActionTypeKey) REFERENCES dbo.DimActionType(ActionTypeKey),
        CONSTRAINT FK_FactApplicationAuditEvent_DimEntityType FOREIGN KEY (EntityTypeKey) REFERENCES dbo.DimEntityType(EntityTypeKey),
        CONSTRAINT FK_FactApplicationAuditEvent_DimOutcome FOREIGN KEY (OutcomeKey) REFERENCES dbo.DimOutcome(OutcomeKey)
    );
END;
GO

IF OBJECT_ID(N'dbo.FactSecurityEvent', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FactSecurityEvent (
        SecurityFactKey BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_FactSecurityEvent PRIMARY KEY,
        SourceSecurityEventId INT NOT NULL CONSTRAINT UQ_FactSecurityEvent_SourceSecurityEventId UNIQUE,
        DateKey INT NOT NULL,
        EventTimestamp DATETIME2 NOT NULL,
        ActorUserKey INT NOT NULL,
        ActorRoleKey INT NOT NULL,
        ActionTypeKey INT NOT NULL,
        SecurityCategoryKey INT NOT NULL,
        SecuritySeverityKey INT NOT NULL,
        OutcomeKey INT NOT NULL,
        SourceApplicationAuditEventId INT NULL,
        EventSummary NVARCHAR(1000) NOT NULL,
        DetailsJson NVARCHAR(MAX) NULL,
        RequestMethod NVARCHAR(20) NULL,
        RequestPath NVARCHAR(500) NULL,
        IpAddress NVARCHAR(100) NULL,
        UserAgent NVARCHAR(1000) NULL,
        DwInsertedAt DATETIME2(0) NOT NULL CONSTRAINT DF_FactSecurityEvent_DwInsertedAt DEFAULT SYSUTCDATETIME(),
        DwUpdatedAt DATETIME2(0) NULL,
        CONSTRAINT FK_FactSecurityEvent_DimDate FOREIGN KEY (DateKey) REFERENCES dbo.DimDate(DateKey),
        CONSTRAINT FK_FactSecurityEvent_DimUser FOREIGN KEY (ActorUserKey) REFERENCES dbo.DimUser(UserKey),
        CONSTRAINT FK_FactSecurityEvent_DimRole FOREIGN KEY (ActorRoleKey) REFERENCES dbo.DimRole(RoleKey),
        CONSTRAINT FK_FactSecurityEvent_DimActionType FOREIGN KEY (ActionTypeKey) REFERENCES dbo.DimActionType(ActionTypeKey),
        CONSTRAINT FK_FactSecurityEvent_DimSecurityCategory FOREIGN KEY (SecurityCategoryKey) REFERENCES dbo.DimSecurityCategory(SecurityCategoryKey),
        CONSTRAINT FK_FactSecurityEvent_DimSecuritySeverity FOREIGN KEY (SecuritySeverityKey) REFERENCES dbo.DimSecuritySeverity(SecuritySeverityKey),
        CONSTRAINT FK_FactSecurityEvent_DimOutcome FOREIGN KEY (OutcomeKey) REFERENCES dbo.DimOutcome(OutcomeKey)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FactApplicationAuditEvent_DateKey' AND object_id = OBJECT_ID(N'dbo.FactApplicationAuditEvent'))
BEGIN
    CREATE INDEX IX_FactApplicationAuditEvent_DateKey ON dbo.FactApplicationAuditEvent(DateKey);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FactApplicationAuditEvent_ActionTypeKey' AND object_id = OBJECT_ID(N'dbo.FactApplicationAuditEvent'))
BEGIN
    CREATE INDEX IX_FactApplicationAuditEvent_ActionTypeKey ON dbo.FactApplicationAuditEvent(ActionTypeKey);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FactApplicationAuditEvent_ActorUserKey' AND object_id = OBJECT_ID(N'dbo.FactApplicationAuditEvent'))
BEGIN
    CREATE INDEX IX_FactApplicationAuditEvent_ActorUserKey ON dbo.FactApplicationAuditEvent(ActorUserKey);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FactSecurityEvent_DateKey' AND object_id = OBJECT_ID(N'dbo.FactSecurityEvent'))
BEGIN
    CREATE INDEX IX_FactSecurityEvent_DateKey ON dbo.FactSecurityEvent(DateKey);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FactSecurityEvent_Severity_Category' AND object_id = OBJECT_ID(N'dbo.FactSecurityEvent'))
BEGIN
    CREATE INDEX IX_FactSecurityEvent_Severity_Category ON dbo.FactSecurityEvent(SecuritySeverityKey, SecurityCategoryKey);
END;
GO

CREATE OR ALTER PROCEDURE dbo.uspLoadWonderlandDw
AS
BEGIN
    SET NOCOUNT ON;

    /* Unknown/default dimension rows */

    IF NOT EXISTS (SELECT 1 FROM dbo.DimDate WHERE DateKey = 19000101)
    BEGIN
        INSERT INTO dbo.DimDate (
            DateKey,
            DateValue,
            CalendarYear,
            CalendarQuarter,
            MonthNumber,
            MonthName,
            DayOfMonth,
            DayOfWeekName,
            IsWeekend
        )
        VALUES (
            19000101,
            CONVERT(DATE, '1900-01-01'),
            1900,
            1,
            1,
            N'January',
            1,
            N'Monday',
            0
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.DimRole WHERE RoleName = N'Unknown')
    BEGIN
        INSERT INTO dbo.DimRole (RoleName) VALUES (N'Unknown');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.DimUser WHERE SourceUserId = -1)
    BEGIN
        INSERT INTO dbo.DimUser (
            SourceUserId,
            Email,
            FirstName,
            LastName,
            FullName,
            RoleName
        )
        VALUES (
            -1,
            N'unknown@wonderland.local',
            N'Unknown',
            N'User',
            N'Unknown User',
            N'Unknown'
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.DimActionType WHERE ActionTypeName = N'Unknown')
    BEGIN
        INSERT INTO dbo.DimActionType (ActionTypeName) VALUES (N'Unknown');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.DimEntityType WHERE EntityTypeName = N'Unknown')
    BEGIN
        INSERT INTO dbo.DimEntityType (EntityTypeName) VALUES (N'Unknown');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.DimOutcome WHERE OutcomeName = N'Unknown')
    BEGIN
        INSERT INTO dbo.DimOutcome (OutcomeName) VALUES (N'Unknown');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.DimSecurityCategory WHERE CategoryName = N'Unknown')
    BEGIN
        INSERT INTO dbo.DimSecurityCategory (CategoryName) VALUES (N'Unknown');
    END;

    MERGE dbo.DimSecuritySeverity AS target
    USING (
        VALUES
            (N'Unknown', 0),
            (N'Low', 1),
            (N'Medium', 2),
            (N'High', 3),
            (N'Critical', 4)
    ) AS source (SeverityName, SeverityRank)
    ON target.SeverityName = source.SeverityName
    WHEN MATCHED AND target.SeverityRank <> source.SeverityRank THEN
        UPDATE SET
            SeverityRank = source.SeverityRank,
            DwUpdatedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (SeverityName, SeverityRank)
        VALUES (source.SeverityName, source.SeverityRank);

    /* DimDate load */

    DECLARE @StartDate DATE;
    DECLARE @EndDate DATE;

    SELECT
        @StartDate = MIN(SourceDate),
        @EndDate = MAX(SourceDate)
    FROM (
        SELECT CAST(CreatedAt AS DATE) AS SourceDate
        FROM WonderlandDB.dbo.ApplicationAuditEvents
        UNION ALL
        SELECT CAST(CreatedAt AS DATE) AS SourceDate
        FROM WonderlandDB.dbo.SecurityEvents
        UNION ALL
        SELECT CAST(CreatedAt AS DATE) AS SourceDate
        FROM WonderlandDB.dbo.Users
    ) AS SourceDates;

    SET @StartDate = ISNULL(@StartDate, CAST(SYSUTCDATETIME() AS DATE));
    SET @EndDate = ISNULL(@EndDate, CAST(SYSUTCDATETIME() AS DATE));

    IF @EndDate < CAST(SYSUTCDATETIME() AS DATE)
    BEGIN
        SET @EndDate = CAST(SYSUTCDATETIME() AS DATE);
    END;

    WHILE @StartDate <= @EndDate
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.DimDate WHERE DateValue = @StartDate)
        BEGIN
            INSERT INTO dbo.DimDate (
                DateKey,
                DateValue,
                CalendarYear,
                CalendarQuarter,
                MonthNumber,
                MonthName,
                DayOfMonth,
                DayOfWeekName,
                IsWeekend
            )
            VALUES (
                CONVERT(INT, CONVERT(CHAR(8), @StartDate, 112)),
                @StartDate,
                DATEPART(YEAR, @StartDate),
                DATEPART(QUARTER, @StartDate),
                DATEPART(MONTH, @StartDate),
                DATENAME(MONTH, @StartDate),
                DATEPART(DAY, @StartDate),
                DATENAME(WEEKDAY, @StartDate),
                CASE WHEN DATENAME(WEEKDAY, @StartDate) IN (N'Saturday', N'Sunday') THEN 1 ELSE 0 END
            );
        END;

        SET @StartDate = DATEADD(DAY, 1, @StartDate);
    END;

    /* Dimension loads */

    MERGE dbo.DimRole AS target
    USING (
        SELECT DISTINCT RoleName
        FROM (
            SELECT NULLIF(LTRIM(RTRIM(Role)), N'') AS RoleName
            FROM WonderlandDB.dbo.Users
            UNION
            SELECT NULLIF(LTRIM(RTRIM(ActorRole)), N'') AS RoleName
            FROM WonderlandDB.dbo.ApplicationAuditEvents
            UNION
            SELECT NULLIF(LTRIM(RTRIM(ActorRole)), N'') AS RoleName
            FROM WonderlandDB.dbo.SecurityEvents
        ) AS roles
        WHERE RoleName IS NOT NULL
    ) AS source
    ON target.RoleName = source.RoleName
    WHEN NOT MATCHED THEN
        INSERT (RoleName)
        VALUES (source.RoleName);

    MERGE dbo.DimUser AS target
    USING (
        SELECT
            UserId AS SourceUserId,
            Email,
            FirstName,
            LastName,
            CONCAT(FirstName, N' ', LastName) AS FullName,
            Role AS RoleName,
            CreatedAt AS SourceCreatedAt,
            UpdatedAt AS SourceUpdatedAt
        FROM WonderlandDB.dbo.Users
    ) AS source
    ON target.SourceUserId = source.SourceUserId
    WHEN MATCHED THEN
        UPDATE SET
            Email = source.Email,
            FirstName = source.FirstName,
            LastName = source.LastName,
            FullName = source.FullName,
            RoleName = source.RoleName,
            SourceCreatedAt = source.SourceCreatedAt,
            SourceUpdatedAt = source.SourceUpdatedAt,
            DwUpdatedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (
            SourceUserId,
            Email,
            FirstName,
            LastName,
            FullName,
            RoleName,
            SourceCreatedAt,
            SourceUpdatedAt
        )
        VALUES (
            source.SourceUserId,
            source.Email,
            source.FirstName,
            source.LastName,
            source.FullName,
            source.RoleName,
            source.SourceCreatedAt,
            source.SourceUpdatedAt
        );

    MERGE dbo.DimActionType AS target
    USING (
        SELECT DISTINCT ActionTypeName
        FROM (
            SELECT NULLIF(LTRIM(RTRIM(EventType)), N'') AS ActionTypeName
            FROM WonderlandDB.dbo.ApplicationAuditEvents
            UNION
            SELECT NULLIF(LTRIM(RTRIM(EventType)), N'') AS ActionTypeName
            FROM WonderlandDB.dbo.SecurityEvents
        ) AS actionTypes
        WHERE ActionTypeName IS NOT NULL
    ) AS source
    ON target.ActionTypeName = source.ActionTypeName
    WHEN NOT MATCHED THEN
        INSERT (ActionTypeName)
        VALUES (source.ActionTypeName);

    MERGE dbo.DimEntityType AS target
    USING (
        SELECT DISTINCT EntityTypeName
        FROM (
            SELECT NULLIF(LTRIM(RTRIM(TargetEntityType)), N'') AS EntityTypeName
            FROM WonderlandDB.dbo.ApplicationAuditEvents
        ) AS entityTypes
        WHERE EntityTypeName IS NOT NULL
    ) AS source
    ON target.EntityTypeName = source.EntityTypeName
    WHEN NOT MATCHED THEN
        INSERT (EntityTypeName)
        VALUES (source.EntityTypeName);

    MERGE dbo.DimOutcome AS target
    USING (
        SELECT DISTINCT OutcomeName
        FROM (
            SELECT NULLIF(LTRIM(RTRIM(ActionStatus)), N'') AS OutcomeName
            FROM WonderlandDB.dbo.ApplicationAuditEvents
            UNION
            SELECT NULLIF(LTRIM(RTRIM(ActionStatus)), N'') AS OutcomeName
            FROM WonderlandDB.dbo.SecurityEvents
        ) AS outcomes
        WHERE OutcomeName IS NOT NULL
    ) AS source
    ON target.OutcomeName = source.OutcomeName
    WHEN NOT MATCHED THEN
        INSERT (OutcomeName)
        VALUES (source.OutcomeName);

    MERGE dbo.DimSecurityCategory AS target
    USING (
        SELECT DISTINCT CategoryName
        FROM (
            SELECT NULLIF(LTRIM(RTRIM(EventCategory)), N'') AS CategoryName
            FROM WonderlandDB.dbo.SecurityEvents
        ) AS categories
        WHERE CategoryName IS NOT NULL
    ) AS source
    ON target.CategoryName = source.CategoryName
    WHEN NOT MATCHED THEN
        INSERT (CategoryName)
        VALUES (source.CategoryName);

    MERGE dbo.DimSecuritySeverity AS target
    USING (
        SELECT DISTINCT
            NULLIF(LTRIM(RTRIM(Severity)), N'') AS SeverityName,
            CASE NULLIF(LTRIM(RTRIM(Severity)), N'')
                WHEN N'Low' THEN 1
                WHEN N'Medium' THEN 2
                WHEN N'High' THEN 3
                WHEN N'Critical' THEN 4
                ELSE 0
            END AS SeverityRank
        FROM WonderlandDB.dbo.SecurityEvents
        WHERE NULLIF(LTRIM(RTRIM(Severity)), N'') IS NOT NULL
    ) AS source
    ON target.SeverityName = source.SeverityName
    WHEN MATCHED AND target.SeverityRank <> source.SeverityRank THEN
        UPDATE SET
            SeverityRank = source.SeverityRank,
            DwUpdatedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (SeverityName, SeverityRank)
        VALUES (source.SeverityName, source.SeverityRank);

    /* FactApplicationAuditEvent load */

    MERGE dbo.FactApplicationAuditEvent AS target
    USING (
        SELECT
            ae.ApplicationAuditEventId AS SourceApplicationAuditEventId,
            dd.DateKey,
            ae.CreatedAt AS EventTimestamp,
            COALESCE(du.UserKey, unknownUser.UserKey) AS ActorUserKey,
            COALESCE(dr.RoleKey, unknownRole.RoleKey) AS ActorRoleKey,
            COALESCE(dat.ActionTypeKey, unknownAction.ActionTypeKey) AS ActionTypeKey,
            COALESCE(det.EntityTypeKey, unknownEntity.EntityTypeKey) AS EntityTypeKey,
            COALESCE(dout.OutcomeKey, unknownOutcome.OutcomeKey) AS OutcomeKey,
            ae.EventCategory,
            ae.TargetEntityId,
            ae.TargetEntityReference,
            ae.EventSummary,
            ae.DetailsJson,
            ae.RequestMethod,
            ae.RequestPath,
            ae.IpAddress,
            ae.UserAgent
        FROM WonderlandDB.dbo.ApplicationAuditEvents ae
        INNER JOIN dbo.DimDate dd
            ON dd.DateValue = CAST(ae.CreatedAt AS DATE)
        CROSS JOIN (SELECT UserKey FROM dbo.DimUser WHERE SourceUserId = -1) AS unknownUser
        CROSS JOIN (SELECT RoleKey FROM dbo.DimRole WHERE RoleName = N'Unknown') AS unknownRole
        CROSS JOIN (SELECT ActionTypeKey FROM dbo.DimActionType WHERE ActionTypeName = N'Unknown') AS unknownAction
        CROSS JOIN (SELECT EntityTypeKey FROM dbo.DimEntityType WHERE EntityTypeName = N'Unknown') AS unknownEntity
        CROSS JOIN (SELECT OutcomeKey FROM dbo.DimOutcome WHERE OutcomeName = N'Unknown') AS unknownOutcome
        LEFT JOIN dbo.DimUser du
            ON du.SourceUserId = ae.ActorUserId
        LEFT JOIN dbo.DimRole dr
            ON dr.RoleName = COALESCE(NULLIF(LTRIM(RTRIM(ae.ActorRole)), N''), N'Unknown')
        LEFT JOIN dbo.DimActionType dat
            ON dat.ActionTypeName = COALESCE(NULLIF(LTRIM(RTRIM(ae.EventType)), N''), N'Unknown')
        LEFT JOIN dbo.DimEntityType det
            ON det.EntityTypeName = COALESCE(NULLIF(LTRIM(RTRIM(ae.TargetEntityType)), N''), N'Unknown')
        LEFT JOIN dbo.DimOutcome dout
            ON dout.OutcomeName = COALESCE(NULLIF(LTRIM(RTRIM(ae.ActionStatus)), N''), N'Unknown')
    ) AS source
    ON target.SourceApplicationAuditEventId = source.SourceApplicationAuditEventId
    WHEN MATCHED THEN
        UPDATE SET
            DateKey = source.DateKey,
            EventTimestamp = source.EventTimestamp,
            ActorUserKey = source.ActorUserKey,
            ActorRoleKey = source.ActorRoleKey,
            ActionTypeKey = source.ActionTypeKey,
            EntityTypeKey = source.EntityTypeKey,
            OutcomeKey = source.OutcomeKey,
            EventCategory = source.EventCategory,
            TargetEntityId = source.TargetEntityId,
            TargetEntityReference = source.TargetEntityReference,
            EventSummary = source.EventSummary,
            DetailsJson = source.DetailsJson,
            RequestMethod = source.RequestMethod,
            RequestPath = source.RequestPath,
            IpAddress = source.IpAddress,
            UserAgent = source.UserAgent,
            DwUpdatedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (
            SourceApplicationAuditEventId,
            DateKey,
            EventTimestamp,
            ActorUserKey,
            ActorRoleKey,
            ActionTypeKey,
            EntityTypeKey,
            OutcomeKey,
            EventCategory,
            TargetEntityId,
            TargetEntityReference,
            EventSummary,
            DetailsJson,
            RequestMethod,
            RequestPath,
            IpAddress,
            UserAgent
        )
        VALUES (
            source.SourceApplicationAuditEventId,
            source.DateKey,
            source.EventTimestamp,
            source.ActorUserKey,
            source.ActorRoleKey,
            source.ActionTypeKey,
            source.EntityTypeKey,
            source.OutcomeKey,
            source.EventCategory,
            source.TargetEntityId,
            source.TargetEntityReference,
            source.EventSummary,
            source.DetailsJson,
            source.RequestMethod,
            source.RequestPath,
            source.IpAddress,
            source.UserAgent
        );

    /* FactSecurityEvent load */

    MERGE dbo.FactSecurityEvent AS target
    USING (
        SELECT
            se.SecurityEventId AS SourceSecurityEventId,
            dd.DateKey,
            se.CreatedAt AS EventTimestamp,
            COALESCE(du.UserKey, unknownUser.UserKey) AS ActorUserKey,
            COALESCE(dr.RoleKey, unknownRole.RoleKey) AS ActorRoleKey,
            COALESCE(dat.ActionTypeKey, unknownAction.ActionTypeKey) AS ActionTypeKey,
            COALESCE(dsc.SecurityCategoryKey, unknownCategory.SecurityCategoryKey) AS SecurityCategoryKey,
            COALESCE(dss.SecuritySeverityKey, unknownSeverity.SecuritySeverityKey) AS SecuritySeverityKey,
            COALESCE(dout.OutcomeKey, unknownOutcome.OutcomeKey) AS OutcomeKey,
            se.SourceApplicationAuditEventId,
            se.EventSummary,
            se.DetailsJson,
            se.RequestMethod,
            se.RequestPath,
            se.IpAddress,
            se.UserAgent
        FROM WonderlandDB.dbo.SecurityEvents se
        INNER JOIN dbo.DimDate dd
            ON dd.DateValue = CAST(se.CreatedAt AS DATE)
        CROSS JOIN (SELECT UserKey FROM dbo.DimUser WHERE SourceUserId = -1) AS unknownUser
        CROSS JOIN (SELECT RoleKey FROM dbo.DimRole WHERE RoleName = N'Unknown') AS unknownRole
        CROSS JOIN (SELECT ActionTypeKey FROM dbo.DimActionType WHERE ActionTypeName = N'Unknown') AS unknownAction
        CROSS JOIN (SELECT SecurityCategoryKey FROM dbo.DimSecurityCategory WHERE CategoryName = N'Unknown') AS unknownCategory
        CROSS JOIN (SELECT SecuritySeverityKey FROM dbo.DimSecuritySeverity WHERE SeverityName = N'Unknown') AS unknownSeverity
        CROSS JOIN (SELECT OutcomeKey FROM dbo.DimOutcome WHERE OutcomeName = N'Unknown') AS unknownOutcome
        LEFT JOIN dbo.DimUser du
            ON du.SourceUserId = se.ActorUserId
        LEFT JOIN dbo.DimRole dr
            ON dr.RoleName = COALESCE(NULLIF(LTRIM(RTRIM(se.ActorRole)), N''), N'Unknown')
        LEFT JOIN dbo.DimActionType dat
            ON dat.ActionTypeName = COALESCE(NULLIF(LTRIM(RTRIM(se.EventType)), N''), N'Unknown')
        LEFT JOIN dbo.DimSecurityCategory dsc
            ON dsc.CategoryName = COALESCE(NULLIF(LTRIM(RTRIM(se.EventCategory)), N''), N'Unknown')
        LEFT JOIN dbo.DimSecuritySeverity dss
            ON dss.SeverityName = COALESCE(NULLIF(LTRIM(RTRIM(se.Severity)), N''), N'Unknown')
        LEFT JOIN dbo.DimOutcome dout
            ON dout.OutcomeName = COALESCE(NULLIF(LTRIM(RTRIM(se.ActionStatus)), N''), N'Unknown')
    ) AS source
    ON target.SourceSecurityEventId = source.SourceSecurityEventId
    WHEN MATCHED THEN
        UPDATE SET
            DateKey = source.DateKey,
            EventTimestamp = source.EventTimestamp,
            ActorUserKey = source.ActorUserKey,
            ActorRoleKey = source.ActorRoleKey,
            ActionTypeKey = source.ActionTypeKey,
            SecurityCategoryKey = source.SecurityCategoryKey,
            SecuritySeverityKey = source.SecuritySeverityKey,
            OutcomeKey = source.OutcomeKey,
            SourceApplicationAuditEventId = source.SourceApplicationAuditEventId,
            EventSummary = source.EventSummary,
            DetailsJson = source.DetailsJson,
            RequestMethod = source.RequestMethod,
            RequestPath = source.RequestPath,
            IpAddress = source.IpAddress,
            UserAgent = source.UserAgent,
            DwUpdatedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (
            SourceSecurityEventId,
            DateKey,
            EventTimestamp,
            ActorUserKey,
            ActorRoleKey,
            ActionTypeKey,
            SecurityCategoryKey,
            SecuritySeverityKey,
            OutcomeKey,
            SourceApplicationAuditEventId,
            EventSummary,
            DetailsJson,
            RequestMethod,
            RequestPath,
            IpAddress,
            UserAgent
        )
        VALUES (
            source.SourceSecurityEventId,
            source.DateKey,
            source.EventTimestamp,
            source.ActorUserKey,
            source.ActorRoleKey,
            source.ActionTypeKey,
            source.SecurityCategoryKey,
            source.SecuritySeverityKey,
            source.OutcomeKey,
            source.SourceApplicationAuditEventId,
            source.EventSummary,
            source.DetailsJson,
            source.RequestMethod,
            source.RequestPath,
            source.IpAddress,
            source.UserAgent
        );
END;
GO

CREATE OR ALTER VIEW dbo.vwDwLoadValidation
AS
SELECT
    ValidationArea,
    SourceRowCount,
    DwRowCount,
    SourceRowCount - DwRowCount AS Difference
FROM (
    SELECT
        N'ApplicationAuditEvents' AS ValidationArea,
        CAST((SELECT COUNT(*) FROM WonderlandDB.dbo.ApplicationAuditEvents) AS BIGINT) AS SourceRowCount,
        CAST((SELECT COUNT(*) FROM dbo.FactApplicationAuditEvent) AS BIGINT) AS DwRowCount

    UNION ALL

    SELECT
        N'SecurityEvents' AS ValidationArea,
        CAST((SELECT COUNT(*) FROM WonderlandDB.dbo.SecurityEvents) AS BIGINT) AS SourceRowCount,
        CAST((SELECT COUNT(*) FROM dbo.FactSecurityEvent) AS BIGINT) AS DwRowCount

    UNION ALL

    SELECT
        N'Users' AS ValidationArea,
        CAST((SELECT COUNT(*) FROM WonderlandDB.dbo.Users) AS BIGINT) AS SourceRowCount,
        CAST((SELECT COUNT(*) FROM dbo.DimUser WHERE SourceUserId <> -1) AS BIGINT) AS DwRowCount
) AS validation;
GO

EXEC dbo.uspLoadWonderlandDw;
GO

SELECT *
FROM dbo.vwDwLoadValidation
ORDER BY ValidationArea;
GO

SELECT 'Iteration 15 data warehouse foundation completed successfully' AS Message;
GO
