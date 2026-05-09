USE WonderlandDB;
GO

/* =========================================================
   Iteration 3.7: Content Approval Workflow Schema
   Safe to run multiple times.

   Adds Admin submission / Manager approval fields to:
   - dbo.Rides
   - dbo.Accommodations
   ========================================================= */

IF COL_LENGTH('dbo.Rides', 'ApprovalStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD ApprovalStatus NVARCHAR(50) NOT NULL
        CONSTRAINT DF_Rides_ApprovalStatus DEFAULT 'Approved';
END
GO

IF COL_LENGTH('dbo.Rides', 'SubmittedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD SubmittedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'SubmittedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD SubmittedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'ReviewedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD ReviewedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD ReviewedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Rides', 'RejectionReason') IS NULL
BEGIN
    ALTER TABLE dbo.Rides
    ADD RejectionReason NVARCHAR(500) NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'ApprovalStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD ApprovalStatus NVARCHAR(50) NOT NULL
        CONSTRAINT DF_Accommodations_ApprovalStatus DEFAULT 'Approved';
END
GO

IF COL_LENGTH('dbo.Accommodations', 'SubmittedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD SubmittedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'SubmittedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD SubmittedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'ReviewedByUserId') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD ReviewedByUserId INT NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD ReviewedAt DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.Accommodations', 'RejectionReason') IS NULL
BEGIN
    ALTER TABLE dbo.Accommodations
    ADD RejectionReason NVARCHAR(500) NULL;
END
GO

UPDATE dbo.Rides
SET ApprovalStatus = 'Approved'
WHERE ApprovalStatus IS NULL;

UPDATE dbo.Accommodations
SET ApprovalStatus = 'Approved'
WHERE ApprovalStatus IS NULL;
GO

SELECT
    'dbo.Rides' AS TableName,
    COL_LENGTH('dbo.Rides', 'ApprovalStatus') AS ApprovalStatusColumn,
    COL_LENGTH('dbo.Rides', 'SubmittedByUserId') AS SubmittedByUserIdColumn,
    COL_LENGTH('dbo.Rides', 'ReviewedByUserId') AS ReviewedByUserIdColumn;

SELECT
    'dbo.Accommodations' AS TableName,
    COL_LENGTH('dbo.Accommodations', 'ApprovalStatus') AS ApprovalStatusColumn,
    COL_LENGTH('dbo.Accommodations', 'SubmittedByUserId') AS SubmittedByUserIdColumn,
    COL_LENGTH('dbo.Accommodations', 'ReviewedByUserId') AS ReviewedByUserIdColumn;

SELECT 'Iteration 3.7 content approval schema migration completed successfully' AS Message;
GO
