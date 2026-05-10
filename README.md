# Wonderland Full Stack App

Wonderland is a learning-focused full-stack web application for a modern theme park experience.

The app is being built for three connected learning goals:

1. **Theme park booking platform** — users can browse rides and accommodation, register, log in, manage a booking basket, checkout, view booking history, cancel bookings, and earn/reverse WonderPoints.
2. **Enterprise-style full-stack development** — the app uses a React frontend, Node/Express backend, Microsoft SQL Server operational database, role-based APIs, CI/CD pipelines, and repeatable database migrations.
3. **Playwright JavaScript training app** — the app includes realistic UI/API/auth/workflow scenarios and will later include a dedicated Automation Lab with intentionally tricky locator scenarios.

This project is being built locally on a Windows 11 laptop for learning, portfolio-building, enterprise development practice, SQL Server/Data Warehouse learning, Power BI preparation, and Playwright automation training.

---

## Current Status Snapshot

| Area | Status |
|---|---|
| Local SQL Server database | Working |
| Backend Express API | Working |
| Backend SQL Server connection | Working |
| Backend authentication and role APIs | Working |
| React frontend | Working |
| Playwright local test suite | Passing |
| GitHub repository | Published |
| GitHub Actions workflow | Passing |
| Azure DevOps repository | Published |
| Azure DevOps Pipeline | Passing |
| Latest completed iteration | Iteration 11.1 — CDC booking audit and trigger learning example |
| Next iteration | Iteration 12 — Export and Reporting Enhancements |

Current local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5010
Database: WonderlandDB
```

Local project folder:

```text
D:\Real Projects Backup\wonderland
```

---

## Development Rhythm

Every feature iteration should follow this safer delivery process:

1. Implement the iteration changes.
2. Add or update SQL migrations if the database contract changes.
3. Add or extend Playwright tests for existing and new functionality.
4. Run the full Playwright suite locally.
5. Fix local issues until tests are green.
6. Update this README with the completed iteration notes.
7. Commit the feature, SQL migrations, tests, and README updates together.
8. Push to GitHub first.
9. Confirm GitHub Actions passes.
10. Push the same commit to Azure DevOps.
11. Confirm Azure Pipeline passes.
12. Move to the next iteration.

Current local test command from the project root:

```powershell
npm run test:e2e
```

Current push pattern:

```powershell
git push origin master
git push azure master:main
```

Preferred delivery workflow:

```text
Local tests pass
↓
Commit once
↓
Push to GitHub
↓
Confirm GitHub Actions
↓
Push same commit to Azure DevOps
↓
Confirm Azure Pipeline
↓
Start next iteration
```

---

## CI/CD and Database Migration Approach

Wonderland now uses both GitHub Actions and Azure DevOps Pipelines.

The project is intentionally maintained in two remote repositories:

- **GitHub** is used as the clean source repository and GitHub Actions validation path.
- **Azure DevOps** is used as the enterprise-style learning workspace for Azure Repos, Azure Pipelines, SQL Server CI setup, pipeline artifacts, Playwright reports, and future Azure Boards/Wiki usage.

### Key Lesson Learned from Azure DevOps Setup

During Azure DevOps setup, the Azure Pipeline exposed an important enterprise lesson:

> A CI/CD environment must be able to rebuild the application and database from source-controlled files only.

The local SQL Server database had evolved through multiple development iterations. Some columns existed locally because they were added during earlier manual or local development work. However, the fresh Azure CI database only had what was defined in the repository SQL scripts.

This caused Azure Pipeline failures where backend APIs expected columns that did not yet exist in the CI-created database.

Examples included:

- `Rides.IsFamilyFriendly`
- `Rides.MinimumAgeYears`
- `Rides.RequiresAdultSupervision`
- `Accommodations.IsFamilyFriendly`
- `Accommodations.MinimumLeadGuestAgeYears`
- `Users.EmployeeId`
- `Users.DateOfBirth`
- `Employees.IsRegistered`
- `Employees.RegisteredUserId`
- `Employees.RegisteredAt`
- `Rides.ApprovalStatus`
- `Accommodations.ApprovalStatus`

The fix was to make the missing database changes explicit through repeatable SQL migration scripts and to run backend API smoke tests before the Playwright suite.

### Why Azure Pipeline Initially Failed When GitHub Actions Passed

GitHub Actions and Azure DevOps were using separate CI setup files:

```text
GitHub Actions:
.github/workflows/playwright.yml

