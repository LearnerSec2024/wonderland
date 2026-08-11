# Wonderland Full Stack App

Wonderland is a learning-focused full-stack web application for a modern theme park experience.

The app is being built for two connected learning purposes:

1. Theme park booking platform - users can browse rides, browse accommodation, register, log in, book experiences, manage bookings, cancel bookings, and earn WonderPoints.
2. Playwright JavaScript training app - the app includes realistic user, Admin and Manager workflows, and will later include a dedicated Automation Lab with intentionally tricky locator scenarios.

This project is being built locally on a personal Windows 11 laptop for enterprise-style full-stack learning.

---

## Current Status Snapshot

| Area | Status |
|---|---|
| SQL Server local database | Complete and actively used |
| Backend Express API | Complete foundation plus booking, Admin, Manager, reporting, export and audit APIs |
| Backend SQL Server connection | Working |
| Backend authentication APIs | Working |
| React frontend | Complete foundation with role-based User, Admin and Manager flows |
| Playwright test suite | Passing locally |
| Local Playwright result after Iteration 16 API collection validation | 57 tests passed |
| GitHub repository | Published |
| GitHub Actions workflow | Passing |
| Azure DevOps Pipeline | Passing |
| Latest completed iteration | **Iteration 17 - Power BI Semantic Model and Interactive Reporting** |
| Current completed iteration | **Iteration 17 - Power BI Semantic Model and Interactive Reporting** |

