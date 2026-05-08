USE WonderlandDB;
GO

/* =========================================================
   Iteration 11: Admin/Manager Reporting and Audit Preparation
   Safe to run multiple times.
   ========================================================= */

IF OBJECT_ID('dbo.BookingAuditEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BookingAuditEvents
    (
        BookingAuditEventId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_BookingAuditEvents PRIMARY KEY,
        BookingId INT NOT NULL,
        BookingReference NVARCHAR(50) NOT NULL,
        EventType NVARCHAR(100) NOT NULL,
        OldStatus NVARCHAR(50) NULL,
        NewStatus NVARCHAR(50) NULL,
        EventSummary NVARCHAR(1000) NOT NULL,
        PerformedByUserId INT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_BookingAuditEvents_CreatedAt DEFAULT SYSDATETIME()
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BookingAuditEvents_Bookings'
)
BEGIN
    ALTER TABLE dbo.BookingAuditEvents
    ADD CONSTRAINT FK_BookingAuditEvents_Bookings
    FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(BookingId);
END
GO

CREATE OR ALTER TRIGGER dbo.TR_Bookings_Audit_Insert
ON dbo.Bookings
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.BookingAuditEvents
        (
            BookingId,
            BookingReference,
            EventType,
            OldStatus,
            NewStatus,
            EventSummary,
            PerformedByUserId,
            CreatedAt
        )
    SELECT
        i.BookingId,
        i.BookingReference,
        'BookingCreated',
        NULL,
        i.Status,
        CONCAT('Booking ', i.BookingReference, ' created with status ', i.Status),
        i.UserId,
        SYSDATETIME()
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.BookingAuditEvents existing
        WHERE existing.BookingId = i.BookingId
          AND existing.EventType = 'BookingCreated'
    );
END
GO

CREATE OR ALTER TRIGGER dbo.TR_Bookings_Audit_StatusUpdate
ON dbo.Bookings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(Status)
    BEGIN
        INSERT INTO dbo.BookingAuditEvents
            (
                BookingId,
                BookingReference,
                EventType,
                OldStatus,
                NewStatus,
                EventSummary,
                PerformedByUserId,
                CreatedAt
            )
        SELECT
            i.BookingId,
            i.BookingReference,
            CASE
                WHEN i.Status = 'Cancelled' THEN 'BookingCancelled'
                ELSE 'BookingStatusChanged'
            END,
            d.Status,
            i.Status,
            CASE
                WHEN i.Status = 'Cancelled'
                    THEN CONCAT('Booking ', i.BookingReference, ' cancelled. Reason: ', COALESCE(i.CancellationReason, 'No reason provided'))
                ELSE CONCAT('Booking ', i.BookingReference, ' status changed from ', d.Status, ' to ', i.Status)
            END,
            i.UserId,
            SYSDATETIME()
        FROM inserted i
        INNER JOIN deleted d ON d.BookingId = i.BookingId
        WHERE ISNULL(i.Status, '') <> ISNULL(d.Status, '');
    END
END
GO

/* Backfill created events for existing bookings */
INSERT INTO dbo.BookingAuditEvents
    (
        BookingId,
        BookingReference,
        EventType,
        OldStatus,
        NewStatus,
        EventSummary,
        PerformedByUserId,
        CreatedAt
    )
SELECT
    b.BookingId,
    b.BookingReference,
    'BookingCreated',
    NULL,
    b.Status,
    CONCAT('Booking ', b.BookingReference, ' created with status ', b.Status),
    b.UserId,
    b.CreatedAt
FROM dbo.Bookings b
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.BookingAuditEvents existing
    WHERE existing.BookingId = b.BookingId
      AND existing.EventType = 'BookingCreated'
);
GO

/* Backfill cancellation events for existing cancelled bookings */
INSERT INTO dbo.BookingAuditEvents
    (
        BookingId,
        BookingReference,
        EventType,
        OldStatus,
        NewStatus,
        EventSummary,
        PerformedByUserId,
        CreatedAt
    )
