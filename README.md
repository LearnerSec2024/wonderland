# Wonderland Full Stack App

Wonderland is a learning-focused full-stack web application for a modern theme park experience.

The app is being built for two purposes:

1. **Theme park booking platform** â€” users can browse rides, browse accommodation, register, log in, book experiences, and earn reward points.
2. **Playwright JavaScript training app** â€” the app will include clean, testable pages as well as a dedicated Automation Lab with intentionally tricky locator scenarios.

This project is being built locally on a personal Windows 11 laptop for learning purposes.

---

## Current Status Snapshot

| Area | Status |
|---|---|
| SQL Server local database | Complete |
| Backend Express API | Complete foundation |
| Backend SQL Server connection | Working |
| Backend authentication APIs | Working |
| React frontend | Created |
| Frontend routing/app shell | Complete |
| Playwright smoke tests | Passing |
| GitHub repository | Published |
| GitHub Actions workflow | Added |
| Next iteration | **Iteration 2 â€” Frontend Authentication Flow** |

Current local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5010
Database: WonderlandDB
```

---

## Development Rhythm

Every feature iteration should follow this process:

1. Implement the iteration changes.
2. Add or extend Playwright tests for the existing plus new functionality.
3. Run all tests.
4. Fix issues until tests are green.
5. Commit and push.
6. Move to the next iteration.

Current test command from the project root:

```powershell
npm run test:e2e
```

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

## Project Location

Local project folder:

```text
D:\Projects\wonderland
```

Current project structure:

```text
wonderland
â”œâ”€â”€ .github
â”‚   â””â”€â”€ workflows
â”‚       â””â”€â”€ playwright.yml
â”œâ”€â”€ backend
â”‚   â”œâ”€â”€ config
â”‚   â”œâ”€â”€ controllers
â”‚   â”œâ”€â”€ middleware
â”‚   â”œâ”€â”€ routes
â”‚   â”œâ”€â”€ scripts
â”‚   â”œâ”€â”€ sql
â”‚   â”œâ”€â”€ .env.example
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ server.js
â”œâ”€â”€ frontend
â”‚   â”œâ”€â”€ src
â”‚   â”‚   â”œâ”€â”€ components
â”‚   â”‚   â”œâ”€â”€ pages
â”‚   â”‚   â””â”€â”€ services
â”‚   â”œâ”€â”€ tests
â”‚   â”œâ”€â”€ .env.example
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ playwright.config.js
â”œâ”€â”€ docs
â”‚   â”œâ”€â”€ local-db-setup.md
â”‚   â””â”€â”€ playwright-training-requirements.md
â”œâ”€â”€ postman
â”‚   â”œâ”€â”€ wonderland-api.postman_collection.json
â”‚   â””â”€â”€ wonderland-local.postman_environment.json
â”œâ”€â”€ .gitignore
â”œâ”€â”€ package.json
â”œâ”€â”€ package-lock.json
â””â”€â”€ README.md
```

Local secret files such as `backend/.env`, `frontend/.env`, and `backend/sql/create-app-login.local.sql` are intentionally ignored by Git.

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
cd D:\Projects\wonderland
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
cd D:\Projects\wonderland\backend
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
cd D:\Projects\wonderland\frontend
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

## Database Setup Completed

A SQL Server database called `WonderlandDB` has been created.

Tables created:

| Table | Purpose |
|---|---|
| Users | Stores registered app users |
| Rides | Stores theme park rides |
| Accommodations | Stores hotels, lodges, cabins, and resorts |
| RideBookings | Stores user ride bookings |
| AccommodationBookings | Stores accommodation bookings |
| PointsLedger | Tracks reward points earned or used |

Detailed setup notes are stored in:

```text
docs/local-db-setup.md
```

---

## Seed Data Completed

Sample ride and accommodation data has been inserted into SQL Server.

Current sample rides:

- Dragon Rush Coaster
- Pirate Splash Falls
- Galaxy Spinner
- Enchanted Carousel

Current sample accommodation:

- Castle View Hotel
- Jungle Lodge
- Pirate Cove Cabins
- Galaxy Resort Suites

This seed data allows the backend API and frontend screens to show real-looking theme park content.

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

## SQL Server TCP/IP Fix Completed

The backend initially started successfully and `/api/health` worked.

However, `/api/test-db` failed because Node.js tried to connect to:

```text
localhost:1433
```

SQL Server was not listening on TCP port `1433`.

The fix was completed in SQL Server Configuration Manager:

```text
SQL Server Network Configuration
â””â”€â”€ Protocols for MSSQLSERVER
    â””â”€â”€ TCP/IP enabled
```

Then under TCP/IP Properties:

```text
IPAll
TCP Dynamic Ports = blank
TCP Port = 1433
```

SQL Server was restarted.

The fix was verified with:

```powershell
netstat -ano | findstr :1433
```

and:

```powershell
Test-NetConnection localhost -Port 1433
```

The result confirmed:

```text
TcpTestSucceeded : True
```

---

## Current Backend API Endpoints

### Health Check

```text
GET /api/health
```

URL:

```text
http://localhost:5010/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Wonderland backend API is running"
}
```

### Database Test

```text
GET /api/test-db
```

URL:

```text
http://localhost:5010/api/test-db
```

Expected response:

```json
{
  "message": "Database connection is working",
  "data": {
    "DatabaseName": "WonderlandDB",
    "RideCount": 4
  }
}
```

### Rides

```text
GET /api/rides
```

URL:

```text
http://localhost:5010/api/rides
```

Returns the current ride records from SQL Server.

### Accommodations

```text
GET /api/accommodations
```

URL:

```text
http://localhost:5010/api/accommodations
```

Returns the current accommodation records from SQL Server.

### Register

```text
POST /api/auth/register
```

Example body:

```json
{
  "firstName": "Alex",
  "lastName": "Wonder",
  "email": "alex@wonderland.local",
  "password": "Password123!"
}
```

### Login

```text
POST /api/auth/login
```

Example body:

```json
{
  "email": "alex@wonderland.local",
  "password": "Password123!"
}
```

### Current User

```text
GET /api/auth/me
```

This is a protected route.

Use a JWT Bearer token:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Current Authentication Approach

The app currently uses **JWT Bearer token authentication**.

Current flow:

1. Register or login returns a JWT token in the JSON response.
2. Client sends the token in the `Authorization` header.
3. Protected routes validate the token.

Current protected route:

```text
GET /api/auth/me
```

HTTP-only cookie authentication has not been implemented yet. That can be considered later before real web publishing.

---

## Postman API Collection

The project includes a helper script to generate a Postman collection from backend Express routes.

Generated files:

```text
postman/wonderland-api.postman_collection.json
postman/wonderland-local.postman_environment.json
```

The environment file contains reusable local variables such as:

```text
baseUrl = http://localhost:5010
token = empty secret placeholder
id = 1
userId = 1
productId = 1
bookingId = 1
orderId = 1
attractionId = 1
```

Generate the collection:

```powershell
npm run postman:generate
```

---

## Frontend Routes

Completed in Iteration 1:

```text
/                 Home page
/rides            Rides page
/accommodations   Accommodation page
/login            Login page
/register         Register page
/dashboard        Dashboard placeholder
*                 Custom 404 page
```

Completed frontend components:

```text
Layout.jsx
Navbar.jsx
HomePage.jsx
RidesPage.jsx
AccommodationsPage.jsx
LoginPage.jsx
RegisterPage.jsx
DashboardPage.jsx
NotFoundPage.jsx
```

The homepage loads ride and accommodation data from the backend API and SQL Server.

---

## Playwright Testing

Playwright has been added to the frontend.

Current smoke test file:

```text
frontend/tests/app-shell.spec.js
```

Current smoke tests verify:

- Homepage loads.
- Homepage shows live ride/accommodation data.
- Navbar links navigate correctly.
- Rides page opens.
- Accommodation page opens.
- Login page opens.
- Register page opens.
- Dashboard placeholder opens.
- Unknown routes show the custom 404 page.
- Login and register form fields are visible.

Run all tests from the root:

```powershell
npm run test:e2e
```

Current expected result:

```text
4 passed
```

---

## GitHub Actions

A GitHub Actions workflow has been added:

```text
.github/workflows/playwright.yml
```

The workflow is intended to:

- Run on push and pull request.
- Start a SQL Server container.
- Prepare the `WonderlandDB` schema and seed data.
- Install backend and frontend dependencies.
- Install Playwright browsers.
- Run Playwright smoke tests.
- Upload the Playwright report as an artifact.

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

## Completed Milestones

### Foundation Completed

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

### Iteration 1 Completed: Frontend App Shell and Routing

The React frontend has been converted from a single-page demo into a routed multi-page application.

Completed:

- Shared layout
- Sticky navigation bar
- Home route
- Rides route
- Accommodation route
- Login route
- Register route
- Dashboard placeholder route
- Custom 404 route
- Stable route-level `data-testid` attributes

### Iteration 1.5 Completed: Playwright Smoke Test Safety Net

Completed:

- Playwright installed.
- Root test scripts added.
- Smoke test suite added.
- Tests passed locally.
- GitHub Actions workflow added for automated smoke tests.

---

## Current Roadmap

| Iteration | Name | Status | Expected Outcome |
|---|---|---|---|
| Foundation | Local setup, DB, backend, frontend foundation | Complete | SQL Server, backend, frontend, seed data, API health checks |
| Iteration 1 | Frontend app shell and routing | Complete | Multi-page React app with navbar and 404 |
| Iteration 1.5 | Playwright smoke test safety net | Complete | Existing app shell protected by E2E smoke tests |
| Iteration 2 | Frontend authentication flow | **Next** | Register/login from frontend, token storage, protected dashboard, logout |
| Iteration 3 | Clean rides and accommodation pages | Planned | Search, filters, loading states, error states |
| Iteration 4 | Ride and accommodation details pages | Planned | Detail pages and backend single-item APIs |
| Iteration 5 | Booking basket | Planned | Add ride/accommodation to basket, update/remove items |
| Iteration 6 | Checkout and booking confirmation | Planned | Multi-step checkout, save bookings, points earned |
| Iteration 7 | User dashboard | Planned | User bookings, points, recent activity |
| Iteration 8 | Admin role and dashboard | Planned | Admin CRUD, tables, sorting, pagination |
| Iteration 9 | API cleanup and error handling polish | Planned | Cleaner controllers/routes and predictable API errors |
| Iteration 10 | Testability polish | Planned | Stable selectors, accessible names, mockable APIs |
| Iteration 11 | Beginner Automation Lab | Planned | Forms, tables, modals, search, buttons |
| Iteration 12 | Tricky Automation Lab | Planned | Dynamic locators, Shadow DOM, iframes, XPath, drag/drop |

---

## Next Task: Iteration 2 â€” Frontend Authentication Flow

This is the next task to pick up.

### Goal

Connect the frontend login and registration screens to the backend authentication APIs.

### Expected Outcomes

By the end of Iteration 2:

- User can register from the frontend.
- User can log in from the frontend.
- JWT token is saved on the client.
- Frontend can call `GET /api/auth/me`.
- Dashboard becomes protected.
- Logged-in user details display on the dashboard.
- Logout works.
- Unauthenticated users are redirected to `/login` when trying to open `/dashboard`.
- Navbar changes based on login state.
- Playwright tests cover the new authentication flow.
- Existing Playwright smoke tests still pass.

### Implementation Tasks

1. Extend `frontend/src/services/api.js` with auth methods:
   - `register`
   - `login`
   - `getCurrentUser`

2. Create `frontend/src/context/AuthContext.jsx`:
   - stores user
   - stores token
   - loads token from local storage
   - calls `/api/auth/me`
   - exposes `login`, `register`, and `logout`

3. Create `frontend/src/components/ProtectedRoute.jsx`.

4. Update `frontend/src/App.jsx`:
   - wrap routes with `AuthProvider`
   - protect `/dashboard`

5. Update `LoginPage.jsx`:
   - controlled form state
   - submit to backend
   - show loading state
   - show error message
   - redirect to dashboard on success

6. Update `RegisterPage.jsx`:
   - controlled form state
   - submit to backend
   - show loading state
   - show error message
   - redirect to dashboard on success

7. Update `DashboardPage.jsx`:
   - show logged-in user
   - show user points
   - add logout button or navbar logout option

8. Update `Navbar.jsx`:
   - show Login/Register when logged out
   - show Dashboard/Logout when logged in

9. Extend Playwright tests:
   - register a new user from frontend
   - log in from frontend
   - verify dashboard is protected
   - verify logout works
   - rerun existing app shell tests

10. Run:

```powershell
npm run test:e2e
```

### Done When

- All Iteration 2 functionality works in browser.
- Auth flow works against backend and SQL Server.
- All Playwright tests pass.
- README is updated with Iteration 2 completion notes.
- Changes are committed and pushed.

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

For this local learning project, the database password is simple and local-only. It should not be reused for any real system.

---

## Daily Startup

From the root folder:

```powershell
cd D:\Projects\wonderland
npm start
```

Then open:

```text
http://localhost:5173
```

Run the smoke tests:

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
5. Add or update Playwright tests.
6. Run tests.
7. Update this README.
8. Commit and push.

---

## Iteration 2 Completed: Frontend Authentication Flow

The React frontend is now connected to the backend authentication APIs.

### Completed

- Register form connected to `POST /api/auth/register`
- Login form connected to `POST /api/auth/login`
- Current user session loaded from `GET /api/auth/me`
- JWT token stored in browser `localStorage`
- `/dashboard` route protected with `ProtectedRoute`
- Unauthenticated dashboard access redirects to `/login`
- Navbar changes based on authentication state
- Logout clears the local session and redirects to login
- Dashboard shows logged-in user email, role and WonderPoints

### Playwright Tests Updated

The Playwright test suite now covers:

- Existing app shell routes
- Homepage data loading
- Public navigation
- Unauthenticated dashboard redirect
- Register flow
- Logout flow
- Login flow
- Dashboard user display
- Invalid login error handling

### Iteration 2 Test Command

```powershell
npm run test:e2e