Current local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5010
Database: WonderlandDB
```

Current local project folder:

```text
D:\Real Projects Backup\wonderland
```

Current branch/remotes after Iteration 13:

```text
master
origin/master
azure/master
```

Latest completed commit:

```text
Add Iteration 13 application audit logs
```

---

## Development Rhythm

Every feature iteration must follow the full Wonderland safe delivery flow.

1. Implement the iteration changes.
2. Add or update SQL migrations if the change affects schema, seed data, CDC, triggers, audit tables or reporting objects.
3. Add or extend Playwright tests for existing plus new functionality.
4. Run the full local Playwright suite.
5. Fix issues until tests are green.
6. Update README if project behaviour, APIs, database, tests, reporting, CI or roadmap changed.
7. Commit the feature, tests, database scripts and README together.
8. Push to GitHub first.
9. Confirm GitHub Actions passes.
10. Push the same commit to Azure DevOps.
11. Confirm Azure DevOps Pipeline passes.
12. Move to the next iteration.

Current test command from the project root:

```powershell
npm run test:e2e
```

Current definition of done:

```text
Local Playwright tests passing
+ GitHub Actions passing
+ Azure DevOps Pipeline passing
```

---

## Wonderland Golden Rule for Future Changes

Every change in Wonderland must be assessed across the full delivery chain before it is considered complete.

A change is not just a frontend, backend, database, or test change in isolation. Any update may affect one or more of these layers:

- Frontend behaviour, routes, components, forms, navigation, state, and `data-testid` selectors
- Backend API contracts, routes, controllers, middleware, role checks, and response shapes
- SQL Server schema, migrations, seed data, CDC, triggers, audit tables, and reporting objects
- Playwright tests, fixtures, setup data, authentication helpers, and CI stability
- GitHub Actions workflow and SQL Server setup
- Azure DevOps Pipeline, SQL Server setup, explicit migrations, diagnostics, and API smoke tests
- README documentation and iteration notes

### Golden Rule

> If a change affects how the app behaves, stores data, exposes data, tests data, or builds in CI, update every impacted layer in the same commit.

### Definition of Done

A Wonderland change is only done when:

1. The feature or fix works locally.
2. Any required SQL migration is added and is safe to run more than once where practical.
3. Seed data is updated if tests or app flows depend on it.
4. Backend API contracts and frontend usage are aligned.
5. Playwright tests are added or updated.
6. The full local Playwright suite passes.
7. README is updated if the project behaviour, workflow, APIs, database, tests, or roadmap changed.
8. The commit is pushed to GitHub first.
9. GitHub Actions passes.
10. The same commit is pushed to Azure DevOps.
11. Azure Pipeline passes.

### Impact Checklist Before Each Commit

| Area | Question to Ask |
|---|---|
| Frontend | Did routes, forms, UI text, selectors, state, or page behaviour change? |
| Backend API | Did request/response fields, endpoints, auth, roles, middleware, or validation change? |
| Postman/API Collection | If backend APIs changed, regenerate the Postman collection and run standalone API collection tests before commit. |
| SQL Server | Does the change need a migration, seed update, CDC change, trigger update, audit table update, or reporting object update? |
| Playwright | Do tests need new setup data, updated assertions, better waits, or more stable auth setup? |
| GitHub Actions | Does the GitHub workflow need new SQL scripts, env vars, services, or setup steps? |
| Azure DevOps | Does the Azure pipeline need matching migrations, schema checks, smoke tests, or artifacts? |
| Documentation | Does README need the completed iteration, new commands, new endpoints, new database objects, or changed workflow? |

---

## Project Purpose

The main learning goals are:

- Build a full-stack app using React, Node.js, Express, and Microsoft SQL Server.
- Learn how a frontend connects to a backend API.
- Learn how a backend connects to Microsoft SQL Server.
- Build login and authentication functionality using JWT Bearer tokens.
- Design an operational database suitable for future reporting.
- Later create a data warehouse for Power BI dashboards.
- Build realistic Playwright JavaScript automation tests.
- Create a dedicated Automation Lab for difficult real-world locator scenarios.
- Learn enterprise delivery discipline across frontend, backend, SQL Server, tests, GitHub Actions, Azure DevOps and documentation.
- Learn operational audit, security monitoring, data warehouse and Power BI concepts in a practical app context.

---

## Local Development Environment

The project is being developed locally on Windows 11.

Installed tools:

- Node.js
- npm
- Git
- GitHub Desktop
- VS Code
- SQL Server Developer Edition
- SQL Server Management Studio
- sqlcmd
- Postman
- Power BI Desktop
- Playwright

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Playwright for UI testing

Frontend URL:

```text
http://localhost:5173
```

### Backend

- Node.js
- Express.js
- mssql
- dotenv
- cors
- helmet
- morgan
- bcryptjs
- jsonwebtoken
- express-rate-limit
- nodemon

Backend URL:

```text
http://localhost:5010
```

Port `5010` is used because port `5000` is already used by another local app.

### Database

- Microsoft SQL Server Developer Edition
- SQL Server Management Studio
- sqlcmd

Operational database:

```text
WonderlandDB
```

Future reporting/data warehouse database:

```text
WonderlandDW
```

---

## Root Project Commands

Run these from the project root:

```powershell
cd "D:\Real Projects Backup\wonderland"
```

Start frontend and backend together:

```powershell
npm start
```

Install backend and frontend dependencies:

```powershell
npm run install:all
```

Generate the Postman collection:

```powershell
npm run postman:generate
```

Validate the generated Postman collection and standalone APIs:

```powershell
npm run postman:check
```

Run Playwright tests:

```powershell
npm run test:e2e
```

Run Playwright tests in headed mode:

```powershell
npm run test:e2e:headed
```

Open Playwright UI mode:

```powershell
npm run test:e2e:ui
```

Open the Playwright report:

```powershell
npm run test:e2e:report
```

---

## Backend Commands

Go to the backend folder:

```powershell
cd "D:\Real Projects Backup\wonderland\backend"
```

Start backend only:

```powershell
npm run dev
```

Backend API base URL:

```text
http://localhost:5010
```

Generate Postman collection from backend routes:

```powershell
npm run postman:generate
```

---

## Frontend Commands

Go to the frontend folder:

```powershell
cd "D:\Real Projects Backup\wonderland\frontend"
```

Start frontend only:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Run frontend Playwright tests directly:

```powershell
npm run test:e2e
```

---

## SQL Server Notes

A SQL Server database called `WonderlandDB` has been created and is actively used by the app.

Local sqlcmd commands use `-C` because the local SQL Server certificate is not trusted:

```powershell
sqlcmd -S localhost -d WonderlandDB -E -C -Q "SELECT 1;"
```

For production-style environments, trusted SQL certificates are preferred instead of relying on `-C`.

Local secret files such as `backend/.env`, `frontend/.env`, and `backend/sql/create-app-login.local.sql` are intentionally ignored by Git.

---

## Current Database Learning Objects

### Operational tables

Key operational tables include:

- `dbo.Users`
- `dbo.Roles`
- `dbo.Employees`
- `dbo.EmployeeRoles`
- `dbo.EmployeeSalaries`
- `dbo.Rides`
- `dbo.Accommodations`
- `dbo.Bookings`
- `dbo.BookingItems`
- `dbo.PointsLedger`

### Enterprise learning objects

Wonderland currently includes three different audit/change-capture learning patterns:

| Pattern | Object(s) | Purpose |
|---|---|---|
| CDC | `cdc.dbo_Bookings_CT` | Database-level booking change capture |
| SQL triggers | `dbo.ContentAuditEvents` plus content approval triggers | Database-side content approval audit example |
| Application audit logging | `dbo.ApplicationAuditEvents` | Business-level who-did-what audit trail |

Content approval triggers exist on:

```text
dbo.Rides
dbo.Accommodations
```

Trigger audit records are written to:

```text
dbo.ContentAuditEvents
```

Application audit records are written to:

```text
dbo.ApplicationAuditEvents
```

---

## Current Backend API Areas

### Public and auth APIs

```text
GET  /api/health
GET  /api/test-db
GET  /api/rides
GET  /api/rides/:rideId
GET  /api/accommodations
GET  /api/accommodations/:accommodationId
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/profile/me
```

### Booking APIs

```text
POST /api/bookings/checkout
GET  /api/bookings/my
GET  /api/bookings/:bookingReference
POST /api/bookings/:bookingReference/cancel
```

### Admin APIs

```text
GET  /api/admin/submissions
POST /api/admin/rides
POST /api/admin/accommodations
GET  /api/admin/bookings
GET  /api/admin/bookings/summary
GET  /api/admin/bookings/:bookingReference
GET  /api/admin/reports/bookings
GET  /api/admin/reports/bookings/export.csv
GET  /api/admin/audit-events
```

### Manager APIs

```text
GET  /api/manager/approvals
GET  /api/manager/approvals/count
GET  /api/manager/approvals/history
POST /api/manager/approvals/:type/:id/approve
POST /api/manager/approvals/:type/:id/reject
GET  /api/manager/bookings/activity
GET  /api/manager/bookings/:bookingReference
GET  /api/manager/reports/bookings
```

### Test-support APIs

Test-support APIs are for local development and CI only.

They are enabled only when:

```text
ENABLE_TEST_SUPPORT=true
```

---

## Current Frontend Routes

### Public routes

```text
/                         Home page
/rides                    Rides listing
/rides/:rideId            Ride details
/accommodations           Accommodation listing
/accommodations/:id       Accommodation details
/login                    Login
/register                 Register
*                         Custom 404 page
```

### Authenticated user routes

```text
/dashboard
/profile
/basket
/checkout
/booking-confirmation/:bookingReference
/bookings/history
```

### Admin routes

```text
/admin/content
/admin/bookings
/admin/reports
/admin/audit-logs
```

### Manager routes

```text
/manager/approvals
/manager/bookings
/manager/reports
```

---

## Authentication Approach

The app currently uses JWT Bearer token authentication.

Current flow:

1. Register or login returns a JWT token in the JSON response.
2. Client stores the token in browser storage.
3. Client sends the token in the `Authorization` header.
4. Protected routes validate the token.
5. Role-protected routes check whether the user is `User`, `Admin`, or `Manager`.

HTTP-only cookie authentication has not been implemented yet. That can be considered later before real web publishing.

---

## Postman API Collection

The project includes a helper script to generate a Postman collection from backend Express routes.

Generated files:

```text
postman/wonderland-api.postman_collection.json
postman/wonderland-local.postman_environment.json
```

Generate the collection:

```powershell
npm run postman:generate
```

---


### End-of-Iteration API Checklist

When an iteration changes backend APIs:

1. Regenerate the Postman collection.

```powershell
npm run postman:generate
```

2. Run standalone API collection validation.

```powershell
npm run postman:check
```

3. Run the full Playwright regression suite.

```powershell
npm run test:e2e
```

4. Commit the regenerated Postman collection and local Postman environment with the API changes.

End-of-Iteration-16 validation:

```text
35 generated API requests
5 standalone API collection tests passed
57 full Playwright tests passed
```


## Playwright Testing

Playwright is the main safety net for Wonderland.

Run all tests from the root:

```powershell
npm run test:e2e
```

Current known result after Iteration 13:

```text
50 passed locally
GitHub Actions passed
Azure DevOps Pipeline passed
```

The suite currently covers:

- App shell and navigation
- Authentication and role-based registration
- Profile page
- Rides/accommodation listings and detail pages
- Basket add/update/remove flows
- Checkout and booking confirmation
- Booking history and booking details
- Booking cancellation
- Admin/Manager booking visibility
- Admin/Manager reporting and CSV export
- Content approval workflow
- Application audit logs
- Basket/session isolation regression coverage

---

## Current Roadmap

| Iteration | Name | Status | Expected Outcome |
|---|---|---|---|
| Foundation | Local setup, DB, backend, frontend foundation | Complete | SQL Server, backend, frontend, seed data, API health checks |
| Iteration 1 | Frontend app shell and routing | Complete | Multi-page React app with navbar and 404 |
| Iteration 1.5 | Playwright smoke test safety net | Complete | Existing app shell protected by E2E smoke tests |
| Iteration 2 | Frontend authentication flow | Complete | Register/login, token storage, protected dashboard, logout |
| Iteration 3 | Clean rides and accommodation pages | Complete | Search, filters, loading states, error states |
| Iteration 3.5 | Role-based registration, DOB and age eligibility | Complete | Guest/Admin/Manager registration rules and eligibility data |
| Iteration 3.5.1 | Employee registration status tracking | Complete | Employee registration lifecycle tracked in SQL Server |
| Iteration 3.6 | Profile page | Complete | User and employee-linked profile views |
| Iteration 3.7 | Admin content submission and Manager approval workflow | Complete | Admin submissions, Manager approvals/rejections, role-based visibility |
| Iteration 4 | Ride and accommodation details pages | Complete | Approved active item details and not-found handling |
| Iteration 5 | Booking basket | Complete | Add/update/remove basket items and localStorage persistence |
| Iteration 6 | Checkout and booking confirmation | Complete | Auth-required checkout, SQL booking persistence, WonderPoints |
| Iteration 7 | Booking history and dashboard/profile integration | Complete | Booking history, dashboard recent bookings, profile link |
| Iteration 8 | Booking management enhancements | Complete | Booking search/filter/sort, summary cards and timeline polish |
| Iteration 9 | Booking cancellation workflow | Complete | Customer cancellation, status updates and WonderPoints reversal |
| Iteration 10 | Admin and Manager booking visibility | Complete | Internal booking views and role-protected booking detail visibility |
| Iteration 11 | Admin/Manager reporting and audit preparation | Complete | Reporting dashboards and audit preparation |
| Iteration 11.1 | CDC booking audit and trigger learning example | Complete | CDC on Bookings and trigger-based content approval audit |
| Iteration 12 | Export and reporting enhancements | Complete | Admin/Manager report filters and Admin CSV export |
| Iteration 13 | Application audit logs | Complete | Capture who did what in business terms |
| Iteration 14 | Security events / SIEM simulator | **Completed** | Capture security-relevant events and show monitoring dashboard |
| Iteration 15 | Data warehouse foundation | **Completed** | Created WonderlandDW star schema foundation for reporting |
| Iteration 16 | Power BI-ready reporting views and measures | **Completed** | Prepared SQL views/measures for Power BI dashboards |
| Post-Iteration 16 | API Collection Update and Stabilisation | **Completed** | Regenerated Postman collection, added standalone API validation and stabilised API/frontend error handling |
| Iteration 17 | Power BI semantic model and interactive reporting | **Completed** | Added shared Date/User/Role dimensions, relationships, synced slicers, drill-through and report tooltip learning |
| Iteration 18 | Azure Monitor / Sentinel learning integration | **Completed** | Local monitoring, controlled Azure ingestion, KQL correlation and Microsoft Sentinel validation completed |
| Later | Playwright Automation Lab expansion | Planned | Beginner and tricky locator training pages |

---

## Completed Iteration 12 - Export and Reporting Enhancements

Iteration 12 extended the Admin and Manager reporting work.

Completed:

- Admin report start/end date filters
- Admin report status filter
- Admin filtered CSV export endpoint
- Manager report start/end date filters
- Manager report status filter
- Playwright coverage for report filters and Admin CSV download
- No SQL Server schema migration required

Key endpoint added:

```text
GET /api/admin/reports/bookings/export.csv
```

Report date filters use:

```text
COALESCE(Bookings.VisitDate, Bookings.CreatedAt)
```

In plain English:

- Use `VisitDate` when the booking has one.
- Use `CreatedAt` as the fallback when `VisitDate` is empty.

---

## Completed Iteration 13 - Application Audit Logs

Iteration 13 has been completed, committed, pushed to GitHub, and pushed to Azure DevOps.

Validation status:

```text
Local Playwright tests: 50 passed
GitHub Actions: Passed
Azure DevOps Pipeline: Passed
```

### Purpose

Iteration 13 added application-level audit logs that capture who did what in business terms.

This complements the existing SQL Server learning features:

- CDC on `dbo.Bookings` for database-level booking change capture.
- Content approval triggers on `dbo.Rides` and `dbo.Accommodations`.
- Trigger audit records in `dbo.ContentAuditEvents`.
- Application audit records in `dbo.ApplicationAuditEvents`.

### Database changes

Added:

```text
dbo.ApplicationAuditEvents
```

### Backend changes

Added:

```text
backend/services/auditLogger.js
```

Added Admin audit logs API:

```text
GET /api/admin/audit-events
```

Added audit writes for:

- Admin creates Ride
- Admin creates Accommodation
- Manager approves Ride
- Manager rejects Ride
- Manager approves Accommodation
- Manager rejects Accommodation
- User completes checkout
- User cancels booking
- Admin downloads filtered CSV booking report
- Restricted access denied attempts where the backend is reached

### Frontend changes

Added Admin Audit Logs page:

```text
/admin/audit-logs
```

Added Admin navigation link:

```text
Audit Logs
```

Added audit filters/search:

- Start date
- End date
- Event category
- Actor role
- Action status
- Search text

### Testing changes

Added Playwright test:

```text
frontend/tests/admin-audit-logs.spec.js
```

Added basket/session isolation regression test:

```text
frontend/tests/basket-auth-isolation.spec.js
```

### Other fixes included in Iteration 13

- Fixed basket/session isolation bug.
- Browser-local basket no longer leaks between users on the same browser/session.
- Changed Admin CSV report filename date from UTC date to local date helper.
- README was corrected from `README.md.md` back to `README.md`.
- `SqlQueries` folder is intentionally used for manual SSMS helper queries.

### Learning distinction

Application audit logs are different from CDC and SQL triggers:

- CDC records database-level data changes.
- SQL triggers record database-side events when specific table actions occur.
- Application audit logs record business-level user actions such as who downloaded a report or who cancelled a booking.

---

---

## Iteration 14 Completed: Security Events / SIEM Simulator

Wonderland now includes a local SIEM-style security monitoring layer for security-relevant application events.

This iteration builds on Iteration 13 application audit logs by separating normal business audit activity from security-focused monitoring events.

### Completed

- Added SQL Server security event table:

    dbo.SecurityEvents

- Added SQL Server summary view:

    dbo.vwSecurityEventSummary

- Added backend security event logger service:

    backend/services/securityEventLogger.js

- Added backend security event capture middleware:

    backend/middleware/securityEventCaptureMiddleware.js

- Added Admin security events API:

    GET /api/admin/security-events

- Added authenticated client-side access-denied reporting endpoint:

    POST /api/security-events/access-denied

- Added automatic security event capture for:
  - Failed login attempts
  - Invalid or rejected authentication token attempts
  - Restricted API access denied responses
  - Client-side role guard denials for restricted Admin and Manager routes
  - Admin booking report CSV downloads
  - Admin application audit log viewing
  - Admin security event dashboard viewing

- Added Admin Security Events page:

    /admin/security-events

- Added Admin navigation link:

    Security Events

- Added security dashboard features:
  - Summary cards
  - Severity breakdown
  - Category breakdown
  - Recent security event timeline/cards
  - Start date filter
  - End date filter
  - Severity filter
  - Event category filter
  - Actor role filter
  - Action status filter
  - Search filter

- Added Playwright test file:

    frontend/tests/admin-security-events.spec.js

- Added Playwright coverage for:
  - Admin can view Security Events page
  - Failed login appears as a security event
  - Admin can filter/search security events
  - Normal User cannot access Admin Security Events page
  - Normal User Admin and Manager route attempts create AccessDenied security events

- Updated GitHub Actions SQL setup to run:
  - iteration-13-application-audit-events.sql
  - iteration-14-security-events.sql

- Azure DevOps Pipeline already copies and runs backend SQL files automatically, so no direct Azure pipeline patch was required.

### Security Event Examples

Wonderland now captures security-focused events such as:

- FailedLogin
- InvalidToken
- AccessDenied
- AdminBookingReportCsvDownloaded
- ApplicationAuditLogsViewed
- SecurityEventsViewed

When a logged-in normal User navigates directly to restricted React routes such as `/admin/security-events` or `/manager/approvals`, the frontend role guard still shows the access denied page immediately. The guard also reports the denied route to the backend so `dbo.SecurityEvents` receives an `AccessDenied` row with the attempted route in `RequestPath`.

Latest local verification confirmed:

- Direct frontend route attempts by a normal User create `AccessDenied` rows in `dbo.SecurityEvents`.
- Direct backend API attempts by a normal User return `403` and create:
  - `dbo.ApplicationAuditEvents` row with `RestrictedAccessDenied`
  - `dbo.SecurityEvents` row with `AccessDenied`
- Verified security event examples in source and DW:
  - `AccessDenied`
  - `AdminBookingReportCsvDownloaded`
  - `ApplicationAuditLogsViewed`
  - `FailedLogin`
  - `SecurityEventsViewed`

### Learning Value

Iteration 14 demonstrates the difference between:

- Application audit logs: business-facing "who did what" activity
- Security events: security-relevant monitoring signals
- CDC: database-level change capture
- SQL triggers: database-side reactions to table changes

This prepares Wonderland for future Microsoft Sentinel, Azure Monitor, Log Analytics, KQL and security operations learning.

### Test Status

Current test status after Iteration 14:

    Local Playwright tests: 52 passed
    GitHub Actions: To be confirmed after push
    Azure DevOps Pipeline: To be confirmed after push

## Completed Task: Iteration 15 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Data Warehouse Foundation

This is the next task to pick up.

### Purpose

Start separating operational application data from reporting and analytics data by creating the first Wonderland data warehouse foundation.

Iteration 15 introduced a dedicated reporting database:

    WonderlandDW

The goal is to learn OLTP-to-DW modelling using realistic Wonderland data from bookings, application audit logs and security events.

### Planned Database Changes

Create:

    WonderlandDW

Initial dimension tables may include:

- DimDate
- DimUser
- DimRole
- DimActionType
- DimEntityType
- DimOutcome
- DimSecuritySeverity
- DimSecurityCategory

Initial fact tables may include:

- FactApplicationAuditEvent
- FactSecurityEvent

Future fact tables may include:

- FactBooking
- FactBookingItem
- FactBookingChange

### Planned ETL / Load Changes

Add repeatable SQL scripts or stored procedures to load data from:

    WonderlandDB

into:

    WonderlandDW

Initial source tables:

- dbo.ApplicationAuditEvents
- dbo.SecurityEvents
- dbo.Users

### Planned Learning Outcomes

Iteration 15 teaches:

- Difference between OLTP and data warehouse design
- Star schema foundations
- Dimensions vs facts
- Surrogate keys
- Date dimension usage
- Audit/security events as reporting facts
- How Power BI-ready data models differ from application tables

### Done When

- WonderlandDW database exists locally.
- Initial dimension and fact tables exist.
- Load scripts or stored procedures exist and are safe to re-run where practical.
- Application audit events can be loaded into DW fact tables.
- Security events can be loaded into DW fact tables.
- Basic validation queries prove source-to-DW row counts.
- Playwright suite still passes locally.
- README is updated.
- Changes are pushed to GitHub and GitHub Actions passes.
- Same commit is pushed to Azure DevOps and Azure Pipeline passes.

---

## Security Notes

The `.env` files contain local secrets and must not be committed to GitHub.

The `.env.example` files should be committed because they show required settings without exposing real passwords.

Ignored local files include:

```text
backend/.env
frontend/.env
backend/sql/create-app-login.local.sql
node_modules
frontend/playwright-report
frontend/test-results
```

For this local learning project, any simple database password is local-only and should not be reused for any real system.

---

## Daily Startup

From the root folder:

```powershell
cd "D:\Real Projects Backup\wonderland"
npm start
```

Then open:

```text
http://localhost:5173
```

Run the tests:

```powershell
npm run test:e2e
```

---

## Current Source of Truth for Next Work

At the start of each future session:

1. Read this README.
2. Check the `Current Roadmap`.
3. Pick the first item with status **Next**.
4. Implement that iteration.
5. Add or update SQL migrations if needed.
6. Add or update Playwright tests.
7. Run the full local Playwright suite.
8. Update this README.
9. Commit only after local tests pass.
10. Push to GitHub first.
11. Confirm GitHub Actions passes.
12. Push the same commit to Azure DevOps.
13. Confirm Azure DevOps Pipeline passes.

Current next item:

```text
Iteration 14 - Security Events / SIEM Simulator
```

## Iteration 15 Completed ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Data Warehouse Foundation

Iteration 15 starts the separation of operational application data from reporting and analytics data.

### What was added

- Created a new `WonderlandDW` SQL Server database.
- Added the first Wonderland star schema foundation.
- Added dimension tables:
  - `dbo.DimDate`
  - `dbo.DimUser`
  - `dbo.DimRole`
  - `dbo.DimActionType`
  - `dbo.DimEntityType`
  - `dbo.DimOutcome`
  - `dbo.DimSecuritySeverity`
  - `dbo.DimSecurityCategory`
- Added fact tables:
  - `dbo.FactApplicationAuditEvent`
  - `dbo.FactSecurityEvent`
- Added repeatable DW load stored procedure:
  - `dbo.uspLoadWonderlandDw`
- Added validation view:
  - `dbo.vwDwLoadValidation`
- Loaded source data from:
  - `WonderlandDB.dbo.Users`
  - `WonderlandDB.dbo.ApplicationAuditEvents`
  - `WonderlandDB.dbo.SecurityEvents`
- Added source-to-DW row count validation.
- Updated GitHub Actions to run the Iteration 15 DW SQL script.

### Local validation completed

- `WonderlandDW` created successfully.
- Source-to-DW validation passed:
  - `ApplicationAuditEvents`: source count matched DW fact count.
  - `SecurityEvents`: source count matched DW fact count.
  - `Users`: source count matched DW dimension count.
- Repeatable SQL load script confirmed.
- Repeat validation after E2E activity confirmed application audit and security event fact loads continued to reconcile with their OLTP sources.
- Missing application audit or security event fact rows after the DW load: `0`.
- Verified audited event types cascade from `WonderlandDB.dbo.ApplicationAuditEvents` to `WonderlandDW.dbo.FactApplicationAuditEvent`:
  - `AdminCreatedRide`
  - `AdminDownloadedBookingCsvReport`
  - `ManagerApprovedContent`
  - `RestrictedAccessDenied`
  - `UserCancelledBooking`
  - `UserCompletedCheckout`
- Verified security event types cascade from `WonderlandDB.dbo.SecurityEvents` to `WonderlandDW.dbo.FactSecurityEvent`:
  - `AccessDenied`
  - `AdminBookingReportCsvDownloaded`
  - `ApplicationAuditLogsViewed`
  - `FailedLogin`
  - `SecurityEventsViewed`
- Note: `Users` validation can show extra DW rows when test users have been deleted from the OLTP database after earlier loads. This is a dimension history/staleness check, not an audit/security event cascade failure.
- Local Playwright suite passed:
  - `52 passed`

### Learning outcome

Iteration 15 introduces the OLTP-to-DW separation pattern:

- `WonderlandDB` is the operational application database.
- `WonderlandDW` is the analytics and reporting database.

This prepares Wonderland for future reporting layers such as Power BI-ready views, measures, dashboards, and trend analysis.

---

## Iteration 16 - Power BI-ready Reporting Views and Measures

Iteration 16 builds on the WonderlandDW foundation by exposing business-friendly SQL reporting views and documenting reusable Power BI measures for application audit, security monitoring, and user activity analysis.

### SQL Reporting Views

Added `backend/sql/iteration-16-power-bi-reporting-views.sql`.

The script reloads the warehouse through `dbo.uspLoadWonderlandDw` and creates or replaces:

- `dbo.vPowerBIApplicationAuditEvents`
- `dbo.vPowerBISecurityEvents`
- `dbo.vPowerBIUserActivitySummary`
- `dbo.vPowerBISecuritySeverityTrend`
- `dbo.vPowerBIAuditActionSummary`
- `dbo.vPowerBISecurityCategorySummary`
- `dbo.vPowerBIReportingValidation`

The reporting views expose Power BI-friendly fields including date, year, quarter, month, year-month, actor user and role, action type, entity type, outcome, security severity, security category, event counts, and reporting flags.

Security reporting flags include:

- `IsHighSeverity` for High and Critical security events.
- `IsFailedOrDenied` for failed or denied security activity.

### Power BI Measures and Report Pages

Added `docs/powerbi/wonderland-power-bi-measures.md` to document reusable DAX measures and the report design.

The local Power BI learning report contains four pages:

1. Executive Overview
2. Security Monitoring
3. Application Audit
4. User Activity

Documented measures include total application audit events, recent application audit activity, total security events, high severity security events, failed or denied security events, recent security activity, and user activity totals.

An exact Top 10 active users calculated table is used to produce ten deterministic rows when multiple users are tied at the Power BI Top N cutoff.

Power BI Desktop `.pbix` files are retained locally under `docs/powerbi` and ignored by Git. The reusable SQL and DAX documentation remain version controlled.

### DW Refresh and Power BI Refresh Workflow

Power BI uses Import mode against `WonderlandDW`.

To refresh the reporting data:

1. Run the warehouse load and reporting validation:

    sqlcmd -S localhost -d WonderlandDW -E -C -i ".\SqlQueries\Iteration16DwRefresh.sql"

2. Confirm `dbo.vPowerBIReportingValidation` shows a difference of `0` for both application audit and security reporting views.
3. Open the Power BI Desktop report.
4. Select `Home -> Refresh`.
5. Save the refreshed local `.pbix` file.

For consolidated SQL validation, run:

    sqlcmd -S localhost -d WonderlandDW -E -C -i ".\SqlQueries\Iteration16PowerBIValidation.sql"

The validation covers reporting row reconciliation, overall event totals, security measures, user activity totals, and the deterministic Top 10 active users query.

### CI and Validation

- GitHub Actions now copies and executes `iteration-16-power-bi-reporting-views.sql` after the Iteration 15 data warehouse foundation script.
- Iteration 16 SQL reporting views were validated against the DW fact tables.
- Application audit reporting view difference: `0`.
- Security event reporting view difference: `0`.
- User activity totals reconcile to application audit activity plus security activity.
- Full Playwright regression passed with `52 passed`.
- A single Admin profile registration timing failure was observed once during a two-worker run, did not reproduce in a serial run, and did not reproduce in a subsequent two-worker full regression.

### Learning Value

Iteration 16 demonstrates the reporting boundary between operational data, a data warehouse, SQL semantic/reporting views, and Power BI calculations:

`WonderlandDB -> WonderlandDW -> Power BI reporting views -> DAX measures -> report visuals`

It also demonstrates why reporting validation should reconcile base fact rows to reporting views before dashboard values are trusted.

### Iteration 16 Status

`Iteration 16 - Power BI-ready Reporting Views and Measures` is complete locally and ready for repository delivery validation.

---

## Post-Iteration 16 - API Collection Update and Stabilisation

After Iteration 16, Wonderland completed a small API collection and stabilisation bridge before starting Iteration 17.

### Purpose

This bridge step made the backend API surface easier to inspect, validate and use from Postman before continuing into Power BI semantic modelling.

### Completed

- Regenerated the Postman collection from backend Express routes.
- Confirmed the generated collection contained 35 API requests.
- Added standalone API collection validation.
- Confirmed public APIs, authentication APIs and protected API rejection behaviour.
- Confirmed normal User tokens cannot access Admin or Manager standalone APIs.
- Stabilised reporting role-protection testing.
- Cleaned up API and frontend error handling.
- Aligned root package-lock.json metadata.

### Validation

End-of-bridge validation confirmed:

- 35 generated API requests
- 5 standalone API collection tests passed
- 57 full Playwright tests passed

This bridge did not replace Iteration 17. It prepared the project for the next learning iteration.

### Status

Post-Iteration 16 - API Collection Update and Stabilisation is complete.

---

## Iteration 17 - Power BI Semantic Model and Interactive Reporting

Iteration 17 evolves the Iteration 16 Power BI reporting layer from separate imported SQL views into a clearer analytical model with shared dimensions, active relationships, synced slicers and interactive report behaviours.

### SQL Semantic Model Views

Added backend/sql/iteration-17-power-bi-semantic-model-views.sql.

The script reloads the warehouse through dbo.uspLoadWonderlandDw and creates or replaces:

- dbo.vPowerBIDate
- dbo.vPowerBIUser
- dbo.vPowerBIRole
- dbo.vPowerBISemanticModelValidation

It also updates existing Power BI reporting views to expose relationship keys:

- DateKey
- ActorUserKey
- ActorRoleKey

### Power BI Semantic Model

The local Iteration 17 PBIX file is docs/powerbi/Wonderland-Iteration-17-PowerBI-Semantic-Model.pbix.

Power BI Desktop .pbix files remain ignored by Git.

The Iteration 17 model uses these shared dimensions:

- vPowerBIDate
- vPowerBIUser
- vPowerBIRole

vPowerBIDate excludes the technical unknown/sentinel row DateKey = 19000101 and is marked as the Power BI date table using the Date column.

The model uses one-to-many, single-direction relationships from dimensions to reporting/fact-style tables.

Expected relationship pattern:

- vPowerBIDate DateKey filters reporting views by DateKey
- vPowerBIUser UserKey filters user/activity views by ActorUserKey
- vPowerBIRole RoleKey filters audit/security/activity views by ActorRoleKey

The model deliberately avoids fact-to-fact relationships and avoids a direct vPowerBIUser to vPowerBIRole relationship to prevent ambiguous filter paths.

### Interactive Reporting Added

The Iteration 17 Power BI learning report includes:

- Shared Date slicer using vPowerBIDate Date
- Shared Role slicer using vPowerBIRole RoleName
- Synced slicers across Executive Overview, Security Monitoring, Application Audit and User Activity
- User Activity Details drill-through page using vPowerBIUser Email
- Security Tooltip report page attached to the Security Events by Category visual

### Validation Helper

Added SqlQueries/Iteration17PowerBISemanticModelValidation.sql.

This helper validates:

- semantic validation differences are 0
- vPowerBIDate is contiguous
- the unknown/sentinel date is excluded from vPowerBIDate
- relationship keys are exposed to Power BI
- semantic dimension views exist

Run it with:

    sqlcmd -S localhost -d WonderlandDW -E -C -i .\SqlQueries\Iteration17PowerBISemanticModelValidation.sql

### CI and Validation

GitHub Actions now copies and executes backend/sql/iteration-17-power-bi-semantic-model-views.sql after the Iteration 16 Power BI reporting views script.

Azure DevOps copies the full backend/sql folder and runs SQL scripts in version sort order, so the Iteration 17 SQL script is picked up automatically after Iteration 16.

Local SQL validation confirmed:

- application audit reporting view difference: 0
- security event reporting view difference: 0
- Power BI date dimension difference: 0
- Power BI user dimension difference: 0
- Power BI role dimension difference: 0
- date/user/role relationship orphan checks: 0
- vPowerBIDate missing date count: 0
- sentinel rows in vPowerBIDate: 0

### Learning Value

Iteration 17 demonstrates the difference between flat imported reporting views and a Power BI semantic model.

Learning flow:

    WonderlandDB -> WonderlandDW -> Power BI semantic views -> relationships -> shared slicers -> interactive reporting

It also demonstrates why shared dimensions, active relationships, single filter direction, drill-through, synced slicers and report-page tooltips make a Power BI report easier to reason about and validate.

### Iteration 17 Status

Iteration 17 - Power BI Semantic Model and Interactive Reporting is complete locally and ready for repository delivery validation.

---

## Completed Iteration 18 - Azure Monitor / Sentinel Learning Integration

Iteration 18 extends Wonderland's existing application-audit and
security-event capabilities into Azure Monitor, Log Analytics, KQL and
Microsoft Sentinel learning patterns.

The iteration is divided into two phases:

- Local Phase A: safe monitoring export, detection and KQL learning - complete
- Controlled Phase B: controlled Azure ingestion and Sentinel exercise - complete

Both phases are complete and validated. Final repository delivery
validation remains before Iteration 18 is marked complete.

### Local Phase A Completed

Added a common monitoring-event mapper:

```text
backend/services/monitoringEventMapper.js
```

Added a read-only SQL-to-JSON exporter:

```text
backend/scripts/export-monitoring-events.js
```

Added local Sentinel-style detection rules:

```text
backend/services/monitoringDetectionRules.js
```

Added a local detection runner:

```text
backend/scripts/run-monitoring-detections.js
```

Added an automated workflow validator:

```text
backend/scripts/validate-monitoring-workflow.js
```

Generated monitoring output is written under:

```text
backend/exports/monitoring/
```

The generated folder is excluded from Git.

### Local Monitoring Flow

```text
WonderlandDB
    |
    | Read-only SELECT queries
    v
