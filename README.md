# Wonderland Full Stack App

Wonderland is a learning-focused full-stack web application for a modern theme park experience.

The app is being built for two purposes:

1. **Theme park booking platform** — users can browse rides, browse accommodation, register, log in, book experiences, and earn reward points.
2. **Playwright JavaScript training app** — the app will include clean, testable pages as well as a dedicated Automation Lab with intentionally tricky locator scenarios.

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
| Next iteration | **Iteration 2 — Frontend Authentication Flow** |

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
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
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
└── Protocols for MSSQLSERVER
    └── TCP/IP enabled
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

## Next Task: Iteration 2 — Frontend Authentication Flow

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

Iteration 3 � Clean Rides and Accommodation Pages

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
- Iteration 1 � Frontend app shell and routing
- Iteration 1.5 � Playwright smoke test safety net
- Iteration 2 � Frontend authentication flow
- Iteration 3 � Clean rides and accommodation pages

### Next Iteration

Iteration 4 � Ride and Accommodation Details Pages

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

Iteration 3.5 � Role-Based Registration, DOB and Age Eligibility

This iteration strengthens the authentication and business rules foundation before adding ride/accommodation detail pages and booking workflows.

---

## Iteration 3.5 � Role-Based Registration, DOB and Age Eligibility

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

### Iteration 4 � Ride and Accommodation Details Pages

Planned features:

- Ride details page
- Accommodation details page
- Backend endpoints for single item lookup
- Links from listing cards to detail pages
- Clean not-found handling for invalid IDs
- Playwright tests for detail page navigation and not-found states

---

### Iteration 5 � Booking Basket

Planned features:

- Add ride to basket
- Add accommodation to basket
- Basket count in navbar
- Update guest count
- Remove basket item
- Basket page
- Local storage or frontend state basket initially

---

### Iteration 6 � Checkout, Booking Guests and Eligibility Enforcement

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

### Iteration 7 � User Dashboard Enhancements

Planned features:

- Upcoming ride bookings
- Upcoming accommodation bookings
- Recent points activity
- User profile summary
- Eligibility hints
- Quick action buttons

---

### Iteration 8 � Admin and Manager Dashboards

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

### Later Iterations � Reporting and Automation Lab

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
- Iteration 1 � Frontend app shell and routing
- Iteration 1.5 � Playwright smoke test safety net
- Iteration 2 � Frontend authentication flow
- Iteration 3 � Clean rides and accommodation pages

Current test status:

- Playwright tests passing locally
- GitHub Actions passing after latest push

Next implementation task:

- Iteration 3.5 � Role-Based Registration, DOB and Age Eligibility

Development rhythm remains:

1. Implement iteration changes
2. Add or update Playwright tests for existing and new functionality
3. Run local tests
4. Push to GitHub
5. Confirm GitHub Actions passes
6. Move to the next iteration

