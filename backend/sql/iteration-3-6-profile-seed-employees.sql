USE WonderlandDB;
GO

/* =========================================================
   Iteration 3.6: Profile Page Test Employees
   This script is safe to run multiple times.
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'profile.admin@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Priya', 'ProfileAdmin', 'profile.admin@wonderland.local', '1987-07-07', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'profile.manager@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Morgan', 'ProfileManager', 'profile.manager@wonderland.local', '1991-11-11', 1);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles er
    JOIN dbo.Employees e ON e.EmployeeId = er.EmployeeId
    JOIN dbo.Roles r ON r.RoleId = er.RoleId
    WHERE e.Email = 'profile.admin@wonderland.local'
      AND r.RoleName = 'Admin'
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    SELECT e.EmployeeId, r.RoleId
    FROM dbo.Employees e
    CROSS JOIN dbo.Roles r
    WHERE e.Email = 'profile.admin@wonderland.local'
      AND r.RoleName = 'Admin';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles er
    JOIN dbo.Employees e ON e.EmployeeId = er.EmployeeId
    JOIN dbo.Roles r ON r.RoleId = er.RoleId
    WHERE e.Email = 'profile.manager@wonderland.local'
      AND r.RoleName = 'Manager'
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    SELECT e.EmployeeId, r.RoleId
    FROM dbo.Employees e
    CROSS JOIN dbo.Roles r
    WHERE e.Email = 'profile.manager@wonderland.local'
      AND r.RoleName = 'Manager';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeSalaries es
    JOIN dbo.Employees e ON e.EmployeeId = es.EmployeeId
    WHERE e.Email = 'profile.admin@wonderland.local'
)
BEGIN
    INSERT INTO dbo.EmployeeSalaries (EmployeeId, AnnualSalary, Currency, EffectiveFrom)
    SELECT EmployeeId, 118000.00, 'AUD', '2026-01-01'
    FROM dbo.Employees
    WHERE Email = 'profile.admin@wonderland.local';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeSalaries es
    JOIN dbo.Employees e ON e.EmployeeId = es.EmployeeId
    WHERE e.Email = 'profile.manager@wonderland.local'
)
BEGIN
    INSERT INTO dbo.EmployeeSalaries (EmployeeId, AnnualSalary, Currency, EffectiveFrom)
    SELECT EmployeeId, 91000.00, 'AUD', '2026-01-01'
    FROM dbo.Employees
    WHERE Email = 'profile.manager@wonderland.local';
END
GO

SELECT 'Iteration 3.6 profile seed employees completed successfully' AS Message;
GO
