const { writeAuditEvent } = require("../services/auditLogger");

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      writeAuditEvent({
        req,
        eventCategory: "Security",
        eventType: "RestrictedAccessDenied",
        actorUserId: req.user.userId,
        actorRole: req.user.role,
        actorEmail: req.user.email,
        targetEntityType: "Route",
        targetEntityReference: `${req.method} ${req.originalUrl}`,
        actionStatus: "Denied",
        eventSummary: `Access denied for ${req.user.role} user on ${req.method} ${req.originalUrl}`,
        details: {
          allowedRoles,
          actualRole: req.user.role,
        },
      });

      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};