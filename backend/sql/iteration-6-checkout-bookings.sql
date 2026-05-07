USE WonderlandDB;
GO

/* =========================================================
   Iteration 6: Checkout and Booking Confirmation
   Safe to run multiple times.
   ========================================================= */

IF OBJECT_ID('dbo.BookingItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BookingItems
    (
        BookingItemId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_BookingItems PRIMARY KEY,
        BookingId INT NOT NULL,
        ItemType NVARCHAR(50) NOT NULL,
        RideId INT NULL,
        AccommodationId INT NULL,
        ItemName NVARCHAR(200) NOT NULL,
        UnitPrice DECIMAL(10,2) NOT NULL,
        Quantity INT NULL,
        GuestCount INT NULL,
        Subtotal DECIMAL(10,2) NOT NULL,
        PointsEarned INT NOT NULL CONSTRAINT DF_BookingItems_PointsEarned DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_BookingItems_CreatedAt DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.Bookings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Bookings
    (
        BookingId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Bookings PRIMARY KEY,
        BookingReference NVARCHAR(50) NOT NULL CONSTRAINT UQ_Bookings_BookingReference UNIQUE,
        UserId INT NOT NULL,
        Status NVARCHAR(50) NOT NULL CONSTRAINT DF_Bookings_Status DEFAULT 'Confirmed',
        BasketItemCount INT NOT NULL,
        TotalAmount DECIMAL(10,2) NOT NULL,
        TotalPointsEarned INT NOT NULL CONSTRAINT DF_Bookings_TotalPointsEarned DEFAULT 0,
        VisitDate DATE NULL,
        CustomerNotes NVARCHAR(1000) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT SYSDATETIME()
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_BookingItems_Bookings'
)
BEGIN
    ALTER TABLE dbo.BookingItems
    ADD CONSTRAINT FK_BookingItems_Bookings
    FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(BookingId);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Bookings_Users'
)
BEGIN
    ALTER TABLE dbo.Bookings
    ADD CONSTRAINT FK_Bookings_Users
    FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId);
END
GO

SELECT 'Iteration 6 checkout and booking migration completed successfully' AS Message;
GO
