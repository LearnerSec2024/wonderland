-- to delete all the USERS (not employees), so make sure you use USERS email not  EMPLOYEE USER's email while running this query

USE WonderlandDB;
GO

BEGIN TRANSACTION;

-- 1. Preview matching normal users first
SELECT *
FROM dbo.Users
WHERE Email LIKE '%playwright%'
  AND Role = 'User';

-- 2. Delete related user data first
DELETE FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId
    FROM dbo.Users
    WHERE Email LIKE '%playwright%'
      AND Role = 'User'
);

-- 3. Delete matching normal user accounts
DELETE FROM dbo.Users
WHERE Email LIKE '%playwright%'
  AND Role = 'User';

-- 4. Confirm matching users are gone inside the transaction
SELECT *
FROM dbo.Users
WHERE Email LIKE '%playwright%'
  AND Role = 'User';

-- 5. Confirm related PointsLedger rows are gone
SELECT *
FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId
    FROM dbo.Users
    WHERE Email LIKE '%playwright%'
      AND Role = 'User'
);

-- First run: keep this to test only
--ROLLBACK;

-- Final run: comment ROLLBACK and uncomment COMMIT
COMMIT;