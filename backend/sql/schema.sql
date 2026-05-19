USE WonderlandDB;
GO

IF OBJECT_ID('dbo.PointsLedger', 'U') IS NOT NULL DROP TABLE dbo.PointsLedger;
IF OBJECT_ID('dbo.RideBookings', 'U') IS NOT NULL DROP TABLE dbo.RideBookings;
IF OBJECT_ID('dbo.AccommodationBookings', 'U') IS NOT NULL DROP TABLE dbo.AccommodationBookings;
IF OBJECT_ID('dbo.Rides', 'U') IS NOT NULL DROP TABLE dbo.Rides;
IF OBJECT_ID('dbo.Accommodations', 'U') IS NOT NULL DROP TABLE dbo.Accommodations;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'User',
    TotalPoints INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL
);
GO

CREATE TABLE dbo.Rides (
    RideId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    ThrillLevel NVARCHAR(50) NOT NULL,
    MinimumHeightCm INT NULL,
    Price DECIMAL(10,2) NOT NULL DEFAULT 0,
    PointsEarned INT NOT NULL DEFAULT 0,
    ImageUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.Accommodations (
    AccommodationId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Type NVARCHAR(100) NOT NULL,
    PricePerNight DECIMAL(10,2) NOT NULL,
    MaxGuests INT NOT NULL,
    ImageUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.RideBookings (
    RideBookingId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RideId INT NOT NULL,
    RideDate DATE NOT NULL,
    RideTime TIME NOT NULL,
    NumberOfGuests INT NOT NULL DEFAULT 1,
    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    BookingStatus NVARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_RideBookings_Users 
        FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),

    CONSTRAINT FK_RideBookings_Rides 
        FOREIGN KEY (RideId) REFERENCES dbo.Rides(RideId)
);
GO

CREATE TABLE dbo.AccommodationBookings (
    AccommodationBookingId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AccommodationId INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    Guests INT NOT NULL DEFAULT 1,
    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    BookingStatus NVARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_AccommodationBookings_Users 
        FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),

    CONSTRAINT FK_AccommodationBookings_Accommodations 
        FOREIGN KEY (AccommodationId) REFERENCES dbo.Accommodations(AccommodationId)
);
GO

CREATE TABLE dbo.PointsLedger (
    PointsLedgerId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    SourceType NVARCHAR(100) NOT NULL,
    SourceId INT NULL,
    Points INT NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL,
    Description NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_PointsLedger_Users 
        FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

SELECT 'WonderlandDB schema created successfully' AS Message;
GO

USE WonderlandDB;
GO

IF OBJECT_ID('dbo.ApplicationAuditEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ApplicationAuditEvents
    (
        ApplicationAuditEventId INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_ApplicationAuditEvents PRIMARY KEY,

        EventCategory NVARCHAR(100) NOT NULL,
        EventType NVARCHAR(150) NOT NULL,

        ActorUserId INT NULL,
        ActorRole NVARCHAR(50) NULL,
        ActorEmail NVARCHAR(256) NULL,

        TargetEntityType NVARCHAR(100) NULL,
        TargetEntityId INT NULL,
        TargetEntityReference NVARCHAR(150) NULL,

        ActionStatus NVARCHAR(50) NOT NULL
            CONSTRAINT DF_ApplicationAuditEvents_ActionStatus DEFAULT ('Succeeded'),

        EventSummary NVARCHAR(1000) NOT NULL,
        DetailsJson NVARCHAR(MAX) NULL,

        RequestMethod NVARCHAR(20) NULL,
        RequestPath NVARCHAR(500) NULL,
        IpAddress NVARCHAR(100) NULL,
        UserAgent NVARCHAR(1000) NULL,

        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_ApplicationAuditEvents_CreatedAt DEFAULT SYSDATETIME()
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_CreatedAt'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_CreatedAt
    ON dbo.ApplicationAuditEvents (CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_EventType'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_EventType
    ON dbo.ApplicationAuditEvents (EventType, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_ActorUserId'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_ActorUserId
    ON dbo.ApplicationAuditEvents (ActorUserId, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ApplicationAuditEvents_Target'
      AND object_id = OBJECT_ID('dbo.ApplicationAuditEvents')
)
BEGIN
    CREATE INDEX IX_ApplicationAuditEvents_Target
    ON dbo.ApplicationAuditEvents (TargetEntityType, TargetEntityId, CreatedAt DESC);
END;
GO
