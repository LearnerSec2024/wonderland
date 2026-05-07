require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { sql, getPool } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminContentRoutes = require("./routes/adminContentRoutes");
const managerApprovalRoutes = require("./routes/managerApprovalRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const testSupportRoutes = require("./routes/testSupportRoutes");

const app = express();

const PORT = process.env.PORT || 5010;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminContentRoutes);
app.use("/api/manager", managerApprovalRoutes);
app.use("/api/bookings", bookingRoutes);

if (process.env.ENABLE_TEST_SUPPORT === "true") {
  app.use("/api/test-support", testSupportRoutes);
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Wonderland backend API is running",
  });
});

app.get("/api/test-db", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS DatabaseName,
        COUNT(*) AS RideCount
      FROM dbo.Rides;
    `);

    res.json({
      message: "Database connection is working",
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/rides", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        RideId,
        Name,
        Description,
        Category,
        ThrillLevel,
        MinimumHeightCm,
        MinimumAgeYears,
        RequiresAdultSupervision,
        Price,
        PointsEarned,
        ImageUrl
      FROM dbo.Rides
      WHERE IsActive = 1
        AND ApprovalStatus = 'Approved'
      ORDER BY RideId;
    `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

app.get("/api/rides/:rideId", async (req, res, next) => {
  try {
    const rideId = Number(req.params.rideId);

    if (!Number.isInteger(rideId) || rideId <= 0) {
      return res.status(400).json({
        message: "Ride id must be a positive number",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("RideId", sql.Int, rideId)
      .query(`
        SELECT
          RideId,
          Name,
          Description,
          Category,
          ThrillLevel,
          MinimumHeightCm,
          MinimumAgeYears,
          RequiresAdultSupervision,
          Price,
          PointsEarned,
          ImageUrl
        FROM dbo.Rides
        WHERE RideId = @RideId
          AND IsActive = 1
          AND ApprovalStatus = 'Approved';
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/accommodations", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        AccommodationId,
        Name,
        Description,
        Type,
        PricePerNight,
        MaxGuests,
        MinimumLeadGuestAgeYears,
        IsFamilyFriendly,
        ImageUrl
      FROM dbo.Accommodations
      WHERE IsActive = 1
        AND ApprovalStatus = 'Approved'
      ORDER BY AccommodationId;
    `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

app.get("/api/accommodations/:accommodationId", async (req, res, next) => {
  try {
    const accommodationId = Number(req.params.accommodationId);

    if (!Number.isInteger(accommodationId) || accommodationId <= 0) {
      return res.status(400).json({
        message: "Accommodation id must be a positive number",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("AccommodationId", sql.Int, accommodationId)
      .query(`
        SELECT
          AccommodationId,
          Name,
          Description,
          Type,
          PricePerNight,
          MaxGuests,
          MinimumLeadGuestAgeYears,
          IsFamilyFriendly,
          ImageUrl
        FROM dbo.Accommodations
        WHERE AccommodationId = @AccommodationId
          AND IsActive = 1
          AND ApprovalStatus = 'Approved';
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Accommodation not found",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Wonderland backend running on http://localhost:${PORT}`);
});

