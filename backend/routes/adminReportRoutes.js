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

function mapAuditEvent(row) {
  return {
    bookingAuditEventId: row.BookingAuditEventId,
    bookingReference: row.BookingReference,
    eventType: row.EventType,
    oldStatus: row.OldStatus,
    newStatus: row.NewStatus,
    eventSummary: row.EventSummary,
    createdAt: toIsoString(row.CreatedAt),
    customerEmail: row.Email,
    customerName: `${row.FirstName || ""} ${row.LastName || ""}`.trim(),
  };
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

    const auditResult = await pool.request().query(`
      SELECT TOP 20
        a.BookingAuditEventId,
        a.BookingReference,
        a.EventType,
        a.OldStatus,
        a.NewStatus,
        a.EventSummary,
        a.CreatedAt,
        u.FirstName,
        u.LastName,
        u.Email
      FROM dbo.BookingAuditEvents a
      INNER JOIN dbo.Bookings b ON b.BookingId = a.BookingId
      INNER JOIN dbo.Users u ON u.UserId = b.UserId
      ORDER BY a.CreatedAt DESC, a.BookingAuditEventId DESC;
    `);

    const summary = summaryResult.recordset[0];

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
      recentAuditEvents: auditResult.recordset.map((row) => mapAuditEvent(row)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
