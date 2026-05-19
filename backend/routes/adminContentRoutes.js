const express = require("express");

const { sql, getPool } = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");


const { writeAuditEvent } = require("../services/auditLogger");
const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

router.get("/submissions", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("UserId", sql.Int, req.user.userId)
      .query(`
        SELECT
          'ride' AS ItemType,
          RideId AS ItemId,
          Name,
          ApprovalStatus,
          SubmittedAt,
          ReviewedAt,
          RejectionReason
        FROM dbo.Rides
        WHERE SubmittedByUserId = @UserId

        UNION ALL

        SELECT
          'accommodation' AS ItemType,
          AccommodationId AS ItemId,
          Name,
          ApprovalStatus,
          SubmittedAt,
          ReviewedAt,
          RejectionReason
        FROM dbo.Accommodations
        WHERE SubmittedByUserId = @UserId

        ORDER BY SubmittedAt DESC;
      `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.post("/rides", async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      thrillLevel,
      minimumHeightCm,
      minimumAgeYears,
      requiresAdultSupervision,
      price,
      pointsEarned,
      imageUrl,
    } = req.body;

    if (!name || !description || !category || !thrillLevel || price === undefined) {
      return res.status(400).json({
        message: "Name, description, category, thrill level and price are required",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("Name", sql.NVarChar(150), name)
      .input("Description", sql.NVarChar(sql.MAX), description)
      .input("Category", sql.NVarChar(100), category)
      .input("ThrillLevel", sql.NVarChar(50), thrillLevel)
      .input("MinimumHeightCm", sql.Int, Number(minimumHeightCm || 0))
      .input("MinimumAgeYears", sql.Int, Number(minimumAgeYears || 0))
      .input("RequiresAdultSupervision", sql.Bit, Boolean(requiresAdultSupervision))
      .input("Price", sql.Decimal(10, 2), Number(price))
      .input("PointsEarned", sql.Int, Number(pointsEarned || 0))
      .input("ImageUrl", sql.NVarChar(500), imageUrl || null)
      .input("SubmittedByUserId", sql.Int, req.user.userId)
      .query(`
        INSERT INTO dbo.Rides
          (
            Name,
            Description,
            Category,
            ThrillLevel,
            MinimumHeightCm,
            MinimumAgeYears,
            RequiresAdultSupervision,
            Price,
            PointsEarned,
            ImageUrl,
            IsActive,
            ApprovalStatus,
            SubmittedByUserId,
            SubmittedAt
          )
        OUTPUT
          INSERTED.RideId,
          INSERTED.Name,
          INSERTED.ApprovalStatus,
          INSERTED.IsActive
        VALUES
          (
            @Name,
            @Description,
            @Category,
            @ThrillLevel,
            @MinimumHeightCm,
            @MinimumAgeYears,
            @RequiresAdultSupervision,
            @Price,
            @PointsEarned,
            @ImageUrl,
            0,
            'PendingApproval',
            @SubmittedByUserId,
            SYSDATETIME()
          );
      `);

    const createdRide = result.recordset[0];

    await writeAuditEvent({
      poolOrTransaction: pool,
      req,
      eventCategory: "Content",
      eventType: "AdminCreatedRide",
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      actorEmail: req.user.email,
      targetEntityType: "Ride",
      targetEntityId: createdRide.RideId,
      targetEntityReference: createdRide.Name,
      eventSummary: `Admin submitted ride "${createdRide.Name}" for manager approval`,
      details: {
        approvalStatus: createdRide.ApprovalStatus,
        isActive: createdRide.IsActive,
      },
    });

    res.status(201).json({
      message: "Ride submitted for manager approval",
      item: createdRide,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/accommodations", async (req, res, next) => {
  try {
    const {
      name,
      description,
      type,
      pricePerNight,
      maxGuests,
      minimumLeadGuestAgeYears,
      isFamilyFriendly,
      imageUrl,
    } = req.body;

    if (!name || !description || !type || pricePerNight === undefined || maxGuests === undefined) {
      return res.status(400).json({
        message: "Name, description, type, price per night and max guests are required",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("Name", sql.NVarChar(150), name)
      .input("Description", sql.NVarChar(sql.MAX), description)
      .input("Type", sql.NVarChar(100), type)
      .input("PricePerNight", sql.Decimal(10, 2), Number(pricePerNight))
      .input("MaxGuests", sql.Int, Number(maxGuests))
      .input("MinimumLeadGuestAgeYears", sql.Int, Number(minimumLeadGuestAgeYears || 18))
      .input("IsFamilyFriendly", sql.Bit, Boolean(isFamilyFriendly))
      .input("ImageUrl", sql.NVarChar(500), imageUrl || null)
      .input("SubmittedByUserId", sql.Int, req.user.userId)
      .query(`
        INSERT INTO dbo.Accommodations
          (
            Name,
            Description,
            Type,
            PricePerNight,
            MaxGuests,
            MinimumLeadGuestAgeYears,
            IsFamilyFriendly,
            ImageUrl,
            IsActive,
            ApprovalStatus,
            SubmittedByUserId,
            SubmittedAt
          )
        OUTPUT
          INSERTED.AccommodationId,
          INSERTED.Name,
          INSERTED.ApprovalStatus,
          INSERTED.IsActive
        VALUES
          (
            @Name,
            @Description,
            @Type,
            @PricePerNight,
            @MaxGuests,
            @MinimumLeadGuestAgeYears,
            @IsFamilyFriendly,
            @ImageUrl,
            0,
            'PendingApproval',
            @SubmittedByUserId,
            SYSDATETIME()
          );
      `);

    const createdAccommodation = result.recordset[0];

    await writeAuditEvent({
      poolOrTransaction: pool,
      req,
      eventCategory: "Content",
      eventType: "AdminCreatedAccommodation",
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      actorEmail: req.user.email,
      targetEntityType: "Accommodation",
      targetEntityId: createdAccommodation.AccommodationId,
      targetEntityReference: createdAccommodation.Name,
      eventSummary: `Admin submitted accommodation "${createdAccommodation.Name}" for manager approval`,
      details: {
        approvalStatus: createdAccommodation.ApprovalStatus,
        isActive: createdAccommodation.IsActive,
      },
    });

    res.status(201).json({
      message: "Accommodation submitted for manager approval",
      item: createdAccommodation,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
