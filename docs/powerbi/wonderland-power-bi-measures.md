# Wonderland Power BI Measures and Semantic Model

This document contains suggested DAX measures and semantic model notes for the Wonderland Power BI learning dashboard.

These measures are designed for the Iteration 16 reporting views in `WonderlandDW`.

Recommended Power BI source views:

- `dbo.vPowerBIApplicationAuditEvents`
- `dbo.vPowerBISecurityEvents`
- `dbo.vPowerBIUserActivitySummary`
- `dbo.vPowerBISecuritySeverityTrend`
- `dbo.vPowerBIAuditActionSummary`
- `dbo.vPowerBISecurityCategorySummary`

---

## Application Audit Measures

~~~DAX
Total Application Audit Events =
COUNTROWS('vPowerBIApplicationAuditEvents')
~~~

~~~DAX
Successful Application Audit Events =
CALCULATE(
    [Total Application Audit Events],
    'vPowerBIApplicationAuditEvents'[Outcome] = "Success"
)
~~~

~~~DAX
Application Audit Events Last 7 Days =
CALCULATE(
    [Total Application Audit Events],
    DATESINPERIOD(
        'vPowerBIDate'[Date],
        MAX('vPowerBIDate'[Date]),
        -7,
        DAY
    )
)
~~~

---

## Security Measures

~~~DAX
Total Security Events =
COUNTROWS('vPowerBISecurityEvents')
~~~

~~~DAX
High Severity Security Events =
CALCULATE(
    [Total Security Events],
    'vPowerBISecurityEvents'[IsHighSeverity] = 1
)
~~~

~~~DAX
Failed Or Denied Security Events =
CALCULATE(
    [Total Security Events],
    'vPowerBISecurityEvents'[IsFailedOrDenied] = 1
)
~~~

~~~DAX
Security Events Last 7 Days =
CALCULATE(
    [Total Security Events],
    DATESINPERIOD(
        'vPowerBIDate'[Date],
        MAX('vPowerBIDate'[Date]),
        -7,
        DAY
    )
)
~~~

---

## User Activity Measures

~~~DAX
Total User Activity Events =
SUM('vPowerBIUserActivitySummary'[TotalEventCount])
~~~

~~~DAX
Total Security Activity Events =
SUM('vPowerBIUserActivitySummary'[SecurityEventCount])
~~~

~~~DAX
Total Application Activity Events =
SUM('vPowerBIUserActivitySummary'[ApplicationAuditEventCount])
~~~

---

## Suggested Dashboard Pages

### Page 1 — Executive Overview

Suggested visuals:

- Total Application Audit Events
- Total Security Events
- High Severity Security Events
- Failed Or Denied Security Events
- Event trend by date
- Events by actor role

### Page 2 — Security Monitoring

Suggested visuals:

- Security events by severity
- Security events by category
- High severity trend
- Failed or denied event count
- Security event timeline

### Page 3 — Application Audit

Suggested visuals:

- Audit events by action type
- Audit events by entity type
- Audit events by actor role
- Recent admin, manager, and user activity

### Page 4 — User Activity

Suggested visuals:

- Total events by user
- Application audit events by user
- Security events by user
- User activity over time

---

## Iteration 17 Semantic Model Notes

Iteration 17 extends the report from separate imported reporting views into a relationship-based Power BI semantic model.

### Shared dimension views

- dbo.vPowerBIDate
- dbo.vPowerBIUser
- dbo.vPowerBIRole
- dbo.vPowerBISemanticModelValidation

### Relationship pattern

Use one-to-many, single-direction, active relationships.

- vPowerBIDate DateKey filters reporting views by DateKey
- vPowerBIUser UserKey filters audit, security and user activity views by ActorUserKey
- vPowerBIRole RoleKey filters audit, security and user activity views by ActorRoleKey

Avoid fact-to-fact relationships and avoid a direct vPowerBIUser to vPowerBIRole relationship.

### Date table setup

Mark vPowerBIDate as the Power BI date table using the Date column.

Sort MonthName by MonthNumber.

Sort YearMonth by YearMonthSort.

### Interactive report features

- Synced Date slicer using vPowerBIDate Date
- Synced Role slicer using vPowerBIRole RoleName
- User Activity Details drill-through page using vPowerBIUser Email
- Security Tooltip report page for the Security Events by Category visual

### Validation

Run the Iteration 17 semantic validation helper before refreshing Power BI:

    sqlcmd -S localhost -d WonderlandDW -E -C -i .\SqlQueries\Iteration17PowerBISemanticModelValidation.sql

The validation checks semantic view reconciliation, date continuity, sentinel date exclusion, exposed relationship keys and semantic dimension availability.

Local PBIX files remain ignored by Git. SQL scripts and documentation are version controlled.
