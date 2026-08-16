"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});

const {
  getAzureMonitoringConfiguration,
  uploadApplicationAuditEvents,
  uploadSecurityEvents,
} = require("../services/azureLogIngestionService");

function parseArguments(argumentsList) {
  const result = {
    exportFolder: null,
    dryRun: false,
    confirmAzureSend: false,
  };

  for (
    let index = 0;
    index < argumentsList.length;
    index += 1
  ) {
    const argument = argumentsList[index];

    if (argument === "--dry-run") {
      result.dryRun = true;
      continue;
    }

    if (argument === "--confirm-azure-send") {
      result.confirmAzureSend = true;
      continue;
    }

    if (argument === "--export-folder") {
      const suppliedFolder =
        argumentsList[index + 1];

      if (!suppliedFolder) {
        throw new Error(
          "--export-folder requires a folder path."
        );
      }

      result.exportFolder = suppliedFolder;
      index += 1;
      continue;
    }

    throw new Error(
      `Unknown argument: ${argument}`
    );
  }

  if (!result.exportFolder) {
    throw new Error(
      "--export-folder is required."
    );
  }

  if (
    !result.dryRun &&
    !result.confirmAzureSend
  ) {
    throw new Error(
      "Real Azure ingestion requires --confirm-azure-send."
    );
  }

  if (
    result.dryRun &&
    result.confirmAzureSend
  ) {
    throw new Error(
      "--dry-run and --confirm-azure-send cannot be used together."
    );
  }

  return result;
}

async function readJsonFile(filePath) {
  const fileContent =
    await fs.readFile(filePath, "utf8");

  return JSON.parse(fileContent);
}

function requireArray(value, description) {
  if (!Array.isArray(value)) {
    throw new Error(
      `${description} must contain a JSON array.`
    );
  }
}

function validateManifest(
  manifest,
  securityRecords,
  auditRecords
) {
  if (
    !manifest ||
    typeof manifest !== "object" ||
    Array.isArray(manifest)
  ) {
    throw new Error(
      "Monitoring manifest must be a JSON object."
    );
  }

  if (
    manifest.SourceSystem !== "Wonderland"
  ) {
    throw new Error(
      "Monitoring manifest SourceSystem must be Wonderland."
    );
  }

  if (
    !manifest.ExportedRecordCounts ||
    typeof manifest.ExportedRecordCounts !==
      "object"
  ) {
    throw new Error(
      "Monitoring manifest does not contain ExportedRecordCounts."
    );
  }

  if (
    securityRecords.length !==
    manifest.ExportedRecordCounts.SecurityEvents
  ) {
    throw new Error(
      "Security record count does not match the manifest."
    );
  }

  if (
    auditRecords.length !==
    manifest.ExportedRecordCounts.ApplicationAuditEvents
  ) {
    throw new Error(
      "Application audit record count does not match the manifest."
    );
  }
}

function validateMonitoringRecord(
  record,
  expectedSourceTable,
  index
) {
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record)
  ) {
    throw new Error(
      `${expectedSourceTable} record ${index + 1} must be an object.`
    );
  }

  if (!record.TimeGenerated) {
    throw new Error(
      `${expectedSourceTable} record ${index + 1} is missing TimeGenerated.`
    );
  }

  if (
    record.SourceSystem !== "Wonderland"
  ) {
    throw new Error(
      `${expectedSourceTable} record ${index + 1} has an invalid SourceSystem.`
    );
  }

  if (
    record.SourceTable !== expectedSourceTable
  ) {
    throw new Error(
      `${expectedSourceTable} record ${index + 1} has an invalid SourceTable.`
    );
  }

  if (
    record.SourceEventId === null ||
    record.SourceEventId === undefined
  ) {
    throw new Error(
      `${expectedSourceTable} record ${index + 1} is missing SourceEventId.`
    );
  }
}

function validateMonitoringRecords(
  records,
  expectedSourceTable
) {
  records.forEach(
    (record, index) =>
      validateMonitoringRecord(
        record,
        expectedSourceTable,
        index
      )
  );
}