Current result:

7 passed
Next Iteration

Iteration 3 — Clean Rides and Accommodation Pages

Expected outcomes:

Full rides listing page
Full accommodation listing page
Search bars
Filters
Loading, error and empty states
Test-friendly data-testid attributes
Playwright tests for listing, search and filters


---

## Iteration 3 Completed: Clean Rides and Accommodation Pages

The Rides and Accommodation placeholder pages have been replaced with full listing pages connected to the backend APIs.

### Completed

- `/rides` now loads live ride data from `GET /api/rides`
- `/accommodations` now loads live accommodation data from `GET /api/accommodations`
- Rides page includes:
  - Search
  - Category filter
  - Thrill-level filter
  - Sort dropdown
  - Loading state
  - Error state
  - Empty state
  - Test-friendly `data-testid` attributes
- Accommodation page includes:
  - Search
  - Stay type filter
  - Minimum guest filter
  - Sort dropdown
  - Loading state
  - Error state
  - Empty state
  - Test-friendly `data-testid` attributes

### Playwright Tests Updated

The Playwright test suite now covers:

- Existing app shell routes
- Frontend authentication flow
- Rides listing page
- Rides search
- Rides category filter
- Rides thrill filter
- Rides sort behaviour
- Rides empty state
- Accommodation listing page
- Accommodation search
- Accommodation type filter
- Accommodation guest filter
- Accommodation sort behaviour
- Accommodation empty state

### Iteration 3 Test Command

    npm run test:e2e

Expected result:

    11 passed

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages

### Next Iteration

Iteration 4 — Ride and Accommodation Details Pages

Expected outcomes:

- Ride details page
- Accommodation details page
- Backend endpoints for single item lookup
- Link from listing cards to details pages
- Clean 404 handling for invalid IDs
- Playwright tests for detail page navigation and not-found states


---

## Roadmap Update: Iteration 3.5 Added

After completing Iteration 3, the next step has been refined before moving to Iteration 4.

### New Next Iteration

Iteration 3.5 — Role-Based Registration, DOB and Age Eligibility

This iteration strengthens the authentication and business rules foundation before adding ride/accommodation detail pages and booking workflows.

---

## Iteration 3.5 — Role-Based Registration, DOB and Age Eligibility

### Purpose

Wonderland registration will support different account types and introduce age-related business rules for future ride and accommodation eligibility.

This is important because Wonderland is a theme park application where:

- Guests may be restricted from certain rides based on age
- Accommodation bookings may require a minimum lead guest age
- Admin and Manager accounts should only be created by authorised employees
- Future booking workflows need reliable DOB and role data

---

### Registration Workflows

The registration process will support three account types:

1. Guest
2. Admin
3. Manager

---

### Guest Registration

Anyone can register as a Guest using their own email address.

Guest registration rules:

- Email can be any valid unused email
- Date of birth is required
- User role is saved as `User`
- EmployeeId is NULL
- Guest can later browse, book and earn WonderPoints

---

### Admin Registration

Admin users can only register if their email already exists in the employee records.

Admin registration rules:

- Email must exist in `Employees`
- Employee must be active
- Employee must have the `Admin` role
- Date of birth must match the employee record
- User role is saved as `Admin`
- User is linked to the matching EmployeeId

---

### Manager Registration

Manager users can only register if their email already exists in the employee records.

Manager registration rules:

- Email must exist in `Employees`
- Employee must be active
- Employee must have the `Manager` role
- Date of birth must match the employee record
- User role is saved as `Manager`
- User is linked to the matching EmployeeId

---

## Database Changes Planned for Iteration 3.5

### Users Table Updates

Add:

- DateOfBirth
- EmployeeId

Purpose:

- Store DOB for all registered users
- Link Admin and Manager user accounts to employee records
- Keep Guest/User accounts independent from employee records

---

### New Roles Table

Create a `Roles` table.

Initial roles:

- User
- Admin
- Manager

Purpose:

- Provide a clean role model for authentication and future role-based access
- Support future Admin and Manager dashboards

---

### New Employees Table

Create an `Employees` table.

Purpose:

- Store authorised employee identities
- Allow Admin and Manager registration only for pre-approved employee emails
- Store employee DOB as the trusted source for employee account validation

Expected fields:

- EmployeeId
- FirstName
- LastName
- Email
- DateOfBirth
- IsActive
- CreatedAt
- UpdatedAt

---

### New EmployeeRoles Table

Create an `EmployeeRoles` table.

Purpose:

- Map employees to roles
- Allow future flexibility where one employee may have multiple roles

Expected fields:

- EmployeeRoleId
- EmployeeId
- RoleId
- AssignedAt

---

### New EmployeeSalaries Table

Create an `EmployeeSalaries` table.

Purpose:

- Provide realistic enterprise-style data modelling
- Support future Admin/Manager reporting scenarios
- Prepare for later data warehouse and Power BI learning

Important:

- Salary data is mock/demo data only
- Salary data should not be exposed through normal frontend user APIs
- Salary visibility should be restricted in future Admin/Manager features

Expected fields:

- EmployeeSalaryId
- EmployeeId
- AnnualSalary
- Currency
- EffectiveFrom
- EffectiveTo
- CreatedAt

---

### Rides Table Updates

Add:

- MinimumAgeYears
- RequiresAdultSupervision

Purpose:

- Display ride age eligibility rules
- Prepare for later booking validation

Example rules:

- Dragon Rush Coaster: 13+
- Pirate Splash Falls: 6+
- Galaxy Spinner: 8+
- Enchanted Carousel: all ages

Note:

Ride booking enforcement will be implemented later when checkout and rider details exist.

---

### Accommodations Table Updates

Add:

- MinimumLeadGuestAgeYears
- IsFamilyFriendly

Purpose:

- Display accommodation eligibility rules
- Prepare for later booking validation

Example rules:

