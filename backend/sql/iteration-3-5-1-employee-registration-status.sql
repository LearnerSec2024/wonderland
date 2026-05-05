USE WonderlandDB;
GO

/* =========================================================
   Iteration 3.5.1: Employee Registration Status Tracking
   This script is safe to run multiple times.
   ========================================================= */

IF COL_LENGTH('dbo.Employees', 'IsRegistered') IS NULL
BEGIN
    ALTER TABLE dbo.Employees
    ADD IsRegistered BIT NOT NULL
        CONSTRAINT DF_Employees_IsRegistered DEFAULT 0 WITH VALUES;
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

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Employees_RegisteredUsers')
BEGIN
    ALTER TABLE dbo.Employees
    ADD CONSTRAINT FK_Employees_RegisteredUsers
    FOREIGN KEY (RegisteredUserId) REFERENCES dbo.Users(UserId);
END
GO

/* Backfill status for any Admin/Manager users already registered locally */
UPDATE e
SET
    e.IsRegistered = 1,
    e.RegisteredUserId = u.UserId,
    e.RegisteredAt = COALESCE(e.RegisteredAt, u.CreatedAt)
FROM dbo.Employees e
INNER JOIN dbo.Users u ON u.EmployeeId = e.EmployeeId
WHERE u.Role IN ('Admin', 'Manager');
GO

SELECT 'Iteration 3.5.1 employee registration status migration completed successfully' AS Message;
GO