async function loadMonitoringExport(
  exportFolder
) {
  const resolvedExportFolder =
    path.resolve(exportFolder);

  const manifestPath =
    path.join(
      resolvedExportFolder,
      "manifest.json"
    );

  const manifest =
    await readJsonFile(manifestPath);

  if (
    !manifest.Files ||
    typeof manifest.Files !== "object"
  ) {
    throw new Error(
      "Monitoring manifest does not contain Files."
    );
  }

  const securityFileName =
    manifest.Files.SecurityEvents;

  const auditFileName =
    manifest.Files.ApplicationAuditEvents;

  if (
    !securityFileName ||
    !auditFileName
  ) {
    throw new Error(
      "Monitoring manifest does not declare both monitoring files."
    );
  }

  const securityPath =
    path.join(
      resolvedExportFolder,
      securityFileName
    );

  const auditPath =
    path.join(
      resolvedExportFolder,
      auditFileName
    );

  const [
    securityRecords,
    auditRecords,
  ] = await Promise.all([
    readJsonFile(securityPath),
    readJsonFile(auditPath),
  ]);

  requireArray(
    securityRecords,
    "Security monitoring export"
  );

  requireArray(
    auditRecords,
    "Application audit monitoring export"
  );

  validateManifest(
    manifest,
    securityRecords,
    auditRecords
  );

  validateMonitoringRecords(
    securityRecords,
    "SecurityEvents"
  );

  validateMonitoringRecords(
    auditRecords,
    "ApplicationAuditEvents"
  );

  return {
    exportFolder: resolvedExportFolder,
    manifest,
    securityRecords,
    auditRecords,
  };
}

function createDryRunClient(calls) {
  return {
    async upload(
      dcrImmutableId,
      streamName,
      records
    ) {
      calls.push({
        dcrImmutableId,
        streamName,
        recordCount: records.length,
      });
    },
  };
}

async function ingestMonitoringExport({
  exportFolder,
  dryRun,
  environment = process.env,
}) {
  const monitoringExport =
    await loadMonitoringExport(
      exportFolder
    );

  if (!dryRun) {
    const securityResult =
      await uploadSecurityEvents(
        monitoringExport.securityRecords,
        {
          environment,
        }
      );

    const auditResult =
      await uploadApplicationAuditEvents(
        monitoringExport.auditRecords,
        {
          environment,
        }
      );

    return {
      dryRun: false,
      monitoringExport,
      securityResult,
      auditResult,
      uploadCalls: null,
    };
  }

  const monitoringConfiguration =
    getAzureMonitoringConfiguration(
      environment
    );

  const uploadCalls = [];
  const fakeClient =
    createDryRunClient(uploadCalls);

  const securityResult =
    await uploadSecurityEvents(
      monitoringExport.securityRecords,
      {
        environment,
        client: fakeClient,
      }
    );

  const auditResult =
    await uploadApplicationAuditEvents(
      monitoringExport.auditRecords,
      {
        environment,
        client: fakeClient,
      }
    );

  return {
    dryRun: true,
    monitoringExport,
    monitoringConfiguration,
    securityResult,
    auditResult,
    uploadCalls,
  };
}

async function main() {
  const options =
    parseArguments(
      process.argv.slice(2)
    );

  const result =
    await ingestMonitoringExport({
      exportFolder:
        options.exportFolder,
      dryRun:
        options.dryRun,
    });

  console.log("");
  console.log(
    "PASS: Monitoring ingestion runner completed."
  );

  console.log(
    `Mode: ${
      result.dryRun
        ? "DRY RUN"
        : "AZURE INGESTION"
    }`
  );

  console.log(
    `Export directory: ${
      result.monitoringExport.exportFolder
    }`
  );

  console.log(
    "Security records: " +
      result.monitoringExport
        .securityRecords.length
  );

  console.log(
    "Application audit records: " +
      result.monitoringExport
        .auditRecords.length
  );

  if (result.dryRun) {
    console.log("");
    console.log(
      "Dry-run upload routing:"
    );

    for (
      const call of result.uploadCalls
    ) {
      console.log(
        `- DCR: ${call.dcrImmutableId}`
      );

      console.log(
        `  Stream: ${call.streamName}`
      );

      console.log(
        `  Records: ${call.recordCount}`
      );
    }

    console.log("");
    console.log(
      "No records were sent to Azure."
    );
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("");
    console.error(
      "FAIL: Monitoring ingestion runner failed."
    );

    console.error(
      error.message
    );

    process.exitCode = 1;
  });
}

module.exports = {
  createDryRunClient,
  ingestMonitoringExport,
  loadMonitoringExport,
  parseArguments,
  validateManifest,
  validateMonitoringRecord,
  validateMonitoringRecords,
};
