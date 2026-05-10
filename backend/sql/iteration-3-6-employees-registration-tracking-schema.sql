USE WonderlandDB;
GO

/* =========================================================
   Employees Registration Tracking Schema Fix
   Safe to run multiple times.

   Adds dbo.Employees columns expected by:
   - employee role registration
   - profile API
   - admin/manager linked profile flows

   Columns:
   - IsRegistered
   - RegisteredUserId
   - RegisteredAt
   ========================================================= */

IF COL_LENGTH('dbo.Employees', 'IsRegistered') IS NULL
BEGIN
    ALTER TABLE dbo.Employees
    ADD IsRegistered BIT NOT NULL
        CONSTRAINT DF_Employees_IsRegistered DEFAULT 0;
END
GO

IF COL_LENGTH('dbo.Employees', 'RegisteredUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Employees
    ADD RegisteredUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Employees', 'RegisteredAt') IS NULL
BEGIN
    ALTER TABLE dbo.Employees
    ADD RegisteredAt DATETIME2 NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Employees_RegisteredUserId'
      AND object_id = OBJECT_ID('dbo.Employees')
)
AND COL_LENGTH('dbo.Employees', 'RegisteredUserId') IS NOT NULL
BEGIN
    CREATE INDEX IX_Employees_RegisteredUserId
    ON dbo.Employees(RegisteredUserId);
END
GO

SELECT
    'dbo.Employees' AS TableName,
    COL_LENGTH('dbo.Employees', 'IsRegistered') AS IsRegisteredColumn,
    COL_LENGTH('dbo.Employees', 'RegisteredUserId') AS RegisteredUserIdColumn,
    COL_LENGTH('dbo.Employees', 'RegisteredAt') AS RegisteredAtColumn;

SELECT 'Employees registration tracking schema migration completed successfully' AS Message;
GO
