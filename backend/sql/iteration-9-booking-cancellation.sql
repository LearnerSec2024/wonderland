USE WonderlandDB;
GO

/* =========================================================
   Iteration 9: Booking Cancellation Workflow
   Safe to run multiple times.
   ========================================================= */

IF COL_LENGTH('dbo.Bookings', 'CancelledAt') IS NULL
BEGIN
    ALTER TABLE dbo.Bookings
    ADD CancelledAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Bookings', 'CancellationReason') IS NULL
BEGIN
    ALTER TABLE dbo.Bookings
    ADD CancellationReason NVARCHAR(1000) NULL;
END
GO

SELECT 'Iteration 9 booking cancellation migration completed successfully' AS Message;
GO
