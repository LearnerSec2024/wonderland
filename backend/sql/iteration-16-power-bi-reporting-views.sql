USE master;
GO

IF DB_ID(N'WonderlandDW') IS NULL
BEGIN
    THROW 51000, 'WonderlandDW database does not exist. Run Iteration 15 first.', 1;
END;
GO

USE WonderlandDW;
GO

/* =========================================================
   Iteration 16: Power BI-ready reporting views and measures
   Purpose:
   - Build curated reporting views over WonderlandDW.
   - Give Power BI business-friendly columns.
   - Keep operational WonderlandDB separate from reporting use.
   - Provide validation for report view row counts.

   This script is safe to run multiple times.
   ========================================================= */

EXEC dbo.uspLoadWonderlandDw;
GO

CREATE OR ALTER VIEW dbo.vPowerBIApplicationAuditEvents
AS
SELECT
    f.ApplicationAuditFactKey,
    f.SourceApplicationAuditEventId,
    d.DateKey,
    d.DateValue AS EventDate,
    d.CalendarYear AS [Year],
    d.CalendarQuarter AS [Quarter],
    d.MonthNumber,
    d.MonthName,
    CONCAT(d.CalendarYear, N'-', RIGHT(CONCAT(N'0', d.MonthNumber), 2)) AS YearMonth,
    d.DayOfMonth,
    d.DayOfWeekName,
    d.IsWeekend,
    f.EventTimestamp,
    u.SourceUserId AS ActorSourceUserId,
    u.Email AS ActorEmail,
    u.FullName AS ActorFullName,
    r.RoleName AS ActorRole,
    a.ActionTypeName AS ActionType,
    e.EntityTypeName AS EntityType,
    o.OutcomeName AS Outcome,
    f.EventCategory,
    f.TargetEntityId,
    f.TargetEntityReference,
    f.EventSummary,
    f.RequestMethod,
    f.RequestPath,
    f.IpAddress,
    CASE WHEN f.DetailsJson IS NULL THEN 0 ELSE 1 END AS HasDetailsJson,
    CAST(1 AS INT) AS EventCount,
    f.DwInsertedAt
FROM dbo.FactApplicationAuditEvent f
INNER JOIN dbo.DimDate d
    ON f.DateKey = d.DateKey
INNER JOIN dbo.DimUser u
    ON f.ActorUserKey = u.UserKey
INNER JOIN dbo.DimRole r
    ON f.ActorRoleKey = r.RoleKey
INNER JOIN dbo.DimActionType a
    ON f.ActionTypeKey = a.ActionTypeKey
INNER JOIN dbo.DimEntityType e
    ON f.EntityTypeKey = e.EntityTypeKey
INNER JOIN dbo.DimOutcome o
    ON f.OutcomeKey = o.OutcomeKey;
GO

CREATE OR ALTER VIEW dbo.vPowerBISecurityEvents
AS
SELECT
    f.SecurityFactKey,
    f.SourceSecurityEventId,
    f.SourceApplicationAuditEventId,
    d.DateKey,
    d.DateValue AS EventDate,
    d.CalendarYear AS [Year],
    d.CalendarQuarter AS [Quarter],
    d.MonthNumber,
    d.MonthName,
    CONCAT(d.CalendarYear, N'-', RIGHT(CONCAT(N'0', d.MonthNumber), 2)) AS YearMonth,
    d.DayOfMonth,
    d.DayOfWeekName,
    d.IsWeekend,
    f.EventTimestamp,
    u.SourceUserId AS ActorSourceUserId,
    u.Email AS ActorEmail,
    u.FullName AS ActorFullName,
    r.RoleName AS ActorRole,
    a.ActionTypeName AS ActionType,
    c.CategoryName AS SecurityCategory,
    s.SeverityName AS SecuritySeverity,
    s.SeverityRank,
    o.OutcomeName AS Outcome,
    f.EventSummary,
    f.RequestMethod,
    f.RequestPath,
    f.IpAddress,
    CASE
        WHEN s.SeverityName IN (N'High', N'Critical') THEN 1
        ELSE 0
    END AS IsHighSeverity,
    CASE
        WHEN a.ActionTypeName LIKE N'%Failed%'
          OR a.ActionTypeName LIKE N'%Denied%'
          OR o.OutcomeName LIKE N'%Failed%'
          OR o.OutcomeName LIKE N'%Denied%'
        THEN 1
        ELSE 0
    END AS IsFailedOrDenied,
    CASE WHEN f.DetailsJson IS NULL THEN 0 ELSE 1 END AS HasDetailsJson,
    CAST(1 AS INT) AS EventCount,
    f.DwInsertedAt
FROM dbo.FactSecurityEvent f
INNER JOIN dbo.DimDate d
    ON f.DateKey = d.DateKey