Monitoring event mapper
    |
    v
Local JSON monitoring export
    |
    v
Sentinel-style detection rules
    |
    v
detections.json
    |
    v
Workflow validation
```

The source tables remain unchanged:

```text
WonderlandDB.dbo.SecurityEvents
WonderlandDB.dbo.ApplicationAuditEvents
```

### Monitoring Commands

Run from the project root:

```powershell
npm --prefix backend run monitor:export -- 25
npm --prefix backend run monitor:detect
npm --prefix backend run monitor:validate
```

The commands:

1. export recent source events to local JSON;
2. evaluate the latest security-event export;
3. create local detection results; and
4. validate manifest, export and detection consistency.

### Local Detection Rules

| Rule ID   | Detection                                           |
| --------- | --------------------------------------------------- |
| `WDL-001` | Repeated failed logins                              |
| `WDL-002` | Repeated restricted access attempts                 |
| `WDL-003` | High or Critical security event                     |
| `WDL-004` | Security event linked to an application-audit event |

The local repeated-activity rules currently evaluate all supplied
events. The KQL learning examples demonstrate explicit lookback periods
and time buckets.

### Latest Local Validation

The latest completed local simulation validated:

```text
Security events exported: 25
Application audit events exported: 25
Local detections created: 15
```

Triggered results included:

```text
WDL-002: 5 repeated restricted-access detections
WDL-003: 10 high-severity event detections
```

The workflow validator confirmed:

- export counts matched the manifest;
- detection totals matched the detailed results;
- rule-summary counts matched the detections;
- only recognised Wonderland rule IDs were present; and
- Azure and Sentinel safety notes were present.

The exact detection results can change as new Wonderland security events
are generated.

### Controlled Phase B Completed

The controlled Azure learning phase extended the local monitoring model
into Azure Monitor, Log Analytics and Microsoft Sentinel.

The learning environment used:

- Log Analytics workspace `law-wonderland-monitoring-lab`;
- Data Collection Endpoint `dce-wonderland-monitoring-lab`;
- DCR `dcr-wonderland-security-events-lab`;
- DCR `dcr-wonderland-application-audit-events-lab`;
- custom table `WonderlandSecurityEvents_CL`; and
- custom table `WonderlandApplicationAuditEvents_CL`.

Controlled sanitised test records were submitted through the Azure
Monitor Logs Ingestion API and accepted with HTTP 204 responses.

The cross-table validation proved the relationship:

```text
WonderlandSecurityEvents_CL.SourceApplicationAuditEventId
    =
