USE WonderlandDB;
GO

/*
    PURPOSE:
    Delete a normal application User and their related Wonderland data.

    HOW TO RUN SAFELY:
    1. Change @UserEmail to the user you want to delete.
    2. Keep @CommitDelete = 0 for the first run.
       This previews the delete and then rolls it back.
    3. Check the Results and Messages tabs.
    4. If the preview looks correct, change @CommitDelete = 1.
    5. Run again to permanently delete.

    SAFETY:
    This script only deletes users where Role = 'User'.
    It will not delete Admin or Manager accounts.
*/

DECLARE @UserEmail NVARCHAR(255) = 'workflow.admin@wonderland.local';

-- First run: keep this as 0.
-- Permanent delete: change this to 1.
DECLARE @CommitDelete BIT = 1;

DECLARE @UserId INT;
DECLARE @UserRole NVARCHAR(50);

SELECT
    @UserId = UserId,
    @UserRole = Role
FROM dbo.Users
WHERE Email = @UserEmail;
DELETE FROM dbo.Users WHERE Email LIKE '%playwright%' AND Role = 'User';

PRINT '----------------------------------------';
PRINT 'Wonderland User Delete Script';
PRINT '----------------------------------------';
PRINT 'Target Email: ' + @UserEmail;
PRINT 'UserId: ' + ISNULL(CAST(@UserId AS NVARCHAR(20)), 'Not found');
PRINT 'Role: ' + ISNULL(@UserRole, 'Not found');
PRINT 'Commit Mode: ' + CAST(@CommitDelete AS NVARCHAR(1));
PRINT '----------------------------------------';

-- Safety check: stop if user does not exist
IF @UserId IS NULL
BEGIN
    PRINT 'STOPPED: User was not found. Check the email address.';
    RETURN;
END;

-- Safety check: only allow normal users to be deleted
IF @UserRole <> 'User'
BEGIN
    PRINT 'STOPPED: This account is not Role = User.';
    PRINT 'This script will not delete Admin or Manager accounts.';
    RETURN;
END;

BEGIN TRANSACTION;

/*
    BEFORE DELETE:
    Check these results carefully before committing.
*/

PRINT 'Before delete: User record';

SELECT *
FROM dbo.Users
WHERE UserId = @UserId;

PRINT 'Before delete: PointsLedger records linked to this user';

SELECT *
FROM dbo.PointsLedger
WHERE UserId = @UserId;

PRINT 'Before delete: Employee records linked to this user, if any';

SELECT *
FROM dbo.Employees
WHERE RegisteredUserId = @UserId
   OR Email = @UserEmail;

/*
    STEP 1:
    Delete user-related data first.
*/

DELETE FROM dbo.PointsLedger
WHERE UserId = @UserId;

/*
    STEP 2:
    If this user was linked to an employee record, reset the employee registration state.

    We do not delete the employee.
    We only make the employee available for registration again.
*/

UPDATE dbo.Employees
SET
    IsRegistered = 0,
    RegisteredUserId = NULL,
    RegisteredAt = NULL,
    UpdatedAt = SYSDATETIME()
WHERE RegisteredUserId = @UserId;

/*
    STEP 3:
    Delete the User account itself.
*/

DELETE FROM dbo.Users
WHERE UserId = @UserId
  AND Email = @UserEmail
  AND Role = 'User';

/*
    AFTER DELETE PREVIEW:
    These should show no user and no points ledger rows.
*/

PRINT 'After delete preview: User record should be empty';

SELECT *
FROM dbo.Users
WHERE UserId = @UserId
   OR Email = @UserEmail;

PRINT 'After delete preview: PointsLedger records should be empty';

SELECT *
FROM dbo.PointsLedger
WHERE UserId = @UserId;

PRINT 'After delete preview: Employee should be unregistered if it was linked';

SELECT *
FROM dbo.Employees
WHERE RegisteredUserId = @UserId
   OR Email = @UserEmail;

/*
    FINAL DECISION:
    @CommitDelete = 0 means preview only.
    @CommitDelete = 1 means permanently delete.
*/

IF @CommitDelete = 1
BEGIN
    COMMIT;
    PRINT 'SUCCESS: User and related data were permanently deleted.';
END
ELSE
BEGIN
    ROLLBACK;
    PRINT 'PREVIEW ONLY: Changes were rolled back. Nothing was permanently deleted.';
    PRINT 'To permanently delete, change @CommitDelete to 1 and run again.';
END;