INNER JOIN dbo.DimUser u
    ON f.ActorUserKey = u.UserKey
INNER JOIN dbo.DimRole r
    ON f.ActorRoleKey = r.RoleKey
INNER JOIN dbo.DimActionType a
    ON f.ActionTypeKey = a.ActionTypeKey
INNER JOIN dbo.DimSecurityCategory c
    ON f.SecurityCategoryKey = c.SecurityCategoryKey
INNER JOIN dbo.DimSecuritySeverity s
    ON f.SecuritySeverityKey = s.SecuritySeverityKey
INNER JOIN dbo.DimOutcome o
    ON f.OutcomeKey = o.OutcomeKey;
GO

CREATE OR ALTER VIEW dbo.vPowerBIUserActivitySummary
AS
SELECT
    ActivityDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorSourceUserId,
    ActorEmail,
    ActorFullName,
    ActorRole,
    SUM(ApplicationAuditEventCount) AS ApplicationAuditEventCount,
    SUM(SecurityEventCount) AS SecurityEventCount,
    SUM(ApplicationAuditEventCount + SecurityEventCount) AS TotalEventCount
FROM
(
    SELECT
        EventDate AS ActivityDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole,
        COUNT_BIG(*) AS ApplicationAuditEventCount,
        CAST(0 AS BIGINT) AS SecurityEventCount
    FROM dbo.vPowerBIApplicationAuditEvents
    GROUP BY
        EventDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole

    UNION ALL

    SELECT
        EventDate AS ActivityDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole,
        CAST(0 AS BIGINT) AS ApplicationAuditEventCount,
        COUNT_BIG(*) AS SecurityEventCount
    FROM dbo.vPowerBISecurityEvents
    GROUP BY
        EventDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole
) activity
GROUP BY
    ActivityDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorSourceUserId,
    ActorEmail,
    ActorFullName,
    ActorRole;
GO

CREATE OR ALTER VIEW dbo.vPowerBISecuritySeverityTrend
AS
SELECT
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    SecuritySeverity,
    SeverityRank,
    SecurityCategory,
    COUNT_BIG(*) AS SecurityEventCount,
    SUM(CAST(IsHighSeverity AS BIGINT)) AS HighSeverityEventCount
FROM dbo.vPowerBISecurityEvents
GROUP BY
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    SecuritySeverity,
    SeverityRank,
    SecurityCategory;
GO

CREATE OR ALTER VIEW dbo.vPowerBIAuditActionSummary
AS
SELECT
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRole,
    ActionType,
    EntityType,
    Outcome,
    EventCategory,
    COUNT_BIG(*) AS AuditEventCount
FROM dbo.vPowerBIApplicationAuditEvents
GROUP BY
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRole,
    ActionType,
    EntityType,
    Outcome,
    EventCategory;
GO

CREATE OR ALTER VIEW dbo.vPowerBISecurityCategorySummary
AS
SELECT
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRole,
    SecurityCategory,
    SecuritySeverity,
    SeverityRank,
    Outcome,
    COUNT_BIG(*) AS SecurityEventCount,
    SUM(CAST(IsHighSeverity AS BIGINT)) AS HighSeverityEventCount,
    SUM(CAST(IsFailedOrDenied AS BIGINT)) AS FailedOrDeniedEventCount
FROM dbo.vPowerBISecurityEvents
GROUP BY
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRole,
    SecurityCategory,
    SecuritySeverity,
    SeverityRank,
    Outcome;
GO

CREATE OR ALTER VIEW dbo.vPowerBIReportingValidation
AS
SELECT
    N'Application audit reporting view' AS ValidationArea,
    CAST((SELECT COUNT_BIG(*) FROM dbo.FactApplicationAuditEvent) AS BIGINT) AS BaseRowCount,
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIApplicationAuditEvents) AS BIGINT) AS ReportingViewRowCount,
    CAST((SELECT COUNT_BIG(*) FROM dbo.FactApplicationAuditEvent) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIApplicationAuditEvents) AS BIGINT) AS Difference

UNION ALL

SELECT
    N'Security event reporting view' AS ValidationArea,
    CAST((SELECT COUNT_BIG(*) FROM dbo.FactSecurityEvent) AS BIGINT) AS BaseRowCount,
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBISecurityEvents) AS BIGINT) AS ReportingViewRowCount,
    CAST((SELECT COUNT_BIG(*) FROM dbo.FactSecurityEvent) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBISecurityEvents) AS BIGINT) AS Difference;
GO

SELECT *
FROM dbo.vPowerBIReportingValidation
ORDER BY ValidationArea;
GO

SELECT 'Iteration 16 Power BI reporting views completed successfully' AS Message;
GO
