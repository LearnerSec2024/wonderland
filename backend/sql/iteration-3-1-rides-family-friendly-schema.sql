USE WonderlandDB;
GO

/* =========================================================
   Iteration 3.1: Rides Family Friendly Schema
   Safe to run multiple times.

   Adds dbo.Rides.IsFamilyFriendly used by the rides API/listing UI.
   ========================================================= */

IF COL_LENGTH('dbo.Rides', 'IsFamilyFriendly') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD IsFamilyFriendly BIT NOT NULL
        CONSTRAINT DF_Rides_IsFamilyFriendly DEFAULT 0;
END
GO

UPDATE dbo.Rides
SET IsFamilyFriendly = CASE
    WHEN Name IN ('Enchanted Carousel', 'Pirate Splash Falls', 'Galaxy Spinner') THEN 1
    ELSE 0
END
WHERE IsFamilyFriendly IS NOT NULL;
GO

SELECT
    'dbo.Rides' AS TableName,
    COL_LENGTH('dbo.Rides', 'IsFamilyFriendly') AS IsFamilyFriendlyColumn;

SELECT
    RideId,
    Name,
    IsFamilyFriendly
FROM dbo.Rides
ORDER BY RideId;

SELECT 'Iteration 3.1 rides family friendly schema migration completed successfully' AS Message;
GO
