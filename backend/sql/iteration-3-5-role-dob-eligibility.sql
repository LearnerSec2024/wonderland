USE WonderlandDB;
GO

/* =========================================================
   Iteration 3.5: Roles, Employees, DOB and Eligibility
   This script is safe to run multiple times.
   ========================================================= */

IF OBJECT_ID('dbo.EmployeeSalaries', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeeSalaries (
        EmployeeSalaryId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        AnnualSalary DECIMAL(12,2) NOT NULL,
        Currency NVARCHAR(10) NOT NULL DEFAULT 'AUD',
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.EmployeeRoles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeeRoles (
        EmployeeRoleId INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeId INT NOT NULL,
        RoleId INT NOT NULL,
        AssignedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.Employees', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Employees (
        EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        DateOfBirth DATE NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.Users', 'DateOfBirth') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD DateOfBirth DATE NULL;
END
GO

IF COL_LENGTH('dbo.Users', 'EmployeeId') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD EmployeeId INT NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'MinimumAgeYears') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD MinimumAgeYears INT NOT NULL
        CONSTRAINT DF_Rides_MinimumAgeYears DEFAULT 0 WITH VALUES;
END
GO

IF COL_LENGTH('dbo.Rides', 'RequiresAdultSupervision') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD RequiresAdultSupervision BIT NOT NULL
        CONSTRAINT DF_Rides_RequiresAdultSupervision DEFAULT 0 WITH VALUES;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'MinimumLeadGuestAgeYears') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD MinimumLeadGuestAgeYears INT NOT NULL
        CONSTRAINT DF_Accommodations_MinLeadGuestAge DEFAULT 18 WITH VALUES;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'IsFamilyFriendly') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD IsFamilyFriendly BIT NOT NULL
        CONSTRAINT DF_Accommodations_IsFamilyFriendly DEFAULT 1 WITH VALUES;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_Employees')
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT FK_Users_Employees
    FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EmployeeRoles_Employees')
BEGIN
    ALTER TABLE dbo.EmployeeRoles
    ADD CONSTRAINT FK_EmployeeRoles_Employees
    FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EmployeeRoles_Roles')
BEGIN
    ALTER TABLE dbo.EmployeeRoles
    ADD CONSTRAINT FK_EmployeeRoles_Roles
    FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EmployeeSalaries_Employees')
BEGIN
    ALTER TABLE dbo.EmployeeSalaries
    ADD CONSTRAINT FK_EmployeeSalaries_Employees
    FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'User')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('User', 'Guest customer account');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Admin')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('Admin', 'Wonderland administrator account');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Manager')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('Manager', 'Wonderland manager account');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'ava.admin@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Ava', 'Admin', 'ava.admin@wonderland.local', '1988-04-12', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'mila.manager@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Mila', 'Manager', 'mila.manager@wonderland.local', '1990-09-20', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'noah.inactive@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Noah', 'Inactive', 'noah.inactive@wonderland.local', '1985-01-15', 0);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles er
    JOIN dbo.Employees e ON e.EmployeeId = er.EmployeeId
    JOIN dbo.Roles r ON r.RoleId = er.RoleId
    WHERE e.Email = 'ava.admin@wonderland.local'
      AND r.RoleName = 'Admin'
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    SELECT e.EmployeeId, r.RoleId
    FROM dbo.Employees e
    CROSS JOIN dbo.Roles r
    WHERE e.Email = 'ava.admin@wonderland.local'
      AND r.RoleName = 'Admin';
END

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles er
    JOIN dbo.Employees e ON e.EmployeeId = er.EmployeeId
    JOIN dbo.Roles r ON r.RoleId = er.RoleId
    WHERE e.Email = 'mila.manager@wonderland.local'
      AND r.RoleName = 'Manager'
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    SELECT e.EmployeeId, r.RoleId
    FROM dbo.Employees e
    CROSS JOIN dbo.Roles r
    WHERE e.Email = 'mila.manager@wonderland.local'
      AND r.RoleName = 'Manager';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeSalaries es
    JOIN dbo.Employees e ON e.EmployeeId = es.EmployeeId
    WHERE e.Email = 'ava.admin@wonderland.local'
)
BEGIN
    INSERT INTO dbo.EmployeeSalaries (EmployeeId, AnnualSalary, Currency, EffectiveFrom)
    SELECT EmployeeId, 125000.00, 'AUD', '2026-01-01'
    FROM dbo.Employees
    WHERE Email = 'ava.admin@wonderland.local';
END

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeSalaries es
    JOIN dbo.Employees e ON e.EmployeeId = es.EmployeeId
    WHERE e.Email = 'mila.manager@wonderland.local'
)
BEGIN
    INSERT INTO dbo.EmployeeSalaries (EmployeeId, AnnualSalary, Currency, EffectiveFrom)
    SELECT EmployeeId, 95000.00, 'AUD', '2026-01-01'
    FROM dbo.Employees
    WHERE Email = 'mila.manager@wonderland.local';
END
GO

UPDATE dbo.Rides
SET MinimumAgeYears = 13,
    RequiresAdultSupervision = 0
WHERE Name = 'Dragon Rush Coaster';

UPDATE dbo.Rides
SET MinimumAgeYears = 6,
    RequiresAdultSupervision = 1
WHERE Name = 'Pirate Splash Falls';

UPDATE dbo.Rides
SET MinimumAgeYears = 8,
    RequiresAdultSupervision = 1
WHERE Name = 'Galaxy Spinner';

UPDATE dbo.Rides
SET MinimumAgeYears = 0,
    RequiresAdultSupervision = 1
WHERE Name = 'Enchanted Carousel';
GO

UPDATE dbo.Accommodations
SET MinimumLeadGuestAgeYears = 18,
    IsFamilyFriendly = 1
WHERE Name = 'Castle View Hotel';

UPDATE dbo.Accommodations
SET MinimumLeadGuestAgeYears = 18,
    IsFamilyFriendly = 1
WHERE Name = 'Jungle Lodge';

UPDATE dbo.Accommodations
SET MinimumLeadGuestAgeYears = 18,
    IsFamilyFriendly = 1
WHERE Name = 'Pirate Cove Cabins';

UPDATE dbo.Accommodations
SET MinimumLeadGuestAgeYears = 21,
    IsFamilyFriendly = 0
WHERE Name = 'Galaxy Resort Suites';
GO

SELECT 'Iteration 3.5 database migration completed successfully' AS Message;
GO
