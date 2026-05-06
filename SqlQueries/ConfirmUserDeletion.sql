-- Run this after deleting the user to confirm that no rows are displayed 

USE WonderlandDB;
GO

DECLARE @UserEmail NVARCHAR(255) = 'playwright.1777957993599@wonderland.local';

SELECT *
FROM dbo.Users
WHERE Email = @UserEmail;

SELECT *
FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId
    FROM dbo.Users
    WHERE Email = @UserEmail
);

SELECT *
FROM dbo.Employees
WHERE Email = @UserEmail
   OR RegisteredUserId IN (
        SELECT UserId
        FROM dbo.Users
        WHERE Email = @UserEmail
   );