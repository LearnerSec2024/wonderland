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

function toDateOnly(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function mapBookingRow(row, items = []) {
  return {
    bookingId: row.BookingId,
    bookingReference: row.BookingReference,
    userId: row.UserId,
    customerName: `${row.FirstName || ""} ${row.LastName || ""}`.trim(),
    customerEmail: row.Email,
    status: row.Status,
    basketItemCount: row.BasketItemCount,
    totalAmount: Number(row.TotalAmount),
    totalPointsEarned: row.TotalPointsEarned,
    visitDate: toDateOnly(row.VisitDate),
    customerNotes: row.CustomerNotes,
    createdAt: toIsoString(row.CreatedAt),
    cancelledAt: toIsoString(row.CancelledAt),
    cancellationReason: row.CancellationReason,
    items,
  };
}

function mapBookingItemRow(row) {
  return {
    bookingItemId: row.BookingItemId,
    itemType: row.ItemType,
    itemId: row.ItemType === "ride" ? row.RideId : row.AccommodationId,
    rideId: row.RideId,
    accommodationId: row.AccommodationId,
    name: row.ItemName,
    unitPrice: Number(row.UnitPrice),
    quantity: row.Quantity,
    guestCount: row.GuestCount,
    subtotal: Number(row.Subtotal),
    pointsEarned: row.PointsEarned,
  };
}

async function getBookingItems(pool, bookingId) {
  const result = await pool
    .request()
    .input("BookingId", sql.Int, bookingId)
    .query(`
      SELECT
        BookingItemId,
        ItemType,
        RideId,
        AccommodationId,
        ItemName,
        UnitPrice,
        Quantity,
        GuestCount,
        Subtotal,
        PointsEarned
      FROM dbo.BookingItems
      WHERE BookingId = @BookingId
      ORDER BY BookingItemId;
    `);

  return result.recordset.map((row) => mapBookingItemRow(row));
}

router.get("/bookings", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT TOP 100
        b.BookingId,
        b.BookingReference,
        b.UserId,
        u.FirstName,
        u.LastName,
        u.Email,
        b.Status,
        b.BasketItemCount,
        b.TotalAmount,
        b.TotalPointsEarned,
        b.VisitDate,
        b.CustomerNotes,
        b.CreatedAt,
        b.CancelledAt,
        b.CancellationReason
      FROM dbo.Bookings b
      INNER JOIN dbo.Users u ON u.UserId = b.UserId
      ORDER BY b.CreatedAt DESC;
    `);

    res.json({
      bookings: result.recordset.map((row) => mapBookingRow(row)),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings/summary", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS TotalBookings,
        SUM(CASE WHEN Status = 'Confirmed' THEN 1 ELSE 0 END) AS ConfirmedBookings,
        SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledBookings,
        COALESCE(SUM(TotalAmount), 0) AS TotalRevenue,
        COALESCE(SUM(TotalPointsEarned), 0) AS TotalPointsIssued
      FROM dbo.Bookings;
    `);

    const summary = result.recordset[0];

    res.json({
      totalBookings: summary.TotalBookings || 0,
      confirmedBookings: summary.ConfirmedBookings || 0,
      cancelledBookings: summary.CancelledBookings || 0,
      totalRevenue: Number(summary.TotalRevenue || 0),
      totalPointsIssued: Number(summary.TotalPointsIssued || 0),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings/:bookingReference", async (req, res, next) => {
  try {
    const pool = await getPool();

    const bookingResult = await pool
      .request()
      .input("BookingReference", sql.NVarChar(50), req.params.bookingReference)
      .query(`
        SELECT
          b.BookingId,
          b.BookingReference,
          b.UserId,
          u.FirstName,
          u.LastName,
          u.Email,
          b.Status,
          b.BasketItemCount,
          b.TotalAmount,
          b.TotalPointsEarned,
          b.VisitDate,
          b.CustomerNotes,
          b.CreatedAt,
          b.CancelledAt,
          b.CancellationReason
        FROM dbo.Bookings b
        INNER JOIN dbo.Users u ON u.UserId = b.UserId
        WHERE b.BookingReference = @BookingReference;
      `);

    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookingResult.recordset[0];
    const items = await getBookingItems(pool, booking.BookingId);

    res.json({
      booking: mapBookingRow(booking, items),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
