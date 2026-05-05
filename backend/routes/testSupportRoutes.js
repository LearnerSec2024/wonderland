const express = require("express");
const { sql, getPool } = require("../config/db");

const router = express.Router();

router.delete("/users/by-email", async (req, res, next) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email query parameter is required",
      });
    }

    const pool = await getPool();

    const users = await pool
      .request()
      .input("Email", sql.NVarChar(255), email)
      .query(`
        SELECT UserId, EmployeeId
        FROM dbo.Users
        WHERE LOWER(Email) = @Email;
      `);

    for (const user of users.recordset) {
      await pool
        .request()
        .input("UserId", sql.Int, user.UserId)
        .query(`
          UPDATE e
          SET
            e.IsRegistered = 0,
            e.RegisteredUserId = NULL,
            e.RegisteredAt = NULL,
            e.UpdatedAt = SYSDATETIME()
          FROM dbo.Employees e
          INNER JOIN dbo.Users u ON u.EmployeeId = e.EmployeeId
          WHERE u.UserId = @UserId;

          DELETE FROM dbo.PointsLedger WHERE UserId = @UserId;
          DELETE FROM dbo.RideBookings WHERE UserId = @UserId;
          DELETE FROM dbo.AccommodationBookings WHERE UserId = @UserId;
          DELETE FROM dbo.Users WHERE UserId = @UserId;
        `);
    }

    res.json({
      message: "Test user cleanup completed",
      email,
      deletedUsers: users.recordset.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
