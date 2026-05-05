# Wonderland Manual DB Reset Scripts

This file contains local development SQL scripts used to reset selected database records for manual testing.

These scripts are for local learning and testing only.

Do not run these against any real production database.

---

## Purpose

Some Wonderland test scenarios use fixed seeded employee accounts:

- `ava.admin@wonderland.local`
- `mila.manager@wonderland.local`

After these employees register as Admin or Manager, their employee records are updated:

- `IsRegistered = 1`
- `RegisteredUserId = populated`
- `RegisteredAt = populated`

To manually test Admin and Manager registration again, the matching user accounts must be deleted and the employee registration flags must be reset.

---

## Important Notes

Do not only set `IsRegistered = 0`.

If the matching record still exists in `dbo.Users`, registration will still fail with:

```text
A user with this email already exists

For a clean manual reset, reset the employee fields and delete the related user account.

After running a reset script, refresh SSMS manually. Open table views in SSMS do not always auto-refresh.

Check Employee Registration Status
sqlcmd -S localhost -E -C -d WonderlandDB -Q "
SELECT 
    Email,
    IsActive,
    IsRegistered,
    RegisteredUserId,
    RegisteredAt
FROM dbo.Employees
ORDER BY EmployeeId;
"
Reset Admin and Manager Employee Registration

Use this before manually testing Admin and Manager registration again.

sqlcmd -S localhost -E -C -d WonderlandDB -Q "
UPDATE dbo.Employees
SET 
    IsRegistered = 0,
    RegisteredUserId = NULL,
    RegisteredAt = NULL,
    UpdatedAt = SYSDATETIME()
WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local');

DELETE FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local')
);

DELETE FROM dbo.RideBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local')
);

DELETE FROM dbo.AccommodationBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local')
);

DELETE FROM dbo.Users
WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local');

SELECT 
    Email,
    IsRegistered,
    RegisteredUserId,
    RegisteredAt
FROM dbo.Employees
WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local');

SELECT 
    UserId,
    Email,
    Role
FROM dbo.Users
WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local');
"

Expected employee result:

ava.admin@wonderland.local       IsRegistered = 0   RegisteredUserId = NULL   RegisteredAt = NULL
mila.manager@wonderland.local    IsRegistered = 0   RegisteredUserId = NULL   RegisteredAt = NULL

Expected user result:

0 rows affected
Reset Admin Employee Only
sqlcmd -S localhost -E -C -d WonderlandDB -Q "
UPDATE dbo.Employees
SET 
    IsRegistered = 0,
    RegisteredUserId = NULL,
    RegisteredAt = NULL,
    UpdatedAt = SYSDATETIME()
WHERE Email = 'ava.admin@wonderland.local';

DELETE FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email = 'ava.admin@wonderland.local'
);

DELETE FROM dbo.RideBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email = 'ava.admin@wonderland.local'
);

DELETE FROM dbo.AccommodationBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email = 'ava.admin@wonderland.local'
);

DELETE FROM dbo.Users
WHERE Email = 'ava.admin@wonderland.local';

SELECT 
    Email,
    IsRegistered,
    RegisteredUserId,
    RegisteredAt
FROM dbo.Employees
WHERE Email = 'ava.admin@wonderland.local';
"
Reset Manager Employee Only
sqlcmd -S localhost -E -C -d WonderlandDB -Q "
UPDATE dbo.Employees
SET 
    IsRegistered = 0,
    RegisteredUserId = NULL,
    RegisteredAt = NULL,
    UpdatedAt = SYSDATETIME()
WHERE Email = 'mila.manager@wonderland.local';

DELETE FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email = 'mila.manager@wonderland.local'
);

DELETE FROM dbo.RideBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email = 'mila.manager@wonderland.local'
);

DELETE FROM dbo.AccommodationBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email = 'mila.manager@wonderland.local'
);

DELETE FROM dbo.Users
WHERE Email = 'mila.manager@wonderland.local';

SELECT 
    Email,
    IsRegistered,
    RegisteredUserId,
    RegisteredAt
FROM dbo.Employees
WHERE Email = 'mila.manager@wonderland.local';
"
Check Seeded Admin and Manager Users
sqlcmd -S localhost -E -C -d WonderlandDB -Q "
SELECT 
    UserId,
    FirstName,
    LastName,
    Email,
    Role,
    EmployeeId,
    DateOfBirth,
    CreatedAt
FROM dbo.Users
WHERE Email IN ('ava.admin@wonderland.local', 'mila.manager@wonderland.local');
"
Check All Registered Users
sqlcmd -S localhost -E -C -d WonderlandDB -Q "
SELECT 
    UserId,
    FirstName,
    LastName,
    Email,
    Role,
    EmployeeId,
    DateOfBirth,
    TotalPoints,
    CreatedAt
FROM dbo.Users
ORDER BY UserId;
"
Delete Playwright Generated Guest Users

Playwright guest registration tests create users with email addresses like:

playwright.<timestamp>@wonderland.local

Use this to clean those local test users if needed.

sqlcmd -S localhost -E -C -d WonderlandDB -Q "
DELETE FROM dbo.PointsLedger
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email LIKE 'playwright.%@wonderland.local'
);

DELETE FROM dbo.RideBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email LIKE 'playwright.%@wonderland.local'
);

DELETE FROM dbo.AccommodationBookings
WHERE UserId IN (
    SELECT UserId FROM dbo.Users
    WHERE Email LIKE 'playwright.%@wonderland.local'
);

DELETE FROM dbo.Users
WHERE Email LIKE 'playwright.%@wonderland.local';

SELECT 
    UserId,
    Email,
    Role
FROM dbo.Users
WHERE Email LIKE 'playwright.%@wonderland.local';
"
Test-Support API Alternative

The backend includes a local test-support endpoint when this environment variable is enabled:

ENABLE_TEST_SUPPORT=true

This is used by Playwright tests.

You can also call it manually while the backend is running.

Reset Admin test user:

Invoke-RestMethod -Method Delete -Uri "http://localhost:5010/api/test-support/users/by-email?email=ava.admin@wonderland.local"

Reset Manager test user:

Invoke-RestMethod -Method Delete -Uri "http://localhost:5010/api/test-support/users/by-email?email=mila.manager@wonderland.local"

This route should remain for local development and CI testing only.

Manual Test Scenarios After Reset
Admin Successful Registration

Use:

Account type: Admin
First name: Ava
Last name: Admin
Email: ava.admin@wonderland.local
DOB: 1988-04-12
Password: Password123!

Expected:

Registration succeeds
Dashboard role shows Admin
Employees.IsRegistered becomes 1
Employees.RegisteredUserId is populated
Employees.RegisteredAt is populated
Manager Successful Registration

Use:

Account type: Manager
First name: Mila
Last name: Manager
Email: mila.manager@wonderland.local
DOB: 1990-09-20
Password: Password123!

Expected:

Registration succeeds
Dashboard role shows Manager
Employees.IsRegistered becomes 1
Employees.RegisteredUserId is populated
Employees.RegisteredAt is populated
Duplicate Employee Registration

After Admin or Manager has already registered, try registering the same employee again.

Expected error:

This employee has already registered
Admin Random Email Failure

Use:

Account type: Admin
Email: random.admin@wonderland.local
DOB: 1988-04-12
Password: Password123!

Expected error:

Admin registration requires a pre-approved active employee email
Admin Wrong DOB Failure

Use:

Account type: Admin
Email: ava.admin@wonderland.local
DOB: 1999-01-01
Password: Password123!

Expected error:

Date of birth does not match employee records

