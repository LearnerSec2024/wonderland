USE WonderlandDB;
GO

/* =========================================================
   Iteration 3.7: Admin Content Submission + Manager Approval
   Safe to run multiple times.
   ========================================================= */

IF COL_LENGTH('dbo.Rides', 'ApprovalStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD ApprovalStatus NVARCHAR(50) NOT NULL
        CONSTRAINT DF_Rides_ApprovalStatus DEFAULT 'Approved' WITH VALUES;
END
GO

IF COL_LENGTH('dbo.Rides', 'SubmittedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Rides ADD SubmittedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'SubmittedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Rides ADD SubmittedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'ReviewedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Rides ADD ReviewedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Rides ADD ReviewedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'RejectionReason') IS NULL
BEGIN
    ALTER TABLE dbo.Rides ADD RejectionReason NVARCHAR(500) NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'ApprovalStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD ApprovalStatus NVARCHAR(50) NOT NULL
        CONSTRAINT DF_Accommodations_ApprovalStatus DEFAULT 'Approved' WITH VALUES;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'SubmittedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations ADD SubmittedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'SubmittedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations ADD SubmittedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'ReviewedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations ADD ReviewedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations ADD ReviewedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'RejectionReason') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations ADD RejectionReason NVARCHAR(500) NULL;
END
GO

UPDATE dbo.Rides
SET ApprovalStatus = 'Approved',
    IsActive = 1
WHERE ApprovalStatus IS NULL OR ApprovalStatus = '';
GO

UPDATE dbo.Accommodations
SET ApprovalStatus = 'Approved',
    IsActive = 1
WHERE ApprovalStatus IS NULL OR ApprovalStatus = '';
GO

/* Extra employees reserved for approval workflow Playwright tests */

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'workflow.admin@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Willow', 'WorkflowAdmin', 'workflow.admin@wonderland.local', '1986-03-03', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'workflow.manager@wonderland.local')
BEGIN
    INSERT INTO dbo.Employees (FirstName, LastName, Email, DateOfBirth, IsActive)
    VALUES ('Mason', 'WorkflowManager', 'workflow.manager@wonderland.local', '1989-08-08', 1);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles er
    JOIN dbo.Employees e ON e.EmployeeId = er.EmployeeId
    JOIN dbo.Roles r ON r.RoleId = er.RoleId
    WHERE e.Email = 'workflow.admin@wonderland.local'
      AND r.RoleName = 'Admin'
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    SELECT e.EmployeeId, r.RoleId
    FROM dbo.Employees e
    CROSS JOIN dbo.Roles r
    WHERE e.Email = 'workflow.admin@wonderland.local'
      AND r.RoleName = 'Admin';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles er
    JOIN dbo.Employees e ON e.EmployeeId = er.EmployeeId
    JOIN dbo.Roles r ON r.RoleId = er.RoleId
    WHERE e.Email = 'workflow.manager@wonderland.local'
      AND r.RoleName = 'Manager'
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    SELECT e.EmployeeId, r.RoleId
    FROM dbo.Employees e
    CROSS JOIN dbo.Roles r
    WHERE e.Email = 'workflow.manager@wonderland.local'
      AND r.RoleName = 'Manager';
END
GO

SELECT 'Iteration 3.7 approval workflow migration completed successfully' AS Message;
GO
