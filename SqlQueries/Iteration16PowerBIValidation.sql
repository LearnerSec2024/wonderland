USE WonderlandDW;
GO

PRINT '=== 1. Reporting validation ===';

SELECT *
FROM dbo.vPowerBIReportingValidation
ORDER BY ValidationArea;
GO


PRINT '=== 2. Overall event totals ===';

SELECT
    (SELECT SUM(EventCount)
     FROM dbo.vPowerBIApplicationAuditEvents)
        AS TotalApplicationAuditEvents,

    (SELECT SUM(EventCount)
     FROM dbo.vPowerBISecurityEvents)
        AS TotalSecurityEvents;
GO


PRINT '=== 3. Security measures ===';

SELECT
    SUM(EventCount) AS TotalSecurityEvents,

    SUM(
        CASE
            WHEN IsHighSeverity = 1 THEN EventCount
            ELSE 0
        END
    ) AS HighSeveritySecurityEvents,

    SUM(
        CASE
            WHEN IsFailedOrDenied = 1 THEN EventCount
            ELSE 0
        END
    ) AS FailedOrDeniedSecurityEvents
FROM dbo.vPowerBISecurityEvents;
GO


PRINT '=== 4. User activity totals ===';

SELECT
    SUM(ApplicationAuditEventCount) AS ApplicationAuditActivity,
    SUM(SecurityEventCount) AS SecurityActivity,
    SUM(TotalEventCount) AS CombinedActivity
FROM dbo.vPowerBIUserActivitySummary;
GO


PRINT '=== 5. Exact Top 10 active users ===';

WITH UserTotals AS
(
    SELECT
        ActorEmail,
        SUM(TotalEventCount) AS TotalEventCount
    FROM dbo.vPowerBIUserActivitySummary
    GROUP BY ActorEmail
)
SELECT TOP (10)
    ActorEmail,
    TotalEventCount
FROM UserTotals
ORDER BY
    TotalEventCount DESC,
    ActorEmail ASC;
GO