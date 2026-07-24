USE master;
GO

IF DB_ID(N'WonderlandDW') IS NULL
BEGIN
    THROW 51000, 'WonderlandDW database does not exist. Run Iteration 15 first.', 1;
END;
GO

USE WonderlandDW;
GO

/*
=========================================================
Iteration 17: Power BI Semantic Model and Interactive Reporting

Purpose:
- Add Power BI-ready dimension views for Date, User, and Role.
- Expose warehouse relationship keys on Power BI reporting views.
- Support shared slicers and one-to-many semantic model relationships.
- Keep Iteration 16 flat reporting views backward-compatible.
- Provide validation for semantic model readiness.

This script is safe to run multiple times.
=========================================================
*/

EXEC dbo.uspLoadWonderlandDw;
GO

CREATE OR ALTER VIEW dbo.vPowerBIDate AS
SELECT
    DateKey,
    DateValue AS [Date],
    CalendarYear AS [Year],
    CalendarQuarter AS [Quarter],
    MonthNumber,
    MonthName,
    CONCAT(CalendarYear, N'-', RIGHT(CONCAT(N'0', MonthNumber), 2)) AS YearMonth,
    (CalendarYear * 100) + MonthNumber AS YearMonthSort,
    DayOfMonth,
    DayOfWeekName,
    IsWeekend
FROM dbo.DimDate
WHERE DateKey <> 19000101;
GO

CREATE OR ALTER VIEW dbo.vPowerBIUser AS
SELECT
    UserKey,
    SourceUserId,
    Email,
    FirstName,
    LastName,
    FullName,
    RoleName,
    CASE WHEN SourceUserId = -1 THEN 1 ELSE 0 END AS IsUnknownUser
FROM dbo.DimUser;
GO

CREATE OR ALTER VIEW dbo.vPowerBIRole AS
SELECT
    RoleKey,
    RoleName,
    CASE RoleName
        WHEN N'Unknown' THEN 0
        WHEN N'Admin' THEN 1
        WHEN N'Manager' THEN 2
        WHEN N'User' THEN 3
        ELSE 99
    END AS RoleSort
FROM dbo.DimRole;
GO

CREATE OR ALTER VIEW dbo.vPowerBIApplicationAuditEvents AS
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
    f.ActorUserKey,
    f.ActorRoleKey,
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

CREATE OR ALTER VIEW dbo.vPowerBISecurityEvents AS
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
    f.ActorUserKey,
    f.ActorRoleKey,
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
    CASE WHEN s.SeverityName IN (N'High', N'Critical') THEN 1 ELSE 0 END AS IsHighSeverity,
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

CREATE OR ALTER VIEW dbo.vPowerBIUserActivitySummary AS
SELECT
    DateKey,
    ActivityDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorUserKey,
    ActorRoleKey,
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
        DateKey,
        EventDate AS ActivityDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorUserKey,
        ActorRoleKey,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole,
        COUNT_BIG(*) AS ApplicationAuditEventCount,
        CAST(0 AS BIGINT) AS SecurityEventCount
    FROM dbo.vPowerBIApplicationAuditEvents
    GROUP BY
        DateKey,
        EventDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorUserKey,
        ActorRoleKey,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole

    UNION ALL

    SELECT
        DateKey,
        EventDate AS ActivityDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorUserKey,
        ActorRoleKey,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole,
        CAST(0 AS BIGINT) AS ApplicationAuditEventCount,
        COUNT_BIG(*) AS SecurityEventCount
    FROM dbo.vPowerBISecurityEvents
    GROUP BY
        DateKey,
        EventDate,
        [Year],
        MonthNumber,
        MonthName,
        YearMonth,
        ActorUserKey,
        ActorRoleKey,
        ActorSourceUserId,
        ActorEmail,
        ActorFullName,
        ActorRole
) activity
GROUP BY
    DateKey,
    ActivityDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorUserKey,
    ActorRoleKey,
    ActorSourceUserId,
    ActorEmail,
    ActorFullName,
    ActorRole;
GO

CREATE OR ALTER VIEW dbo.vPowerBISecuritySeverityTrend AS
SELECT
    DateKey,
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
    DateKey,
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    SecuritySeverity,
    SeverityRank,
    SecurityCategory;
GO

CREATE OR ALTER VIEW dbo.vPowerBIAuditActionSummary AS
SELECT
    DateKey,
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRoleKey,
    ActorRole,
    ActionType,
    EntityType,
    Outcome,
    EventCategory,
    COUNT_BIG(*) AS AuditEventCount
FROM dbo.vPowerBIApplicationAuditEvents
GROUP BY
    DateKey,
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRoleKey,
    ActorRole,
    ActionType,
    EntityType,
    Outcome,
    EventCategory;
GO

CREATE OR ALTER VIEW dbo.vPowerBISecurityCategorySummary AS
SELECT
    DateKey,
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRoleKey,
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
    DateKey,
    EventDate,
    [Year],
    MonthNumber,
    MonthName,
    YearMonth,
    ActorRoleKey,
    ActorRole,
    SecurityCategory,
    SecuritySeverity,
    SeverityRank,
    Outcome;
