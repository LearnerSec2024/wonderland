const express = require("express");
const { sql, getPool } = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


const { writeAuditEvent } = require("../services/auditLogger");
const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

const VALID_BOOKING_STATUSES = new Set(["Confirmed", "Cancelled"]);

function toIsoString(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function toDateOnly(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function isValidDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeBookingReportFilters(query) {
  const startDate = query.startDate?.trim() || "";
  const endDate = query.endDate?.trim() || "";
  const status = query.status?.trim() || "";

  if (startDate && !isValidDateOnly(startDate)) {
    return { error: "startDate must use YYYY-MM-DD format" };
  }

  if (endDate && !isValidDateOnly(endDate)) {
    return { error: "endDate must use YYYY-MM-DD format" };
  }

  if (startDate && endDate && startDate > endDate) {
    return { error: "startDate cannot be after endDate" };
  }

  if (status && !VALID_BOOKING_STATUSES.has(status)) {
    return { error: "status must be Confirmed or Cancelled" };
  }

  return {
    filters: {
      startDate,
      endDate,
      status,
    },
  };
}

function buildBookingFilterWhere(request, filters, alias = "b") {
  const clauses = [];
  const dateExpression = `CAST(COALESCE(${alias}.VisitDate, ${alias}.CreatedAt) AS DATE)`;

  if (filters.startDate) {
    request.input("StartDate", sql.Date, filters.startDate);
    clauses.push(`${dateExpression} >= @StartDate`);
  }

  if (filters.endDate) {
    request.input("EndDate", sql.Date, filters.endDate);
    clauses.push(`${dateExpression} <= @EndDate`);
  }

  if (filters.status) {
    request.input("Status", sql.NVarChar(50), filters.status);
    clauses.push(`${alias}.Status = @Status`);
  }

  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
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

async function getBookingReport(pool, filters) {
  const summaryRequest = pool.request();
  const summaryWhere = buildBookingFilterWhere(summaryRequest, filters);

  const summaryResult = await summaryRequest.query(`
    SELECT
      COUNT(*) AS TotalBookings,
      SUM(CASE WHEN b.Status = 'Confirmed' THEN 1 ELSE 0 END) AS ConfirmedBookings,
      SUM(CASE WHEN b.Status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledBookings,
      COALESCE(SUM(b.TotalAmount), 0) AS TotalBookedValue,
      COALESCE(SUM(CASE WHEN b.Status = 'Confirmed' THEN b.TotalAmount ELSE 0 END), 0) AS ConfirmedValue,
      COALESCE(SUM(CASE WHEN b.Status = 'Cancelled' THEN b.TotalAmount ELSE 0 END), 0) AS CancelledValue,
      COALESCE(SUM(b.TotalPointsEarned), 0) AS TotalPointsIssued,
      COALESCE(AVG(CAST(b.TotalAmount AS DECIMAL(10,2))), 0) AS AverageBookingValue
    FROM dbo.Bookings b
    ${summaryWhere};
  `);

  const statusRequest = pool.request();
  const statusWhere = buildBookingFilterWhere(statusRequest, filters);

  const statusResult = await statusRequest.query(`
    SELECT
      b.Status,
      COUNT(*) AS BookingCount,
      COALESCE(SUM(b.TotalAmount), 0) AS TotalAmount
    FROM dbo.Bookings b
    ${statusWhere}
    GROUP BY b.Status
    ORDER BY b.Status;
  `);

  const itemTypeRequest = pool.request();
  const itemTypeWhere = buildBookingFilterWhere(itemTypeRequest, filters);

  const itemTypeResult = await itemTypeRequest.query(`
    SELECT
      bi.ItemType,
      COUNT(*) AS ItemCount,
      COALESCE(SUM(bi.Subtotal), 0) AS TotalAmount,
      COALESCE(SUM(bi.PointsEarned), 0) AS PointsEarned
    FROM dbo.BookingItems bi
    INNER JOIN dbo.Bookings b ON b.BookingId = bi.BookingId
    ${itemTypeWhere}
    GROUP BY bi.ItemType
    ORDER BY bi.ItemType;
  `);

  const dailyActivityRequest = pool.request();
  const dailyActivityWhere = buildBookingFilterWhere(dailyActivityRequest, filters);

  const dailyActivityResult = await dailyActivityRequest.query(`
    SELECT TOP 14
      CAST(b.CreatedAt AS DATE) AS ActivityDate,
      COUNT(*) AS BookingCount,
      COALESCE(SUM(b.TotalAmount), 0) AS TotalAmount
    FROM dbo.Bookings b
    ${dailyActivityWhere}
    GROUP BY CAST(b.CreatedAt AS DATE)
    ORDER BY ActivityDate DESC;
  `);

  const summary = summaryResult.recordset[0];
  const cdcStatus = await getCdcStatus(pool);
  const recentBookingChangeEvents = await getBookingCdcEvents(pool);
  const contentAuditEvents = await getContentAuditEvents(pool);

  return {
    filters,
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
      activityDate: toDateOnly(row.ActivityDate),
      bookingCount: row.BookingCount,
      totalAmount: Number(row.TotalAmount),
    })),
    cdcStatus,
    recentBookingChangeEvents,
    contentAuditEvents,
  };
}

