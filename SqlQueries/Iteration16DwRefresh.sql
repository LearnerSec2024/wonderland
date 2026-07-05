-- -- Run this script from SQL Server Studio to refresh the WonderlandDW database and validate the data for Power BI reporting.

USE WonderlandDW;
GO

EXEC dbo.uspLoadWonderlandDw;
GO

SELECT *
FROM dbo.vPowerBIReportingValidation;
GO