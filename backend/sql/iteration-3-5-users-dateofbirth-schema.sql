USE WonderlandDB;
GO

/* =========================================================
   Users Date of Birth Schema Fix
   Safe to run multiple times.

   Adds dbo.Users.DateOfBirth used by registration/profile flows.
   ========================================================= */

IF COL_LENGTH('dbo.Users', 'DateOfBirth') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD DateOfBirth DATE NULL;
END
GO

SELECT
    'dbo.Users' AS TableName,
    COL_LENGTH('dbo.Users', 'DateOfBirth') AS DateOfBirthColumn;

SELECT 'Users DateOfBirth schema migration completed successfully' AS Message;
GO
