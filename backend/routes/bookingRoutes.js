const express = require('express');

const { sql, getPool } = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

function calculateAccommodationPricing(unitPrice, guestCount) {
  const basePrice = Number(unitPrice || 0);
  const safeGuestCount = Math.max(1, Number(guestCount || 1));
  const guestSurchargeRates = [0.5, 0.25, 0.25, 0.1];

  const surcharge = guestSurchargeRates.reduce((total, rate, index) => {
    const guestNumber = index + 1;

    if (safeGuestCount >= guestNumber) {
      return total + basePrice * rate;
    }

    return total;
  }, 0);

  return {
    basePrice,
    surcharge,
    subtotal: basePrice + surcharge,
  };
}

function makeBookingReference(userId) {
  return `WB-${Date.now()}-${userId}`;
}

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
    itemId: row.ItemType === 'ride' ? row.RideId : row.AccommodationId,
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

async function getBookingItems(poolOrTransaction, bookingId) {
  const request =
    poolOrTransaction instanceof sql.Transaction ? new sql.Request(poolOrTransaction) : poolOrTransaction.request();

  const result = await request.input('BookingId', sql.Int, bookingId).query(`
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

router.get('/my', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().input('UserId', sql.Int, req.user.userId).query(`
        SELECT TOP 20
          BookingId,
          BookingReference,
          UserId,
          Status,
          BasketItemCount,
          TotalAmount,
          TotalPointsEarned,
          VisitDate,
          CustomerNotes,
          CreatedAt,
          CancelledAt,
          CancellationReason
        FROM dbo.Bookings
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC;
      `);

    res.json({
      bookings: result.recordset.map((row) => mapBookingRow(row)),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:bookingReference', async (req, res, next) => {
  try {
    const pool = await getPool();

    const bookingResult = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('BookingReference', sql.NVarChar(50), req.params.bookingReference).query(`
        SELECT
          BookingId,
          BookingReference,
          UserId,
          Status,
          BasketItemCount,
          TotalAmount,
          TotalPointsEarned,
          VisitDate,
          CustomerNotes,
          CreatedAt,
          CancelledAt,
          CancellationReason
        FROM dbo.Bookings
        WHERE UserId = @UserId
          AND BookingReference = @BookingReference;
      `);

    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({
        message: 'Booking not found',
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

router.post('/:bookingReference/cancel', async (req, res, next) => {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const cancellationReason = req.body?.cancellationReason || 'Cancelled by customer';

    await transaction.begin();

    const bookingResult = await new sql.Request(transaction)
      .input('UserId', sql.Int, req.user.userId)
      .input('BookingReference', sql.NVarChar(50), req.params.bookingReference).query(`
        SELECT
          BookingId,
          BookingReference,
          UserId,
          Status,
          BasketItemCount,
          TotalAmount,
          TotalPointsEarned,
          VisitDate,
          CustomerNotes,
          CreatedAt,
          CancelledAt,
          CancellationReason
        FROM dbo.Bookings
        WHERE UserId = @UserId
          AND BookingReference = @BookingReference;
      `);

    if (bookingResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    const existingBooking = bookingResult.recordset[0];

    if (existingBooking.Status === 'Cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Booking is already cancelled',
      });
    }

    if (existingBooking.Status !== 'Confirmed') {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Only confirmed bookings can be cancelled',
      });
    }

    const updateResult = await new sql.Request(transaction)
      .input('BookingId', sql.Int, existingBooking.BookingId)
      .input('CancellationReason', sql.NVarChar(1000), cancellationReason).query(`
        DECLARE @UpdatedBooking TABLE
        (
          BookingId INT,
          BookingReference NVARCHAR(50),
          UserId INT,
          Status NVARCHAR(50),
          BasketItemCount INT,
          TotalAmount DECIMAL(10,2),
          TotalPointsEarned INT,
          VisitDate DATE NULL,
          CustomerNotes NVARCHAR(1000) NULL,
          CreatedAt DATETIME2,
          CancelledAt DATETIME2 NULL,
          CancellationReason NVARCHAR(1000) NULL
        );

        UPDATE dbo.Bookings
        SET
          Status = 'Cancelled',
          CancelledAt = SYSDATETIME(),
          CancellationReason = @CancellationReason
        OUTPUT
          INSERTED.BookingId,
          INSERTED.BookingReference,
          INSERTED.UserId,
          INSERTED.Status,
          INSERTED.BasketItemCount,
          INSERTED.TotalAmount,
          INSERTED.TotalPointsEarned,
          INSERTED.VisitDate,
          INSERTED.CustomerNotes,
          INSERTED.CreatedAt,
          INSERTED.CancelledAt,
          INSERTED.CancellationReason
        INTO @UpdatedBooking
        WHERE BookingId = @BookingId;

        SELECT
          BookingId,
          BookingReference,
          UserId,
          Status,
          BasketItemCount,
          TotalAmount,
          TotalPointsEarned,
          VisitDate,
          CustomerNotes,
          CreatedAt,
          CancelledAt,
          CancellationReason
        FROM @UpdatedBooking;
      `);

    if (existingBooking.TotalPointsEarned > 0) {
      await new sql.Request(transaction)
        .input('UserId', sql.Int, req.user.userId)
        .input('TotalPointsEarned', sql.Int, existingBooking.TotalPointsEarned).query(`
          UPDATE dbo.Users
          SET TotalPoints =
            CASE
              WHEN TotalPoints - @TotalPointsEarned < 0 THEN 0
              ELSE TotalPoints - @TotalPointsEarned
            END
          WHERE UserId = @UserId;
        `);
    }

    const updatedBooking = updateResult.recordset[0];
    const items = await getBookingItems(transaction, updatedBooking.BookingId);

    await transaction.commit();

    res.json({
      message: 'Booking cancelled successfully',
      booking: mapBookingRow(updatedBooking, items),
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Ignore rollback failure
    }

    next(error);
  }
});

router.post('/checkout', async (req, res, next) => {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const { items, visitDate = null, customerNotes = null } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Basket must contain at least one item',
      });
    }

    await transaction.begin();

    const normalizedItems = [];

    for (const item of items) {
      if (item.itemType === 'ride') {
        const rideId = Number(item.itemId);
        const quantity = Math.max(1, Number(item.quantity || 1));

        const rideResult = await new sql.Request(transaction).input('RideId', sql.Int, rideId).query(`
            SELECT
              RideId,
              Name,
              Description,
              Price,
              PointsEarned
            FROM dbo.Rides
            WHERE RideId = @RideId
              AND IsActive = 1
              AND ApprovalStatus = 'Approved';
          `);

        if (rideResult.recordset.length === 0) {
          throw new Error(`Ride ${rideId} is not available for checkout`);
        }

        const ride = rideResult.recordset[0];
        const unitPrice = Number(ride.Price);
        const subtotal = unitPrice * quantity;
        const pointsEarned = Number(ride.PointsEarned || 0) * quantity;

        normalizedItems.push({
          itemType: 'ride',
          itemId: ride.RideId,
          rideId: ride.RideId,
          accommodationId: null,
          name: ride.Name,
          unitPrice,
          quantity,
          guestCount: null,
          subtotal,
          pointsEarned,
        });
      } else if (item.itemType === 'accommodation') {
        const accommodationId = Number(item.itemId);
        const requestedGuestCount = Math.max(1, Number(item.guestCount || 1));

        const accommodationResult = await new sql.Request(transaction).input(
          'AccommodationId',
          sql.Int,
          accommodationId,
        ).query(`
            SELECT
              AccommodationId,
              Name,
              Description,
              PricePerNight,
              MaxGuests
            FROM dbo.Accommodations
            WHERE AccommodationId = @AccommodationId
              AND IsActive = 1
              AND ApprovalStatus = 'Approved';
          `);

        if (accommodationResult.recordset.length === 0) {
          throw new Error(`Accommodation ${accommodationId} is not available for checkout`);
        }

        const accommodation = accommodationResult.recordset[0];
        const maxGuests = Number(accommodation.MaxGuests || 1);
        const guestCount = Math.min(maxGuests, requestedGuestCount);
        const unitPrice = Number(accommodation.PricePerNight);
        const pricing = calculateAccommodationPricing(unitPrice, guestCount);

        normalizedItems.push({
          itemType: 'accommodation',
          itemId: accommodation.AccommodationId,
          rideId: null,
          accommodationId: accommodation.AccommodationId,
          name: accommodation.Name,
          unitPrice,
          quantity: null,
          guestCount,
          subtotal: pricing.subtotal,
          pointsEarned: 0,
        });
      } else {
        throw new Error('Basket item type must be ride or accommodation');
      }
    }

    const totalAmount = normalizedItems.reduce((total, item) => total + item.subtotal, 0);
    const totalPointsEarned = normalizedItems.reduce((total, item) => total + item.pointsEarned, 0);
    const basketItemCount = normalizedItems.reduce((total, item) => {
      if (item.itemType === 'ride') return total + item.quantity;
      return total + 1;
    }, 0);

    const bookingReference = makeBookingReference(req.user.userId);

    const bookingResult = await new sql.Request(transaction)
      .input('BookingReference', sql.NVarChar(50), bookingReference)
      .input('UserId', sql.Int, req.user.userId)
      .input('BasketItemCount', sql.Int, basketItemCount)
      .input('TotalAmount', sql.Decimal(10, 2), totalAmount)
      .input('TotalPointsEarned', sql.Int, totalPointsEarned)
      .input('VisitDate', sql.Date, visitDate || null)
      .input('CustomerNotes', sql.NVarChar(1000), customerNotes || null).query(`
        DECLARE @InsertedBooking TABLE
        (
          BookingId INT,
          BookingReference NVARCHAR(50),
          UserId INT,
          Status NVARCHAR(50),
          BasketItemCount INT,
          TotalAmount DECIMAL(10,2),
          TotalPointsEarned INT,
          VisitDate DATE NULL,
          CustomerNotes NVARCHAR(1000) NULL,
          CreatedAt DATETIME2,
          CancelledAt DATETIME2 NULL,
          CancellationReason NVARCHAR(1000) NULL
        );

        INSERT INTO dbo.Bookings
          (
            BookingReference,
            UserId,
            Status,
            BasketItemCount,
            TotalAmount,
            TotalPointsEarned,
            VisitDate,
            CustomerNotes
          )
        OUTPUT
          INSERTED.BookingId,
          INSERTED.BookingReference,
          INSERTED.UserId,
          INSERTED.Status,
          INSERTED.BasketItemCount,
          INSERTED.TotalAmount,
          INSERTED.TotalPointsEarned,
          INSERTED.VisitDate,
          INSERTED.CustomerNotes,
          INSERTED.CreatedAt,
          INSERTED.CancelledAt,
          INSERTED.CancellationReason
        INTO @InsertedBooking
        VALUES
          (
            @BookingReference,
            @UserId,
            'Confirmed',
            @BasketItemCount,
            @TotalAmount,
            @TotalPointsEarned,
            @VisitDate,
            @CustomerNotes
          );

        SELECT
          BookingId,
          BookingReference,
          UserId,
          Status,
          BasketItemCount,
          TotalAmount,
          TotalPointsEarned,
          VisitDate,
          CustomerNotes,
          CreatedAt,
          CancelledAt,
          CancellationReason
        FROM @InsertedBooking;
      `);

    const booking = bookingResult.recordset[0];

    for (const item of normalizedItems) {
      await new sql.Request(transaction)
        .input('BookingId', sql.Int, booking.BookingId)
        .input('ItemType', sql.NVarChar(50), item.itemType)
        .input('RideId', sql.Int, item.rideId)
        .input('AccommodationId', sql.Int, item.accommodationId)
        .input('ItemName', sql.NVarChar(200), item.name)
        .input('UnitPrice', sql.Decimal(10, 2), item.unitPrice)
        .input('Quantity', sql.Int, item.quantity)
        .input('GuestCount', sql.Int, item.guestCount)
        .input('Subtotal', sql.Decimal(10, 2), item.subtotal)
        .input('PointsEarned', sql.Int, item.pointsEarned).query(`
          INSERT INTO dbo.BookingItems
            (
              BookingId,
              ItemType,
              RideId,
              AccommodationId,
              ItemName,
              UnitPrice,
              Quantity,
              GuestCount,
              Subtotal,
              PointsEarned
            )
          VALUES
            (
              @BookingId,
              @ItemType,
              @RideId,
              @AccommodationId,
              @ItemName,
              @UnitPrice,
              @Quantity,
              @GuestCount,
              @Subtotal,
              @PointsEarned
            );
        `);
    }

    if (totalPointsEarned > 0) {
      await new sql.Request(transaction)
        .input('UserId', sql.Int, req.user.userId)
        .input('TotalPointsEarned', sql.Int, totalPointsEarned).query(`
          UPDATE dbo.Users
          SET TotalPoints = TotalPoints + @TotalPointsEarned
          WHERE UserId = @UserId;
        `);
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: mapBookingRow(booking, normalizedItems),
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Ignore rollback failure
    }

    next(error);
  }
});

module.exports = router;
