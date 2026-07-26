# Wonderland Monitoring Learning Guide

## Purpose

Iteration 18 connects Wonderland's existing application-audit and
security-event capabilities to cloud monitoring and SIEM learning
concepts.

The current phase is deliberately local and safe. It demonstrates how
Wonderland events can be:

1. read from SQL Server without modifying source data;
2. converted into a common monitoring-event structure;
3. exported into local JSON files;
4. evaluated by local security detection rules; and
5. validated before future Azure integration.

No data is currently sent to Azure.

## Current Local Architecture

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

Time-window behaviour will be demonstrated later using KQL examples.

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

The current implementation:

- performs read-only SQL queries;
- does not insert, update or delete source records;
- writes only into the ignored local export folder;
- does not create Microsoft Sentinel alerts;
- does not send records to Azure;
- does not store Azure credentials; and
- does not create Azure resources.

## Future Controlled Azure Phase

A later phase may connect the monitoring structure to Azure Monitor,
Log Analytics and Microsoft Sentinel.

That phase must include:

- review before creating Azure resources;
- secure authentication;
- controlled ingestion of a small test dataset;
- KQL query validation;
- cost and retention review;
- confirmation that no secrets are committed; and
- explicit approval before resources are created or changed.
