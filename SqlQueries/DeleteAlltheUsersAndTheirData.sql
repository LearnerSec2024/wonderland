-- This Query deletes all the users and their relevant data but It does not delete employees, 
-- but it resets employee registration links so there are no broken references.

USE WonderlandDB;
GO

/*
    PURPOSE:
    Delete ALL user accounts and their related user data.

    SAFE RUN:
    - First run with @CommitDelete = 0
    - Check the preview results
    - Then change @CommitDelete = 1 to permanently delete
*/

DECLARE @CommitDelete BIT = 1; -- Change to 1 when ready to permanently delete

BEGIN TRANSACTION;

-- 1. Preview all users that will be deleted
SELECT *
FROM dbo.Users;

-- 2. Preview related PointsLedger records
SELECT *
FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId
    FROM dbo.Users
);

-- 3. Reset employee registration links, but DO NOT delete employees
UPDATE dbo.Employees
SET
    IsRegistered = 0,
    RegisteredUserId = NULL,
    RegisteredAt = NULL,
    UpdatedAt = SYSDATETIME()
WHERE RegisteredUserId IN (
    SELECT UserId
    FROM dbo.Users
);

-- 4. Delete related user data first
DELETE FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId
    FROM dbo.Users
);

-- 5. Delete all users
DELETE FROM dbo.Users;

-- 6. Confirm Users table is empty inside the transaction
SELECT *
FROM dbo.Users;

-- 7. Confirm PointsLedger is empty inside the transaction
SELECT *
FROM dbo.PointsLedger;

-- 8. Final decision
IF @CommitDelete = 1
BEGIN
    COMMIT;
    PRINT 'SUCCESS: All users and related user data were permanently deleted.';
END
ELSE
BEGIN
    ROLLBACK;
    PRINT 'PREVIEW ONLY: Changes were rolled back. Nothing was permanently deleted.';
    PRINT 'To permanently delete, change @CommitDelete to 1 and run again.';
END;