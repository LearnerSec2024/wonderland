USE WonderlandDB;
GO

/* =========================================================
   Rides Eligibility / Family Friendly Schema Fix
   Safe to run multiple times.

   Adds dbo.Rides columns expected by the rides API:
   - IsFamilyFriendly
   - MinimumAgeYears
   - RequiresAdultSupervision
   ========================================================= */

IF COL_LENGTH('dbo.Rides', 'IsFamilyFriendly') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD IsFamilyFriendly BIT NOT NULL
        CONSTRAINT DF_Rides_IsFamilyFriendly DEFAULT 0;
END
GO

IF COL_LENGTH('dbo.Rides', 'MinimumAgeYears') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD MinimumAgeYears INT NOT NULL
        CONSTRAINT DF_Rides_MinimumAgeYears DEFAULT 0;
END
GO

IF COL_LENGTH('dbo.Rides', 'RequiresAdultSupervision') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD RequiresAdultSupervision BIT NOT NULL
        CONSTRAINT DF_Rides_RequiresAdultSupervision DEFAULT 0;
END
GO

UPDATE dbo.Rides
SET
    IsFamilyFriendly = CASE
        WHEN Name IN ('Enchanted Carousel', 'Pirate Splash Falls', 'Galaxy Spinner') THEN 1
        ELSE 0
    END,
    MinimumAgeYears = CASE
        WHEN Name = 'Dragon Rush Coaster' THEN 13
        WHEN Name = 'Pirate Splash Falls' THEN 8
        WHEN Name = 'Galaxy Spinner' THEN 10
        WHEN Name = 'Enchanted Carousel' THEN 3
        ELSE 0
    END,
    RequiresAdultSupervision = CASE
        WHEN Name IN ('Enchanted Carousel', 'Pirate Splash Falls') THEN 1
        ELSE 0
    END;
GO

SELECT
    'dbo.Rides' AS TableName,
    COL_LENGTH('dbo.Rides', 'IsFamilyFriendly') AS IsFamilyFriendlyColumn,
    COL_LENGTH('dbo.Rides', 'MinimumAgeYears') AS MinimumAgeYearsColumn,
    COL_LENGTH('dbo.Rides', 'RequiresAdultSupervision') AS RequiresAdultSupervisionColumn;

SELECT
    RideId,
    Name,
    IsActive,
    IsFamilyFriendly,
    MinimumAgeYears,
    RequiresAdultSupervision
FROM dbo.Rides
ORDER BY RideId;

SELECT 'Rides eligibility / family friendly schema migration completed successfully' AS Message;
GO