GO

CREATE OR ALTER VIEW dbo.vPowerBISemanticModelValidation AS
SELECT
    N'Application audit reporting view row count' AS ValidationArea,
    CAST((SELECT COUNT_BIG(*) FROM dbo.FactApplicationAuditEvent) AS BIGINT) AS ExpectedValue,
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIApplicationAuditEvents) AS BIGINT) AS ActualValue,
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIApplicationAuditEvents) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.FactApplicationAuditEvent) AS BIGINT) AS Difference

UNION ALL

SELECT
    N'Security event reporting view row count',
    CAST((SELECT COUNT_BIG(*) FROM dbo.FactSecurityEvent) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBISecurityEvents) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBISecurityEvents) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.FactSecurityEvent) AS BIGINT)

UNION ALL

SELECT
    N'Power BI date dimension excludes unknown sentinel date',
    CAST((SELECT COUNT_BIG(*) FROM dbo.DimDate WHERE DateKey <> 19000101) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIDate) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIDate) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.DimDate WHERE DateKey <> 19000101) AS BIGINT)

UNION ALL

SELECT
    N'Power BI user dimension row count',
    CAST((SELECT COUNT_BIG(*) FROM dbo.DimUser) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIUser) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIUser) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.DimUser) AS BIGINT)

UNION ALL

SELECT
    N'Power BI role dimension row count',
    CAST((SELECT COUNT_BIG(*) FROM dbo.DimRole) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIRole) AS BIGINT),
    CAST((SELECT COUNT_BIG(*) FROM dbo.vPowerBIRole) AS BIGINT)
        - CAST((SELECT COUNT_BIG(*) FROM dbo.DimRole) AS BIGINT)

UNION ALL

SELECT
    N'Application audit date relationship orphan count',
    CAST(0 AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactApplicationAuditEvent f
        LEFT JOIN dbo.vPowerBIDate d
            ON f.DateKey = d.DateKey
        WHERE d.DateKey IS NULL
          AND f.DateKey <> 19000101
    ) AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactApplicationAuditEvent f
        LEFT JOIN dbo.vPowerBIDate d
            ON f.DateKey = d.DateKey
        WHERE d.DateKey IS NULL
          AND f.DateKey <> 19000101
    ) AS BIGINT)

UNION ALL

SELECT
    N'Application audit user relationship orphan count',
    CAST(0 AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactApplicationAuditEvent f
        LEFT JOIN dbo.vPowerBIUser u
            ON f.ActorUserKey = u.UserKey
        WHERE u.UserKey IS NULL
    ) AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactApplicationAuditEvent f
        LEFT JOIN dbo.vPowerBIUser u
            ON f.ActorUserKey = u.UserKey
        WHERE u.UserKey IS NULL
    ) AS BIGINT)

UNION ALL

SELECT
    N'Application audit role relationship orphan count',
    CAST(0 AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactApplicationAuditEvent f
        LEFT JOIN dbo.vPowerBIRole r
            ON f.ActorRoleKey = r.RoleKey
        WHERE r.RoleKey IS NULL
    ) AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactApplicationAuditEvent f
        LEFT JOIN dbo.vPowerBIRole r
            ON f.ActorRoleKey = r.RoleKey
        WHERE r.RoleKey IS NULL
    ) AS BIGINT)

UNION ALL

SELECT
    N'Security event date relationship orphan count',
    CAST(0 AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactSecurityEvent f
        LEFT JOIN dbo.vPowerBIDate d
            ON f.DateKey = d.DateKey
        WHERE d.DateKey IS NULL
          AND f.DateKey <> 19000101
    ) AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactSecurityEvent f
        LEFT JOIN dbo.vPowerBIDate d
            ON f.DateKey = d.DateKey
        WHERE d.DateKey IS NULL
          AND f.DateKey <> 19000101
    ) AS BIGINT)

UNION ALL

SELECT
    N'Security event user relationship orphan count',
    CAST(0 AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactSecurityEvent f
        LEFT JOIN dbo.vPowerBIUser u
            ON f.ActorUserKey = u.UserKey
        WHERE u.UserKey IS NULL
    ) AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactSecurityEvent f
        LEFT JOIN dbo.vPowerBIUser u
            ON f.ActorUserKey = u.UserKey
        WHERE u.UserKey IS NULL
    ) AS BIGINT)

UNION ALL

SELECT
    N'Security event role relationship orphan count',
    CAST(0 AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactSecurityEvent f
        LEFT JOIN dbo.vPowerBIRole r
            ON f.ActorRoleKey = r.RoleKey
        WHERE r.RoleKey IS NULL
    ) AS BIGINT),
    CAST((
        SELECT COUNT_BIG(*)
        FROM dbo.FactSecurityEvent f
        LEFT JOIN dbo.vPowerBIRole r
            ON f.ActorRoleKey = r.RoleKey
        WHERE r.RoleKey IS NULL
    ) AS BIGINT);
GO

SELECT *
FROM dbo.vPowerBISemanticModelValidation
ORDER BY ValidationArea;
GO

SELECT 'Iteration 17 Power BI semantic model views completed successfully' AS Message;
GO
