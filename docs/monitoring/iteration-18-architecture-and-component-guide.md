# Wonderland Iteration 18 - Azure Monitor / Microsoft Sentinel Architecture & Component Guide

## Purpose

This is a quick-reference guide for Iteration 18. It explains what was built, why each component exists, the order in which the components were built and used, and how the full monitoring and Microsoft Sentinel flow fits together.

## 1. Goal of Iteration 18

The goal was to extend Wonderland's existing Application Audit and Security Event capability into a practical monitoring and security-operations learning flow.

The iteration demonstrated how Wonderland events can be:

1. read from SQL Server without modifying source data;
2. converted into a common monitoring-event structure;
3. exported into local JSON;
4. analysed by local detection rules;
5. sent as controlled sanitised test records to Azure Monitor;
6. stored in Log Analytics custom tables;
7. queried and correlated using KQL;
8. detected by a Microsoft Sentinel scheduled analytics rule; and
9. surfaced as a controlled alert and incident.

## 2. Architecture at a Glance

```text
Wonderland Application + SQL Server
  |
  | dbo.SecurityEvents
  | dbo.ApplicationAuditEvents
  v
Local Monitoring Layer
  |
  | monitoringEventMapper.js
  | export-monitoring-events.js
  | monitoringDetectionRules.js
  | run-monitoring-detections.js
  | validate-monitoring-workflow.js
  v
Controlled Azure Ingestion
  |
  | Microsoft Entra application authentication
  | Azure Monitor Logs Ingestion API
  | Data Collection Endpoint (DCE)
  | Security DCR
  | Application Audit DCR
  v
Log Analytics Workspace
  |
  +--> WonderlandSecurityEvents_CL
  |
  +--> WonderlandApplicationAuditEvents_CL
  |
  v
KQL Validation + Cross-Table Correlation
  |
  | CorrelationKey = 920001
  | TestRunIdMatch = true
  | TimeDeltaSeconds = 2
  v
Microsoft Sentinel Scheduled Analytics Rule
  |
  v
Controlled Alert
  |
  v
Controlled Incident
  |
  +--> Resolved as expected security-testing activity
  |
  +--> Analytics rule disabled after validation
```

## 3. Components Built and Used

| Layer | Component | Purpose |
| --- | --- | --- |
| Local | `backend/services/monitoringEventMapper.js` | Converts Wonderland SQL rows into a consistent monitoring-event structure. |
| Local | `backend/scripts/export-monitoring-events.js` | Reads recent Security and Application Audit events and exports JSON plus a manifest. |
| Local | `backend/services/monitoringDetectionRules.js` | Contains local Sentinel-style detection rules. |
| Local | `backend/scripts/run-monitoring-detections.js` | Runs local detection logic against the latest security-event export. |
| Local | `backend/scripts/validate-monitoring-workflow.js` | Validates manifest counts, export counts, detections, rule summaries and safety notes. |
| Documentation | `README.md` | Project source of truth for iteration status and delivery evidence. |
| Documentation | `docs/monitoring/wonderland-monitoring-learning-guide.md` | Explains the local/Azure monitoring architecture and safety boundaries. |
| Documentation | `docs/monitoring/wonderland-kql-learning-pack.md` | Contains KQL learning queries and the validated correlation query. |
| Azure | Log Analytics workspace | Stores and queries Wonderland monitoring data. |
| Azure | `WonderlandSecurityEvents_CL` | Custom table for security events. |
| Azure | `WonderlandApplicationAuditEvents_CL` | Custom table for application audit events. |
| Azure | Data Collection Endpoint (DCE) | Endpoint used by the Azure Monitor Logs Ingestion API. |
| Azure | Security DCR | Maps and routes security-event JSON to `WonderlandSecurityEvents_CL`. |
| Azure | Application Audit DCR | Maps and routes audit-event JSON to `WonderlandApplicationAuditEvents_CL`. |
| Security | Microsoft Entra application | Provides machine-to-machine authentication for controlled ingestion. |
| Security | Windows DPAPI-protected secret | Protects the local client secret outside the repository. |
| KQL | Validation queries | Confirm test records landed with the expected fields and values. |
| KQL | Cross-table correlation query | Joins Security and Audit events using the shared correlation key and validates test/time relationships. |
| Sentinel | Scheduled analytics rule | Runs the KQL correlation query on a schedule and creates an alert when a match exists. |
| Sentinel | Alert and incident | End-to-end security operations validation. |

## 4. Build Order