Azure DevOps:
azure-pipelines.yml
```

Both environments created their own fresh SQL Server database, but the setup logic was not identical.

This meant:

```text
Local DB       = long-lived evolved database
GitHub CI DB   = fresh database built by GitHub workflow
Azure CI DB    = fresh database built by Azure pipeline
```

The Azure Pipeline exposed schema drift between the local database and the source-controlled SQL scripts.

The important enterprise lesson:

```text
Application code, SQL migrations, seed data, tests and CI setup must move together.
```

---

## CI Validation Order

The safer CI validation order is:

1. Start SQL Server for CI.
2. Create `WonderlandDB`.
3. Run SQL schema and seed scripts.
4. Run required idempotent schema alignment migrations.
5. Create the backend CI `.env` file.
6. Verify key database tables, columns, and seed data.
7. Install dependencies.
8. Run backend API smoke tests.
9. Install Playwright browsers.
10. Run the Playwright test suite.
11. Publish Playwright HTML report and test artifacts.

### Why API Smoke Tests Run Before Playwright

Playwright UI failures can hide backend or database problems.

For example, a UI test may fail with:

```text
ride-card-1 not found
```

But the real cause may be:

```text
GET /api/rides returned 500 because the CI database was missing a column.
```

To avoid guessing, the Azure Pipeline now proves the backend first using smoke checks such as:

```text
GET /api/rides
GET /api/accommodations
POST /api/auth/register
GET /api/profile/me
Admin employee registration
Manager employee registration
```

Only after the database and backend APIs are healthy should Playwright failures be treated as frontend or test-specific issues.

---

## Database Migration Rule

For every future iteration:

> If application code expects a database change, the same commit must include a SQL migration for that change.

Examples:

- New backend field means a SQL migration is required.
- New UI data requirement means the API and DB contract must be checked.
- New seeded reference data must be added to source-controlled SQL scripts.
- SQL migrations should be safe to run more than once where practical.
- CI pipeline setup must run the same schema/seed logic needed by the app and tests.

Preferred migration pattern:

```sql
IF COL_LENGTH('dbo.TableName', 'ColumnName') IS NULL
BEGIN
    ALTER TABLE dbo.TableName
    ADD ColumnName NVARCHAR(100) NULL;
END
GO
```

### Future CI Cleanup Target

The current Azure Pipeline includes detailed database setup and diagnostic steps. This was useful while stabilising CI.

A future improvement is to move shared CI logic into reusable scripts:

```text
scripts/ci/setup-wonderland-db.sh
scripts/ci/smoke-test-api.sh
```

Then both GitHub Actions and Azure DevOps can call the same scripts, giving one source of truth for database setup and API smoke testing.

Target future model:

```text
GitHub Actions  → scripts/ci/setup-wonderland-db.sh
Azure Pipeline  → scripts/ci/setup-wonderland-db.sh

GitHub Actions  → scripts/ci/smoke-test-api.sh
Azure Pipeline  → scripts/ci/smoke-test-api.sh
```

YAML should orchestrate. Scripts should do the detailed setup work.

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

### CI/CD

- GitHub Actions
- Azure DevOps Pipelines
- SQL Server container for CI
- Playwright report artifacts
- Backend API smoke tests

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
- Azure CLI
- Azure DevOps extension for Azure CLI

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

## Project Structure

```text
wonderland
├── .github
│   └── workflows
│       └── playwright.yml
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── scripts
│   ├── sql
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── services
│   ├── tests
│   ├── .env.example
│   ├── package.json
│   └── playwright.config.js
├── docs
│   ├── local-db-setup.md
│   └── playwright-training-requirements.md
├── postman
│   ├── wonderland-api.postman_collection.json
│   └── wonderland-local.postman_environment.json
├── SqlQueries
├── azure-pipelines.yml
├── manual-db-reset-scripts.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

Local secret files such as `backend/.env`, `frontend/.env`, and `backend/sql/create-app-login.local.sql` are intentionally ignored by Git.

---

## Security Notes

The `.env` files contain local secrets and must not be committed.

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

For this local learning project, the database password is local-only. It should not be reused for any real system.

Test-support APIs are enabled only when:

```text
ENABLE_TEST_SUPPORT=true
```

These routes are for local development and CI testing only, not production use.