- Castle View Hotel: lead guest 18+
- Jungle Lodge: lead guest 18+
- Pirate Cove Cabins: lead guest 18+, family friendly
- Galaxy Resort Suites: lead guest 21+

Note:

Accommodation booking enforcement will be implemented later during checkout.

---

## Frontend Changes Planned for Iteration 3.5

The registration page will be updated to support:

- Account type selection
- Guest option
- Admin option
- Manager option
- Date of birth field
- Conditional guidance text based on account type
- Backend validation error messages

Expected registration form behaviour:

- Guest selected: anyone can register with an unused email
- Admin selected: email must belong to an active Admin employee
- Manager selected: email must belong to an active Manager employee

---

## Backend Changes Planned for Iteration 3.5

The backend registration API will be updated to accept:

- accountType
- firstName
- lastName
- email
- dateOfBirth
- password

Backend registration rules:

- Guest accounts register as User
- Admin accounts require matching active employee with Admin role
- Manager accounts require matching active employee with Manager role
- Admin/Manager DOB must match employee DOB
- Duplicate emails are rejected
- Missing DOB is rejected
- Invalid account type is rejected

---

## Playwright Tests Planned for Iteration 3.5

The Playwright test suite should be extended to cover:

- Guest can register successfully with DOB
- Guest registration fails without DOB
- Admin can register with seeded employee email and matching DOB
- Manager can register with seeded employee email and matching DOB
- Admin registration fails with random email
- Manager registration fails with random email
- Admin registration fails with wrong DOB
- Dashboard shows correct role
- Rides page displays minimum age rules
- Accommodation page displays lead guest age rules
- Existing app shell tests still pass
- Existing authentication tests still pass
- Existing listing/search/filter tests still pass

---

## Deferred Functionality After Iteration 3.5

The following items are intentionally not part of Iteration 3.5 and will be handled later.

### Iteration 4 — Ride and Accommodation Details Pages

Planned features:

- Ride details page
- Accommodation details page
- Backend endpoints for single item lookup
- Links from listing cards to detail pages
- Clean not-found handling for invalid IDs
- Playwright tests for detail page navigation and not-found states

---

### Iteration 5 — Booking Basket

Planned features:

- Add ride to basket
- Add accommodation to basket
- Basket count in navbar
- Update guest count
- Remove basket item
- Basket page
- Local storage or frontend state basket initially

---

### Iteration 6 — Checkout, Booking Guests and Eligibility Enforcement

Planned features:

- Checkout page
- Multi-step booking flow
- BookingGuests data model
- Guest DOB per rider/guest
- Guest height per rider where needed
- Enforce ride minimum age
- Enforce ride minimum height
- Enforce adult supervision rules
- Enforce accommodation lead guest age
- Save bookings to SQL Server
- Create PointsLedger records
- Update user WonderPoints
- Booking confirmation page

Important:

Account holder DOB alone is not enough for ride eligibility because a parent may book for children. A future `BookingGuests` table will be required.

---

### Iteration 7 — User Dashboard Enhancements

Planned features:

- Upcoming ride bookings
- Upcoming accommodation bookings
- Recent points activity
- User profile summary
- Eligibility hints
- Quick action buttons

---

### Iteration 8 — Admin and Manager Dashboards

Planned features:

- Role-based Admin access
- Role-based Manager access
- Admin dashboard
- Manager dashboard
- Manage rides
- Manage accommodation
- View users
- View employees
- View bookings
- Salary data visibility rules
- Tables with sorting and pagination

---

### Later Iterations — Reporting and Automation Lab

Planned features:

- Data warehouse tables
- Power BI reporting
- Beginner Playwright Automation Lab pages
- Tricky locator Playwright Automation Lab pages
- Shadow DOM scenarios
- Iframe scenarios
- Dynamic locator scenarios
- Drag and drop scenarios
- Legacy DOM scenarios

---

## Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages

Current test status:

- Playwright tests passing locally
- GitHub Actions passing after latest push

Next implementation task:

- Iteration 3.5 — Role-Based Registration, DOB and Age Eligibility

Development rhythm remains:

1. Implement iteration changes
2. Add or update Playwright tests for existing and new functionality
3. Run local tests
4. Push to GitHub
5. Confirm GitHub Actions passes
6. Move to the next iteration


---

## Iteration 3.5 Completed: Role-Based Registration, DOB and Age Eligibility

Iteration 3.5 has been completed and verified locally and through GitHub Actions.

### Completed

- Guest registration now requires date of birth
- Admin registration requires a pre-approved active employee email
- Manager registration requires a pre-approved active employee email
- Admin and Manager DOB must match the employee record
- Users table now supports:
  - DateOfBirth
  - EmployeeId
- New role and employee-related tables added:
  - Roles
  - Employees
  - EmployeeRoles
  - EmployeeSalaries
- Rides now support:
  - MinimumAgeYears
  - RequiresAdultSupervision
- Accommodations now support:
  - MinimumLeadGuestAgeYears
  - IsFamilyFriendly
- Backend registration logic updated for:
  - Guest
  - Admin
  - Manager
- Dashboard now shows:
  - User email
  - Role
  - WonderPoints
  - Age
- Long email overflow issue on dashboard fixed
- GitHub Actions workflow updated to run the Iteration 3.5 database migration
- Playwright tests extended and passing

### Seeded Employee Accounts

Admin employee:

    ava.admin@wonderland.local
    DOB: 1988-04-12

Manager employee:

    mila.manager@wonderland.local
    DOB: 1990-09-20

### Test Status

Current test status:

    Local Playwright tests: Passed
    GitHub Actions tests: Passed

---

## Revised Roadmap After Iteration 3.5

The roadmap has been refined before moving to ride and accommodation details pages.

The next few iterations will strengthen employee lifecycle, profile pages, and approval workflows before continuing to public item detail pages.

---

## Iteration 3.5.1 — Employee Registration Status Tracking

### Purpose

Before an employee registers, the database should indicate that they have not registered yet.

After a successful Admin or Manager registration, the employee record should indicate that the employee has registered and should link to the created user account.

### Planned Database Changes

Update the Employees table with:

- IsRegistered
- RegisteredUserId
- RegisteredAt

Example before registration:

    IsRegistered = 0
    RegisteredUserId = NULL
    RegisteredAt = NULL

Example after successful employee registration:

    IsRegistered = 1
    RegisteredUserId = matching Users.UserId
    RegisteredAt = current timestamp

### Planned Backend Changes

When Admin or Manager registration succeeds:

- Create the user
- Link the user to EmployeeId
- Update Employees.IsRegistered
- Update Employees.RegisteredUserId
- Update Employees.RegisteredAt

Admin or Manager registration should reject an employee who has already registered.

Expected error:

    This employee has already registered

### Planned Playwright Tests

- Admin employee can register once
- Admin employee cannot register a second time
- Manager employee can register once
- Manager employee cannot register a second time
- Existing registration, login and listing tests still pass

---

## Iteration 3.6 — Profile Page

### Purpose

Add a proper profile page for all authenticated users.

New route:

    /profile

### Guest/User Profile

The profile page should show:

- Name
- Email
- Role
- Date of birth
- Age
- WonderPoints
- Account created date

### Employee Profile

For Admin and Manager users, the profile page should also show employee-linked information:

- EmployeeId
- Employee name
- Employee email
- Employee role
- Employee active status
- RegisteredAt

### Important Security Note

Employee salary data should not be shown on the normal profile page.

Salary data is mock/demo data for future enterprise and reporting scenarios, but it should be restricted to future Admin/Manager features.

### Planned Backend API

    GET /api/profile/me

### Planned Playwright Tests

- Logged-out user cannot access /profile
- Guest user sees guest profile details
- Admin user sees employee-linked profile details
- Manager user sees employee-linked profile details
- Profile link appears after login
- Profile link disappears after logout

---

## Iteration 3.7 — Admin Content Submission and Manager Approval Workflow

### Purpose

Admins should be able to submit new ride and accommodation content, but new content should not appear publicly until a Manager approves it.

Managers should receive an approval task notification.

### Admin Workflow

Admins can submit:

- Ride
- Accommodation

Submitted content should be saved as:

    ApprovalStatus = PendingApproval
    IsActive = 0

This means it is not visible on the public rides or accommodation pages yet.

### Manager Workflow

Managers should be able to view pending approval tasks.

Planned routes:

    /manager/tasks
    /manager/approvals

Managers can:

- Approve
- Reject

If approved:

    ApprovalStatus = Approved
    IsActive = 1
    ReviewedByUserId = Manager user id
    ReviewedAt = current timestamp

If rejected:

    ApprovalStatus = Rejected
    IsActive = 0
    RejectionReason = manager reason

### Notification Indicator

The Manager profile/navbar should show a task indicator when there are pending approvals.

Initial version can use a simple badge such as:

    Manager Tasks: 2 pending

or:

    Profile ?? 2

A blinking or pulsing indicator can be added with CSS.

Real-time WebSocket notifications are deferred to a later advanced iteration.

### Planned Database Updates

For Rides and Accommodations, add:

- ApprovalStatus
- SubmittedByUserId
- SubmittedAt
- ReviewedByUserId
- ReviewedAt
- RejectionReason

Existing seed data should be marked as:

    ApprovalStatus = Approved
    IsActive = 1

### Planned Backend APIs

Admin APIs:

    POST /api/admin/rides
    POST /api/admin/accommodations

Manager APIs:

    GET  /api/manager/approvals
    GET  /api/manager/approvals/count
    POST /api/manager/approvals/:type/:id/approve
    POST /api/manager/approvals/:type/:id/reject

### Planned Playwright Tests

- Admin can submit a new ride
- Submitted ride is not visible publicly before approval
- Manager sees pending approval indicator
- Manager can approve ride
- Approved ride appears on public rides page
- Manager can reject accommodation
- Rejected accommodation does not appear publicly
- Normal User cannot access Admin submission pages
- Admin cannot perform Manager approval actions if restricted

---

## Iteration 4 — Ride and Accommodation Details Pages

