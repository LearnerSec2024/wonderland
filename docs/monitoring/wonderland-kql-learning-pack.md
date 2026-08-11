# Wonderland KQL Learning Pack

## Purpose

This guide translates Wonderland's local monitoring schema into
Kusto Query Language learning examples.

The queries use the validated Azure Monitor custom-table names:

```text
WonderlandSecurityEvents_CL
WonderlandApplicationAuditEvents_CL
```

Both tables now exist in the controlled Wonderland learning workspace.
Sanitised test records were ingested and the KQL patterns were executed
in Log Analytics. A controlled correlation query was also used by a
Microsoft Sentinel scheduled analytics rule.

## Expected Security-Event Columns

The security-event table is based on the local
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

This failed-login query remains a learning candidate for a future
scheduled Microsoft Sentinel analytics rule.

Iteration 18B created a separate controlled correlation analytics rule
to validate the end-to-end Sentinel workflow.

## Controlled Sentinel Correlation Query

Iteration 18B validated a controlled Security/Application Audit
correlation and then used the same detection logic in a scheduled
Microsoft Sentinel analytics rule.

```kusto
WonderlandSecurityEvents_CL
| where EventType == "AzureCorrelationSecurityTest"
| extend
    SecurityCorrelationKey = tolong(SourceApplicationAuditEventId),
    SecurityTestRunId = tostring(Details.TestRunId)
| project
    SecurityTimeGenerated = TimeGenerated,
    SecurityEventType = EventType,
    SecuritySeverity = Severity,
    SecurityCorrelationKey,
    SecurityTestRunId,
    SecurityActorEmail = ActorEmail,
    SecurityRequestPath = RequestPath
| join kind=inner (
    WonderlandApplicationAuditEvents_CL
    | where EventType == "AzureCorrelationAuditTest"
    | extend
        AuditCorrelationKey = tolong(SourceEventId),
        AuditTestRunId = tostring(Details.TestRunId)
    | project
        AuditTimeGenerated = TimeGenerated,
        AuditEventType = EventType,
        AuditActionStatus = ActionStatus,
        AuditCorrelationKey,
        AuditTestRunId,
        AuditActorEmail = ActorEmail,
        AuditRequestPath = RequestPath,
        TargetEntityType,
        TargetEntityId,
        TargetEntityReference
) on $left.SecurityCorrelationKey == $right.AuditCorrelationKey
| extend
    TestRunIdMatch = SecurityTestRunId == AuditTestRunId,
    TimeDeltaSeconds = datetime_diff(
        'second',
        SecurityTimeGenerated,
        AuditTimeGenerated
    )
| where TestRunIdMatch == true
| where abs(TimeDeltaSeconds) <= 30
| extend
    TimeGenerated = SecurityTimeGenerated,
    CorrelationKey = SecurityCorrelationKey
| project
    TimeGenerated,
    CorrelationKey,
    TimeDeltaSeconds,
    TestRunIdMatch,
    SecurityEventType,
    AuditEventType,
    SecuritySeverity,
    AuditActionStatus,
    SecurityActorEmail,
    AuditActorEmail,
    SecurityRequestPath,
    AuditRequestPath,
    TargetEntityType,
    TargetEntityId,
    TargetEntityReference
```

The controlled result confirmed:

```text
CorrelationKey: 920001
TestRunIdMatch: true
TimeDeltaSeconds: 2
SecurityEventType: AzureCorrelationSecurityTest
AuditEventType: AzureCorrelationAuditTest
```

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

## Controlled Azure Validation Results

Controlled Phase B completed the validation sequence:

1. created and reviewed both Log Analytics custom-table schemas;
2. confirmed the required column names and data types;
3. ingested only controlled sanitised test records;
4. ran inspection and validation queries in Log Analytics;
5. validated both Wonderland event tables independently;
6. validated the Security/Application Audit correlation;
7. confirmed that no credential or access-token value was committed;
8. created one controlled scheduled Sentinel analytics rule;
9. generated one controlled Informational alert and one incident; and
10. disabled the analytics rule after successful testing.

## Current Safety Status

At the end of Controlled Phase B:

- both Wonderland custom tables exist in the learning workspace;
- separate DCRs route Security and Application Audit events;
- only sanitised learning records were ingested;
- no production monitoring data was sent to Azure;
- generated monitoring and Azure test payloads remain excluded from Git;
- no Azure secret or access-token value is committed to the repository;
- the client secret is protected outside the repository with Windows DPAPI;
- the controlled Sentinel analytics rule is disabled; and
- the controlled incident is resolved as security-testing activity.