---

## SQL Server App Login

A dedicated SQL Server login was created for the backend app:

```text
wonderland_app_user
```

This was created so the Node.js backend does not connect using a personal Windows admin account or the powerful `sa` account.

The app user has access to `WonderlandDB` and has been added to:

```text
db_datareader
db_datawriter
```

This means the backend can read and write app data without being a full SQL Server administrator.

The local real password script is ignored by Git:

```text
backend/sql/create-app-login.local.sql
```

A safe example script is included:

```text
backend/sql/create-app-login.example.sql
```

---

## Current Backend API Groups

### Health

```text
GET /api/health
GET /api/test-db
```

### Public Content

```text
GET /api/rides
GET /api/rides/:rideId
GET /api/accommodations
GET /api/accommodations/:accommodationId
```

Public content APIs return only records where:

```text
IsActive = 1
ApprovalStatus = Approved
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

The app uses JWT Bearer token authentication.

Current flow:

1. Register or login returns a JWT token.
2. Client stores the token in `localStorage`.
3. Client sends the token in the `Authorization` header.
4. Protected routes validate the token.

### Profile

```text
GET /api/profile/me
```

Profile returns guest/user profile details and employee-linked details for Admin and Manager users.

Employee salary data is intentionally not exposed on the normal profile page.

### Bookings

```text
POST /api/bookings/checkout
GET  /api/bookings/my
GET  /api/bookings/:bookingReference
POST /api/bookings/:bookingReference/cancel
```

### Admin Content

```text
GET  /api/admin/submissions
POST /api/admin/rides
POST /api/admin/accommodations
```

### Manager Approvals

```text
GET  /api/manager/approvals
GET  /api/manager/approvals/count
GET  /api/manager/approvals/history
POST /api/manager/approvals/:type/:id/approve
POST /api/manager/approvals/:type/:id/reject
```

### Admin Booking Visibility

```text
GET /api/admin/bookings
GET /api/admin/bookings/summary
GET /api/admin/bookings/:bookingReference
```

### Manager Booking Activity

```text
GET /api/manager/bookings/activity
GET /api/manager/bookings/:bookingReference
```

### Reporting

```text
GET /api/admin/reports/bookings
GET /api/manager/reports/bookings
```

---

## Current Frontend Routes

```text
/                                  Home page
/rides                             Rides listing
/rides/:rideId                     Ride details
/accommodations                    Accommodation listing
/accommodations/:accommodationId   Accommodation details
/basket                            Booking basket
/checkout                          Checkout
/booking-confirmation/:reference   Booking confirmation / booking details
/bookings/history                  Booking history
/login                             Login
/register                          Register
/dashboard                         User dashboard
/profile                           Profile
/admin/content                     Admin content submission
/admin/bookings                    Admin booking visibility
/admin/reports                     Admin reporting
/manager/approvals                 Manager approvals
/manager/bookings                  Manager booking activity
/manager/reports                   Manager reporting
*                                  Custom 404 page
```

---

## Current Database Objects

Operational database:

```text
WonderlandDB
```

Important tables:

| Table | Purpose |
|---|---|
| Users | Registered app users |
| Roles | Application roles |
| Employees | Authorised employee identities |
| EmployeeRoles | Employee-to-role mapping |
| EmployeeSalaries | Mock/demo salary data for future restricted reporting |
| Rides | Theme park ride content |
| Accommodations | Accommodation content |
| Bookings | Booking/order header |
| BookingItems | Booking line items |
| PointsLedger | WonderPoints activity |
| BookingAuditEvents | Booking audit table retained for learning/reporting context |
| ContentAuditEvents | Trigger-based content approval audit events |

### SQL Server CDC

CDC is enabled for:

```text
dbo.Bookings
```

CDC capture table:

```text
cdc.dbo_Bookings_CT
```

CDC is used for booking change capture and reporting-style audit learning.

### Trigger Learning Example

Triggers are used for content approval audit events on:

```text
dbo.Rides
dbo.Accommodations
```

Trigger audit table:

```text
dbo.ContentAuditEvents
```

This gives Wonderland examples of both approaches:

```text
CDC      = change capture / audit / reporting pattern
Triggers = database-side reaction to a specific business event
```

---

## Seed and Test Data

Sample rides:

- Dragon Rush Coaster
- Pirate Splash Falls
- Galaxy Spinner
- Enchanted Carousel

Sample accommodation:

- Castle View Hotel
- Jungle Lodge
- Pirate Cove Cabins
- Galaxy Resort Suites

Important seeded employee accounts include:

```text
ava.admin@wonderland.local
mila.manager@wonderland.local
profile.admin@wonderland.local
profile.manager@wonderland.local
workflow.admin@wonderland.local
workflow.manager@wonderland.local
visibility.admin@wonderland.local
visibility.manager@wonderland.local
reporting.admin@wonderland.local
reporting.manager@wonderland.local
```

The exact seed values are maintained in the SQL migration scripts under:

```text
backend/sql
```

---

## Playwright Testing

Playwright is used as the main end-to-end test framework.

Current test command from the root:

```powershell
npm run test:e2e
```

The suite now covers:

- App shell and routing
- Public ride/accommodation listing pages
- Search, filtering and sorting
- Ride and accommodation details pages
- Registration and login
- Role-based registration
- Profile page
- Booking basket
- Checkout
- Booking confirmation
- Booking history
- Booking cancellation
- Admin content submission
- Manager approval workflow
- Admin/Manager booking visibility
- Admin/Manager reporting
- Role-based access denial
- CDC/reporting panels
- Trigger-based content audit panels

### Playwright Stability Note

The Playwright config was updated to reduce flakiness from shared SQL Server state.

Current approach:

```text
fullyParallel: false
workers: 2
```

This is more stable because tests now share:

- SQL Server database
- Seed employees
- Role registration state
- Booking data
- Cancellation data
- CDC capture data
- Content approval data

---

## GitHub Actions and Azure DevOps Pipelines

Wonderland currently uses two CI/CD validation paths.

### GitHub Actions

Workflow file:

```text
.github/workflows/playwright.yml
```

GitHub Actions is used as the clean source repository validation path.

It validates that the app can be built and tested from the GitHub repository.

### Azure DevOps Pipeline

Pipeline file:

```text
azure-pipelines.yml
```

Azure DevOps is used as the enterprise-style learning pipeline.

The Azure Pipeline currently performs additional SQL Server setup, database diagnostics, backend API smoke tests, Playwright test execution, and artifact publishing.

### Why Azure Pipeline Has More Steps

The Azure Pipeline is intentionally more detailed because it is being used to learn enterprise CI/CD practices.

It validates:

- SQL Server container startup
- `WonderlandDB` creation
- SQL migrations
- Seed data
- Required schema columns
- Backend `.env` setup
- Backend API health
- Auth/profile/role registration smoke tests
- Playwright browser installation
- Full Playwright suite
- Playwright report publishing

This helps catch database and backend issues before debugging frontend UI tests.

---

## Current Roadmap

| Iteration | Name | Status | Expected Outcome |
|---|---|---|---|
| Foundation | Local setup, DB, backend, frontend foundation | Complete | SQL Server, backend, frontend, seed data, API health checks |
| Iteration 1 | Frontend app shell and routing | Complete | Multi-page React app with navbar and 404 |
| Iteration 1.5 | Playwright smoke test safety net | Complete | Existing app shell protected by E2E smoke tests |
| Iteration 2 | Frontend authentication flow | Complete | Register/login from frontend, token storage, protected dashboard, logout |
| Iteration 3 | Clean rides and accommodation pages | Complete | Search, filters, loading states, error states |
| Iteration 3.5 | Role-based registration, DOB and age eligibility | Complete | Guest/Admin/Manager registration rules and eligibility data |
| Iteration 3.5.1 | Employee registration status tracking | Complete | Employee registration lifecycle tracking |
| Iteration 3.6 | Profile page | Complete | Guest and employee-linked profile pages |
| Iteration 3.7 | Admin content submission and Manager approval workflow | Complete | Pending/approved/rejected content workflow |
| Iteration 4 | Ride and accommodation details pages | Complete | Public detail pages and not-found handling |
| Iteration 5 | Booking basket | Complete | Add/update/remove basket items |
| Iteration 6 | Checkout and booking confirmation | Complete | Persist bookings, confirmation page and WonderPoints |
| Iteration 7 | Booking history and dashboard/profile integration | Complete | Booking history and dashboard recent bookings |
| Iteration 8 | Booking management enhancements | Complete | Booking filters, search, summaries and timeline |
| Iteration 9 | Booking cancellation workflow | Complete | Cancel confirmed bookings and update status |
| Iteration 10 | Admin and Manager booking visibility | Complete | Internal booking visibility for Admin/Manager |
| Iteration 11 | Admin/Manager reporting and audit preparation | Complete | Reporting dashboards, CDC and trigger learning examples |
| Iteration 11.1 | CDC booking audit and trigger learning example | Complete | CDC for bookings and trigger audit for content approvals |
| Iteration 12 | Export and reporting enhancements | Next | Report filters, CSV export/download, reporting polish |
| Later | Data warehouse and Power BI integration | Planned | OLTP-to-DW-to-Power BI learning architecture |
| Later | Automation Lab | Planned | Beginner and tricky Playwright locator scenarios |

---

## Completed Milestones

### Foundation

- Local project folder created.
- SQL Server installed and running.
- SSMS installed and connected.
- `WonderlandDB` created.
- Database schema created.
- Seed data inserted.
- App-specific SQL login created.
- SQL Server TCP/IP issue fixed.
- Backend npm project initialised.
- Backend dependencies installed.
- Backend `.env` configured.
- Backend moved from port `5000` to `5010`.
- Backend can read data from SQL Server.
- Backend auth APIs created and tested.
- Postman collection generator added.
- React/Vite frontend created.
- Tailwind configured.
- Homepage created and connected to backend data.
- Playwright training requirements documented.
- GitHub repository published.
- GitHub Actions workflow added.
- Azure DevOps repository added.
- Azure Pipeline added and stabilised.

### Iteration 1 — Frontend App Shell and Routing

- Shared layout
- Sticky navigation bar
- Home route
- Rides route
- Accommodation route
- Login route
- Register route
- Dashboard route
- Custom 404 route
- Stable route-level `data-testid` attributes

### Iteration 1.5 — Playwright Smoke Test Safety Net

- Playwright installed
- Root test scripts added
- Smoke test suite added
- GitHub Actions workflow added

### Iteration 2 — Frontend Authentication Flow

- Register form connected to backend
- Login form connected to backend
- JWT stored in localStorage
- Dashboard protected
- Navbar changes based on auth state
- Logout works
- Auth Playwright tests added

### Iteration 3 — Clean Rides and Accommodation Pages

- Live rides page
- Live accommodation page
- Search
- Filters
- Sorting
- Loading/error/empty states
- Listing Playwright tests

### Iteration 3.5 — Role-Based Registration, DOB and Age Eligibility

- Guest/Admin/Manager registration rules
- DOB required
- Employee-backed Admin/Manager validation
- Age eligibility fields for rides and accommodation
- Roles, Employees, EmployeeRoles and EmployeeSalaries tables

### Iteration 3.5.1 — Employee Registration Status Tracking

- Employees track registration lifecycle
- `IsRegistered`
- `RegisteredUserId`
- `RegisteredAt`
- Duplicate employee registration blocked
- Test-support cleanup improved

### Iteration 3.6 — Profile Page

- Protected `/profile` route
- Guest profile details
- Employee-linked Admin/Manager details
- Profile link in navbar
- Profile Playwright tests

### Iteration 3.7 — Admin Content Submission and Manager Approval Workflow

- Admin content submission
- Manager approval/rejection workflow
- Pending content hidden from public pages
- Manager task badge
- Admin submissions list
- Manager reviewed history
- Role-aware login redirect fix

### Iteration 4 — Ride and Accommodation Details Pages

- `/rides/:rideId`
- `/accommodations/:accommodationId`
- Public detail pages
- Clean not-found handling
- Detail page Playwright tests

### Iteration 5 — Booking Basket

- Basket page
- Add ride/accommodation to basket
- Basket count in navbar
- Quantity/guest updates
- Remove and clear actions
- localStorage persistence

### Iteration 6 — Checkout and Booking Confirmation

- Protected checkout
- Booking persistence
- Booking confirmation page
- Booking items saved
- WonderPoints updated
- Basket cleared after checkout

### Iteration 7 — Booking History and Dashboard/Profile Integration

- Dashboard recent bookings
- Booking history page
- Booking details opened from history
- Profile links to booking history

### Iteration 8 — Booking Management Enhancements

- Booking history search/filter/sort
- Summary cards
- Timeline
- Cancellation preparation UI

### Iteration 9 — Booking Cancellation Workflow

- Cancel confirmed bookings
- Prevent duplicate cancellation
- Capture cancellation reason and time
- Reverse WonderPoints
- Cancelled filter and timeline state

### Iteration 10 — Admin and Manager Booking Visibility

- Admin can view all customer bookings
- Manager booking activity summary
- Internal booking details visibility
- Role-based booking APIs
- Dedicated visibility test employees

### Iteration 11 and 11.1 — Reporting, CDC Audit and Trigger Learning

- Admin reporting dashboard
- Manager reporting dashboard
- Booking metrics
- CDC enabled for `dbo.Bookings`
- CDC events shown in reports
- Content audit triggers for rides/accommodations
- SQL Server `OUTPUT INTO` fix for triggered tables
- Reporting Playwright tests

---

## Iteration 12 — Export and Reporting Enhancements

This is the next task to pick up.

### Goal

Enhance Admin and Manager reporting with report filters, export preparation, and downloadable reporting outputs.

### Expected Outcomes

By the end of Iteration 12:

- Admin report date filters are added.
- Manager report date/status filters are added.
- Booking reporting metrics can be filtered.
- CSV export/download endpoint is added.
- Admin can download booking/reporting data.
- Export/download flow is covered by Playwright tests.
- Existing reporting, booking, auth and role-based tests still pass.
- Local, GitHub Actions and Azure Pipeline validation all pass.

### Implementation Approach

1. Review current Admin and Manager reporting pages.
2. Confirm backend report API requirements.
3. Add or update SQL migrations if the reporting/export contract changes.
4. Implement backend report filter/export endpoints.
5. Update frontend report pages.
6. Add Playwright tests for filters and export/download flow.
7. Run local tests.
8. Push to GitHub first.
9. Confirm GitHub Actions passes.
10. Push the same commit to Azure DevOps.
11. Confirm Azure Pipeline passes.

---

## Data Warehouse and Power BI Direction

Wonderland is also intended to support enterprise-style reporting and analytics learning.

The future reporting design should follow a proper architecture:

```text
OLTP WonderlandDB
↓
ETL / ELT process
↓
WonderlandDW
↓
Power BI semantic model and reports
```

The Data Warehouse and Power BI work should not replace core application functionality or Playwright Automation Lab work. It should be added as a linked enterprise reporting stream.

Future DW/Power BI goals:

- Booking fact table
- Booking item fact table
- User/customer dimension
- Ride dimension
- Accommodation dimension
- Date dimension
- Booking status dimension
- Revenue and WonderPoints measures
- Cancellation reporting
- Admin/Manager reporting model
- Power BI dashboard practice

---

## Playwright Training Requirement

Wonderland will also be used as a Playwright JavaScript training application.

In addition to normal theme park booking features, the app will include a dedicated Automation Lab section with intentionally tricky locator scenarios such as:

- Dynamic IDs and classes
- Deeply nested DOM structures
- Shadow DOM components
- Iframes
- Elements without IDs or names
- Hover-only menus
- Hidden and overlapping elements
- Legacy-style DOM manipulation
- Slow rendering
- Repeated identical buttons
- XPath-required markup
- Drag and drop

Detailed requirements are saved in:

```text
docs/playwright-training-requirements.md
```

---

## Current Source of Truth for Next Work

At the start of each future session:

1. Read this README.
2. Check the latest completed iteration.
3. Check the `Next Iteration` section.
4. Run the local Playwright suite before making new changes.
5. Implement the next iteration.
6. Add or update SQL migrations if the database contract changes.
7. Add or update Playwright tests.
8. Run local tests.
9. Update this README.
10. Commit changes.
11. Push to GitHub first.
12. Confirm GitHub Actions passes.
13. Push the same commit to Azure DevOps.
14. Confirm Azure Pipeline passes.

Current local test command:

```powershell
npm run test:e2e
```

Current push commands:

```powershell
git push origin master
git push azure master:main
```

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

## Current Test Status

```text
Local Playwright tests: Passed
GitHub Actions: Passed
Azure DevOps Pipeline: Passed
```

---

## Next Iteration

```text
Iteration 12 — Export and Reporting Enhancements
```

Expected outcomes:

- Admin report export preparation
- CSV export for bookings/reporting
- Report download endpoint
- Admin report date filters
- Manager report date/status filters
- Booking report refinement
- Playwright tests for report filters and export/download flow