Iteration 4 will now happen after Iterations 3.5.1, 3.6 and 3.7.

### Planned Features

- Ride details page
- Accommodation details page
- Backend endpoints for single item lookup
- Links from listing cards to detail pages
- Clean not-found handling for invalid IDs
- Playwright tests for detail page navigation and not-found states

### Why Iteration 4 Was Moved Later

The app will be stronger if details pages are built after:

- Employee registration lifecycle is clean
- Profiles exist
- Admin/Manager role workflows are clearer
- Content approval status exists

This means details pages can later show only approved public content and can respect role-based business rules.

---

## Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility

Next implementation task:

    Iteration 3.5.1 — Employee Registration Status Tracking

Development rhythm remains:

1. Implement iteration changes
2. Add or update Playwright tests for existing and new functionality
3. Run local tests
4. Push to GitHub
5. Confirm GitHub Actions passes
6. Move to the next iteration


---

## Iteration 3.5.1 Completed: Employee Registration Status Tracking

Iteration 3.5.1 has been completed and verified locally.

### Completed

- Employees table now tracks employee registration lifecycle
- Employees table now supports:
  - IsRegistered
  - RegisteredUserId
  - RegisteredAt
- Successful Admin registration updates the matching employee record
- Successful Manager registration updates the matching employee record
- Already registered employees cannot register again
- Test-support cleanup resets employee registration status for repeatable Playwright tests
- Role registration Playwright tests now run serially because they use fixed seeded employee emails
- Manual testing completed successfully
- Local Playwright tests passed

### Employee Registration Lifecycle

Before Admin or Manager registration:

    IsRegistered = 0
    RegisteredUserId = NULL
    RegisteredAt = NULL

After successful Admin or Manager registration:

    IsRegistered = 1
    RegisteredUserId = matching Users.UserId
    RegisteredAt = current timestamp

### Manual DB Reset Scripts

A new root-level helper document has been added:

    manual-db-reset-scripts.md

This file contains local SQL scripts for manually resetting test data used in Admin and Manager registration testing.

It includes scripts for:

- Checking employee registration status
- Resetting Admin and Manager employee registration
- Resetting Admin only
- Resetting Manager only
- Checking registered users
- Deleting Playwright-generated guest users
- Calling the test-support cleanup API manually
- Re-running manual registration scenarios

### Manual Testing Completed

The following manual checks passed:

- Admin employee registration status can be reset
- Manager employee registration status can be reset
- Admin can register after reset
- Manager can register after reset
- Admin duplicate registration is blocked
- Manager duplicate registration is blocked
- Employee registration fields update correctly after successful registration
- Dashboard displays long email addresses correctly after UI fix

### Playwright Tests

Local Playwright tests passed after Iteration 3.5.1 implementation.

The tests now include coverage for:

- Admin employee registration
- Manager employee registration
- Admin duplicate employee registration prevention
- Manager duplicate employee registration prevention
- Existing auth flow
- Existing app shell flow
- Existing rides/accommodation listing flow

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking

### Next Iteration

Iteration 3.6 — Profile Page

Expected outcomes:

- New `/profile` route
- Guest profile details
- Admin employee-linked profile details
- Manager employee-linked profile details
- Protected profile route
- Profile link in navbar for logged-in users
- Playwright tests for profile access and profile content


---

## Iteration 3.6 Completed: Profile Page

Wonderland now includes a protected profile page for all authenticated users.

### Completed

- New `/profile` route added
- `/profile` is protected by `ProtectedRoute`
- Logged-out users are redirected to `/login`
- Navbar shows `Profile` only when a user is logged in
- Guest/User profile displays:
  - Name
  - Email
  - Role
  - Date of birth
  - Age
  - WonderPoints
  - Account created date
- Admin and Manager profiles also display employee-linked details:
  - EmployeeId
  - Employee name
  - Employee email
  - Employee roles
  - Employee active status
  - Employee registration status
  - RegisteredAt
- Employee salary data is intentionally not exposed on the profile page
- New backend API added:
  - `GET /api/profile/me`
- New profile-specific seeded employees added for repeatable tests:
  - `profile.admin@wonderland.local`
  - `profile.manager@wonderland.local`
- GitHub Actions workflow updated to run the Iteration 3.6 seed migration

### Playwright Tests Added

The test suite now covers:

- Logged-out user is redirected from `/profile` to `/login`
- Guest user can view profile details
- Guest user does not see employee-linked profile section
- Profile link appears after login
- Profile link disappears after logout
- Admin user sees employee-linked profile details
- Manager user sees employee-linked profile details

### Important Security Note

Employee salary data exists as mock learning data for future enterprise/reporting scenarios, but it is not shown on the normal profile page.

Salary visibility should remain restricted to future Admin/Manager reporting features.

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page

### Next Iteration

Iteration 3.7 — Admin Content Submission and Manager Approval Workflow

Expected outcomes:

- Admin can submit new rides
- Admin can submit new accommodation
- Submitted content starts as pending approval
- Pending content is not publicly visible
- Manager can see pending approval tasks
- Manager can approve or reject submitted content
- Manager task badge/indicator appears when approvals are pending
- Playwright tests cover Admin submission and Manager approval workflow


---

## Iteration 3.7 Completed: Admin Content Submission and Manager Approval Workflow

Wonderland now includes an Admin content submission workflow and a Manager approval workflow.

### Completed

- Admin users can submit new rides
- Admin users can submit new accommodation
- Submitted content starts as:
  - ApprovalStatus = PendingApproval
  - IsActive = 0
- Pending content is not publicly visible on public listing pages
- Manager users can view pending approval tasks
- Manager users can approve pending content
- Manager users can reject pending content
- Approved content becomes publicly visible
- Rejected content remains inactive and hidden from public pages
- Manager navbar shows a pending task badge when approvals exist
- Normal User accounts cannot access Admin content pages
- Normal User accounts cannot access Manager approval pages
- Public rides/accommodation APIs now return only:
  - IsActive = 1
  - ApprovalStatus = Approved

### Admin Workflow

New Admin route:

    /admin/content

Admin users can submit:

- Ride
- Accommodation

Admin users can now also view a list of their submitted content with status:

- PendingApproval
- Approved
- Rejected

This gives Admin users visibility of what they submitted and where it is in the approval workflow.

### Manager Workflow

New Manager route:

    /manager/approvals

Manager users can now view:

- Pending approval tasks
- Reviewed approval history

The reviewed history shows content the Manager has already approved or rejected.

### Workflow Behaviour

Expected content lifecycle:

    Admin submits content
    Content saved as PendingApproval
    Content hidden from public pages
    Manager sees pending task
    Manager approves or rejects
    Approved content becomes public
    Rejected content remains hidden
    Admin can see latest status in My Submissions
    Manager can see completed review in Reviewed History

### Login Redirect Fix

A role-aware login redirect fix was added.

Before the fix, if an Admin logged out from `/admin/content` and a Manager logged in afterwards, the app could redirect the Manager back to `/admin/content`, causing an Access Denied page.

The login flow now checks the newly logged-in user role before redirecting.

Expected behaviour:

- Admin logging into an Admin route can continue to that route
- Manager logging into a Manager route can continue to that route
- Manager logging in after Admin logout is safely redirected to `/dashboard`
- Admin logging in after Manager logout is safely redirected to `/dashboard`
- Normal Users are not redirected into restricted Admin or Manager routes

### Database Changes

Rides and Accommodations now support:

- ApprovalStatus
- SubmittedByUserId
- SubmittedAt
- ReviewedByUserId
- ReviewedAt
- RejectionReason

Existing seeded content is treated as:

    ApprovalStatus = Approved
    IsActive = 1

### New Backend APIs

Admin APIs:

    GET  /api/admin/submissions
    POST /api/admin/rides
    POST /api/admin/accommodations

Manager APIs:

    GET  /api/manager/approvals
    GET  /api/manager/approvals/count
    GET  /api/manager/approvals/history
    POST /api/manager/approvals/:type/:id/approve
    POST /api/manager/approvals/:type/:id/reject

### New Frontend Routes

Admin route:

    /admin/content

Manager route:

    /manager/approvals

### Test-Support Enhancements

The local/CI test-support API now also supports cleaning test-created content by name.

This is used only for repeatable local and CI tests.

Test-support endpoint added:

    DELETE /api/test-support/content/by-name

Reminder:

Test-support APIs are enabled only when:

    ENABLE_TEST_SUPPORT=true

These routes are for local development and CI testing only, not production use.

### Playwright Tests Added / Updated

The Playwright suite now covers:

- Admin can submit a new ride
- Admin can see submitted ride in My Submissions
- Submitted ride starts as PendingApproval
- Pending ride is not visible publicly before approval
- Manager sees pending approval task indicator
- Manager can approve submitted ride
- Manager can see approved content in Reviewed History
- Approved ride becomes visible publicly
- Normal User cannot access Admin content page
- Normal User cannot access Manager approvals page
- Listing page tests now support dynamic public content counts
- Login redirect safely handles role-restricted return paths

### Manual Testing Completed

Manual testing confirmed:

- Admin Content link appears only for Admin users
- Manager Tasks link appears only for Manager users
- Normal Users do not see Admin/Manager navigation
- Normal Users are blocked when directly visiting restricted URLs
- Admin-submitted content is hidden before approval
- Manager approval makes content publicly visible
- Manager task badge appears when pending approvals exist
- Admin can view submitted content statuses
- Manager can view reviewed approval history
- Role-aware login redirect works correctly after logout/login between Admin and Manager accounts

### Test Status

Current test status:

    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow

### Next Iteration

Iteration 4 — Ride and Accommodation Details Pages

Expected outcomes:

- Ride details page
- Accommodation details page
- Backend endpoints for single item lookup
- Links from listing cards to detail pages
- Detail pages should only show approved active content
- Clean 404 handling for invalid IDs
- Playwright tests for detail page navigation and not-found states


---

## Iteration 4 Completed: Ride and Accommodation Details Pages

