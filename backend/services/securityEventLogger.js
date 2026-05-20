const { sql, getPool } = require("../config/db");

function getRequestIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    null
  );
}

async function writeSecurityEvent({
  poolOrTransaction = null,
  req = null,
  eventCategory,
  eventType,
  severity = "Low",
  actorUserId = null,
  actorRole = null,
  actorEmail = null,
  actionStatus = "Observed",
  eventSummary,
  details = null,
  sourceApplicationAuditEventId = null,
}) {
  try {
    const db = poolOrTransaction || (await getPool());
    const request = db instanceof sql.Transaction ? new sql.Request(db) : db.request();
    const safeDetailsJson =
      details === null || details === undefined ? null : JSON.stringify(details);

    await request
      .input("EventCategory", sql.NVarChar(100), eventCategory)
      .input("EventType", sql.NVarChar(150), eventType)
      .input("Severity", sql.NVarChar(20), severity)
      .input("ActorUserId", sql.Int, actorUserId)
      .input("ActorRole", sql.NVarChar(50), actorRole)
      .input("ActorEmail", sql.NVarChar(256), actorEmail)
      .input("ActionStatus", sql.NVarChar(50), actionStatus)
      .input("EventSummary", sql.NVarChar(1000), eventSummary)
      .input("DetailsJson", sql.NVarChar(sql.MAX), safeDetailsJson)
      .input("RequestMethod", sql.NVarChar(20), req?.method || null)
      .input("RequestPath", sql.NVarChar(500), req?.originalUrl || null)
      .input("IpAddress", sql.NVarChar(100), req ? getRequestIp(req) : null)
      .input("UserAgent", sql.NVarChar(1000), req?.headers?.["user-agent"] || null)
      .input("SourceApplicationAuditEventId", sql.Int, sourceApplicationAuditEventId)
      .query(`
        INSERT INTO dbo.SecurityEvents
        (
          EventCategory,
          EventType,
          Severity,
          ActorUserId,
          ActorRole,
          ActorEmail,
          ActionStatus,
          EventSummary,
          DetailsJson,
          RequestMethod,
          RequestPath,
          IpAddress,
          UserAgent,
          SourceApplicationAuditEventId
        )
        VALUES
        (
          @EventCategory,
          @EventType,
          @Severity,
          @ActorUserId,
          @ActorRole,
          @ActorEmail,
          @ActionStatus,
          @EventSummary,
          @DetailsJson,
          @RequestMethod,
          @RequestPath,
          @IpAddress,
          @UserAgent,
          @SourceApplicationAuditEventId
        );
      `);
  } catch (error) {
    console.error("Security event logging failed:", error.message);
  }
}

module.exports = {
  writeSecurityEvent,
};
