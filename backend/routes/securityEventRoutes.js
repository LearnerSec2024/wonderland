const express = require("express");

const { requireAuth } = require("../middleware/authMiddleware");
const { writeSecurityEvent } = require("../services/securityEventLogger");

const router = express.Router();

function getRequiredArea(path) {
  if (path.startsWith("/admin")) {
    return "Admin";
  }

  if (path.startsWith("/manager")) {
    return "Manager";
  }

  return "Restricted";
}

router.use(requireAuth);

router.post("/access-denied", async (req, res, next) => {
  try {
    const deniedPath =
      typeof req.body?.path === "string" && req.body.path.startsWith("/")
        ? req.body.path.slice(0, 500)
        : null;
    const allowedRoles = Array.isArray(req.body?.allowedRoles)
      ? req.body.allowedRoles
          .filter((role) => typeof role === "string" && role.trim())
          .map((role) => role.trim().slice(0, 50))
      : [];

    if (!deniedPath) {
      return res.status(400).json({
        message: "Denied path is required",
      });
    }

    const requiredArea = getRequiredArea(deniedPath);

    await writeSecurityEvent({
      req,
      requestMethod: "GET",
      requestPath: deniedPath,
      eventCategory: "Authorization",
      eventType: "AccessDenied",
      severity: requiredArea === "Admin" ? "High" : "Medium",
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      actorEmail: req.user.email,
      actionStatus: "Denied",
      eventSummary: "Client-side restricted route access was denied",
      details: {
        path: deniedPath,
        requiredArea,
        allowedRoles,
        actualRole: req.user.role,
        source: "RoleProtectedRoute",
      },
    });

    res.status(202).json({
      message: "Security event accepted",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