Wonderland now includes public detail pages for approved rides and accommodation.

### Completed

- Ride details page added
- Accommodation details page added
- Backend single-item lookup endpoints added
- Listing cards now link to detail pages
- Detail pages only show approved active content
- Clean not-found handling added for invalid IDs
- Playwright tests added for detail page navigation and not-found states

---

### Ride Details Page

New route:

    /rides/:rideId

Example:

    /rides/1

The ride details page displays:

- Ride name
- Description
- Category
- Thrill level
- Minimum age
- Minimum height
- Adult supervision requirement
- Price
- WonderPoints earned
- Booking coming soon message
- Back to rides link

This page prepares the app for future booking basket functionality, where users will later be able to add rides to a basket and validate rider age/height eligibility.

---

### Accommodation Details Page

New route:

    /accommodations/:accommodationId

Example:

    /accommodations/1

The accommodation details page displays:

- Accommodation name
- Description
- Stay type
- Maximum guests
- Minimum lead guest age
- Family-friendly indicator
- Price per night
- Booking coming soon message
- Back to stays link

This page prepares the app for future accommodation booking functionality, where users will later be able to select dates, guest counts and validate lead guest age rules.

---

### Backend API Changes

New public API endpoints added:

    GET /api/rides/:rideId
    GET /api/accommodations/:accommodationId

These endpoints return a single approved active ride or accommodation record.

The existing list endpoints remain:

    GET /api/rides
    GET /api/accommodations

The single-item endpoints follow the same public visibility rule as the list endpoints.

Only records with the following values are returned publicly:

    IsActive = 1
    ApprovalStatus = Approved

This prevents pending or rejected Admin-submitted content from being viewed directly by guessing a URL.

---

### Listing Page Changes

Ride cards now include:

    View details

which links to:

    /rides/:rideId

Accommodation cards now include:

    View details

which links to:

    /accommodations/:accommodationId

This creates a realistic user journey:

    Browse list
    Open details
    Review item information
    Return to list
    Future step: add to booking basket

---

### Not-Found Handling

Invalid or unavailable detail URLs now show friendly not-found states.

Examples:

    /rides/999999
    /accommodations/999999

Expected behaviour:

- User sees a clean not-found message
- App does not crash
- User can navigate back to the relevant listing page

Ride not-found message explains that the ride may not exist, may be inactive, or may still be waiting for Manager approval.

Accommodation not-found message follows the same pattern.

---

### Playwright Tests Added / Updated

New detail-page tests cover:

- User can open a ride details page from the rides listing
- Ride details page displays expected ride information
- Ride details back link returns to the rides listing
- Invalid ride ID shows a clean not-found state
- User can open an accommodation details page from the stays listing
- Accommodation details page displays expected accommodation information
- Accommodation details back link returns to the accommodation listing
- Invalid accommodation ID shows a clean not-found state

Existing listing and app shell tests were also adjusted to better support dynamic CMS-approved content.

### Playwright Locator Improvements

Some tests were updated to use more precise locators.

For example, accommodation page heading checks now target the page-level H1 instead of matching any heading that contains the word “Accommodation”.

Improved pattern:

    page.getByRole("heading", { name: "Accommodation", level: 1, exact: true })

This prevents strict-mode failures when approved accommodation content contains “Accommodation” in item titles.

---

### Test Status

Current test status:

    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages

---

### Next Iteration

Iteration 5 — Booking Basket

Expected outcomes:

- Add ride to basket
- Add accommodation to basket
- Basket count in navbar
- Basket page
- Update ride quantity or guest count
- Remove basket item
- Persist basket in frontend state or local storage initially
- Prepare for future checkout and booking confirmation flow
- Playwright tests for basket add/update/remove flows


---

## Iteration 5 Completed: Booking Basket

Wonderland now includes a frontend booking basket for rides and accommodation.

This iteration prepares the app for the future checkout and booking confirmation workflow.

### Completed

- Booking basket page added
- Basket route added:

    /basket

- Basket link added to the navbar
- Basket count displays in the navbar when items are added
- Users can add rides to the basket from:
  - Ride details page
  - Rides listing cards
- Users can add accommodation to the basket from:
  - Accommodation details page
  - Accommodation listing cards
- Users can update ride quantity
- Users can update accommodation guest count
- Users can remove individual basket items
- Users can clear the full basket
- Remove item action now shows a confirmation warning
- Clear basket action now shows a confirmation warning
- Basket persists in localStorage
- Basket state is managed through a shared React BasketContext
- BasketProvider now wraps the app from main.jsx so navbar, layout and pages can all access basket state

---

### Basket Page

New route:

    /basket

The basket page displays:

- Ride basket items
- Accommodation basket items
- Basket count
- WonderPoints total
- Basket total
- Item subtotals
- Update controls
- Remove buttons
- Clear basket button
- Checkout coming soon message

Checkout remains disabled for now and will be implemented in a future iteration.

---

### Basket State

Basket state is currently frontend-only and stored in:

    localStorage

Storage key:

    wonderland_basket

This keeps the basket available after page refresh.

Future checkout iterations will move confirmed bookings into SQL Server tables.

---

### Ride Basket Behaviour

Users can add rides to the basket.

Ride items include:

- Ride ID
- Ride name
- Description
- Unit price
- Quantity
- WonderPoints
- Minimum age
- Minimum height

Ride subtotal is calculated as:

    Unit price × Quantity

Users can increase or decrease ride quantity.

Minimum ride quantity is:

    1

---

### Accommodation Basket Behaviour

Users can add accommodation to the basket.

Accommodation items include:

- Accommodation ID
- Accommodation name
- Description
- Unit price
- Guest count
- Maximum guests
- Minimum lead guest age

Accommodation guest count can be changed up to the accommodation maximum guest capacity.

---

### Accommodation Guest Pricing Rule

Accommodation pricing now adjusts based on guest count.

Pricing rule:

    Base accommodation price
    + 50% of base price for guest 1
    + 25% of base price for guest 2
    + 25% of base price for guest 3
    + 10% of base price for guest 4
    + 0% for guest 5 and above

Example for a $320 accommodation:

    1 guest  = 320 + 160 = 480
    2 guests = 320 + 160 + 80 = 560
    3 guests = 320 + 160 + 80 + 80 = 640
    4 guests = 320 + 160 + 80 + 80 + 32 = 672
    5+ guests = 672

The basket page displays a guest pricing note for accommodation items.

---

### Listing Card Basket Actions

Ride listing cards now include:

- Add to basket
- View details

Accommodation listing cards now include:

- Add to basket
- View details

This allows users to add items directly from listing pages without needing to open the details page first.

The details pages still support Add to basket as well.

---

### Confirmation Warnings

Basket removal actions now include warnings.

Remove single item:

    Remove [item name] from your Wonderland basket?

Clear basket:

    Are you sure you want to clear your entire Wonderland basket?

This prevents accidental basket deletion during manual testing and real user workflows.

---

### Playwright Tests Added / Updated

The Playwright suite now covers:

- Add ride to basket from ride details page
- Add accommodation to basket from accommodation details page
- Add ride to basket from rides listing card
- Add accommodation to basket from accommodation listing card
- Basket count updates in navbar
- Basket page displays added ride
- Basket page displays added accommodation
- Ride quantity can be increased
- Accommodation guest count can be updated
- Accommodation pricing updates based on guest count
- Remove item confirmation dialog appears and can be accepted
- Clear basket confirmation dialog appears and can be accepted
- Basket persists after page reload
- Basket can be cleared
- View details links continue to work after Add to basket buttons were added

---

### Test Status

Current test status:

    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket

---

### Next Iteration

Iteration 6 — Checkout and Booking Confirmation

Expected outcomes:

- Checkout page
- Basket review before checkout
- Auth-required checkout
- Guest/User booking submission
- Backend booking/order APIs
- SQL Server booking/order persistence
- Booking confirmation page
- WonderPoints update after successful booking
- Empty basket after successful checkout
- Booking history preparation for dashboard/profile
- Playwright tests for checkout and booking confirmation flow


---

## Iteration 6 Completed: Checkout and Booking Confirmation

Wonderland now supports authenticated checkout, booking persistence in SQL Server, booking confirmation, and WonderPoints updates.

This iteration moves the app from a frontend-only basket to a real persisted booking workflow.

---

### Completed

- Checkout page added
- Checkout route added:

    /checkout

- Booking confirmation page added
- Booking confirmation route added:

    /booking-confirmation/:bookingReference

- Checkout is protected and requires authentication
- Logged-out users are redirected to Login when trying to checkout
- Logged-in users can confirm a booking from basket contents
- Confirmed bookings are saved to SQL Server
- Booking items are saved to SQL Server
- Booking reference is generated automatically
- Booking confirmation page displays confirmed booking details
- Basket is cleared after successful checkout
- Ride WonderPoints are added to the user account after checkout
- Booking history API preparation added
- GitHub Actions workflow updated to run the Iteration 6 SQL migration
- Playwright tests added for checkout and booking confirmation

---

### New Database Tables

Iteration 6 added two new SQL Server tables:

    dbo.Bookings
    dbo.BookingItems

#### dbo.Bookings

Stores the booking/order header.

Important fields:

- BookingId
- BookingReference
- UserId
- Status
- BasketItemCount
- TotalAmount
- TotalPointsEarned
- VisitDate
- CustomerNotes
- CreatedAt

#### dbo.BookingItems

Stores the individual ride and accommodation items inside a booking.

Important fields:

- BookingItemId
- BookingId
- ItemType
- RideId
- AccommodationId
- ItemName
- UnitPrice
- Quantity
- GuestCount
- Subtotal
- PointsEarned
- CreatedAt

Relationship:

    Bookings.BookingId
        ? BookingItems.BookingId

Bookings are also linked to users:

    Users.UserId
        ? Bookings.UserId

---

### New Backend APIs

Booking APIs added:

    POST /api/bookings/checkout
    GET  /api/bookings/my
    GET  /api/bookings/:bookingReference

