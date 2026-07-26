"use strict";

const DEFAULT_FAILED_LOGIN_THRESHOLD = 3;
const DEFAULT_ACCESS_DENIED_THRESHOLD = 2;

const HIGH_SEVERITIES = new Set([
  "high",
  "critical",
]);

function normalizeText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text === "" ? null : text;
}

function toValidDate(value, fieldName = "TimeGenerated") {
  const dateValue =
    value instanceof Date ? value : new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    throw new TypeError(
      `${fieldName} must be a valid date and time.`
    );
  }

  return dateValue;
}

function getActorGroupingKey(event) {
  return (
    normalizeText(event.ActorEmail) ||
    normalizeText(event.IpAddress) ||
    "UnknownActor"
  );
}

function groupEvents(events, keySelector) {
  const groups = new Map();

  for (const event of events) {
    const key = keySelector(event);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(event);
  }

  return groups;
}

function getEventTimeRange(events) {
  const sortedEvents = [...events].sort(
    (left, right) =>
      toValidDate(left.TimeGenerated) -
      toValidDate(right.TimeGenerated)
  );

  return {
    FirstSeen: toValidDate(
      sortedEvents[0].TimeGenerated
    ).toISOString(),
    LastSeen: toValidDate(
      sortedEvents[sortedEvents.length - 1].TimeGenerated
    ).toISOString(),
  };
}

function getSourceEventIds(events) {
  return events
    .map((event) => Number(event.SourceEventId))
    .filter((sourceEventId) =>
      Number.isFinite(sourceEventId)
    );
}

function createRepeatedActivityDetections({
  events,
  eventType,
  threshold,
  ruleId,
  ruleName,
  severity,
}) {
  const matchingEvents = events.filter(
    (event) =>
      normalizeText(event.EventType)?.toLowerCase() ===
      eventType.toLowerCase()
  );

  const eventGroups = groupEvents(
    matchingEvents,
    getActorGroupingKey
  );

  const detections = [];

  for (const [groupingKey, groupedEvents] of eventGroups) {
    if (groupedEvents.length < threshold) {
      continue;
    }

    const timeRange = getEventTimeRange(groupedEvents);

    detections.push({
      RuleId: ruleId,
      RuleName: ruleName,
      Severity: severity,
      GroupingKey: groupingKey,
      MatchCount: groupedEvents.length,
      FirstSeen: timeRange.FirstSeen,
      LastSeen: timeRange.LastSeen,
      SourceEventIds: getSourceEventIds(groupedEvents),
      Summary:
        `${groupedEvents.length} ${eventType} events ` +
        `were detected for ${groupingKey}.`,
    });
  }

  return detections;
}

function detectRepeatedFailedLogins(
  events,
  threshold = DEFAULT_FAILED_LOGIN_THRESHOLD
) {
  return createRepeatedActivityDetections({
    events,
    eventType: "FailedLogin",
    threshold,
    ruleId: "WDL-001",
    ruleName: "Repeated failed logins",
    severity: "Medium",
  });
}

function detectRepeatedAccessDenied(
  events,
  threshold = DEFAULT_ACCESS_DENIED_THRESHOLD
) {
  return createRepeatedActivityDetections({
    events,
    eventType: "AccessDenied",
    threshold,
    ruleId: "WDL-002",
    ruleName: "Repeated restricted access attempts",
    severity: "High",
  });
}

function detectHighSeverityEvents(events) {
  return events
    .filter((event) =>
      HIGH_SEVERITIES.has(
        normalizeText(event.Severity)?.toLowerCase()
      )
    )
    .map((event) => {
      const eventTime = toValidDate(
        event.TimeGenerated
      ).toISOString();

      return {
        RuleId: "WDL-003",
        RuleName: "High severity security event",
        Severity: normalizeText(event.Severity),
        GroupingKey:
          String(event.SourceEventId ?? "UnknownEvent"),
        MatchCount: 1,
        FirstSeen: eventTime,
        LastSeen: eventTime,
        SourceEventIds: getSourceEventIds([event]),
        Summary:
          `${normalizeText(event.Severity)} severity ` +
          `${normalizeText(event.EventType) || "security"} ` +
          "event detected.",
      };
    });
}

function detectAuditLinkedSecurityEvents(events) {
  return events
    .filter((event) => {
      if (
        event.SourceApplicationAuditEventId === null ||
        event.SourceApplicationAuditEventId === undefined ||
        event.SourceApplicationAuditEventId === ""
      ) {
        return false;
      }

      return Number.isFinite(
        Number(event.SourceApplicationAuditEventId)
      );
    })
    .map((event) => {
      const eventTime = toValidDate(
        event.TimeGenerated
      ).toISOString();

      return {
        RuleId: "WDL-004",
        RuleName: "Security and audit event correlation",
        Severity: "Informational",
        GroupingKey: String(
          event.SourceApplicationAuditEventId
        ),
        MatchCount: 1,
        FirstSeen: eventTime,
        LastSeen: eventTime,
        SourceEventIds: getSourceEventIds([event]),
        SourceApplicationAuditEventId: Number(
          event.SourceApplicationAuditEventId
        ),
        Summary:
          `Security event ${event.SourceEventId} is linked ` +
          `to application audit event ` +
          `${event.SourceApplicationAuditEventId}.`,
      };
    });
}

function runMonitoringDetections(
  events,
  options = {}
) {
  if (!Array.isArray(events)) {
    throw new TypeError(
      "Monitoring events must be provided as an array."
    );
  }

  const failedLoginThreshold =
    options.failedLoginThreshold ??
    DEFAULT_FAILED_LOGIN_THRESHOLD;

  const accessDeniedThreshold =
    options.accessDeniedThreshold ??
    DEFAULT_ACCESS_DENIED_THRESHOLD;

  return [
    ...detectRepeatedFailedLogins(
      events,
      failedLoginThreshold
    ),
    ...detectRepeatedAccessDenied(
      events,
      accessDeniedThreshold
    ),
    ...detectHighSeverityEvents(events),
    ...detectAuditLinkedSecurityEvents(events),
  ].sort(
    (left, right) =>
      toValidDate(right.LastSeen) -
      toValidDate(left.LastSeen)
  );
}

module.exports = {
  DEFAULT_FAILED_LOGIN_THRESHOLD,
  DEFAULT_ACCESS_DENIED_THRESHOLD,
  detectRepeatedFailedLogins,
  detectRepeatedAccessDenied,
  detectHighSeverityEvents,
  detectAuditLinkedSecurityEvents,
  runMonitoringDetections,
};