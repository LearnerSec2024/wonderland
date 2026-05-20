const { writeSecurityEvent } = require("../services/securityEventLogger");

function getCleanPath(req) {
  return (req.originalUrl || req.url || "").split("?")[0];
}

function getActor(req) {
  return {
    actorUserId: req.user?.userId || null,
    actorRole: req.user?.role || null,
    actorEmail: req.user?.email || req.body?.email || null,
  };
}

function classifySecurityEvent(req, res) {
  const path = getCleanPath(req);
  const statusCode = res.statusCode;

  if (path === "/api/auth/login" && (statusCode === 400 || statusCode === 401)) {
    return {
      eventCategory: "Authentication",
      eventType: "FailedLogin",
      severity: "Medium",
      actionStatus: "Failed",
      eventSummary: "Failed login attempt detected",
      details: {
        statusCode,
        email: req.body?.email || null,
      },
    };
  }

  if (statusCode === 401 && req.headers.authorization) {
    return {
      eventCategory: "Authentication",
      eventType: "InvalidToken",
      severity: "Medium",
      actionStatus: "Denied",
      eventSummary: "Invalid or expired authentication token rejected",
      details: {
        statusCode,
        path,
      },
    };
  }

  if (statusCode === 403) {
    return {
      eventCategory: "Authorization",
      eventType: "AccessDenied",
      severity: path.startsWith("/api/admin") ? "High" : "Medium",
      actionStatus: "Denied",
      eventSummary: "Restricted API access was denied",
      details: {
        statusCode,
        path,
        method: req.method,
        requiredArea: path.startsWith("/api/admin")
          ? "Admin"
          : path.startsWith("/api/manager")
            ? "Manager"
            : "Restricted",
      },
    };
  }

  if (
    statusCode >= 200 &&
    statusCode < 300 &&
    path === "/api/admin/reports/bookings/export.csv"
  ) {
    return {
      eventCategory: "DataExport",
      eventType: "AdminBookingReportCsvDownloaded",
      severity: "High",
      actionStatus: "Succeeded",
      eventSummary: "Admin downloaded booking report CSV",
      details: {
        query: req.query || {},
      },
    };
  }

  if (
    statusCode >= 200 &&
    statusCode < 300 &&
    path === "/api/admin/audit-events"
  ) {
    return {
      eventCategory: "Monitoring",
      eventType: "ApplicationAuditLogsViewed",
      severity: "Low",
      actionStatus: "Succeeded",
      eventSummary: "Admin viewed application audit logs",
      details: {
        query: req.query || {},
      },
    };
  }

  if (
    statusCode >= 200 &&
    statusCode < 300 &&
    path === "/api/admin/security-events"
  ) {
    return {
      eventCategory: "Monitoring",
      eventType: "SecurityEventsViewed",
      severity: "Low",
      actionStatus: "Succeeded",
      eventSummary: "Admin viewed security events",
      details: {
        query: req.query || {},
      },
    };
  }

  return null;
}

function securityEventCaptureMiddleware(req, res, next) {
  res.on("finish", () => {
    const event = classifySecurityEvent(req, res);

    if (!event) {
      return;
    }

    const actor = getActor(req);

    void writeSecurityEvent({
      req,
      ...actor,
      ...event,
    });
  });

  next();
}

module.exports = {
  securityEventCaptureMiddleware,
};
