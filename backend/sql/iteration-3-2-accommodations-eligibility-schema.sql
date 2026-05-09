USE WonderlandDB;
GO

/* =========================================================
   Accommodations Eligibility / Family Friendly Schema Fix
   Safe to run multiple times.

   Adds dbo.Accommodations columns expected by the accommodations API:
   - IsFamilyFriendly
   - MinimumLeadGuestAgeYears
   ========================================================= */

IF COL_LENGTH('dbo.Accommodations', 'IsFamilyFriendly') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD IsFamilyFriendly BIT NOT NULL
        CONSTRAINT DF_Accommodations_IsFamilyFriendly DEFAULT 1;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'MinimumLeadGuestAgeYears') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD MinimumLeadGuestAgeYears INT NOT NULL
        CONSTRAINT DF_Accommodations_MinimumLeadGuestAgeYears DEFAULT 18;
END
GO

UPDATE dbo.Accommodations
SET
    IsFamilyFriendly = 1,
    MinimumLeadGuestAgeYears = 18;
GO

SELECT
    'dbo.Accommodations' AS TableName,
    COL_LENGTH('dbo.Accommodations', 'IsFamilyFriendly') AS IsFamilyFriendlyColumn,
    COL_LENGTH('dbo.Accommodations', 'MinimumLeadGuestAgeYears') AS MinimumLeadGuestAgeYearsColumn;

SELECT
    AccommodationId,
    Name,
    IsActive,
    IsFamilyFriendly,
    MinimumLeadGuestAgeYears
FROM dbo.Accommodations
ORDER BY AccommodationId;

SELECT 'Accommodations eligibility / family friendly schema migration completed successfully' AS Message;
GO
