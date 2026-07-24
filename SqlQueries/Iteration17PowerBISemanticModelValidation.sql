USE WonderlandDW;
GO

/*
=========================================================
Iteration 17: Power BI Semantic Model Validation Helper

Purpose:
- Confirm semantic model views exist.
- Confirm fact/detail views expose relationship keys.
- Confirm validation differences are zero.
- Confirm vPowerBIDate is contiguous and excludes the unknown sentinel date.
=========================================================
*/

PRINT '=== Iteration 17 Power BI Semantic Model Validation ===';

PRINT '';
PRINT '--- Semantic model validation results ---';

SELECT
    ValidationArea,
    ExpectedValue,
    ActualValue,
    Difference
FROM dbo.vPowerBISemanticModelValidation
ORDER BY ValidationArea;

PRINT '';
PRINT '--- Power BI date dimension continuity ---';

SELECT
    MIN([Date]) AS MinimumDate,
    MAX([Date]) AS MaximumDate,
    COUNT_BIG(*) AS ActualDateRows,
    DATEDIFF(DAY, MIN([Date]), MAX([Date])) + 1 AS ExpectedContiguousDateRows,
    (DATEDIFF(DAY, MIN([Date]), MAX([Date])) + 1) - COUNT_BIG(*) AS MissingDateCount
FROM dbo.vPowerBIDate;

PRINT '';
PRINT '--- Confirm unknown/sentinel date is excluded from vPowerBIDate ---';

SELECT
    COUNT_BIG(*) AS SentinelRowsInPowerBIDate
FROM dbo.vPowerBIDate
WHERE DateKey = 19000101;

PRINT '';
PRINT '--- Semantic relationship columns exposed to Power BI ---';

SELECT
    v.name AS ViewName,
    c.column_id AS ColumnOrder,
    c.name AS ColumnName
FROM sys.views v
INNER JOIN sys.columns c
    ON v.object_id = c.object_id
WHERE v.name IN
(
    N'vPowerBIApplicationAuditEvents',
    N'vPowerBISecurityEvents',
    N'vPowerBIUserActivitySummary',
    N'vPowerBIAuditActionSummary',
    N'vPowerBISecurityCategorySummary',
    N'vPowerBISecuritySeverityTrend'
)
AND c.name IN
(
    N'DateKey',
    N'ActorUserKey',
    N'ActorRoleKey',
    N'ActorSourceUserId',
    N'ActorRole'
)
ORDER BY
    v.name,
    c.column_id;

PRINT '';
PRINT '--- Power BI semantic dimension views ---';

SELECT
    v.name AS ViewName
FROM sys.views v
WHERE v.name IN
(
    N'vPowerBIDate',
    N'vPowerBIUser',
    N'vPowerBIRole',
    N'vPowerBISemanticModelValidation'
)
ORDER BY v.name;
GO