#### POST /api/bookings/checkout

Creates a confirmed booking from basket items.

The API:

- Requires authentication
- Validates the basket has items
- Re-checks ride/accommodation availability from the database
- Only allows approved active rides/accommodation
- Recalculates pricing on the backend
- Creates a booking record
- Creates booking item records
- Updates user WonderPoints
- Returns the confirmed booking

Important design point:

The backend does not blindly trust frontend basket totals. It recalculates prices and points from SQL Server data.

---

### Checkout Page

New route:

    /checkout

The checkout page displays:

- Logged-in user details
- Basket item summary
- Visit date field
- Optional notes field
- Basket count
- WonderPoints total
- Booking total
- Confirm booking button
- Back to basket link

Checkout requires a logged-in user.

If a logged-out user tries to checkout, they are redirected to:

    /login

---

### Booking Confirmation Page

New route:

    /booking-confirmation/:bookingReference

Example:

    /booking-confirmation/WB-177...

The confirmation page displays:

- Booking reference
- Booking status
- Visit date
- Total amount
- Total WonderPoints earned
- Confirmed ride items
- Confirmed accommodation items
- Browse more rides link
- Back to dashboard link

The booking reference starts with:

    WB-

---

### Basket and Checkout Flow

Expected user journey:

    Add ride to basket
    Add accommodation to basket
    Open basket
    Review basket total
    Click Checkout
    Login/register if required
    Enter visit date
    Add optional notes
    Confirm booking
    Booking saved to SQL Server
    Booking confirmation page displayed
    Basket cleared
    WonderPoints updated

---

### Pricing Behaviour

Ride pricing:

    Ride unit price × quantity

Accommodation pricing continues to use the guest surcharge rule introduced in Iteration 5:

    Base accommodation price
    + 50% of base price for guest 1
    + 25% of base price for guest 2
    + 25% of base price for guest 3
    + 10% of base price for guest 4
    + 0% for guest 5 and above

The checkout backend recalculates accommodation pricing to ensure totals are not trusted only from the frontend.

---

### WonderPoints Behaviour

Ride items earn WonderPoints.

During checkout:

- Ride points are calculated from approved ride data
- Points are multiplied by ride quantity
- Booking stores TotalPointsEarned
- User TotalPoints is increased after successful booking

Accommodation currently earns:

    0 points

This can be expanded in a future rewards iteration.

---

### GitHub Actions / CI Update

GitHub Actions now runs the Iteration 6 SQL migration:

    backend/sql/iteration-6-checkout-bookings.sql

This ensures CI creates:

- dbo.Bookings
- dbo.BookingItems

before running Playwright tests.

---

### Playwright Tests Added / Updated

The Playwright suite now covers:

- Checkout requires authentication
- Logged-out user is redirected to Login when trying to checkout
- Logged-in user can add ride to basket
- Logged-in user can add accommodation to basket
- Basket total appears correctly before checkout
- User can open checkout page
- Checkout page displays basket summary
- User can enter visit date and notes
- User can confirm booking
- Booking confirmation page appears
- Booking reference starts with WB-
- Booking status is Confirmed
- Booking total is displayed
- WonderPoints are displayed
- Confirmed booking items are displayed
- Basket is empty after successful checkout
- Basket count disappears after checkout

---

### Test Status

Current test status:

    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket
- Iteration 6 — Checkout and booking confirmation

---

### Next Iteration

Iteration 7 — Booking History and Dashboard/Profile Integration

Expected outcomes:

- User dashboard shows recent bookings
- Profile page links to booking history
- Booking history page
- Booking details view from history
- Backend booking history API refinement if needed
- Display booking reference, status, visit date, total and points
- Playwright tests for booking history visibility after checkout


---

## Iteration 7 Completed: Booking History and Dashboard/Profile Integration

Wonderland now includes booking history visibility across the user dashboard, profile page, and booking history page.

This iteration builds on Iteration 6 booking persistence and makes confirmed bookings visible to users after checkout.

---

### Completed

- User dashboard now shows recent bookings
- Profile page now links to booking history
- Booking history page added
- Booking history route added:

    /bookings/history

- Booking details can be opened from booking history
- Existing booking confirmation page is reused as the booking detail view
- Booking history uses existing persisted booking data from SQL Server
- Playwright tests added for booking history after checkout
- Existing auth flow tests updated to match the new dashboard layout

---

### Dashboard Updates

The dashboard now includes:

- Logged-in user email
- User role
- WonderPoints
- Recent bookings section
- Link to view all bookings
- Quick actions:
  - View profile
  - Browse rides
  - Browse stays

Recent bookings show:

- Booking reference
- Booking status
- Visit date
- Booking date
- Total amount
- WonderPoints earned
- Link to view booking details

If the user has no bookings, the dashboard shows an empty recent bookings message.

---

### Profile Page Updates

The profile page now includes a booking history section.

New profile action:

    View booking history

This links to:

    /bookings/history

The profile page remains protected and only visible to authenticated users.

---

### Booking History Page

New route:

    /bookings/history

The booking history page displays all recent bookings for the logged-in user.

Each booking card displays:

- Booking reference
- Status
- Visit date
- Booking created date
- Total amount
- WonderPoints earned
- Basket item count
- View booking details link

If the user has no bookings, the page shows a friendly empty state with links to browse rides and accommodation.

---

### Booking Details from History

The existing booking confirmation page is reused as the booking detail page.

Route:

    /booking-confirmation/:bookingReference

This means users can open a past booking from history and see:

- Booking reference
- Status
- Visit date
- Total amount
- WonderPoints earned
- Ride items
- Accommodation items

This avoids creating a separate duplicate booking details page.

---

### Backend API Usage

Iteration 7 uses the existing Iteration 6 booking APIs:

    GET /api/bookings/my
    GET /api/bookings/:bookingReference

No new database tables were added in this iteration.

Booking history reads from:

    dbo.Bookings
    dbo.BookingItems

---

### Test Updates

Playwright tests now cover:

- Booking appears on dashboard after checkout
- Dashboard recent bookings section displays booking reference
- Dashboard recent bookings section displays total and points
- User can open booking history from dashboard
- Booking appears on booking history page
- User can open booking details from history
- Booking details page displays the same booking reference
- Profile page links to booking history
- Booking history empty state appears for a user with no bookings

Existing authentication tests were updated to match the new dashboard layout.

The old dashboard test expected:

    dashboard-user-name
    dashboard-total-points

The new dashboard uses:

    Welcome back, [FirstName]
    dashboard-user-points

---

### Test Status

Current test status:

    Manual testing: Passed
    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket
- Iteration 6 — Checkout and booking confirmation
- Iteration 7 — Booking history and dashboard/profile integration

---

### Next Iteration

Iteration 8 — Booking Management Enhancements

Expected outcomes:

- Booking history filters
- Booking history search by booking reference
- Booking status display improvements
- Booking detail page polish
- User-friendly booking timeline
- Admin/Manager visibility preparation for bookings
- Booking cancellation preparation
- Playwright tests for booking history filtering/search


---

## Iteration 8 Completed: Booking Management Enhancements

Wonderland now includes improved booking history management, booking search/filter/sort, summary cards, booking detail polish, timeline display, and cancellation preparation UI.

This iteration improves the user experience around managing confirmed bookings after checkout.

---

### Completed

- Booking history search added
- Booking history status filter added
- Booking history sort added
- Booking history summary cards added
- Booking history no-results state added
- Clear filters action added
- Booking detail page polished
- Existing booking confirmation page enhanced as a reusable booking details page
- Booking timeline added
- Cancellation preparation UI added
- Back to booking history link added from booking details
- Playwright tests updated for booking history search/filter/detail polish

No new database tables were added in this iteration.

---

### Booking History Enhancements

Booking history route:

    /bookings/history

The booking history page now includes:

- Total bookings summary
- Total spend summary
- WonderPoints earned summary
- Search by booking reference
- Filter by booking status
- Sort options
- No-results state
- Clear filters button

Users can now search and manage booking history more easily as more bookings are created.

---

### Booking History Search

Users can search bookings by:

- Booking reference
- Booking status
- Total amount

Example:

    WB-...

If no matching booking is found, the page shows a friendly no-results state.

---

### Booking History Filters

Users can filter booking history by status.

Current status:

    Confirmed

This prepares the app for future statuses such as:

    Cancelled
    Pending
    Refunded

---

### Booking History Sort Options

Booking history can now be sorted by:

- Newest first
- Oldest first
- Highest total
- Lowest total

This helps users manage larger booking histories over time.

---

### Booking Summary Cards

The booking history page now displays summary cards:

- Total bookings
- Total spend
- WonderPoints earned

These are calculated from the logged-in user’s booking history.

---

### Booking Detail Page Polish

The existing booking confirmation page is now also used as a richer booking details page.

Route:

    /booking-confirmation/:bookingReference

It now displays:

- Booking reference
- Booking status
- Visit date
- WonderPoints earned
- Booking total
- Confirmed ride/accommodation items
- Booking timeline
- Cancellation preparation section
- Back to booking history link
- Browse more rides link
- Back to dashboard link

This avoids duplicating a separate booking details page.

---

### Booking Timeline

A user-friendly booking timeline was added.

The timeline currently shows:

- Booking created
- Status confirmed
- Rewards updated

This prepares the booking details page for future lifecycle events such as:

- Booking cancelled
- Refund requested
- Refund processed
- Booking changed
- Admin review completed

---

### Cancellation Preparation UI

A cancellation preparation section was added to booking details.

Current behaviour:

- Cancellation information is displayed
- Cancel booking button is disabled
- The UI explains cancellation is coming soon

This prepares for a future cancellation workflow without enabling cancellation yet.

Future cancellation workflow may include:

- Cancellation rules
- Cancellation confirmation
- Status update from Confirmed to Cancelled
- Audit/history tracking
- Refund preparation
- Admin/Manager visibility

---

### Playwright Tests Added / Updated

The Playwright suite now covers:

