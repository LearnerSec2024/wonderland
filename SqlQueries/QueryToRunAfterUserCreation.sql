USE WonderlandDB;
GO

DECLARE @UserEmail NVARCHAR(255) = 'manual@wonderland.local';

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