1. Reused the existing Wonderland event sources: `dbo.SecurityEvents` and `dbo.ApplicationAuditEvents`.
2. Built `monitoringEventMapper.js`.
3. Built `export-monitoring-events.js`.
4. Built `monitoringDetectionRules.js`.
5. Built `run-monitoring-detections.js`.
6. Built `validate-monitoring-workflow.js`.
7. Prepared sanitised local schema/test samples.
8. Created the Log Analytics workspace, DCE, two DCRs and two custom tables.
9. Configured secure Microsoft Entra application authentication.
10. Protected the local client secret outside the repository using Windows DPAPI.
11. Created controlled Security and Application Audit ingestion payloads.
12. Uploaded controlled test events through the Azure Monitor Logs Ingestion API.
13. Validated each custom table with KQL.
14. Created a deliberate correlated Security + Audit pair.
15. Validated the pair with a KQL join.
16. Used the successful KQL in a Microsoft Sentinel scheduled analytics rule.
17. Generated one controlled Informational alert and one incident.
18. Resolved the incident as expected security-testing activity.
19. Disabled the controlled analytics rule after successful validation.

## 5. Runtime / Use Order

```text
Wonderland event
    ↓
Monitoring mapper
    ↓
Local JSON export
    ↓
Local detection simulation / validation
    ↓
Sanitised Azure test payload
    ↓
Microsoft Entra authentication
    ↓
Azure Monitor Logs Ingestion API
    ↓
DCE
    ↓
Relevant DCR
    ↓
Relevant Log Analytics custom table
    ↓
KQL inspection
    ↓
Cross-table correlation
    ↓
Sentinel scheduled analytics rule
    ↓
Alert
    ↓
Incident
```

## 6. The Correlated Test Pair

The clearest end-to-end example was the deliberate correlated Security + Application Audit pair.

The two records shared:

- correlation key `920001`;
- the same `TestRunId`;
- the same controlled actor/request context; and
- a two-second relationship between the Audit and Security event timestamps.

The important field relationship was:

```text
WonderlandSecurityEvents_CL.SourceApplicationAuditEventId
    =
WonderlandApplicationAuditEvents_CL.SourceEventId
```

Validated result:

```text
CorrelationKey: 920001
TestRunIdMatch: true
TimeDeltaSeconds: 2
SecurityEventType: AzureCorrelationSecurityTest
AuditEventType: AzureCorrelationAuditTest
```

## 7. KQL Correlation Logic in Plain English

1. Read the controlled Security test record.
2. Treat `SourceApplicationAuditEventId` as the Security correlation key.
3. Read the controlled Application Audit test record.
4. Treat `SourceEventId` as the Audit correlation key.
5. Join the tables where the two keys are equal.
6. Compare the `TestRunId` values.
7. Keep only matching test runs.
8. Calculate the timestamp difference.
9. Keep only events within the controlled time window.
10. Return the fields needed for the Sentinel detection.

## 8. What Microsoft Sentinel Added

Log Analytics and KQL provided storage and query capability. Microsoft Sentinel added the security-operations workflow:

- the scheduled analytics rule reran the detection query automatically;
- a matching result created an Informational alert;
- incident creation was enabled;
- one controlled incident was produced;
- the incident was reviewed and resolved as expected security-testing activity; and
- the learning analytics rule was disabled after successful validation.

## 9. Security and Cost Controls

- WonderlandDB monitoring source access remained read-only.
- No production monitoring data was sent to Azure.
- Monitoring exports, schema samples and Azure test payloads remained Git ignored.
- No client secret or access-token value was committed to Git.
- The local client secret was protected outside the repository using Windows DPAPI.
- A dedicated Microsoft Entra application was used for ingestion.
- The Azure learning environment used a small budget and Log Analytics daily ingestion cap.
- The controlled Sentinel analytics rule remains retained but disabled.
- The controlled incident remains resolved as evidence of the exercise.

## 10. Simple Glossary

| Term | Meaning in Iteration 18 |
| --- | --- |
| Mapper | Converts application/database records into a consistent monitoring schema. |
| Exporter | Reads source events and writes local JSON files. |
| Detection rule | Logic that decides whether an event or pattern should be surfaced. |
| DCE | Data Collection Endpoint - the Azure endpoint used for log ingestion. |
| DCR | Data Collection Rule - defines the incoming stream/schema and target routing. |
| Log Analytics | Azure workspace for storing and querying logs. |
| Custom table | A Log Analytics table created for the Wonderland event schema. |
| KQL | Kusto Query Language - used to search, filter, aggregate and join log data. |
| Correlation | Connecting separate records that refer to the same underlying activity. |
| Sentinel analytics rule | Scheduled KQL-based detection logic. |
| Alert | A detection generated when a rule finds matching data. |
| Incident | A case used to investigate and resolve security alerts. |
| DPAPI | Windows Data Protection API used to protect the local client secret. |

## 11. Final State

