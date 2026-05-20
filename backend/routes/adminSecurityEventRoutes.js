const express = require("express");
const { sql, getPool } = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin"));

const VALID_SEVERITIES = new Set(["Low", "Medium", "High", "Critical"]);
const VALID_ACTION_STATUSES = new Set(["Observed", "Succeeded", "Failed", "Denied"]);

function toIsoString(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function isValidDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeFilters(query) {
  const startDate = query.startDate?.trim() || "";
  const endDate = query.endDate?.trim() || "";
  const severity = query.severity?.trim() || "";
  const eventCategory = query.eventCategory?.trim() || "";
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

  if (severity && !VALID_SEVERITIES.has(severity)) {
    return { error: "severity must be Low, Medium, High or Critical" };
  }

  if (actionStatus && !VALID_ACTION_STATUSES.has(actionStatus)) {
    return { error: "actionStatus must be Observed, Succeeded, Failed or Denied" };
  }

  return {
    filters: {
      startDate,
      endDate,
      severity,
      eventCategory,
      actorRole,
      actionStatus,
      search,
    },
  };
}

function addFiltersToRequest(request, filters, alias = "se") {
  const clauses = [];

  if (filters.startDate) {
    request.input("StartDate", sql.Date, filters.startDate);
    clauses.push(`CAST(${alias}.CreatedAt AS DATE) >= @StartDate`);
  }

  if (filters.endDate) {
    request.input("EndDate", sql.Date, filters.endDate);
    clauses.push(`CAST(${alias}.CreatedAt AS DATE) <= @EndDate`);
  }

  if (filters.severity) {
    request.input("Severity", sql.NVarChar(20), filters.severity);
    clauses.push(`${alias}.Severity = @Severity`);
  }

  if (filters.eventCategory) {
    request.input("EventCategory", sql.NVarChar(100), filters.eventCategory);
    clauses.push(`${alias}.EventCategory = @EventCategory`);
  }

  if (filters.actorRole) {
    request.input("ActorRole", sql.NVarChar(50), filters.actorRole);
    clauses.push(`${alias}.ActorRole = @ActorRole`);
  }

  if (filters.actionStatus) {
    request.input("ActionStatus", sql.NVarChar(50), filters.actionStatus);
    clauses.push(`${alias}.ActionStatus = @ActionStatus`);
  }

  if (filters.search) {
    request.input("Search", sql.NVarChar(300), `%${filters.search}%`);
    clauses.push(`(
      ${alias}.ActorEmail LIKE @Search
      OR ${alias}.EventSummary LIKE @Search
      OR ${alias}.EventType LIKE @Search
      OR ${alias}.RequestPath LIKE @Search
    )`);
  }

  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

function mapSecurityEvent(row) {
  return {
    securityEventId: row.SecurityEventId,
    eventCategory: row.EventCategory,
    eventType: row.EventType,
    severity: row.Severity,
    actorUserId: row.ActorUserId,
    actorRole: row.ActorRole,
    actorEmail: row.ActorEmail,
    actionStatus: row.ActionStatus,
    eventSummary: row.EventSummary,
    detailsJson: row.DetailsJson,
    requestMethod: row.RequestMethod,
    requestPath: row.RequestPath,
    ipAddress: row.IpAddress,
    userAgent: row.UserAgent,
    sourceApplicationAuditEventId: row.SourceApplicationAuditEventId,
    createdAt: toIsoString(row.CreatedAt),
  };
}

router.get("/security-events", async (req, res, next) => {
  try {
    const { filters, error } = normalizeFilters(req.query);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const pool = await getPool();

    const eventsRequest = pool.request();
    const eventsWhere = addFiltersToRequest(eventsRequest, filters);

    const eventsResult = await eventsRequest.query(`
      SELECT TOP 200
        se.SecurityEventId,
        se.EventCategory,
        se.EventType,
        se.Severity,
        se.ActorUserId,
        se.ActorRole,
        se.ActorEmail,
        se.ActionStatus,
        se.EventSummary,
        se.DetailsJson,
        se.RequestMethod,
        se.RequestPath,
        se.IpAddress,
        se.UserAgent,
        se.SourceApplicationAuditEventId,
        se.CreatedAt
      FROM dbo.SecurityEvents se
      ${eventsWhere}
      ORDER BY se.CreatedAt DESC, se.SecurityEventId DESC;
    `);

    const summaryRequest = pool.request();
    const summaryWhere = addFiltersToRequest(summaryRequest, filters);

    const summaryResult = await summaryRequest.query(`
      SELECT
        COUNT(*) AS TotalEvents,
        SUM(CASE WHEN se.Severity = 'Critical' THEN 1 ELSE 0 END) AS CriticalEvents,
        SUM(CASE WHEN se.Severity = 'High' THEN 1 ELSE 0 END) AS HighEvents,
        SUM(CASE WHEN se.Severity = 'Medium' THEN 1 ELSE 0 END) AS MediumEvents,
        SUM(CASE WHEN se.Severity = 'Low' THEN 1 ELSE 0 END) AS LowEvents,
        SUM(CASE WHEN se.ActionStatus = 'Denied' THEN 1 ELSE 0 END) AS DeniedEvents,
        SUM(CASE WHEN se.ActionStatus = 'Failed' THEN 1 ELSE 0 END) AS FailedEvents
      FROM dbo.SecurityEvents se
      ${summaryWhere};
    `);

    const categoryRequest = pool.request();
    const categoryWhere = addFiltersToRequest(categoryRequest, filters);

    const categoryResult = await categoryRequest.query(`
      SELECT
        se.EventCategory,
        COUNT(*) AS EventCount
      FROM dbo.SecurityEvents se
      ${categoryWhere}
      GROUP BY se.EventCategory
      ORDER BY EventCount DESC, se.EventCategory;
    `);

    const severityRequest = pool.request();
    const severityWhere = addFiltersToRequest(severityRequest, filters);

    const severityResult = await severityRequest.query(`
      SELECT
        se.Severity,
        COUNT(*) AS EventCount
      FROM dbo.SecurityEvents se
      ${severityWhere}
      GROUP BY se.Severity
      ORDER BY
        CASE se.Severity
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END;
    `);

    const summary = summaryResult.recordset[0] || {};

    res.json({
      filters,
      summary: {
        totalEvents: summary.TotalEvents || 0,
        criticalEvents: summary.CriticalEvents || 0,
        highEvents: summary.HighEvents || 0,
        mediumEvents: summary.MediumEvents || 0,
        lowEvents: summary.LowEvents || 0,
        deniedEvents: summary.DeniedEvents || 0,
        failedEvents: summary.FailedEvents || 0,
      },
      categoryBreakdown: categoryResult.recordset.map((row) => ({
        eventCategory: row.EventCategory,
        eventCount: row.EventCount,
      })),
      severityBreakdown: severityResult.recordset.map((row) => ({
        severity: row.Severity,
        eventCount: row.EventCount,
      })),
      events: eventsResult.recordset.map((row) => mapSecurityEvent(row)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
