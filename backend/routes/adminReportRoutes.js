const express = require("express");

const { sql, getPool } = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

function toIsoString(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function mapBookingCdcEvent(row) {
  const operationMap = {
    1: "Delete",
    2: "Insert",
    3: "UpdateBefore",
    4: "UpdateAfter",
  };

  const operationName = operationMap[row.Operation] || "Unknown";

  return {
    bookingReference: row.BookingReference,
    operation: operationName,
    status: row.Status,
    totalAmount: Number(row.TotalAmount || 0),
    totalPointsEarned: Number(row.TotalPointsEarned || 0),
    cancelledAt: toIsoString(row.CancelledAt),
    cancellationReason: row.CancellationReason,
    changeTime: toIsoString(row.ChangeTime),
    customerEmail: row.Email,
    customerName: `${row.FirstName || ""} ${row.LastName || ""}`.trim(),
    eventSummary:
      operationName === "Insert"
        ? `CDC captured booking ${row.BookingReference} being created`
        : `CDC captured booking ${row.BookingReference} changing to status ${row.Status}`,
  };
}

function mapContentAuditEvent(row) {
  return {
    contentAuditEventId: row.ContentAuditEventId,
    entityType: row.EntityType,
    entityId: row.EntityId,
    entityName: row.EntityName,
    eventType: row.EventType,
    oldApprovalStatus: row.OldApprovalStatus,
    newApprovalStatus: row.NewApprovalStatus,
    eventSummary: row.EventSummary,
    createdAt: toIsoString(row.CreatedAt),
  };
}

async function getCdcStatus(pool) {
  const result = await pool.request().query(`
    SELECT
      DB_NAME() AS DatabaseName,
      d.is_cdc_enabled AS IsDatabaseCdcEnabled,
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM cdc.change_tables
          WHERE source_object_id = OBJECT_ID('dbo.Bookings')
        )
        THEN 1
        ELSE 0
      END AS IsBookingsCdcEnabled
    FROM sys.databases d
    WHERE d.name = DB_NAME();
  `);

  const row = result.recordset[0];

  return {
    databaseName: row.DatabaseName,
    isDatabaseCdcEnabled: Boolean(row.IsDatabaseCdcEnabled),
    isBookingsCdcEnabled: Boolean(row.IsBookingsCdcEnabled),
    captureInstance: "dbo_Bookings",
  };
}

async function getBookingCdcEvents(pool) {
  const result = await pool.request().query(`
    DECLARE @from_lsn binary(10);
    DECLARE @to_lsn binary(10);

    SET @from_lsn = sys.fn_cdc_get_min_lsn('dbo_Bookings');
    SET @to_lsn = sys.fn_cdc_get_max_lsn();

    IF @from_lsn IS NULL OR @to_lsn IS NULL
    BEGIN
      SELECT TOP 0
        CAST(NULL AS INT) AS Operation,
        CAST(NULL AS DATETIME2) AS ChangeTime,
        CAST(NULL AS NVARCHAR(50)) AS BookingReference,
        CAST(NULL AS INT) AS UserId,
        CAST(NULL AS NVARCHAR(50)) AS Status,
        CAST(NULL AS DECIMAL(10,2)) AS TotalAmount,
        CAST(NULL AS INT) AS TotalPointsEarned,
        CAST(NULL AS DATETIME2) AS CancelledAt,
        CAST(NULL AS NVARCHAR(1000)) AS CancellationReason,
        CAST(NULL AS NVARCHAR(100)) AS FirstName,
        CAST(NULL AS NVARCHAR(100)) AS LastName,
        CAST(NULL AS NVARCHAR(256)) AS Email;
    END
    ELSE
    BEGIN
      SELECT TOP 20
        c.__$operation AS Operation,
        sys.fn_cdc_map_lsn_to_time(c.__$start_lsn) AS ChangeTime,
        c.BookingReference,
        c.UserId,
        c.Status,
        c.TotalAmount,
        c.TotalPointsEarned,
        c.CancelledAt,
        c.CancellationReason,
        u.FirstName,
        u.LastName,
        u.Email
      FROM cdc.fn_cdc_get_all_changes_dbo_Bookings(@from_lsn, @to_lsn, 'all') c
      LEFT JOIN dbo.Users u ON u.UserId = c.UserId
      WHERE c.__$operation IN (2, 4)
      ORDER BY c.__$start_lsn DESC, c.__$seqval DESC;
    END
  `);

  return result.recordset.map((row) => mapBookingCdcEvent(row));
}

async function getContentAuditEvents(pool) {
  const result = await pool.request().query(`
    SELECT TOP 20
      ContentAuditEventId,
      EntityType,
      EntityId,
      EntityName,
      EventType,
      OldApprovalStatus,
      NewApprovalStatus,
      EventSummary,
      CreatedAt
    FROM dbo.ContentAuditEvents
    ORDER BY CreatedAt DESC, ContentAuditEventId DESC;
  `);

  return result.recordset.map((row) => mapContentAuditEvent(row));
}

router.get("/reports/bookings", async (req, res, next) => {
  try {
    const pool = await getPool();

    const summaryResult = await pool.request().query(`
      SELECT
        COUNT(*) AS TotalBookings,
        SUM(CASE WHEN Status = 'Confirmed' THEN 1 ELSE 0 END) AS ConfirmedBookings,
        SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledBookings,
        COALESCE(SUM(TotalAmount), 0) AS TotalBookedValue,
        COALESCE(SUM(CASE WHEN Status = 'Confirmed' THEN TotalAmount ELSE 0 END), 0) AS ConfirmedValue,
        COALESCE(SUM(CASE WHEN Status = 'Cancelled' THEN TotalAmount ELSE 0 END), 0) AS CancelledValue,
        COALESCE(SUM(TotalPointsEarned), 0) AS TotalPointsIssued,
        COALESCE(AVG(CAST(TotalAmount AS DECIMAL(10,2))), 0) AS AverageBookingValue
      FROM dbo.Bookings;
    `);

    const statusResult = await pool.request().query(`
      SELECT
        Status,
        COUNT(*) AS BookingCount,
        COALESCE(SUM(TotalAmount), 0) AS TotalAmount
      FROM dbo.Bookings
      GROUP BY Status
      ORDER BY Status;
    `);

    const itemTypeResult = await pool.request().query(`
      SELECT
        ItemType,
        COUNT(*) AS ItemCount,
        COALESCE(SUM(Subtotal), 0) AS TotalAmount,
        COALESCE(SUM(PointsEarned), 0) AS PointsEarned
      FROM dbo.BookingItems
      GROUP BY ItemType
      ORDER BY ItemType;
    `);

    const dailyActivityResult = await pool.request().query(`
      SELECT TOP 14
        CAST(CreatedAt AS DATE) AS ActivityDate,
        COUNT(*) AS BookingCount,
        COALESCE(SUM(TotalAmount), 0) AS TotalAmount
      FROM dbo.Bookings
      GROUP BY CAST(CreatedAt AS DATE)
      ORDER BY ActivityDate DESC;
    `);

    const summary = summaryResult.recordset[0];

    const cdcStatus = await getCdcStatus(pool);
    const recentBookingChangeEvents = await getBookingCdcEvents(pool);
    const contentAuditEvents = await getContentAuditEvents(pool);

    res.json({
      summary: {
        totalBookings: summary.TotalBookings || 0,
        confirmedBookings: summary.ConfirmedBookings || 0,
        cancelledBookings: summary.CancelledBookings || 0,
        totalBookedValue: Number(summary.TotalBookedValue || 0),
        confirmedValue: Number(summary.ConfirmedValue || 0),
        cancelledValue: Number(summary.CancelledValue || 0),
        totalPointsIssued: Number(summary.TotalPointsIssued || 0),
        averageBookingValue: Number(summary.AverageBookingValue || 0),
      },
      statusBreakdown: statusResult.recordset.map((row) => ({
        status: row.Status,
        bookingCount: row.BookingCount,
        totalAmount: Number(row.TotalAmount),
      })),
      itemTypeBreakdown: itemTypeResult.recordset.map((row) => ({
        itemType: row.ItemType,
        itemCount: row.ItemCount,
        totalAmount: Number(row.TotalAmount),
        pointsEarned: Number(row.PointsEarned),
      })),
      dailyActivity: dailyActivityResult.recordset.map((row) => ({
        activityDate: row.ActivityDate ? new Date(row.ActivityDate).toISOString().slice(0, 10) : null,
        bookingCount: row.BookingCount,
        totalAmount: Number(row.TotalAmount),
      })),
      cdcStatus,
      recentBookingChangeEvents,
      contentAuditEvents,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