WonderlandApplicationAuditEvents_CL.SourceEventId
```

The controlled correlated pair validated:

```text
CorrelationKey: 920001
TestRunIdMatch: true
TimeDeltaSeconds: 2
```

A scheduled Microsoft Sentinel analytics rule named
`Wonderland - Correlated Security and Audit Validation` produced one
controlled Informational alert and one incident. After successful
validation, the analytics rule was disabled and the incident was
resolved as expected security-testing activity.

Authentication used a dedicated Microsoft Entra application. The client
secret was protected outside the repository with Windows DPAPI, and no
credential or access-token value was committed to Git.

### Monitoring Documentation

Added:

- [Wonderland Monitoring Learning Guide](docs/monitoring/wonderland-monitoring-learning-guide.md)
- [Wonderland KQL Learning Pack](docs/monitoring/wonderland-kql-learning-pack.md)
- [Iteration 18 Architecture and Component Guide](docs/monitoring/iteration-18-architecture-and-component-guide.md)

The KQL guide uses the validated Azure Monitor custom-table names:

```text
WonderlandSecurityEvents_CL
WonderlandApplicationAuditEvents_CL
```

Both custom tables now exist in the controlled learning workspace and
were validated with sanitised test records.

### Current Safety Boundary

Iteration 18 preserves the following controls:

- WonderlandDB source access remains read-only for monitoring export;
- source audit and security records are not modified by the monitoring workflow;
- generated monitoring and Azure test payloads remain under the Git-ignored export folder;
- Azure ingestion was limited to controlled sanitised learning records;
- no production monitoring data was sent to Azure;
- no Azure credential or access-token value is stored in the repository;
- the client secret is protected outside the repository using Windows DPAPI;
- the controlled Sentinel analytics rule is retained but disabled; and
- the controlled Sentinel incident is resolved as security-testing activity.

### Iteration 18 Status

Iteration 18 is **Completed locally**.

Validated completion evidence includes:

- Local Phase A monitoring workflow validation passed;
- Controlled Azure Phase B validation passed;
- Azure Monitor ingestion and both custom tables were validated;
- cross-table KQL correlation was validated;
- the controlled Microsoft Sentinel alert and incident workflow was validated;
- the controlled Sentinel analytics rule was disabled after testing;
- the controlled incident was resolved as security-testing activity;
- no production monitoring data was sent to Azure;
- no Azure credential or access-token value is committed to Git; and
- the full Wonderland Playwright suite passed with 57 tests.

The completion commit will now proceed through the standard Wonderland
GitHub Actions and Azure DevOps delivery validation process.