SELECT
    b.BookingId,
    b.BookingReference,
    'BookingCancelled',
    'Confirmed',
    'Cancelled',
    CONCAT('Booking ', b.BookingReference, ' cancelled. Reason: ', COALESCE(b.CancellationReason, 'No reason provided')),
    b.UserId,
    COALESCE(b.CancelledAt, b.CreatedAt)
FROM dbo.Bookings b
WHERE b.Status = 'Cancelled'
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.BookingAuditEvents existing
      WHERE existing.BookingId = b.BookingId
        AND existing.EventType = 'BookingCancelled'
  );
GO

/* Dedicated reporting test employees */
DECLARE @AdminRoleId INT;
DECLARE @ManagerRoleId INT;
DECLARE @ReportingAdminEmployeeId INT;
DECLARE @ReportingManagerEmployeeId INT;

SELECT @AdminRoleId = RoleId FROM dbo.Roles WHERE RoleName = 'Admin';
SELECT @ManagerRoleId = RoleId FROM dbo.Roles WHERE RoleName = 'Manager';

IF @AdminRoleId IS NULL
BEGIN
    THROW 51100, 'Admin role was not found in dbo.Roles', 1;
END;

IF @ManagerRoleId IS NULL
BEGIN
    THROW 51101, 'Manager role was not found in dbo.Roles', 1;
END;

IF EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'reporting.admin@wonderland.local')
BEGIN
    UPDATE dbo.Employees
    SET
        FirstName = 'Reporting',
        LastName = 'Admin',
        DateOfBirth = '1985-05-05',
        IsActive = 1,
        IsRegistered = 0,
        RegisteredUserId = NULL,
        RegisteredAt = NULL,
        UpdatedAt = SYSDATETIME()
    WHERE Email = 'reporting.admin@wonderland.local';
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
            'Reporting',
            'Admin',
            'reporting.admin@wonderland.local',
            '1985-05-05',
            1,
            0,
            NULL,
            NULL,
            SYSDATETIME(),
            SYSDATETIME()
        );
END;

IF EXISTS (SELECT 1 FROM dbo.Employees WHERE Email = 'reporting.manager@wonderland.local')
BEGIN
    UPDATE dbo.Employees
    SET
        FirstName = 'Reporting',
        LastName = 'Manager',
        DateOfBirth = '1988-08-08',
        IsActive = 1,
        IsRegistered = 0,
        RegisteredUserId = NULL,
        RegisteredAt = NULL,
        UpdatedAt = SYSDATETIME()
    WHERE Email = 'reporting.manager@wonderland.local';
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
            'Reporting',
            'Manager',
            'reporting.manager@wonderland.local',
            '1988-08-08',
            1,
            0,
            NULL,
            NULL,
            SYSDATETIME(),
            SYSDATETIME()
        );
END;

SELECT @ReportingAdminEmployeeId = EmployeeId
FROM dbo.Employees
WHERE Email = 'reporting.admin@wonderland.local';

SELECT @ReportingManagerEmployeeId = EmployeeId
FROM dbo.Employees
WHERE Email = 'reporting.manager@wonderland.local';

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles
    WHERE EmployeeId = @ReportingAdminEmployeeId
      AND RoleId = @AdminRoleId
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    VALUES (@ReportingAdminEmployeeId, @AdminRoleId);
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.EmployeeRoles
    WHERE EmployeeId = @ReportingManagerEmployeeId
      AND RoleId = @ManagerRoleId
)
BEGIN
    INSERT INTO dbo.EmployeeRoles (EmployeeId, RoleId)
    VALUES (@ReportingManagerEmployeeId, @ManagerRoleId);
END;

SELECT
    e.Email,
    e.DateOfBirth,
    e.IsActive,
    e.IsRegistered,
    r.RoleName
FROM dbo.Employees e
INNER JOIN dbo.EmployeeRoles er ON er.EmployeeId = e.EmployeeId
INNER JOIN dbo.Roles r ON r.RoleId = er.RoleId
WHERE e.Email IN (
    'reporting.admin@wonderland.local',
    'reporting.manager@wonderland.local'
);

SELECT 'Iteration 11 reporting and audit preparation migration completed successfully' AS Message;
GO
