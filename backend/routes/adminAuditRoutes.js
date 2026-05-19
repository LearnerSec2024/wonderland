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

function isValidDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeAuditFilters(query) {
  const startDate = query.startDate?.trim() || "";
  const endDate = query.endDate?.trim() || "";
  const eventCategory = query.eventCategory?.trim() || "";
  const eventType = query.eventType?.trim() || "";
  const actorRole = query.actorRole?.trim() || "";
  const actionStatus = query.actionStatus?.trim() || "";
  const search = query.search?.trim() || "";

  if (startDate && !isValidDateOnly(startDate)) {
    return { error: "startDate must use YYYY-MM-DD format" };
  }

  if (endDate && !isValidDateOnly(endDate)) {
    return { error: "endDate must use YYYY-MM-DD format" };
  }

  if (startDate && endDate && startDate > endDate) {
    return { error: "startDate cannot be after endDate" };
  }

  return {
    filters: {
      startDate,
      endDate,
      eventCategory,
      eventType,
      actorRole,
      actionStatus,
      search,
    },
  };
}

function mapAuditEvent(row) {
  let details = null;

  try {
    details = row.DetailsJson ? JSON.parse(row.DetailsJson) : null;
  } catch {
    details = row.DetailsJson;
  }

  return {
    applicationAuditEventId: row.ApplicationAuditEventId,
    eventCategory: row.EventCategory,
    eventType: row.EventType,
    actorUserId: row.ActorUserId,
    actorRole: row.ActorRole,
    actorEmail: row.ActorEmail,
    targetEntityType: row.TargetEntityType,
    targetEntityId: row.TargetEntityId,
    targetEntityReference: row.TargetEntityReference,
    actionStatus: row.ActionStatus,
    eventSummary: row.EventSummary,
    details,
    requestMethod: row.RequestMethod,
    requestPath: row.RequestPath,
    ipAddress: row.IpAddress,
    userAgent: row.UserAgent,
    createdAt: toIsoString(row.CreatedAt),
  };
}

router.get("/audit-events", async (req, res, next) => {
  try {
    const { filters, error } = normalizeAuditFilters(req.query);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const pool = await getPool();
    const request = pool.request();
    const clauses = [];

    if (filters.startDate) {
      request.input("StartDate", sql.Date, filters.startDate);
      clauses.push("CAST(a.CreatedAt AS DATE) >= @StartDate");
    }

    if (filters.endDate) {
      request.input("EndDate", sql.Date, filters.endDate);
      clauses.push("CAST(a.CreatedAt AS DATE) <= @EndDate");
    }

    if (filters.eventCategory) {
      request.input("EventCategory", sql.NVarChar(100), filters.eventCategory);
      clauses.push("a.EventCategory = @EventCategory");
    }

    if (filters.eventType) {
      request.input("EventType", sql.NVarChar(150), filters.eventType);
      clauses.push("a.EventType = @EventType");
    }

    if (filters.actorRole) {
      request.input("ActorRole", sql.NVarChar(50), filters.actorRole);
      clauses.push("a.ActorRole = @ActorRole");
    }

    if (filters.actionStatus) {
      request.input("ActionStatus", sql.NVarChar(50), filters.actionStatus);
      clauses.push("a.ActionStatus = @ActionStatus");
    }

    if (filters.search) {
      request.input("Search", sql.NVarChar(200), `%${filters.search}%`);
      clauses.push(`
        (
          a.EventSummary LIKE @Search
          OR a.ActorEmail LIKE @Search
          OR a.EventType LIKE @Search
          OR a.TargetEntityType LIKE @Search
          OR a.TargetEntityReference LIKE @Search
        )
      `);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const result = await request.query(`
      SELECT TOP 100
        a.ApplicationAuditEventId,
        a.EventCategory,
        a.EventType,
        a.ActorUserId,
        a.ActorRole,
        a.ActorEmail,
        a.TargetEntityType,
        a.TargetEntityId,
        a.TargetEntityReference,
        a.ActionStatus,
        a.EventSummary,
        a.DetailsJson,
        a.RequestMethod,
        a.RequestPath,
        a.IpAddress,
        a.UserAgent,
        a.CreatedAt
      FROM dbo.ApplicationAuditEvents a
      ${where}
      ORDER BY a.CreatedAt DESC, a.ApplicationAuditEventId DESC;
    `);

    res.json({
      filters,
      events: result.recordset.map((row) => mapAuditEvent(row)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;