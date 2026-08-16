"use strict";

const {
  ClientSecretCredential,
} = require("@azure/identity");

const {
  LogsIngestionClient,
} = require("@azure/monitor-ingestion");

const REQUIRED_IDENTITY_ENVIRONMENT_VARIABLES = [
  "AZURE_TENANT_ID",
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
];

const REQUIRED_MONITORING_ENVIRONMENT_VARIABLES = [
  "AZURE_MONITOR_INGESTION_ENDPOINT",
  "AZURE_MONITOR_SECURITY_DCR_IMMUTABLE_ID",
  "AZURE_MONITOR_SECURITY_STREAM_NAME",
  "AZURE_MONITOR_AUDIT_DCR_IMMUTABLE_ID",
  "AZURE_MONITOR_AUDIT_STREAM_NAME",
];

function getRequiredEnvironmentValue(
  environment,
  variableName
) {
  const value = environment[variableName];

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    throw new Error(
      `Required Azure configuration is missing: ${variableName}`
    );
  }

  return String(value).trim();
}

function getAzureIdentityConfiguration(
  environment = process.env
) {
  return {
    tenantId: getRequiredEnvironmentValue(
      environment,
      "AZURE_TENANT_ID"
    ),
    clientId: getRequiredEnvironmentValue(
      environment,
      "AZURE_CLIENT_ID"
    ),
    clientSecret: getRequiredEnvironmentValue(
      environment,
      "AZURE_CLIENT_SECRET"
    ),
  };
}

function getAzureMonitoringConfiguration(
  environment = process.env
) {
  return {
    ingestionEndpoint: getRequiredEnvironmentValue(
      environment,
      "AZURE_MONITOR_INGESTION_ENDPOINT"
    ),

    security: {
      dcrImmutableId: getRequiredEnvironmentValue(
        environment,
        "AZURE_MONITOR_SECURITY_DCR_IMMUTABLE_ID"
      ),
      streamName: getRequiredEnvironmentValue(
        environment,
        "AZURE_MONITOR_SECURITY_STREAM_NAME"
      ),
    },

    audit: {
      dcrImmutableId: getRequiredEnvironmentValue(
        environment,
        "AZURE_MONITOR_AUDIT_DCR_IMMUTABLE_ID"
      ),
      streamName: getRequiredEnvironmentValue(
        environment,
        "AZURE_MONITOR_AUDIT_STREAM_NAME"
      ),
    },
  };
}

function createAzureLogsIngestionClient(
  environment = process.env
) {
  const identity =
    getAzureIdentityConfiguration(environment);

  const monitoring =
    getAzureMonitoringConfiguration(environment);

  const credential = new ClientSecretCredential(
    identity.tenantId,
    identity.clientId,
    identity.clientSecret
  );

  return new LogsIngestionClient(
    monitoring.ingestionEndpoint,
    credential
  );
}

function validateRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error(
      "Azure monitoring records must be supplied as an array."
    );
  }
}

async function uploadRecords(
  client,
  dcrImmutableId,
  streamName,
  records
) {
  if (
    !client ||
    typeof client.upload !== "function"
  ) {
    throw new Error(
      "A valid Azure LogsIngestionClient is required."
    );
  }

  validateRecords(records);

  if (records.length === 0) {
    return {
      uploaded: false,
      recordCount: 0,
    };
  }

  await client.upload(
    dcrImmutableId,
    streamName,
    records
  );

  return {
    uploaded: true,
    recordCount: records.length,
  };
}

async function uploadSecurityEvents(
  records,
  options = {}
) {
  const environment =
    options.environment || process.env;

  const monitoring =
    getAzureMonitoringConfiguration(environment);

  const client =
    options.client ||
    createAzureLogsIngestionClient(environment);

  return uploadRecords(
    client,
    monitoring.security.dcrImmutableId,
    monitoring.security.streamName,
    records
  );
}

async function uploadApplicationAuditEvents(
  records,
  options = {}
) {
  const environment =
    options.environment || process.env;

  const monitoring =
    getAzureMonitoringConfiguration(environment);

  const client =
    options.client ||
    createAzureLogsIngestionClient(environment);

  return uploadRecords(
    client,
    monitoring.audit.dcrImmutableId,
    monitoring.audit.streamName,
    records
  );
}

module.exports = {
  REQUIRED_IDENTITY_ENVIRONMENT_VARIABLES,
  REQUIRED_MONITORING_ENVIRONMENT_VARIABLES,
  getAzureIdentityConfiguration,
  getAzureMonitoringConfiguration,
  createAzureLogsIngestionClient,
  uploadRecords,
  uploadSecurityEvents,
  uploadApplicationAuditEvents,
};
