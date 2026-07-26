"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});

const { sql, getPool } = require("../config/db");
const {
  MONITORING_SCHEMA_VERSION,
  MONITORING_SOURCE_SYSTEM,
  mapApplicationAuditEvent,
  mapSecurityEvent,
} = require("../services/monitoringEventMapper");

const DEFAULT_LIMIT = 25;
const MAXIMUM_LIMIT = 500;

function parseLimit(argumentsList) {
  if (argumentsList.length === 0) {
    return DEFAULT_LIMIT;
  }

  const limitArgumentIndex =
    argumentsList.indexOf("--limit");

  let suppliedValue;

  if (limitArgumentIndex !== -1) {
    suppliedValue =
      argumentsList[limitArgumentIndex + 1];

    if (suppliedValue === undefined) {
      throw new Error(
        "--limit requires a numeric value."
      );
    }
  } else if (argumentsList.length === 1) {
    suppliedValue = argumentsList[0];
  } else {
    throw new Error(
      "Use --limit <number> or provide one numeric limit."
    );
  }

  const parsedValue = Number(suppliedValue);

  if (!Number.isInteger(parsedValue)) {
    throw new Error("--limit must be a whole number.");
  }

  if (
    parsedValue < 1 ||
    parsedValue > MAXIMUM_LIMIT
  ) {
    throw new Error(
      `--limit must be between 1 and ${MAXIMUM_LIMIT}.`
    );
  }

  return parsedValue;
}

function createRunFolderName(generatedAt) {
  return generatedAt
    .replaceAll(":", "-")
    .replaceAll(".", "-");
}

async function writeJsonFile(filePath, value) {
  const jsonContent = `${JSON.stringify(value, null, 2)}\n`;

  await fs.writeFile(filePath, jsonContent, {
    encoding: "utf8",
    flag: "wx",
  });
}

async function loadSecurityEvents(pool, limit) {
  const result = await pool
    .request()
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT TOP (@Limit)
          SecurityEventId,
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
          SourceApplicationAuditEventId,
          CreatedAt
      FROM dbo.SecurityEvents
      ORDER BY
          CreatedAt DESC,
          SecurityEventId DESC;
    `);

  return result.recordset;
}

async function loadApplicationAuditEvents(pool, limit) {
  const result = await pool
    .request()
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT TOP (@Limit)
          ApplicationAuditEventId,
          EventCategory,
          EventType,
          ActorUserId,
          ActorRole,
          ActorEmail,
          TargetEntityType,
          TargetEntityId,
          TargetEntityReference,
          ActionStatus,
          EventSummary,
          DetailsJson,
          RequestMethod,
          RequestPath,
          IpAddress,
          UserAgent,
          CreatedAt
      FROM dbo.ApplicationAuditEvents
      ORDER BY
          CreatedAt DESC,
          ApplicationAuditEventId DESC;
    `);

  return result.recordset;
}

async function exportMonitoringEvents() {
  const limit = parseLimit(process.argv.slice(2));
  const generatedAt = new Date().toISOString();

  const outputRoot = path.resolve(
    __dirname,
    "..",
    "exports",
    "monitoring"
  );

  const runFolder = path.join(
    outputRoot,
    createRunFolderName(generatedAt)
  );

  await fs.mkdir(runFolder, {
    recursive: true,
  });

  const pool = await getPool();

  const [
    securitySourceRows,
    applicationAuditSourceRows,
  ] = await Promise.all([
    loadSecurityEvents(pool, limit),
    loadApplicationAuditEvents(pool, limit),
  ]);

  const securityRecords =
    securitySourceRows.map(mapSecurityEvent);

  const applicationAuditRecords =
    applicationAuditSourceRows.map(
      mapApplicationAuditEvent
    );

  const securityFileName = "security-events.json";
  const auditFileName = "application-audit-events.json";
  const manifestFileName = "manifest.json";

  await writeJsonFile(
    path.join(runFolder, securityFileName),
    securityRecords
  );

  await writeJsonFile(
    path.join(runFolder, auditFileName),
    applicationAuditRecords
  );

  const manifest = {
    SchemaVersion: MONITORING_SCHEMA_VERSION,
    SourceSystem: MONITORING_SOURCE_SYSTEM,
    GeneratedAt: generatedAt,
    SourceDatabase:
      process.env.DB_DATABASE || "WonderlandDB",
    RequestedRecordLimitPerTable: limit,
    ExportedRecordCounts: {
      SecurityEvents: securityRecords.length,
      ApplicationAuditEvents:
        applicationAuditRecords.length,
    },
    Files: {
      SecurityEvents: securityFileName,
      ApplicationAuditEvents: auditFileName,
    },
    Notes: [
      "This is a local learning export.",
      "No records were sent to Azure.",
      "The source SQL tables were queried read-only.",
    ],
  };

  await writeJsonFile(
    path.join(runFolder, manifestFileName),
    manifest
  );

  console.log("");
  console.log("PASS: Monitoring export completed.");
  console.log(`Record limit per table: ${limit}`);
  console.log(
    `Security events exported: ${securityRecords.length}`
  );
  console.log(
    "Application audit events exported: " +
      applicationAuditRecords.length
  );
  console.log(`Export directory: ${runFolder}`);
  console.log("");
  console.log("No records were sent to Azure.");
}

exportMonitoringEvents()
  .catch((error) => {
    console.error("");
    console.error("FAIL: Monitoring export failed.");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.close();
  });