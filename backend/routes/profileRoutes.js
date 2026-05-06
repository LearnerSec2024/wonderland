const express = require("express");

const { sql, getPool } = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const toDateOnly = (value) => {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
};

const toIsoString = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("UserId", sql.Int, req.user.userId)
      .query(`
        SELECT
          u.UserId,
          u.FirstName,
          u.LastName,
          u.Email,
          u.Role,
          u.TotalPoints,
          u.DateOfBirth,
          u.EmployeeId,
          u.CreatedAt,

          e.EmployeeId AS LinkedEmployeeId,
          e.FirstName AS EmployeeFirstName,
          e.LastName AS EmployeeLastName,
          e.Email AS EmployeeEmail,
          e.DateOfBirth AS EmployeeDateOfBirth,
          e.IsActive AS EmployeeIsActive,
          e.IsRegistered AS EmployeeIsRegistered,
          e.RegisteredAt AS EmployeeRegisteredAt,

          (
            SELECT STRING_AGG(r.RoleName, ', ')
            FROM dbo.EmployeeRoles er
            INNER JOIN dbo.Roles r ON r.RoleId = er.RoleId
            WHERE er.EmployeeId = e.EmployeeId
          ) AS EmployeeRoles
        FROM dbo.Users u
        LEFT JOIN dbo.Employees e ON e.EmployeeId = u.EmployeeId
        WHERE u.UserId = @UserId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const row = result.recordset[0];

    const profile = {
      user: {
        userId: row.UserId,
        firstName: row.FirstName,
        lastName: row.LastName,
        email: row.Email,
        role: row.Role,
        totalPoints: row.TotalPoints,
        dateOfBirth: toDateOnly(row.DateOfBirth),
        employeeId: row.EmployeeId || null,
        createdAt: toIsoString(row.CreatedAt),
      },
      employee: row.LinkedEmployeeId
        ? {
            employeeId: row.LinkedEmployeeId,
            firstName: row.EmployeeFirstName,
            lastName: row.EmployeeLastName,
            email: row.EmployeeEmail,
            dateOfBirth: toDateOnly(row.EmployeeDateOfBirth),
            isActive: Boolean(row.EmployeeIsActive),
            isRegistered: Boolean(row.EmployeeIsRegistered),
            registeredAt: toIsoString(row.EmployeeRegisteredAt),
            roles: row.EmployeeRoles || row.Role,
          }
        : null,
    };

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
