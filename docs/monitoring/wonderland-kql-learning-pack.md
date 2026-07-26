# Wonderland KQL Learning Pack

## Purpose

This guide translates Wonderland's local monitoring schema into
Kusto Query Language learning examples.

The queries use these planned future Azure Monitor custom-table names:

```text
WonderlandSecurityEvents_CL
WonderlandApplicationAuditEvents_CL
```

These tables do not currently exist. No Wonderland data has been sent
to Azure, and these queries have not yet been executed in a Log
Analytics workspace or Microsoft Sentinel.

## Expected Security-Event Columns

The planned security-event table is based on the local
`security-events.json` structure:

```text
TimeGenerated
SchemaVersion
SourceSystem
SourceTable
SourceEventId
EventCategory
EventType
Severity
ActorUserId
ActorRole
ActorEmail
ActionStatus
EventSummary
Details
RequestMethod
RequestPath
IpAddress
UserAgent
SourceApplicationAuditEventId
```

## Expected Application-Audit Columns

The planned audit table is based on the local
`application-audit-events.json` structure:

```text
TimeGenerated
SchemaVersion
SourceSystem
SourceTable
SourceEventId
EventCategory
EventType
Severity
ActorUserId
ActorRole
ActorEmail
TargetEntityType
TargetEntityId
TargetEntityReference
ActionStatus
EventSummary
Details
RequestMethod
RequestPath
IpAddress
UserAgent
```

## KQL Pipeline Structure

A KQL query normally begins with a table and passes its results through
operators using the pipe character:

```kusto
WonderlandSecurityEvents_CL
| where EventType == "AccessDenied"
| project TimeGenerated, ActorEmail, RequestPath
| order by TimeGenerated desc
```

Each operator receives the result of the previous line.

## Query 1 — View the Latest Security Events

```kusto
WonderlandSecurityEvents_CL
| order by TimeGenerated desc
| take 20
```

Learning purpose:

- select a table;
- sort by event time; and
- limit the number of displayed records.

## Query 2 — Find Access-Denied Events

```kusto
WonderlandSecurityEvents_CL
| where EventType == "AccessDenied"
| project
    TimeGenerated,
    SourceEventId,
    Severity,
    ActorEmail,
    ActorRole,
    ActionStatus,
    RequestMethod,
    RequestPath,
    IpAddress
| order by TimeGenerated desc
```

This is the basic query behind the local `WDL-002` learning rule.

## Query 3 — Count Events by Type and Severity

```kusto
WonderlandSecurityEvents_CL
| summarize
    EventCount = count()
    by EventType, Severity
| order by EventCount desc
```

This groups matching records and counts the events in each combination.

## Query 4 — Security Activity Over Time

```kusto
WonderlandSecurityEvents_CL
| where TimeGenerated >= ago(24h)
| summarize
    EventCount = count()
    by bin(TimeGenerated, 1h), Severity
| order by TimeGenerated asc
```

This query:

- examines the previous 24 hours;
- groups events into one-hour time buckets; and
- counts activity by severity.

## Query 5 — Repeated Failed Logins

```kusto
let Threshold = 3;
WonderlandSecurityEvents_CL
| where TimeGenerated >= ago(24h)
| where EventType == "FailedLogin"
| extend ActorKey = iff(
    isnotempty(ActorEmail),
    ActorEmail,
    iff(
        isnotempty(IpAddress),
        IpAddress,
        "UnknownActor"
    )
)
| extend WindowStart = bin(TimeGenerated, 10m)
| summarize
    FailureCount = count(),
    FirstSeen = min(TimeGenerated),
    LastSeen = max(TimeGenerated),
    SourceEventIds = make_set(SourceEventId)
    by ActorKey, WindowStart
| where FailureCount >= Threshold
| order by LastSeen desc
```

This is the KQL learning equivalent of `WDL-001`.

It looks for at least three failed logins for the same actor grouping
within a ten-minute bucket.

## Query 6 — Repeated Restricted Access Attempts

```kusto
let Threshold = 2;
WonderlandSecurityEvents_CL
| where TimeGenerated >= ago(24h)
| where EventType == "AccessDenied"
| extend ActorKey = iff(
    isnotempty(ActorEmail),
    ActorEmail,
    iff(
        isnotempty(IpAddress),
        IpAddress,
        "UnknownActor"
    )
)
| extend WindowStart = bin(TimeGenerated, 10m)
| summarize
    DeniedCount = count(),
    FirstSeen = min(TimeGenerated),
    LastSeen = max(TimeGenerated),
    RequestPaths = make_set(RequestPath),
    SourceEventIds = make_set(SourceEventId)
    by ActorKey, WindowStart
| where DeniedCount >= Threshold
| order by LastSeen desc
```

This is the KQL learning equivalent of `WDL-002`.

Unlike the current local JavaScript rule, this example applies a
ten-minute time bucket.

## Query 7 — High or Critical Security Events

```kusto
WonderlandSecurityEvents_CL
| where tolower(Severity) in ("high", "critical")
| project
    TimeGenerated,
    SourceEventId,
    EventCategory,
    EventType,
    Severity,
    ActorEmail,
    ActorRole,
    EventSummary,
    RequestMethod,
    RequestPath,
    IpAddress
| order by TimeGenerated desc
```

This is the KQL learning equivalent of `WDL-003`.

Each returned source record represents an individual high- or
critical-severity security event.

## Query 8 — Activity by Actor Role

