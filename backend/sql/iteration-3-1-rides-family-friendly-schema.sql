USE WonderlandDB;
GO

/* =========================================================
   Rides Family Friendly Schema Fix
   Safe to run multiple times.

   Adds dbo.Rides.IsFamilyFriendly because the rides API expects it.
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
END;
GO

SELECT
    'dbo.Rides' AS TableName,
    COL_LENGTH('dbo.Rides', 'IsFamilyFriendly') AS IsFamilyFriendlyColumn;

SELECT
    RideId,
    Name,
    IsActive,
    IsFamilyFriendly
FROM dbo.Rides
ORDER BY RideId;

SELECT 'Rides family friendly schema migration completed successfully' AS Message;
GO