- Booking appears on dashboard after checkout
- Booking appears in booking history
- Booking history summary cards show count, spend and points
- Booking history search by booking reference
- Booking history no-results state
- Booking history clear filters action
- Booking history status filter
- Booking detail page opens from history
- Booking detail page shows the same booking reference
- Booking detail page shows confirmed items
- Booking timeline appears
- Booking timeline shows Confirmed status
- Cancellation preparation section appears
- Back to booking history link works
- Profile page links to booking history
- Booking history empty state appears for users with no bookings

---

### Test Status

Current test status:

    Manual testing: Passed
    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket
- Iteration 6 — Checkout and booking confirmation
- Iteration 7 — Booking history and dashboard/profile integration
- Iteration 8 — Booking management enhancements

---

### Next Iteration

Iteration 9 — Booking Cancellation Workflow

Expected outcomes:

- Enable booking cancellation for confirmed bookings
- Add backend cancellation API
- Update booking status from Confirmed to Cancelled
- Prevent cancellation of already cancelled bookings
- Show cancellation confirmation warning
- Update booking history filters to support Cancelled status
- Show cancelled bookings in dashboard/history/details
- Prepare audit trail for future admin reporting
- Playwright tests for cancellation flow and status updates


---

## Iteration 9 Completed: Booking Cancellation Workflow

Wonderland now supports customer booking cancellation for confirmed bookings.

This iteration extends the booking management workflow by allowing users to cancel their own confirmed bookings, while keeping cancelled bookings visible in booking history and booking details.

---

### Completed

- Booking cancellation backend API added
- Confirmed bookings can now be cancelled
- Already cancelled bookings cannot be cancelled again
- Booking status updates from Confirmed to Cancelled
- CancelledAt is recorded
- CancellationReason is recorded
- Booking detail page now supports cancellation
- Cancellation warning confirmation added
- Cancel button is disabled after cancellation
- Cancelled bookings remain visible in booking history
- Booking history filter now supports Cancelled status
- Booking detail timeline shows cancelled status
- WonderPoints are reversed when a booking is cancelled
- GitHub Actions workflow updated to run Iteration 9 SQL migration
- Playwright tests added for cancellation flow and duplicate cancellation prevention

No new database tables were added in this iteration.

---

### Database Changes

Iteration 9 added cancellation fields to the existing table:

    dbo.Bookings

New columns:

- CancelledAt
- CancellationReason

These fields prepare the app for future audit and admin reporting features.

Example booking lifecycle:

    Confirmed
        ?
    Cancelled

---

### New Backend API

Booking cancellation API added:

    POST /api/bookings/:bookingReference/cancel

The API:

- Requires authentication
- Only allows the booking owner to cancel their booking
- Allows cancellation only when Status = Confirmed
- Updates booking status to Cancelled
- Sets CancelledAt
- Sets CancellationReason
- Prevents duplicate cancellation
- Reverses earned WonderPoints from the user account
- Returns the updated booking

If a booking is already cancelled, the API returns:

    400 Booking is already cancelled

---

### Booking Details Page Updates

The existing booking confirmation/details page now supports cancellation management.

Route:

    /booking-confirmation/:bookingReference

The booking details page now displays:

- Current booking status
- Booking timeline
- Cancellation management section
- Cancel booking button for confirmed bookings
- Disabled cancellation button for cancelled bookings
- Cancellation reason after cancellation
- Cancelled timeline event after cancellation

---

### Cancellation Warning

Before cancelling a booking, the user sees a browser confirmation warning.

Example:

    Cancel booking WB-...? This will change the booking status to Cancelled.

If the user cancels the warning, the booking remains Confirmed.

If the user accepts the warning, the booking status changes to Cancelled.

---

### Booking History Updates

Cancelled bookings remain visible in booking history.

Route:

    /bookings/history

Booking history now supports filtering by:

- Confirmed
- Cancelled

Cancelled bookings can still be opened from history to view the full booking detail page.

---

### WonderPoints Reversal

When a confirmed booking is cancelled:

- The booking remains in history
- The booking status changes to Cancelled
- The user’s earned WonderPoints from that booking are reversed
- TotalPoints is protected from going below zero

This keeps the reward balance aligned with booking status.

---

### GitHub Actions / CI Update

GitHub Actions now runs the Iteration 9 SQL migration:

    backend/sql/iteration-9-booking-cancellation.sql

This ensures CI adds the cancellation columns before Playwright tests run.

---

### Playwright Tests Added / Updated

The Playwright suite now covers:

- User can cancel a confirmed booking
- Cancellation confirmation warning appears
- Booking status changes from Confirmed to Cancelled
- Cancellation success message appears
- Cancellation timeline appears
- Cancellation reason appears
- Cancel button becomes disabled after cancellation
- Cancelled booking appears in booking history
- Booking history can filter by Cancelled status
- Cancelled booking can still be opened from booking history
- Backend prevents cancelling the same booking twice

Existing booking history tests were updated to expect the new cancellation management section.

---

### Manual Testing Completed

Manual testing confirmed:

- Confirmed booking can be cancelled
- Warning appears before cancellation
- Cancelling the warning leaves booking as Confirmed
- Accepting the warning changes status to Cancelled
- Cancel button is disabled after cancellation
- Cancelled booking appears in booking history
- Cancelled filter works
- Cancelled booking details can be opened from history
- SQL Server shows Status = Cancelled
- CancelledAt is populated
- CancellationReason is populated

---

### Test Status

Current test status:

    Manual testing: Passed
    Local Playwright tests: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket
- Iteration 6 — Checkout and booking confirmation
- Iteration 7 — Booking history and dashboard/profile integration
- Iteration 8 — Booking management enhancements
- Iteration 9 — Booking cancellation workflow

---

### Next Iteration

Iteration 10 — Admin and Manager Booking Visibility

Expected outcomes:

- Admin can view all customer bookings
- Manager can view booking activity summary
- Admin/Manager booking search and filters
- Booking detail visibility for Admin/Manager
- Role-based backend booking visibility APIs
- Admin/Manager dashboard booking widgets
- Prepare for future reporting and audit trail
- Playwright tests for Admin/Manager booking visibility


---

## Iteration 10 Completed: Admin and Manager Booking Visibility

Wonderland now includes role-based internal booking visibility for Admin and Manager users.

This iteration gives internal users visibility of customer booking activity while keeping normal customer booking ownership protected.

---

### Completed

- Admin booking visibility page added
- Manager booking activity page added
- Admin can view all customer bookings
- Admin can search, filter and sort customer bookings
- Admin can open customer booking details
- Manager can view booking activity summary
- Manager can view recent booking activity
- Manager can open booking details
- Customer details now appear on booking details when opened by Admin or Manager
- Admin Bookings link added to Admin navbar
- Booking Activity link added to Manager navbar
- Normal Users are blocked from Admin/Manager booking visibility pages
- Backend Admin booking APIs added
- Backend Manager booking activity APIs added
- Dedicated visibility test employees added for repeatable tests
- Playwright tests added for Admin/Manager booking visibility
- Playwright auth setup improved using `page.addInitScript()` for stable token injection
- Playwright HTML report configuration retained for easier debugging

No new database tables were added in this iteration.

---

### New Admin Route

New frontend route:

    /admin/bookings

Visible only to Admin users.

The Admin Bookings page displays:

- Total bookings
- Confirmed bookings
- Cancelled bookings
- Total revenue
- Total WonderPoints issued
- Customer booking list
- Customer name
- Customer email
- Booking reference
- Booking status
- Visit date
- Booking total
- WonderPoints earned
- Search/filter/sort controls
- View booking details action

---

### Admin Booking Search and Filters

Admin users can search bookings by:

- Booking reference
- Customer name
- Customer email
- Booking status

Admin users can filter bookings by status:

- Confirmed
- Cancelled

Admin users can sort bookings by:

- Newest first
- Oldest first
- Highest total
- Lowest total

---

### New Manager Route

New frontend route:

    /manager/bookings

Visible only to Manager users.

The Manager Booking Activity page displays:

- Total bookings
- Confirmed bookings
- Cancelled bookings
- Total revenue
- Total WonderPoints issued
- Recent booking activity
- Customer name
- Customer email
- Booking reference
- Booking status
- Booking total
- View details action

This prepares the app for future operational reporting and booking activity oversight.

---

### Booking Details for Admin and Manager

The existing booking confirmation/details page is reused for Admin and Manager booking detail visibility.

Route:

    /booking-confirmation/:bookingReference

When opened by Admin or Manager, the page can now display:

- Booking reference
- Booking status
- Visit date
- Booking timeline
- Customer name
- Customer email
- Confirmed ride/accommodation items
- Cancellation information where relevant

This avoids building a duplicate booking details page for internal roles.

---

### Backend APIs Added

Admin booking APIs:

    GET /api/admin/bookings
    GET /api/admin/bookings/summary
    GET /api/admin/bookings/:bookingReference

Manager booking APIs:

    GET /api/manager/bookings/activity
    GET /api/manager/bookings/:bookingReference

These APIs are role-protected.

Admin APIs require:

    Role = Admin

Manager APIs require:

    Role = Manager

Normal Users cannot access these APIs.

---

### Dedicated Test Employee Seed Data

Iteration 10 added a repeatable SQL migration for dedicated booking visibility test employees:

    backend/sql/iteration-10-booking-visibility-test-employees.sql

Seeded employees:

    visibility.admin@wonderland.local
    visibility.manager@wonderland.local

These are separate from the workflow approval test employees:

    workflow.admin@wonderland.local
    workflow.manager@wonderland.local

This prevents Playwright tests from colliding when running in parallel.

---

### Playwright Test Reliability Improvement

The normal User access-denied test was updated to use:

    page.addInitScript()

instead of setting localStorage after the app had already loaded.

Improved pattern:

    Register user through API
    Add token with page.addInitScript()
    Navigate to dashboard
    Confirm logged-in User precondition
    Visit restricted Admin/Manager pages
    Confirm Access denied