| Area | Final state |
| --- | --- |
| Iteration | Completed |
| Completion commit | `2debe2e` - Complete Iteration 18 Azure Monitor and Sentinel validation |
| Local Playwright | 57 / 57 passed |
| Local monitoring validator | Passed |
| GitHub Actions | Playwright Smoke Tests #55 passed |
| Azure DevOps | Pipeline #20260811.1 passed |
| Sentinel analytics rule | Retained but Disabled |
| Controlled incident | Resolved as expected security-testing activity |
| Production monitoring data | None sent to Azure |
| Repository working tree at completion | Clean |

## 12. Memory Aid

> Iteration 18 took Wonderland security/audit events, mapped and exported them locally, simulated detections locally, sent sanitised test events into Azure Monitor, stored them in Log Analytics custom tables, validated and correlated them with KQL, used the correlation in a Microsoft Sentinel scheduled rule, generated a controlled alert and incident, then resolved the incident and disabled the rule.

## 13. Relationship to Existing Iteration 18 Documentation

This guide is intended as the simplified architecture and component reference. The deeper supporting documentation remains:

- `docs/monitoring/wonderland-monitoring-learning-guide.md`
- `docs/monitoring/wonderland-kql-learning-pack.md`

Project location:

```text
docs/monitoring/iteration-18-architecture-and-component-guide.md
```

## 14. Azure SDK Continuation

A post-completion learning continuation added an application-level Azure
SDK ingestion implementation while preserving the original Iteration 18
safety boundary.

### Added Local Components

| Component | Role |
| --- | --- |
| backend/services/azureLogIngestionService.js | Loads Azure configuration, creates ClientSecretCredential and LogsIngestionClient, and routes Security and Audit records |
| backend/scripts/ingest-monitoring-export.js | Loads and validates a monitoring export folder and coordinates dry-run or explicitly confirmed ingestion |
| @azure/identity | Official Azure identity SDK dependency |
| @azure/monitor-ingestion | Official Azure Monitor Logs Ingestion SDK dependency |

### SDK Architecture

```text
Existing local monitoring export
        |
        v
ingest-monitoring-export.js
        |
        | manifest and record validation
        v
azureLogIngestionService.js
        |
        +--> ClientSecretCredential
        |
        +--> LogsIngestionClient
                  |
                  v
                 DCE
                  |
        +---------+---------+
        |                   |
        v                   v
 Security DCR          Audit DCR
        |                   |
        v                   v
Security custom table  Audit custom table
```

The SDK implementation does not remap exported records. The existing
monitoring export is already in the common Azure-ready schema produced
by monitoringEventMapper.js.

### Explicit Send Guard

The ingestion runner supports two mutually exclusive operating modes:

```text
--dry-run
    validates loading, schema and routing without an Azure request

--confirm-azure-send
    explicitly authorises real Azure ingestion
```

A run that omits explicit real-send confirmation is rejected.

### Configuration Contract

The code expects these environment-variable names:

```text
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_MONITOR_INGESTION_ENDPOINT
AZURE_MONITOR_SECURITY_DCR_IMMUTABLE_ID
AZURE_MONITOR_SECURITY_STREAM_NAME
AZURE_MONITOR_AUDIT_DCR_IMMUTABLE_ID
AZURE_MONITOR_AUDIT_STREAM_NAME
```

Environment-specific values are intentionally excluded from this guide.

The client secret continues to be protected outside Git using Windows
DPAPI.

### End-to-End Runner Validation

The completed runner path was tested using one controlled synthetic
Security event and one controlled synthetic Application Audit event:

```text
TestRunId: API3C8B-20260816T005145977Z
```

KQL validation confirmed:

```text
WonderlandSecurityEvents_CL
  SourceEventId = 991001
  EventType = AzureSdkRunnerSecurityTest
  ActionStatus = Observed

WonderlandApplicationAuditEvents_CL
  SourceEventId = 991002
  EventType = AzureSdkRunnerAuditTest
  ActionStatus = Succeeded
```

This proved:

```text
Export package
    -> ingestion runner
    -> Azure SDK service
    -> Microsoft Entra authentication
    -> LogsIngestionClient
    -> DCE
    -> appropriate DCR
    -> appropriate Log Analytics custom table
    -> KQL validation
```

The real local monitoring export containing 25 Security records and 25
Application Audit records was exercised in dry-run mode only and was
not transmitted to Azure.

After the controlled real-send validation, all Azure process environment
variables were removed from the local PowerShell session.

## 15. SDK Continuation Safety State

| Control | State |
| --- | --- |
| WonderlandDB access | Read-only monitoring export |
| Real 25 + 25 export | Dry-run only |
| Production monitoring data sent to Azure | No |
| Controlled SDK runner send | 1 synthetic Security + 1 synthetic Audit record |
| Real-send guard | --confirm-azure-send required |
| Dry-run guard | Fake client, no Azure request |
| Azure credentials in Git | None |
| Client secret storage | Outside repository using Windows DPAPI |
| Azure variables after controlled send | Removed from process environment |
| Sentinel learning rule | Retained but disabled |
