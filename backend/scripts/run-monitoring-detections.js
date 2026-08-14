"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const {
  runMonitoringDetections,
} = require("../services/monitoringDetectionRules");

const MONITORING_EXPORT_ROOT = path.resolve(
  __dirname,
  "..",
  "exports",
  "monitoring"
);

async function getLatestExportFolder() {
  const directoryEntries = await fs.readdir(
    MONITORING_EXPORT_ROOT,
    {
      withFileTypes: true,
    }
  );

  const exportFolders = directoryEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const folderName of exportFolders) {
    const folderPath = path.join(
      MONITORING_EXPORT_ROOT,
      folderName
    );

    const requiredFiles = [
      "manifest.json",
      "security-events.json",
      "application-audit-events.json",
    ];

    const requiredFileResults = await Promise.all(
      requiredFiles.map(async (fileName) => {
        try {
          await fs.access(
            path.join(folderPath, fileName)
          );

          return true;
        } catch {
          return false;
        }
      })
    );

    if (
      requiredFileResults.every(
        (fileExists) => fileExists
      )
    ) {
      return folderPath;
    }
  }

  throw new Error(
    "No valid monitoring export folder was found. " +
    "Run monitor:export first."
  );
}

async function readJsonFile(filePath) {
  const fileContent = await fs.readFile(
    filePath,
    "utf8"
  );

  return JSON.parse(fileContent);
}

async function writeJsonFile(filePath, value) {
  const fileContent =
    `${JSON.stringify(value, null, 2)}\n`;

  await fs.writeFile(filePath, fileContent, {
    encoding: "utf8",
  });
}

function summarizeDetections(detections) {
  const ruleSummary = {};

  for (const detection of detections) {
    const ruleId = detection.RuleId;

    if (!ruleSummary[ruleId]) {
      ruleSummary[ruleId] = {
        RuleName: detection.RuleName,
        DetectionCount: 0,
      };
    }

    ruleSummary[ruleId].DetectionCount += 1;
  }

  return ruleSummary;
}

async function run() {
  const exportFolder = await getLatestExportFolder();

  const securityEventsPath = path.join(
    exportFolder,
    "security-events.json"
  );

  const detectionsPath = path.join(
    exportFolder,
    "detections.json"
  );

  const securityEvents = await readJsonFile(
    securityEventsPath
  );

  if (!Array.isArray(securityEvents)) {
    throw new TypeError(
      "security-events.json must contain a JSON array."
    );
  }

  const detections =
    runMonitoringDetections(securityEvents);

  const output = {
    SchemaVersion: "1.0",
    DetectionEngine: "WonderlandLocalSentinelSimulator",
    GeneratedAt: new Date().toISOString(),
    SourceExportFolder: path.basename(exportFolder),
    SourceSecurityEventCount: securityEvents.length,
    DetectionCount: detections.length,
    RuleSummary: summarizeDetections(detections),
    Detections: detections,
    Notes: [
      "This is a local learning simulation.",
      "No alerts were created in Microsoft Sentinel.",
      "No records were sent to Azure.",
    ],
  };

  await writeJsonFile(
    detectionsPath,
    output
  );

  console.log("");
  console.log("PASS: Local detection simulation completed.");
  console.log(`Source export folder: ${exportFolder}`);
  console.log(
    `Security events evaluated: ${securityEvents.length}`
  );
  console.log(
    `Detections created: ${detections.length}`
  );
  console.log(`Detection output: ${detectionsPath}`);
  console.log("");
  console.log(
    "No alerts were created in Microsoft Sentinel."
  );
  console.log("No records were sent to Azure.");

  if (detections.length > 0) {
    console.log("");
    console.log("Detection summary:");

    for (const detection of detections) {
      console.log(
        `${detection.RuleId} | ` +
        `${detection.Severity} | ` +
        `${detection.Summary}`
      );
    }
  }
}

run().catch((error) => {
  console.error("");
  console.error(
    "FAIL: Local detection simulation failed."
  );
  console.error(error.message);
  process.exitCode = 1;
});