async function getBookingExportRows(pool, filters) {
  const request = pool.request();
  const where = buildBookingFilterWhere(request, filters);

  const result = await request.query(`
    SELECT TOP 500
      b.BookingReference,
      b.Status,
      b.VisitDate,
      b.CreatedAt,
      u.FirstName,
      u.LastName,
      u.Email,
      b.TotalAmount,
      b.TotalPointsEarned,
      b.CancelledAt,
      b.CancellationReason
    FROM dbo.Bookings b
    INNER JOIN dbo.Users u ON u.UserId = b.UserId
    ${where}
    ORDER BY b.CreatedAt DESC, b.BookingId DESC;
  `);

  return result.recordset;
}

function csvValue(value) {
  if (value === null || value === undefined) return "";

  let text = String(value).replace(/\r?\n/g, " ").trim();

  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function buildBookingCsv(rows) {
  const headers = [
    "BookingReference",
    "Status",
    "VisitDate",
    "CreatedAt",
    "CustomerName",
    "CustomerEmail",
    "TotalAmount",
    "TotalPointsEarned",
    "CancelledAt",
    "CancellationReason",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    const customerName = `${row.FirstName || ""} ${row.LastName || ""}`.trim();

    lines.push(
      [
        row.BookingReference,
        row.Status,
        toDateOnly(row.VisitDate),
        toIsoString(row.CreatedAt),
        customerName,
        row.Email,
        Number(row.TotalAmount || 0).toFixed(2),
        row.TotalPointsEarned || 0,
        toIsoString(row.CancelledAt),
        row.CancellationReason || "",
      ]
        .map(csvValue)
        .join(",")
    );
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

router.get("/reports/bookings", async (req, res, next) => {
  try {
    const { filters, error } = normalizeBookingReportFilters(req.query);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const pool = await getPool();
    const report = await getBookingReport(pool, filters);

    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.get("/reports/bookings/export.csv", async (req, res, next) => {
  try {
    const { filters, error } = normalizeBookingReportFilters(req.query);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const pool = await getPool();
    const rows = await getBookingExportRows(pool, filters);

    await writeAuditEvent({
      poolOrTransaction: pool,
      req,
      eventCategory: "Report",
      eventType: "AdminDownloadedBookingCsvReport",
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      actorEmail: req.user.email,
      targetEntityType: "BookingReport",
      targetEntityReference: "wonderland-booking-report.csv",
      eventSummary: "Admin downloaded filtered booking CSV report",
      details: {
        filters,
        exportedRowCount: rows.length,
      },
    });
    const csv = buildBookingCsv(rows);
    const fileDate = getLocalDateStamp();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="wonderland-booking-report-${fileDate}.csv"`
    );

    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