This is more stable because the token exists before React/AuthContext starts reading localStorage.

---

### Playwright Tests Added / Updated

The Playwright suite now covers:

- Admin can view customer bookings
- Admin can search by customer email
- Admin can filter by booking status
- Admin can open customer booking details
- Admin booking detail view shows customer details
- Manager can view booking activity summary
- Manager can view recent booking activity
- Manager can open booking details
- Manager booking detail view shows customer details
- Normal User cannot access Admin booking visibility page
- Normal User cannot access Manager booking activity page
- Dedicated Admin/Manager visibility employees are used to avoid test collisions
- Stable token setup is used for role access testing

---

### Manual Testing Completed

Manual testing confirmed:

- Admin Bookings link appears for Admin users
- Admin can open `/admin/bookings`
- Admin can search customer bookings
- Admin can filter bookings by status
- Admin can open booking details
- Manager Booking Activity link appears for Manager users
- Manager can open `/manager/bookings`
- Manager can view booking summary cards
- Manager can open booking details
- Normal Users cannot access `/admin/bookings`
- Normal Users cannot access `/manager/bookings`

---

### Test Status

Current test status:

    Manual testing: Passed
    Local Playwright tests: Passed
    Full Playwright suite: 44 passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket
- Iteration 6 — Checkout and booking confirmation
- Iteration 7 — Booking history and dashboard/profile integration
- Iteration 8 — Booking management enhancements
- Iteration 9 — Booking cancellation workflow
- Iteration 10 — Admin and Manager booking visibility

---

### Next Iteration

Iteration 11 — Admin/Manager Reporting and Audit Preparation

Expected outcomes:

- Booking reporting dashboard preparation
- Admin booking metrics by status
- Admin booking metrics by revenue
- Manager operational booking summary
- Cancelled booking reporting visibility
- Basic audit trail preparation
- Export/reporting preparation
- Playwright tests for reporting widgets and role access


---

## Iteration 11 Completed: Admin/Manager Reporting, CDC Booking Audit and Trigger Learning Example

Wonderland now includes Admin and Manager reporting dashboards, CDC-based booking change visibility, and a separate trigger-based content audit example.

This iteration improves the enterprise learning value of the app by showing two different SQL Server data-change patterns:

    CDC for booking change capture
    Triggers for content approval audit events

---

### Completed

- Admin reporting dashboard added
- Manager reporting dashboard added
- Booking metrics by status added
- Booking metrics by revenue/value added
- Booking item type breakdown added
- Recent daily booking activity added
- CDC enabled for `dbo.Bookings`
- CDC status displayed in Admin and Manager reports
- CDC booking change events displayed in reporting pages
- Booking audit triggers removed from `dbo.Bookings`
- Trigger-based content audit example added for rides and accommodation approval changes
- Content audit table added
- Admin/Manager reporting routes added
- Admin Reports link added to Admin navbar
- Manager Reports link added to Manager navbar
- Normal Users blocked from Admin/Manager reporting pages
- Playwright tests added for reporting access and widgets
- Playwright config updated to reduce parallel test flakiness with shared SQL Server state
- SQL trigger + `OUTPUT` issue fixed in booking and manager approval routes

---

### New Database Objects

Iteration 11 introduced:

    dbo.BookingAuditEvents
    dbo.ContentAuditEvents

Iteration 11.1 changed the booking audit approach.

Booking audit now uses:

    SQL Server CDC on dbo.Bookings

Content approval audit uses:

    dbo.ContentAuditEvents
    TR_Rides_ContentAudit_ApprovalStatusUpdate
    TR_Accommodations_ContentAudit_ApprovalStatusUpdate

---

### CDC for Booking Audit

CDC is now enabled for:

    dbo.Bookings

The CDC capture table is:

    cdc.dbo_Bookings_CT

This captures changes such as:

- Booking created
- Booking status changed
- Booking cancelled
- CancelledAt populated
- CancellationReason populated

CDC operation meanings:

    1 = Delete
    2 = Insert
    3 = Update Before
    4 = Update After

Useful SQL check:

    USE WonderlandDB;
    GO

    SELECT TOP 20
      CASE [__$operation]
        WHEN 1 THEN 'Delete'
        WHEN 2 THEN 'Insert'
        WHEN 3 THEN 'Update Before'
        WHEN 4 THEN 'Update After'
        ELSE 'Unknown'
      END AS OperationName,
      sys.fn_cdc_map_lsn_to_time([__$start_lsn]) AS ChangeTime,
      BookingReference,
      Status,
      CancelledAt,
      CancellationReason
    FROM cdc.dbo_Bookings_CT
    ORDER BY [__$start_lsn] DESC, [__$seqval] DESC;

---

### Why CDC Is Used for Bookings

Booking changes are enterprise-style data events.

CDC is a better fit for this because it captures database changes from the transaction log without adding extra business logic inside the booking transaction.

Examples:

    Booking inserted
    Booking cancelled
    Status changed from Confirmed to Cancelled

This makes CDC useful for:

- Audit reporting
- Data warehouse feeds
- Analytics
- Change tracking
- Operational reporting

---

### Trigger Learning Example

Triggers are still used in Wonderland, but now on a separate learning use case.

Trigger audit is used for content approval changes on:

    dbo.Rides
    dbo.Accommodations

The trigger audit table is:

    dbo.ContentAuditEvents

This records events such as:

- Ride approval status changed
- Ride approved
- Ride rejected
- Accommodation approved
- Accommodation rejected

This gives the project examples of both approaches:

    CDC = change capture / audit / reporting pattern
    Trigger = database-side reaction to a specific business event

---

### SQL Server OUTPUT Fix

After adding triggers to `dbo.Rides` and `dbo.Accommodations`, SQL Server no longer allows direct:

    OUTPUT INSERTED...

against those tables unless the output goes into a table variable.

The app was updated to use:

    OUTPUT INSERTED...
    INTO @UpdatedContent

This was fixed in:

    backend/routes/bookingRoutes.js
    backend/routes/managerApprovalRoutes.js

This protects checkout, cancellation, ride approval and accommodation approval workflows.

---

### New Admin Reporting Route

New frontend route:

    /admin/reports

Visible only to Admin users.

The Admin Reports page displays:

- Total bookings
- Confirmed booking value
- Cancelled booking value
- Average booking value
- CDC status for `dbo.Bookings`
- Booking status breakdown
- Booking item type breakdown
- Recent daily activity
- CDC booking change events
- Trigger-based content audit events
- Export preparation section

---

### New Manager Reporting Route

New frontend route:

    /manager/reports

Visible only to Manager users.

The Manager Reports page displays:

- Total bookings
- Confirmed bookings
- Cancelled bookings
- Confirmed booking value
- Total points issued
- CDC status for `dbo.Bookings`
- Booking status breakdown
- CDC booking change events

---

### Backend APIs Added

Admin reporting API:

    GET /api/admin/reports/bookings

Manager reporting API:

    GET /api/manager/reports/bookings

These APIs are role-protected.

Admin reporting requires:

    Role = Admin

Manager reporting requires:

    Role = Manager

Normal Users cannot access these APIs.

---

### Playwright Stability Update

The Playwright config was updated to reduce flakiness from shared SQL Server state.

Current config approach:

    fullyParallel: false
    workers: 2

This is more stable for Wonderland because tests now share:

- SQL Server database
- Seed employees
- Role registration state
- Booking data
- Cancellation data
- CDC capture data
- Content approval data

---

### Playwright Tests Added / Updated

The Playwright suite now covers:

- Admin can view booking reporting dashboard
- Admin report summary cards appear
- Admin report status breakdown appears
- Admin report item type breakdown appears
- Admin report CDC status appears
- Admin report CDC booking change event panel appears
- Admin export preparation section appears
- Manager can view operational booking report
- Manager report summary cards appear
- Manager report status breakdown appears
- Manager report CDC status appears
- Manager report CDC booking change event panel appears
- Normal User cannot access Admin reporting page
- Normal User cannot access Manager reporting page
- Approval workflow still works with content audit triggers enabled
- Reporting numeric assertion updated to check non-zero values correctly

---

### Manual Testing Completed

Manual testing confirmed:

- Normal user can create bookings
- Normal user can cancel bookings
- CDC captures booking inserts and updates
- CDC records show Insert and Update After events
- Admin Reports page loads
- Admin Reports page shows CDC status
- Admin Reports page shows CDC booking change events
- Admin Reports page shows reporting metrics
- Manager Reports page loads
- Manager Reports page shows operational reporting summary
- Content approval workflow still works after adding content audit triggers

---

### Test Status

Current test status:

    Manual testing: Passed
    Local Playwright tests: Passed
    Full Playwright suite: Passed

GitHub Actions should be checked after pushing this iteration.

---

### Latest Project Status

Completed:

- Foundation
- Iteration 1 — Frontend app shell and routing
- Iteration 1.5 — Playwright smoke test safety net
- Iteration 2 — Frontend authentication flow
- Iteration 3 — Clean rides and accommodation pages
- Iteration 3.5 — Role-based registration, DOB and age eligibility
- Iteration 3.5.1 — Employee registration status tracking
- Iteration 3.6 — Profile page
- Iteration 3.7 — Admin content submission and Manager approval workflow
- Iteration 4 — Ride and accommodation details pages
- Iteration 5 — Booking basket
- Iteration 6 — Checkout and booking confirmation
- Iteration 7 — Booking history and dashboard/profile integration
- Iteration 8 — Booking management enhancements
- Iteration 9 — Booking cancellation workflow
- Iteration 10 — Admin and Manager booking visibility
- Iteration 11 — Admin/Manager reporting and audit preparation
- Iteration 11.1 — CDC booking audit and trigger learning example

---

### Next Iteration

Iteration 12 — Export and Reporting Enhancements

Expected outcomes:

- Admin report export preparation
- CSV export for bookings/reporting
- Report download endpoint
- Admin report date filters
- Manager report date/status filters
- Booking report refinement
- Playwright tests for report filters and export/download flow

