USE WonderlandDB;
GO

/* =========================================================
   Users Employee Link Schema Fix
   Safe to run multiple times.

   Adds dbo.Users.EmployeeId used by employee-linked registration/profile flows.
   ========================================================= */

IF COL_LENGTH('dbo.Users', 'EmployeeId') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD EmployeeId INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Users_Employees_EmployeeId'
)
AND COL_LENGTH('dbo.Users', 'EmployeeId') IS NOT NULL
AND OBJECT_ID('dbo.Employees', 'U') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT FK_Users_Employees_EmployeeId
    FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Users_EmployeeId'
      AND object_id = OBJECT_ID('dbo.Users')
)
AND COL_LENGTH('dbo.Users', 'EmployeeId') IS NOT NULL
BEGIN
    CREATE INDEX IX_Users_EmployeeId
    ON dbo.Users(EmployeeId);
END
GO

SELECT
    'dbo.Users' AS TableName,
    COL_LENGTH('dbo.Users', 'EmployeeId') AS EmployeeIdColumn;

SELECT 'Users employee link schema migration completed successfully' AS Message;
GO
