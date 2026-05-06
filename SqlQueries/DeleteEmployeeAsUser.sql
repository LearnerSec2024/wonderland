-- Step1: Make sure ROLLBACK is uncommented and COMMIT is commented out 
-- Run the query
-- Check the results 
-- Step2: If you are happy with the result, run it by commenting out ROLLLBACK and Uncommenting COMMIT

USE WonderlandDB;
GO

DECLARE @UserId INT = 34;
DECLARE @EmployeeEmail NVARCHAR(255) = 'ava.admin@wonderland.local';

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT 'Checking current user record...';

    SELECT *
    FROM dbo.Users
    WHERE UserId = @UserId
      AND Email = @EmployeeEmail;

    PRINT 'Checking current employee record...';

    SELECT *
    FROM dbo.Employees
    WHERE Email = @EmployeeEmail;

    /*
      Delete related data for the wrongly registered user.
      Add more DELETE statements here later if we create more user-linked tables.
    */
    DELETE FROM dbo.PointsLedger
    WHERE UserId = @UserId;

    /*
      Reset the employee registration state.
      This allows Ava Admin to register again properly.
    */
    UPDATE dbo.Employees
    SET
        IsRegistered = 0,
        RegisteredUserId = NULL,
        RegisteredAt = NULL,
        UpdatedAt = SYSDATETIME()
    WHERE Email = @EmployeeEmail;

    /*
      Delete the wrongly created normal User account.
      Safety condition includes Role = 'User' so we only remove the accidental normal user.
    */
    DELETE FROM dbo.Users
    WHERE UserId = @UserId
      AND Email = @EmployeeEmail
      AND Role = 'User';

    PRINT 'Preview after cleanup...';

    SELECT *
    FROM dbo.Users
    WHERE UserId = @UserId
       OR Email = @EmployeeEmail;

    SELECT *
    FROM dbo.Employees
    WHERE Email = @EmployeeEmail;

    /*
      First run: keep ROLLBACK.
      This tests the cleanup but undoes the changes.
    */
    --ROLLBACK;
    COMMIT;

    PRINT 'Cleanup tested only. Changes were rolled back. Change ROLLBACK to COMMIT when ready.';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    PRINT 'Cleanup failed.';
    PRINT ERROR_MESSAGE();
END CATCH;