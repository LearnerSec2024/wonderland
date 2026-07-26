"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const MONITORING_EXPORT_ROOT = path.resolve(
  __dirname,
  "..",
  "exports",
  "monitoring"
);

const REQUIRED_FILE_NAMES = [
  "manifest.json",
  "security-events.json",
  "application-audit-events.json",
  "detections.json",
];

const RECOGNISED_RULE_IDS = new Set([
  "WDL-001",
  "WDL-002",
  "WDL-003",
  "WDL-004",
]);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findLatestCompletedSimulationFolder() {
  const directoryEntries = await fs.readdir(
    MONITORING_EXPORT_ROOT,
    {
      withFileTypes: true,
    }
  );

  const folderNames = directoryEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const folderName of folderNames) {
    const folderPath = path.join(
      MONITORING_EXPORT_ROOT,
      folderName
    );

    const requiredFileResults = await Promise.all(
      REQUIRED_FILE_NAMES.map((fileName) =>
        fileExists(path.join(folderPath, fileName))
      )
    );

    if (requiredFileResults.every(Boolean)) {
      return folderPath;
    }
  }

  throw new Error(
    "No completed monitoring simulation was found. " +
    "Run monitor:export and monitor:detect first."
  );
}

async function readJsonFile(folderPath, fileName) {
  const filePath = path.join(folderPath, fileName);

  const fileContent = await fs.readFile(
    filePath,
    "utf8"
  );

  return JSON.parse(fileContent);
}

function validateRuleSummary(
  ruleSummary,
  detections
) {
  assert.equal(
    typeof ruleSummary,
    "object",
    "RuleSummary must be an object."
  );

  assert.notEqual(
    ruleSummary,
    null,
    "RuleSummary must not be null."
  );

  for (
    const [ruleId, summaryEntry]
    of Object.entries(ruleSummary)
  ) {
    assert.equal(
      RECOGNISED_RULE_IDS.has(ruleId),
      true,
      `Unrecognised rule ID in RuleSummary: ${ruleId}`
    );

    const actualCount = detections.filter(
      (detection) => detection.RuleId === ruleId
    ).length;

    assert.equal(
      summaryEntry.DetectionCount,
      actualCount,
      `${ruleId} summary count does not match detections.`
    );
  }
}

function validateMonitoringWorkflow({
  folderPath,
  manifest,
  securityEvents,
  applicationAuditEvents,
  detectionOutput,
}) {
  assert.equal(
    manifest.SchemaVersion,
    "1.0",
    "Unexpected manifest schema version."
  );

  assert.equal(
    manifest.SourceSystem,
    "Wonderland",
    "Unexpected manifest source system."
  );

  assert.equal(
    Array.isArray(securityEvents),
    true,
    "Security events must be a JSON array."
  );

  assert.equal(
    Array.isArray(applicationAuditEvents),
    true,
    "Application audit events must be a JSON array."
  );

  assert.equal(
    Number(
      manifest.ExportedRecordCounts.SecurityEvents
    ),
    securityEvents.length,
    "Manifest security-event count does not match."
  );

  assert.equal(
    Number(
      manifest.ExportedRecordCounts
        .ApplicationAuditEvents
    ),
    applicationAuditEvents.length,
    "Manifest audit-event count does not match."
  );

  assert.equal(
    detectionOutput.SchemaVersion,
    "1.0",
    "Unexpected detection schema version."
  );

  assert.equal(
    detectionOutput.DetectionEngine,
    "WonderlandLocalSentinelSimulator",
    "Unexpected detection engine."
  );

  assert.equal(
    detectionOutput.SourceExportFolder,
    path.basename(folderPath),
    "Detection source folder does not match."
  );

  assert.equal(
    Number(detectionOutput.SourceSecurityEventCount),
    securityEvents.length,
    "Detection source-event count does not match."
  );

  assert.equal(
    Array.isArray(detectionOutput.Detections),
    true,
    "Detections must be a JSON array."
  );

  assert.equal(
    Number(detectionOutput.DetectionCount),
    detectionOutput.Detections.length,
    "DetectionCount does not match Detections."
  );

  for (const detection of detectionOutput.Detections) {
    assert.equal(
      RECOGNISED_RULE_IDS.has(detection.RuleId),
      true,
      `Unrecognised detection rule: ${detection.RuleId}`
    );

    assert.equal(
      typeof detection.RuleName,
      "string",
      `${detection.RuleId} must have a RuleName.`
    );

    assert.equal(
      typeof detection.Summary,
      "string",
      `${detection.RuleId} must have a Summary.`
    );

    assert.equal(
      Array.isArray(detection.SourceEventIds),
      true,
      `${detection.RuleId} must have SourceEventIds.`
    );
  }

  validateRuleSummary(
    detectionOutput.RuleSummary,
    detectionOutput.Detections
  );

  assert.equal(
    Array.isArray(detectionOutput.Notes),
    true,
    "Detection Notes must be an array."
  );

  assert.equal(
    detectionOutput.Notes.includes(
      "No alerts were created in Microsoft Sentinel."
    ),
    true,
    "Missing Sentinel safety note."
  );

  assert.equal(
    detectionOutput.Notes.includes(
      "No records were sent to Azure."
    ),
    true,
    "Missing Azure safety note."
  );
}

async function run() {
  const folderPath =
    await findLatestCompletedSimulationFolder();

  const [
    manifest,
    securityEvents,
    applicationAuditEvents,
    detectionOutput,
  ] = await Promise.all([
    readJsonFile(folderPath, "manifest.json"),
    readJsonFile(folderPath, "security-events.json"),
    readJsonFile(
      folderPath,
      "application-audit-events.json"
    ),
    readJsonFile(folderPath, "detections.json"),
  ]);

  validateMonitoringWorkflow({
    folderPath,
    manifest,
    securityEvents,
    applicationAuditEvents,
    detectionOutput,
  });

  console.log("");
  console.log(
    "PASS: Monitoring workflow validation completed."
  );
  console.log(`Validated folder: ${folderPath}`);
  console.log(
    `Security events: ${securityEvents.length}`
  );
  console.log(
    `Application audit events: ` +
      `${applicationAuditEvents.length}`
  );
  console.log(
    `Detections: ${detectionOutput.Detections.length}`
  );
  console.log("");
  console.log(
    "PASS: Export counts match the manifest."
  );
  console.log(
    "PASS: Detection counts and rule summaries match."
  );
  console.log(
    "PASS: Only recognised Wonderland rules were found."
  );
  console.log(
    "PASS: Azure and Sentinel safety notes are present."
  );
}

run().catch((error) => {
  console.error("");
  console.error(
    "FAIL: Monitoring workflow validation failed."
  );
  console.error(error.message);
  process.exitCode = 1;
});