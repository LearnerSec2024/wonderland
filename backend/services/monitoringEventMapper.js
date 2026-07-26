"use strict";

const MONITORING_SCHEMA_VERSION = "1.0";
const MONITORING_SOURCE_SYSTEM = "Wonderland";

function toNullableString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text === "" ? null : text;
}

function toNullableNumber(value, fieldName) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new TypeError(`${fieldName} must be a valid number.`);
  }

  return numberValue;
}

function toRequiredNumber(value, fieldName) {
  const numberValue = toNullableNumber(value, fieldName);

  if (numberValue === null) {
    throw new TypeError(`${fieldName} is required.`);
  }

  return numberValue;
}

function toIsoTimestamp(value, fieldName = "CreatedAt") {
  if (value === null || value === undefined || value === "") {
    throw new TypeError(`${fieldName} is required.`);
  }

  const dateValue = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    throw new TypeError(`${fieldName} must be a valid date and time.`);
  }

  return dateValue.toISOString();
}

function parseDetailsJson(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(String(value));
  } catch {
    return {
      RawValue: String(value),
      ParseStatus: "InvalidJson",
    };
  }
}

function requireRecord(row, sourceTable) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new TypeError(
      `${sourceTable} source row must be an object.`
    );
  }
}

function buildBaseMonitoringRecord({
  row,
  sourceTable,
  sourceIdField,
  severity,
}) {
  requireRecord(row, sourceTable);

  return {
    SchemaVersion: MONITORING_SCHEMA_VERSION,
    TimeGenerated: toIsoTimestamp(row.CreatedAt),
    SourceSystem: MONITORING_SOURCE_SYSTEM,
    SourceTable: sourceTable,
    SourceEventId: toRequiredNumber(
      row[sourceIdField],
      sourceIdField
    ),
    EventCategory: toNullableString(row.EventCategory),
    EventType: toNullableString(row.EventType),
    Severity: toNullableString(severity),
    ActorUserId: toNullableNumber(
      row.ActorUserId,
      "ActorUserId"
    ),
    ActorRole: toNullableString(row.ActorRole),
    ActorEmail: toNullableString(row.ActorEmail),
    ActionStatus: toNullableString(row.ActionStatus),
    EventSummary: toNullableString(row.EventSummary),
    Details: parseDetailsJson(row.DetailsJson),
    RequestMethod: toNullableString(row.RequestMethod),
    RequestPath: toNullableString(row.RequestPath),
    IpAddress: toNullableString(row.IpAddress),
    UserAgent: toNullableString(row.UserAgent),
  };
}

function mapApplicationAuditEvent(row) {
  return {
    ...buildBaseMonitoringRecord({
      row,
      sourceTable: "ApplicationAuditEvents",
      sourceIdField: "ApplicationAuditEventId",
      severity: null,
    }),
    TargetEntityType: toNullableString(
      row.TargetEntityType
    ),
    TargetEntityId: toNullableNumber(
      row.TargetEntityId,
      "TargetEntityId"
    ),
    TargetEntityReference: toNullableString(
      row.TargetEntityReference
    ),
  };
}

function mapSecurityEvent(row) {
  return {
    ...buildBaseMonitoringRecord({
      row,
      sourceTable: "SecurityEvents",
      sourceIdField: "SecurityEventId",
      severity: row.Severity,
    }),
    SourceApplicationAuditEventId: toNullableNumber(
      row.SourceApplicationAuditEventId,
      "SourceApplicationAuditEventId"
    ),
  };
}

module.exports = {
  MONITORING_SCHEMA_VERSION,
  MONITORING_SOURCE_SYSTEM,
  mapApplicationAuditEvent,
  mapSecurityEvent,
  parseDetailsJson,
  toIsoTimestamp,
};