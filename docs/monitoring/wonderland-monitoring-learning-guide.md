# Wonderland Monitoring Learning Guide

## Purpose

Iteration 18 connects Wonderland's existing application-audit and
security-event capabilities to cloud monitoring and SIEM learning
concepts.

Iteration 18 now contains two validated learning phases. Wonderland events
can be:

1. read from SQL Server without modifying source data;
2. converted into a common monitoring-event structure;
3. exported into local JSON files;
4. evaluated by local security detection rules;
5. mapped into Azure Monitor custom-table schemas;
6. ingested as controlled sanitised test records;
7. queried and correlated in Log Analytics with KQL; and
8. detected by a controlled Microsoft Sentinel analytics rule.

Only sanitised learning records were sent to Azure. No production data
was included in the controlled Azure validation.

## Local Architecture

```text
WonderlandDB
  |
  | Read-only SQL queries
  |
  +-- dbo.SecurityEvents
  |
  +-- dbo.ApplicationAuditEvents
          |
          v
monitoringEventMapper.js
          |
          v
Local monitoring JSON
          |
          v
monitoringDetectionRules.js
          |
          v
detections.json
          |
          v
validate-monitoring-workflow.js
```

## Controlled Azure Architecture

```text
Sanitised local test payloads
        |
        v
Microsoft Entra application authentication
        |
        v
Azure Monitor Logs Ingestion API
        |
        v
dce-wonderland-monitoring-lab
        |
        +-------------------------------+
        |                               |
        v                               v
Security DCR                       Application Audit DCR
        |                               |
        v                               v
WonderlandSecurityEvents_CL        WonderlandApplicationAuditEvents_CL
        |                               |
        +---------------+---------------+
                        |
                        v
                 Log Analytics KQL
                        |
                        v
              Microsoft Sentinel rule
                        |
                        v
               Alert -> Incident
```

The controlled Sentinel rule was disabled after validation, and the
resulting incident was resolved as security-testing activity.

## Local Monitoring Components

| Component                                         | Purpose                                                 |
| ------------------------------------------------- | ------------------------------------------------------- |
| `backend/services/monitoringEventMapper.js`       | Converts SQL rows into a common monitoring-event format |
| `backend/scripts/export-monitoring-events.js`     | Creates timestamped local JSON exports                  |
| `backend/services/monitoringDetectionRules.js`    | Applies local Sentinel-style detection rules            |
| `backend/scripts/run-monitoring-detections.js`    | Runs rules against the latest security-event export     |
| `backend/scripts/validate-monitoring-workflow.js` | Validates export counts, detections and safety notes    |

## Commands

Run these commands from the Wonderland project root.

### Export monitoring events

```powershell
npm --prefix backend run monitor:export -- 25
```

This reads up to 25 recent records from each source table.

### Run local detections

```powershell
npm --prefix backend run monitor:detect
```

This reads the latest `security-events.json` file and creates
`detections.json`.

### Validate the completed workflow

```powershell
npm --prefix backend run monitor:validate
```

This validates:

- manifest and export record counts;
- detection totals;
- rule-summary totals;
- recognised Wonderland rule IDs; and
- Azure and Sentinel safety notes.

## Generated Files

Each export creates a timestamped folder under:

```text
backend/exports/monitoring/
```

A completed simulation contains:

```text
manifest.json
security-events.json
application-audit-events.json
detections.json
```

The generated monitoring folder is excluded from Git.

## Local Detection Rules

| Rule ID   | Detection                           | Default condition                                | Severity        |
| --------- | ----------------------------------- | ------------------------------------------------ | --------------- |
| `WDL-001` | Repeated failed logins              | Three or more `FailedLogin` events for one actor | Medium          |
| `WDL-002` | Repeated restricted access attempts | Two or more `AccessDenied` events for one actor  | High            |
| `WDL-003` | High-severity event                 | One High or Critical source event                | Source severity |
| `WDL-004` | Audit/security correlation          | Security event has a linked audit-event ID       | Informational   |

Actor grouping uses the actor email when available, then the IP address,
and finally `UnknownActor`.

## Current Limitation

The repeated-activity rules currently evaluate all events supplied to
the detection engine.

They do not yet apply a rolling time condition such as:

```text
Three failed logins within ten minutes
```

Time-window behaviour is demonstrated in the KQL learning pack and was validated in Log Analytics during Controlled Phase B.

## Validated Local Example

The completed local exercise evaluated:

- 25 security events;
- 25 application-audit events; and
- 15 local detections.

The triggered rules were:

- five `WDL-002` repeated-access detections; and
- ten `WDL-003` high-severity detections.

Results may change when new Wonderland events are generated.

## Safety Boundary

The completed implementation:

- performs read-only SQL queries against the Wonderland monitoring sources;
- does not insert, update or delete source audit or security records;
- writes generated local monitoring and test payloads only under the ignored export folder;
- sends only controlled sanitised learning records to Azure;
- sends no production monitoring data to Azure;
- stores no Azure secret or access-token value in Git;
- protects the client secret outside the repository with Windows DPAPI; and
- leaves the controlled Sentinel analytics rule disabled after testing.

## Controlled Azure Phase Completed

Controlled Phase B validated:

- Azure Monitor custom-table creation and schema review;
- dedicated DCE and DCR routing for both Wonderland event types;
- secure Microsoft Entra application authentication;
- successful Logs Ingestion API requests returning HTTP 204;
- KQL inspection and cross-table correlation;
- correlation key `920001` across Security and Application Audit records;
- `TestRunIdMatch = true`;
- `TimeDeltaSeconds = 2`;
- one controlled Microsoft Sentinel Informational alert;
- one controlled Sentinel/Defender incident;
- resolution of the incident as expected security-testing activity; and
- disabling of the learning analytics rule after validation.
