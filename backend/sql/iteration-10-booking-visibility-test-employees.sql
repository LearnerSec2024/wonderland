USE WonderlandDB;
GO

/* =========================================================
   Iteration 10: Booking Visibility Test Employees
   Safe to run multiple times.
   ========================================================= */

DECLARE @AdminRoleId INT;
DECLARE @ManagerRoleId INT;
DECLARE @VisibilityAdminEmployeeId INT;
DECLARE @VisibilityManagerEmployeeId INT;

SELECT @AdminRoleId = RoleId
FROM dbo.Roles
WHERE RoleName = 'Admin';

SELECT @ManagerRoleId = RoleId
FROM dbo.Roles
WHERE RoleName = 'Manager';

IF @AdminRoleId IS NULL
BEGIN
    THROW 51000, 'Admin role was not found in dbo.Roles', 1;
END;

IF @ManagerRoleId IS NULL
BEGIN
    THROW 51001, 'Manager role was not found in dbo.Roles', 1;
END;

IF EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'visibility.admin@wonderland.local')
BEGIN
    UPDATE dbo.Employees
    SET
        FirstName = 'Visibility',
        LastName = 'Admin',
        DateOfBirth = '1986-03-03',
        IsActive = 1,
        IsRegistered = 0,
        RegisteredUserId = NULL,
        RegisteredAt = NULL,
        UpdatedAt = SYSDATETIME()
    WHERE Email = 'visibility.admin@wonderland.local';
END
ELSE
BEGIN
    INSERT INTO dbo.Employees
        (
            FirstName,
            LastName,
            Email,
            DateOfBirth,
            IsActive,
            IsRegistered,
            RegisteredUserId,
            RegisteredAt,
            CreatedAt,
            UpdatedAt
        )
    VALUES
        (
            'Visibility',
            'Admin',
            'visibility.admin@wonderland.local',
            '1986-03-03',
            1,
            0,
            NULL,
            NULL,
            SYSDATETIME(),
            SYSDATETIME()
        );
END;

IF EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'visibility.manager@wonderland.local')
BEGIN
    UPDATE dbo.Employees
    SET
        FirstName = 'Visibility',
        LastName = 'Manager',
        DateOfBirth = '1989-08-08',
        IsActive = 1,
        IsRegistered = 0,
        RegisteredUserId = NULL,
        RegisteredAt = NULL,
        UpdatedAt = SYSDATETIME()
    WHERE Email = 'visibility.manager@wonderland.local';
END
ELSE
BEGIN
    INSERT INTO dbo.Employees
        (
            FirstName,
            LastName,
            Email,
            DateOfBirth,
            IsActive,
            IsRegistered,
            RegisteredUserId,
            RegisteredAt,
            CreatedAt,
            UpdatedAt
        )
    VALUES
        (
            'Visibility',
            'Manager',
            'visibility.manager@wonderland.local',
            '1989-08-08',
            1,
            0,
            NULL,
            NULL,
            SYSDATETIME(),
            SYSDATETIME()
        );
END;

SELECT @VisibilityAdminEmployeeId = EmployeeId
FROM dbo.Employees
WHERE Email = 'visibility.admin@wonderland.local';

SELECT @VisibilityManagerEmployeeId = EmployeeId
FROM dbo.Employees
WHERE Email = 'visibility.manager@wonderland.local';

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles
    WHERE EmployeeId = @VisibilityAdminEmployeeId
      AND RoleId = @AdminRoleId
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    VALUES (@VisibilityAdminEmployeeId, @AdminRoleId);
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles
    WHERE EmployeeId = @VisibilityManagerEmployeeId
      AND RoleId = @ManagerRoleId
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    VALUES (@VisibilityManagerEmployeeId, @ManagerRoleId);
END;

SELECT
    e.Email,
    e.DateOfBirth,
    e.IsActive,
    e.IsRegistered,
    e.RegisteredUserId,
    e.RegisteredAt,
    r.RoleName
FROM dbo.Employees e
INNER JOIN dbo.EmployeeRoles er ON er.EmployeeId = e.EmployeeId
INNER JOIN dbo.Roles r ON r.RoleId = er.RoleId
WHERE e.Email IN (
    'visibility.admin@wonderland.local',
    'visibility.manager@wonderland.local'
);

SELECT 'Iteration 10 booking visibility test employees migration completed successfully' AS Message;
GO
