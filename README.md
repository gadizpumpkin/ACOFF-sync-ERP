# Business Management Information System

##  ☕Coffee Street -- Integrated Business Management Information System

[Project Description](#project-descryption) | [Objective](#objective) | [Core Features](#core-features) | [Tech Stack](#tech-stack) | [Project Structure](#project-structure) | [Installation Guide](#installation-guide) | [General Usage Guide](#general-usage-guide) | [Example API Flow](#example-api-flow) | [System Workflow Overview](#system-workflow-overview) | [Author](#author)

------------------------------------------------------------------------

## Project Description

Coffee Street is an integrated Business Management Information System
designed to support end‑to‑end operational processes in a coffee shop
environment.\
The system enables owners and managers to monitor sales, inventory,
purchasing, employee attendance, payroll, and financial performance in
real‑time.

The platform emphasizes **data consistency**, **process automation**,
and **decision support analytics** to improve operational efficiency and
profitability.

------------------------------------------------------------------------

## Objective

The primary objectives of this system are:

-   Provide real‑time operational visibility
-   Automate daily and monthly financial closing
-   Improve inventory accuracy using ledger tracking
-   Support decision making using analytics dashboards
-   Standardize business workflow using role‑based access
-   Reduce manual calculation errors
-   Enable scalable architecture for multi‑branch expansion

------------------------------------------------------------------------

## Core Features

### 1. Authentication & Authorization

-   Secure login system
-   Password hashing using bcrypt
-   Role‑based access control (Owner, Manager, Employee)

### 2. Sales Management

-   Record transactions
-   Transaction details tracking
-   Sales summary dashboard

### 3. Inventory Management

-   Raw material stock tracking
-   Inventory Ledger (stock movement history)
-   Automatic stock deduction based on recipe usage

### 4. Purchase Management

-   Supplier database
-   Purchase request workflow
-   Approval system
-   Automatic stock updates after goods received

### 5. Financial System

-   Daily Closing
-   Monthly Closing
-   Automatic Profit & Loss calculation
-   Financial report archive

### 6. Employee Management

-   Attendance tracking
-   Payroll calculation
-   Payroll configuration per role

### 7. Analytics Dashboard

-   Menu performance analytics
-   Profit trend analytics
-   Purchase analytics
-   Inventory usage analytics

### 8. Enterprise Features

-   Automated purchase suggestion
-   Forecasting raw material demand
-   Multi-branch support (future)
-   Backup & restore system

------------------------------------------------------------------------

## Tech Stack

### Backend

-   Node.js
-   Express.js
-   MySQL
-   JWT Authentication
-   Bcrypt

### Database

-   MySQL relational schema
-   Transaction-safe queries
-   Ledger-based inventory design

### Tools

-   Postman (API Testing)
-   GitHub (Version Control)
-   VS Code (Development IDE)

------------------------------------------------------------------------

## Project Structure

    project-root/
    │
    ├── backend/
    │   ├── config/
    │   │   └── db.js
    │   │
    │   ├── controllers/
    │   │   ├── analyticsController.js
    │   │   ├── authController.js
    │   │   ├── closingController.js
    │   │   ├── dashboardController.js
    │   │   ├── inventoryController.js
    │   │   ├── laporanController.js
    │   │   ├── monthlyClosingController.js
    │   │   ├── payrollController.js
    │   │   ├── pembelianController.js
    │   │   ├── reportExportController.js
    │   │   └── transaksiController.js
    │   │
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   ├── closingMiddleware.js
    │   │   └── roleMiddleware.js
    │   │
    │   ├── routes/
    │   │   ├── analyticsRoutes.js
    │   │   ├── authRoutes.js
    │   │   ├── closingRoutes.js
    │   │   ├── dashboardRoutes.js
    │   │   ├── inventoryRoutes.js
    │   │   ├── laporanRoutes.js
    │   │   ├── monthlyClosingRoutes.js
    │   │   ├── payrollRoutes.js
    │   │   ├── pembelianRoutes.js
    │   │   ├── reportRoutes.js
    │   │   └── transaksiRoutes.js
    │   │
    │   ├── utils/
    │   │   ├── auditService.js
    │   │   ├── hashPassword.js
    │   │   ├── inventoryLedgerService.js
    │   │   ├── payrollService.js
    │   │   └── stockService.js
    │   │
    │   ├── .env
    │   ├── hash.js
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── server.js
    │   └── node_modules/
    │
    ├── frontend/
    │   ├── css/
    │   │   ├── absensi.css
    │   │   ├── approval_laporan.css
    │   │   ├── approval_payroll.css
    │   │   ├── approval_pembelian.css
    │   │   ├── audit_log.css
    │   │   ├── bahanbaku.css
    │   │   ├── dashboard.css
    │   │   ├── laporan.css
    │   │   ├── laporan_view.css
    │   │   ├── menu.css
    │   │   ├── paycheck.css
    │   │   ├── payroll.css
    │   │   ├── pembelian.css
    │   │   ├── resep.css
    │   │   ├── style.css
    │   │   ├── supplier.css
    │   │   └── transaksi.css
    │   │
    │   ├── js/
    │   │   ├── absensi.js
    │   │   ├── approval_laporan.js
    │   │   ├── approval_payroll.js
    │   │   ├── approval_pembelian.js
    │   │   ├── audit_log.js
    │   │   ├── auth.js
    │   │   ├── bahanbaku.js
    │   │   ├── dashboard.js
    │   │   ├── export.js
    │   │   ├── laporan.js
    │   │   ├── laporan_view.js
    │   │   ├── login.js
    │   │   ├── menu.js
    │   │   ├── paycheck.js
    │   │   ├── payroll.js
    │   │   ├── pembelian.js
    │   │   ├── resep.js
    │   │   ├── supplier.js
    │   │   └── transaksi.js
    │   │
    │   └── pages/
    │       ├── absensi.html
    │       ├── approval_laporan.html
    │       ├── approval_payroll.html
    │       ├── approval_pembelian.html
    │       ├── audit_log.html
    │       ├── bahanbaku.html
    │       ├── dashboard.html
    │       ├── export.html
    │       ├── index.html
    │       ├── laporan.html
    │       ├── laporan_view.html
    │       ├── menu.html
    │       ├── paycheck.html
    │       ├── payroll.html
    │       ├── pembelian.html
    │       ├── resep.html
    │       ├── supplier.html
    │       └── transaksi.html
    │
    └── README.md

------------------------------------------------------------------------

## Installation Guide

### 1. Clone repository

    git clone https://github.com/yourusername/coffee-street.git
    cd coffee-street

### 2. Install dependencies

    npm install

### 3. Setup database

Create database in MySQL:

    CREATE DATABASE coffe_street;

Import schema:

    mysql -u root -p coffe_street < database/schema.sql

### 4. Configure environment variables

Create `.env` file:

    DB_HOST=localhost
    DB_USER=root
    DB_PASS=yourpassword
    DB_NAME=coffe_street
    JWT_SECRET=secretkey
    PORT=3000

### 5. Run server

    node server.js

Server will run at:

    http://localhost:3000

------------------------------------------------------------------------

## General Usage Guide

### Step 1 -- Login

Use registered user credentials.

Roles: - Owner - Manager - Employee

Password is stored using bcrypt hashing.

------------------------------------------------------------------------

### Step 2 -- Setup Master Data

Add:

-   Menu
-   Raw Materials
-   Supplier
-   Recipe (menu → bahan baku)

------------------------------------------------------------------------

### Step 3 -- Daily Operation

#### Sales

Record transactions:

    POST /transaksi

System will: - store sales - reduce inventory automatically

#### Purchase

Create purchase order:

    POST /pembelian

Workflow:

Draft → Approved → Received

When status = Received: - stock updated - ledger recorded

------------------------------------------------------------------------

### Step 4 -- Daily Closing

Execute daily closing:

    POST /closing/daily

System will: - calculate daily profit - store snapshot

------------------------------------------------------------------------

### Step 5 -- Monthly Closing

    POST /closing/monthly

System will: - aggregate daily snapshots - generate monthly P&L - lock
period

------------------------------------------------------------------------

### Step 6 -- Analytics

Owner can monitor:

-   best selling menu
-   profit trends
-   stock usage
-   purchase efficiency

------------------------------------------------------------------------

## Example API Flow

Login:

    POST /auth/login

Create Transaction:

    POST /transaksi

Update Purchase Status:

    PATCH /pembelian/:id/status

Daily Closing:

    POST /closing/daily

Monthly PNL:

    GET /laporan/pnl

------------------------------------------------------------------------

## System Workflow Overview

    Login
     → Master Data Setup
     → Sales Transaction
     → Inventory Update
     → Purchase Management
     → Daily Closing
     → Monthly Closing
     → Profit & Loss Report
     → Analytics Dashboard

------------------------------------------------------------------------

## Author
Sepi Ananda
Information Systems Student
UPN "Veteran" Yogyakarta
## Coffee Street System Developer
