# Wonderland Full Stack App

Wonderland is a learning-focused full stack web application for a modern theme park experience.

The goal is to build an app where users can:

- View a colourful Wonderland homepage
- Register and log in
- Browse rides
- Browse accommodation
- Book rides
- Book accommodation
- Earn reward points
- Use the data later for a SQL Server data warehouse and Power BI reporting

This project is being built locally on a personal Windows 11 laptop for learning purposes.

---

## Project Purpose

The main learning goals of this project are:

- Build a full stack app using React, Node.js and SQL Server
- Learn how a frontend connects to a backend API
- Learn how a backend connects to Microsoft SQL Server
- Build login and authentication functionality
- Design a database suitable for future reporting
- Create a future data warehouse for Power BI dashboards
- Build a realistic Playwright JavaScript automation training app

---

## Local Development Environment

The project is being developed locally on Windows 11.

Installed tools:

- Node.js
- npm
- Git
- VS Code
- GitHub Desktop
- SQL Server Developer Edition
- SQL Server Management Studio
- sqlcmd
- Postman
- Power BI Desktop

---

## Project Location

Local project folder:

```text
D:\Projects\Wonderland

Current project structure:

Wonderland
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── scripts
│   ├── sql
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend
├── docs
│   ├── local-db-setup.md
│   └── playwright-training-requirements.md
├── postman
│   ├── wonderland-api.postman_collection.json
│   └── wonderland-local.postman_environment.json
├── package.json
└── README.md
Technology Stack
Frontend

Planned frontend stack:

React
Vite
Tailwind CSS

Expected local frontend URL:

http://localhost:5173
Backend

Backend stack:

Node.js
Express.js
mssql
dotenv
cors
helmet
morgan
bcryptjs
jsonwebtoken
express-rate-limit
nodemon

Wonderland backend currently runs on:

http://localhost:5010

Port 5010 is used because port 5000 is already used by another local app.

Database

Database platform:

Microsoft SQL Server Developer Edition

Main operational database:

WonderlandDB

Future reporting/data warehouse database:

WonderlandDW
Database Setup Completed

A SQL Server database called WonderlandDB has been created.

The following tables have been created:

Table    Purpose
Users    Stores registered app users
Rides    Stores theme park rides
Accommodations    Stores hotels, lodges, cabins and resorts
RideBookings    Stores user ride bookings
AccommodationBookings    Stores accommodation bookings
PointsLedger    Tracks reward points earned or used
Seed Data Completed

Sample ride and accommodation data has been inserted into SQL Server.

Rides

Current sample rides:

Dragon Rush Coaster
Pirate Splash Falls
Galaxy Spinner
Enchanted Carousel
Accommodations

Current sample accommodation:

Castle View Hotel
Jungle Lodge
Pirate Cove Cabins
Galaxy Resort Suites

This seed data allows the backend API and future frontend screens to show real-looking theme park content.

SQL Server App Login

A dedicated SQL Server login was created for the backend app:

wonderland_app_user

This was created so the Node.js backend does not connect using a personal Windows admin account or the powerful sa account.

The app user has access to WonderlandDB and has been added to:

db_datareader
db_datawriter

This means the backend can read and write app data without being a full SQL Server administrator.

SQL Server TCP/IP Fix Completed

The backend initially started successfully, and /api/health worked.

However, /api/test-db failed because Node.js tried to connect to:

localhost:1433

SQL Server was not listening on TCP port 1433.

The fix was completed in SQL Server Configuration Manager:

SQL Server Network Configuration
└── Protocols for MSSQLSERVER
    └── TCP/IP enabled

Then under TCP/IP Properties:

IPAll
TCP Dynamic Ports = blank
TCP Port = 1433

SQL Server was restarted.

The fix was verified with:

netstat -ano | findstr :1433

and:

Test-NetConnection localhost -Port 1433

The result confirmed:

TcpTestSucceeded : True
Backend Setup Completed

The backend project has been initialised using npm.

Installed backend dependencies:

express
cors
dotenv
mssql
bcryptjs
jsonwebtoken
helmet
morgan
express-rate-limit

Installed development dependency:

nodemon

Current backend scripts include:

{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "postman:generate": "node scripts/generate-postman-collection.js"
}
Current Backend API Endpoints

The following backend endpoints are currently working.

Health Check
GET /api/health

Browser URL:

http://localhost:5010/api/health

Expected response:

{
  "status": "ok",
  "message": "Wonderland backend API is running"
}
Database Test
GET /api/test-db

Browser URL:

http://localhost:5010/api/test-db

Expected response:

{
  "message": "Database connection is working",
  "data": {
    "DatabaseName": "WonderlandDB",
    "RideCount": 4
  }
}
Rides
GET /api/rides

Browser URL:

http://localhost:5010/api/rides

Returns the current ride records from SQL Server.

Accommodations
GET /api/accommodations

Browser URL:

http://localhost:5010/api/accommodations

Returns the current accommodation records from SQL Server.

Postman API Collection

The project includes a helper script to generate a Postman collection from backend Express routes.

Generated files:

postman/wonderland-api.postman_collection.json
postman/wonderland-local.postman_environment.json

The collection file contains the generated API requests.

The environment file contains reusable local variables such as:

baseUrl = http://localhost:5010
token = local JWT token
productId = sample product ID
bookingId = sample booking ID
orderId = sample order ID
Playwright Training Requirement

Wonderland will also be used as a Playwright JavaScript training application.

In addition to normal theme park booking features, the app will include a dedicated Automation Lab section with intentionally tricky locator scenarios such as:

Dynamic IDs and classes
Deeply nested DOM structures
Shadow DOM components
Iframes
Elements without IDs or names
Hover-only menus
Hidden and overlapping elements
Legacy-style DOM manipulation
Slow rendering
Repeated identical buttons
XPath-required markup
Drag and drop

Detailed requirements are saved in:

docs/playwright-training-requirements.md
Current Status

Completed so far:

Local project folder created
SQL Server installed and running
SSMS installed and connected
WonderlandDB created
Database schema created
Seed data inserted
App-specific SQL login created
Backend npm project initialised
Backend dependencies installed
Backend .env configured
Backend moved from port 5000 to 5010
Backend API running successfully
SQL Server TCP/IP issue fixed
Backend can read data from SQL Server
Postman collection generator added
Playwright training requirements documented
Next Planned Steps

Next development steps:

Create proper backend route/controller structure
Build authentication APIs:
Register
Login
Password hashing
JWT token generation
Add protected routes
Create the React frontend using Vite
Build a colourful Wonderland homepage
Build login and register screens
Connect frontend to backend
Add user dashboard
Add ride and accommodation booking functionality
Add reward points logic
Add Playwright Automation Lab pages
Later create WonderlandDW for Power BI reporting
Important Security Notes

The .env file contains local secrets and should not be committed to GitHub.

The .env.example file should be committed instead because it shows required settings without exposing real passwords.

For this local learning project, the database password is simple and local-only. It should not be reused for any real system.

Useful Commands
Root Project Commands

Run these from the project root:

cd D:\Projects\Wonderland

Start frontend and backend together:

npm start

Install backend and frontend dependencies:

npm run install:all

Generate Postman collection:

npm run postman:generate
Backend Commands

Go to the backend folder:

cd D:\Projects\Wonderland\backend

Start backend only:

npm run dev

Backend API base URL:

http://localhost:5010

Backend health check:

http://localhost:5010/api/health

Backend database check:

http://localhost:5010/api/test-db

Rides API:

http://localhost:5010/api/rides

Accommodations API:

http://localhost:5010/api/accommodations

Generate Postman collection from backend:

npm run postman:generate
Frontend Commands

Go to the frontend folder:

cd D:\Projects\Wonderland\frontend

Start frontend only:

npm run dev

Frontend URL:

http://localhost:5173
SQL Server Checks

Check whether SQL Server is listening on port 1433:

netstat -ano | findstr :1433

Test SQL Server TCP connection:

Test-NetConnection localhost -Port 1433
Port Checking Commands

Check backend port:

netstat -ano | findstr :5010

Check frontend port:

netstat -ano | findstr :5173

Check old backend port:

netstat -ano | findstr :5000
Stop Running App

In the terminal where the app is running:

Ctrl + C
Recommended Daily Startup

From the root folder:

cd D:\Projects\Wonderland
npm start

Then open:

http://localhost:5173


---

## Iteration 1 Completed: Frontend App Shell and Routing

The React frontend has been converted from a single-page demo into a routed multi-page application.

### Completed frontend routes

```text
/                 Home page
/rides            Rides page
/accommodations   Accommodation page
/login            Login page
/register         Register page
/dashboard        Dashboard placeholder
*                 Custom 404 page
Completed components
Layout.jsx
Navbar.jsx
HomePage.jsx
RidesPage.jsx
AccommodationsPage.jsx
LoginPage.jsx
RegisterPage.jsx
DashboardPage.jsx
NotFoundPage.jsx
Outcome

The app now has:

A shared layout
A sticky navigation bar
Working page navigation
Browser back/forward support
A custom page-not-found screen
Stable route-level data-testid attributes for future Playwright tests

The homepage still loads ride and accommodation data from the backend API and SQL Server.

