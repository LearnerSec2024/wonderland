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
| Local Playwright result after Iteration 13 | 50 tests passed |
| GitHub repository | Published |
| GitHub Actions workflow | Passing |
| Azure DevOps Pipeline | Passing |
| Latest completed iteration | **Iteration 14 — Security Events / SIEM Simulator** |
| Current / next iteration | **Iteration 15 — Data Warehouse Foundation** |

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
| Iteration 15 | Data warehouse foundation | **Next** | Create WonderlandDW star schema foundation for reporting |
| Iteration 16 | Power BI-ready reporting views and measures | Planned | Prepare SQL views/measures for Power BI dashboards |
| Iteration 17 | Azure Monitor / Sentinel learning integration | Later | Connect security monitoring concepts to cloud logging/SIEM patterns |
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

- Added automatic security event capture for:
  - Failed login attempts
  - Invalid or rejected authentication token attempts
  - Restricted API access denied responses
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

## Next Task: Iteration 15 — Data Warehouse Foundation

This is the next task to pick up.

### Purpose

Start separating operational application data from reporting and analytics data by creating the first Wonderland data warehouse foundation.

Iteration 15 should introduce a dedicated reporting database:

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

Iteration 15 should teach:

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
