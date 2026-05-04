# Wonderland Local Database Setup Notes

Purpose:
Use these notes to rebuild the Wonderland local SQL Server database on another Windows 11 machine.

---

## 1. Check SQL Server is installed and running

Run:

Get-Service -Name "MSSQL*" | Select-Object Name, Status, DisplayName

Expected result:

MSSQLSERVER    Running    SQL Server (MSSQLSERVER)

If there is no result, SQL Server Database Engine may not be installed.

---

## 2. Check sqlcmd is installed

Run:

sqlcmd -?

Expected result:
You should see the SQL Server command-line tool version.

---

## 3. Test connection to local SQL Server

Run:

sqlcmd -S localhost -E -C -Q "SELECT @@SERVERNAME AS ServerName, DB_NAME() AS CurrentDatabase;"

Explanation:

-S localhost = connect to SQL Server on this laptop
-E           = use Windows Authentication
-C           = trust the local SQL Server certificate
-Q           = run the query and exit

Expected result:
The CurrentDatabase will usually show master.

---

## 4. Create WonderlandDB

Run:

sqlcmd -S localhost -E -C -Q "IF DB_ID('WonderlandDB') IS NULL CREATE DATABASE WonderlandDB;"

Purpose:
Creates the WonderlandDB database only if it does not already exist.

---

## 5. Verify WonderlandDB exists

Run:

sqlcmd -S localhost -E -C -Q "SELECT name FROM sys.databases WHERE name = 'WonderlandDB';"

Expected result:

WonderlandDB

---

## 6. Run the schema script

First move to the project root:

cd D:\Projects\wonderland

Then run:

sqlcmd -S localhost -E -C -d WonderlandDB -i backend\sql\schema.sql

Purpose:
Creates the main Wonderland app tables.

Tables created:

Users
Rides
Accommodations
RideBookings
AccommodationBookings
PointsLedger

---

## 7. Verify the tables exist

Run:

sqlcmd -S localhost -E -C -d WonderlandDB -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;"

Expected result:

AccommodationBookings
Accommodations
PointsLedger
RideBookings
Rides
Users

---

## 8. Run the seed data script

Run this from the project root:

cd D:\Projects\wonderland

Then run:

sqlcmd -S localhost -E -C -d WonderlandDB -i backend\sql\seed.sql

Purpose:
Adds sample Wonderland rides and accommodation so the app has data to display.

Example seed data:

Dragon Rush Coaster
Pirate Splash Falls
Galaxy Spinner
Enchanted Carousel
Castle View Hotel
Jungle Lodge
Pirate Cove Cabins
Galaxy Resort Suites

---

## 9. Verify ride seed data

Run:

sqlcmd -S localhost -E -C -d WonderlandDB -Q "SELECT RideId, Name, Category, ThrillLevel, Price, PointsEarned FROM dbo.Rides;"

---

## 10. Verify accommodation seed data

Run:

sqlcmd -S localhost -E -C -d WonderlandDB -Q "SELECT AccommodationId, Name, Type, PricePerNight, MaxGuests FROM dbo.Accommodations;"

---

## Useful sqlcmd options

-S localhost   Connect to local SQL Server
-E             Use Windows Authentication
-C             Trust the local SQL Server certificate
-d             Choose a database
-i             Run a SQL script file
-Q             Run a SQL query and exit

---

## Current database names

WonderlandDB = operational app database
WonderlandDW = future data warehouse database for Power BI

WonderlandDW will be created later when we start the reporting and data warehouse phase.

---

# SQL Server TCP/IP Fix for Node Backend

## Issue

The backend API was running successfully on:

http://localhost:5010/api/health

But this endpoint failed:

http://localhost:5010/api/test-db

Error:

Failed to connect to localhost:1433

## Cause

SQL Server was installed and working through SSMS/sqlcmd, but it was not listening on TCP port 1433.

Node.js `mssql` connects to SQL Server over TCP, so TCP/IP needed to be enabled.

## Fix

Open:

SQL Server Configuration Manager

Go to:

SQL Server Network Configuration
? Protocols for MSSQLSERVER

Enable:

TCP/IP

Then open TCP/IP Properties.

On the IP Addresses tab, scroll to IPAll and set:

TCP Dynamic Ports = blank
TCP Port = 1433

Restart:

SQL Server (MSSQLSERVER)

## Verify

Run:

netstat -ano | findstr :1433

Expected result should include:

TCP    0.0.0.0:1433    0.0.0.0:0    LISTENING

Then run:

Test-NetConnection localhost -Port 1433

Expected result:

TcpTestSucceeded : True

## Working Wonderland backend port

Wonderland backend runs on:

http://localhost:5010

because port 5000 is used by another local app.