```kusto
WonderlandSecurityEvents_CL
| extend EffectiveRole = iff(
    isnotempty(ActorRole),
    ActorRole,
    "UnknownRole"
)
| summarize
    EventCount = count(),
    DeniedCount = countif(
        ActionStatus == "Denied"
    )
    by EffectiveRole
| order by EventCount desc
```

This shows total security activity and denied activity by actor role.

## Query 9 — Most Active Actors

```kusto
WonderlandSecurityEvents_CL
| extend ActorKey = iff(
    isnotempty(ActorEmail),
    ActorEmail,
    iff(
        isnotempty(IpAddress),
        IpAddress,
        "UnknownActor"
    )
)
| summarize
    EventCount = count(),
    FirstSeen = min(TimeGenerated),
    LastSeen = max(TimeGenerated),
    EventTypes = make_set(EventType)
    by ActorKey
| top 10 by EventCount desc
```

This identifies the actors producing the greatest number of security
events.

High activity is not automatically malicious. The results require
context and investigation.

## Query 10 — Correlate Security and Audit Events

```kusto
let AuditEvents =
    WonderlandApplicationAuditEvents_CL
    | project
        AuditEventId = SourceEventId,
        AuditTimeGenerated = TimeGenerated,
        AuditEventType = EventType,
        AuditActorEmail = ActorEmail,
        AuditActionStatus = ActionStatus,
        AuditSummary = EventSummary,
        TargetEntityType,
        TargetEntityId,
        TargetEntityReference;

WonderlandSecurityEvents_CL
| where isnotnull(SourceApplicationAuditEventId)
| join kind=leftouter AuditEvents
    on $left.SourceApplicationAuditEventId
        == $right.AuditEventId
| project
    SecurityTimeGenerated = TimeGenerated,
    SecurityEventId = SourceEventId,
    SecurityEventType = EventType,
    SecuritySeverity = Severity,
    SecurityActorEmail = ActorEmail,
    SourceApplicationAuditEventId,
    AuditTimeGenerated,
    AuditEventType,
    AuditActorEmail,
    AuditActionStatus,
    AuditSummary,
    TargetEntityType,
    TargetEntityId,
    TargetEntityReference
| order by SecurityTimeGenerated desc
```

This is the future KQL equivalent of the `WDL-004` correlation concept.

The local `WDL-004` rule currently confirms that a linked audit-event ID
exists. This KQL example goes further by joining the security event to
the related application-audit record.

## Query 11 — Investigate One Actor

Replace the example email before running the query.

```kusto
let InvestigatedActor =
    "example.user@wonderland.local";

WonderlandSecurityEvents_CL
| where ActorEmail == InvestigatedActor
| project
    TimeGenerated,
    SourceEventId,
    EventCategory,
    EventType,
    Severity,
    ActionStatus,
    EventSummary,
    RequestMethod,
    RequestPath,
    IpAddress
| order by TimeGenerated asc
```

This creates a chronological timeline for one actor.

## Query 12 — Candidate Scheduled Detection Query

```kusto
let LookbackPeriod = 15m;
let FailedLoginThreshold = 3;

WonderlandSecurityEvents_CL
| where TimeGenerated >= ago(LookbackPeriod)
| where EventType == "FailedLogin"
| extend ActorKey = iff(
    isnotempty(ActorEmail),
    ActorEmail,
    iff(
        isnotempty(IpAddress),
        IpAddress,
        "UnknownActor"
    )
)
| summarize
    FailureCount = count(),
    FirstSeen = min(TimeGenerated),
    LastSeen = max(TimeGenerated),
    SourceEventIds = make_set(SourceEventId),
    RequestPaths = make_set(RequestPath)
    by ActorKey
| where FailureCount >= FailedLoginThreshold
```

This query is a learning candidate for a future scheduled Microsoft
Sentinel analytics rule.

No analytics rule has currently been created.

## Local Rules and KQL Mapping

| Local rule | Local implementation                            | Related KQL query |
| ---------- | ----------------------------------------------- | ----------------- |
| `WDL-001`  | Three failed logins for one actor grouping      | Query 5           |
| `WDL-002`  | Two denied-access events for one actor grouping | Query 6           |
| `WDL-003`  | Individual High or Critical event               | Query 7           |
| `WDL-004`  | Security event contains a linked audit ID       | Query 10          |

## Important Time-Window Difference

The local JavaScript repeated-activity rules evaluate all events passed
to the detection engine.

The KQL examples use explicit time filters and buckets, including:

```kusto
| where TimeGenerated >= ago(24h)
| extend WindowStart = bin(TimeGenerated, 10m)
```

This more closely represents how monitoring queries usually limit the
period being evaluated.

A fixed ten-minute bucket is not identical to a continuously sliding
ten-minute window. Sliding-window behaviour can be explored in a later
advanced exercise.

## Future Validation Requirements

Before using these queries with real Azure data:

1. create and review the Log Analytics table schemas;
2. confirm every column name and data type;
3. ingest only a small approved test dataset;
4. run the basic inspection queries first;
5. compare Azure record counts with the local manifest;
6. validate KQL detection results against known events;
7. review retention and ingestion costs;
8. confirm that no credentials are committed; and
9. obtain approval before creating Sentinel analytics rules.

## Current Safety Status

At the end of the local learning phase:

- no Log Analytics custom tables have been created;
- no Data Collection Rule has been created;
- no Azure credentials have been added;
- no records have been ingested into Azure;
- no Microsoft Sentinel analytics rule has been created; and
- all generated monitoring output remains local and excluded from Git.
