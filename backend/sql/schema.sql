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
