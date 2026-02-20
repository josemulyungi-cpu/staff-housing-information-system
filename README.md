# HIMS – Housing Information Management System

**Kenya Prisons Service – Nairobi Region**
Digital platform for application, tracking, and allocation of rental housing units for prison staff.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Default Login Credentials](#default-login-credentials)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure the following are installed on your machine:

| Software       | Version    | Download Link                                      |
| -------------- | ---------- | -------------------------------------------------- |
| **Node.js**    | v18 or v20 | https://nodejs.org/                                |
| **npm**        | v9+        | Comes with Node.js                                 |
| **WampServer** | Latest     | https://www.wampserver.com/                        |
| **MySQL**      | 5.7+ / 8+  | Included with WampServer                           |
| **Git**        | Latest     | https://git-scm.com/ (optional)                    |

### Verify installations

Open a **Command Prompt** or **PowerShell** and run:

```bash
node -v
npm -v
```

Both should print version numbers. If not, reinstall Node.js and ensure it's added to your system PATH.

---

## Project Structure

```
PROJECT housing/
├── backend/                  # Node.js + Express API server
│   ├── prisma/
│   │   ├── schema.prisma     # Database models
│   │   └── seed.js           # Seed script (admin, house types, sample data)
│   ├── src/
│   │   ├── app.js            # Express server entry point
│   │   ├── controllers/      # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── housingController.js
│   │   │   ├── applicationController.js
│   │   │   ├── employerController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # JWT auth & role guards
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── housingRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── employerRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   └── utils/
│   │       └── prisma.js     # Prisma client instance
│   ├── .env                  # Environment variables
│   └── package.json
│
├── frontend/                 # Vite + Vanilla JS SPA
│   ├── index.html            # HTML shell
│   ├── vite.config.js        # Vite config (dev proxy to port 5000)
│   ├── src/
│   │   ├── main.js           # SPA router & route registration
│   │   ├── api.js            # Fetch wrapper with JWT
│   │   ├── router.js         # Hash-based SPA router
│   │   ├── components/
│   │   │   └── navbar.js     # Dynamic navbar
│   │   ├── pages/
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   ├── staffDashboard.js
│   │   │   ├── housingList.js
│   │   │   ├── adminDashboard.js
│   │   │   ├── adminHousing.js
│   │   │   ├── adminApplications.js
│   │   │   └── adminEmployers.js
│   │   └── styles/
│   │       └── style.css     # All CSS styles
│   └── package.json
│
├── prd                       # Product Design Report
└── README.md                 # This file
```

---

## Backend Setup

### Step 1: Navigate to the backend folder

```bash
cd backend
```

### Step 2: Install dependencies

```bash
npm install
```

This installs:

| Package          | Purpose                                |
| ---------------- | -------------------------------------- |
| express          | Web server framework                   |
| @prisma/client   | Database ORM client                    |
| prisma           | Database migration & schema tool       |
| bcrypt           | Password hashing                       |
| jsonwebtoken     | JWT token generation & verification    |
| cors             | Cross-origin resource sharing          |
| dotenv           | Environment variable loading           |
| nodemon          | Auto-restart server on file changes    |

### Step 3: Configure environment variables

Open the `.env` file in the `backend` folder and update if needed:

```dotenv
DATABASE_URL="mysql://root:password@localhost:3306/housing_db"
JWT_SECRET="hims_jwt_secret_key_2026"
PORT=5000
```

**Adjust these values to match your WampServer MySQL setup:**

| Variable       | Description                                   | Default Value                                     |
| -------------- | --------------------------------------------- | ------------------------------------------------- |
| `DATABASE_URL` | MySQL connection string                       | `mysql://root:password@localhost:3306/housing_db`  |
| `JWT_SECRET`   | Secret key for signing JWT tokens             | `hims_jwt_secret_key_2026`                         |
| `PORT`         | Port the backend API server runs on           | `5000`                                             |

**Connection string format:**
```
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

- **WampServer default user:** `root`
- **WampServer default password:** *(empty)* or whatever you set
- **Default port:** `3306`

> **Example with no password:** `mysql://root:@localhost:3306/housing_db`
> **Example with password:** `mysql://root:mypassword@localhost:3306/housing_db`

### Step 4: Create the MySQL database

1. **Start WampServer** (ensure the icon is green)
2. Open **phpMyAdmin** (click WampServer tray icon → phpMyAdmin)
3. Or open a MySQL console and run:

```sql
CREATE DATABASE housing_db;
```

### Step 5: Run Prisma migrations

This creates all the database tables from the schema:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Expected output:**

```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "housing_db" at "localhost:3306"

Applying migration `XXXXXXXX_init`

The following migration(s) have been created and applied from new schema changes:
  prisma/migrations/XXXXXXXX_init/migration.sql
```

### Step 6: Seed the database

This creates the default admin account, house types, a sample employer, and sample housing units:

```bash
npm run seed
```

**Expected output:**

```
Seeding database...
Admin seeded: username=admin, password=admin123
House types seeded: Bedsitter, 1 Bedroom, 2 Bedroom, 3 Bedroom
Employer seeded: Kenya Prisons Service (authorized)
6 sample housing units seeded
Database seeding completed successfully!
```

### Step 7: Start the backend server

**Development mode (auto-restarts on changes):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

**Expected output:**

```
HIMS Backend running on http://localhost:5000
```

### Verify the backend is running

Open a browser and navigate to:

```
http://localhost:5000/api/health
```

You should see:

```json
{ "status": "OK", "message": "HIMS API is running" }
```

---

## Frontend Setup

### Step 1: Open a NEW terminal (keep the backend running)

```bash
cd frontend
```

### Step 2: Install dependencies

```bash
npm install
```

This installs:

| Package | Purpose                               |
| ------- | ------------------------------------- |
| vite    | Fast development server & build tool  |

### Step 3: Start the frontend dev server

```bash
npm run dev
```

**Expected output:**

```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 4: Open the application

Navigate to:

```
http://localhost:3000
```

You should see the HIMS landing page with **Login** and **Register** buttons.

> **Note:** The Vite dev server automatically proxies `/api/*` requests to `http://localhost:5000`, so both servers need to be running simultaneously.

---

## Running the Application

You need **two terminals** running simultaneously:

### Terminal 1 – Backend

```bash
cd backend
npm run dev
```

### Terminal 2 – Frontend

```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Default Login Credentials

### Admin (Housing Officer)

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

### Staff (Employee)

Register a new staff account through the **Register** page. You'll need:

- Select employer: **Kenya Prisons Service** (pre-seeded)
- Employee ID (e.g., `1001`)
- Full name, gender, date of birth
- Year of employment
- Password (min 6 characters)

---

## API Endpoints Reference

### Authentication

| Method | Endpoint                       | Auth | Description                  |
| ------ | ------------------------------ | ---- | ---------------------------- |
| POST   | `/api/auth/employee/register`  | No   | Register new employee        |
| POST   | `/api/auth/employee/login`     | No   | Employee login               |
| POST   | `/api/auth/admin/login`        | No   | Admin login                  |

### Housing

| Method | Endpoint                       | Auth  | Description                  |
| ------ | ------------------------------ | ----- | ---------------------------- |
| GET    | `/api/housing`                 | JWT   | List houses (with filters)   |
| GET    | `/api/housing/:id`             | JWT   | Get single house             |
| GET    | `/api/housing/filters/options` | JWT   | Get filter dropdown values   |
| POST   | `/api/housing`                 | Admin | Create housing unit          |
| PUT    | `/api/housing/:id`             | Admin | Update housing unit          |
| DELETE | `/api/housing/:id`             | Admin | Delete housing unit (vacant) |

### Applications

| Method | Endpoint                            | Auth  | Description             |
| ------ | ----------------------------------- | ----- | ----------------------- |
| POST   | `/api/applications`                 | Staff | Apply for housing       |
| GET    | `/api/applications`                 | JWT   | List applications       |
| PUT    | `/api/applications/:id/approve`     | Admin | Approve application     |
| PUT    | `/api/applications/:id/reject`      | Admin | Reject application      |

### Employers

| Method | Endpoint                            | Auth  | Description             |
| ------ | ----------------------------------- | ----- | ----------------------- |
| GET    | `/api/employers`                    | No    | List all employers      |
| POST   | `/api/employers`                    | Admin | Add employer            |
| PUT    | `/api/employers/:id/authorize`      | Admin | Toggle authorization    |

### Dashboard

| Method | Endpoint                | Auth  | Description             |
| ------ | ----------------------- | ----- | ----------------------- |
| GET    | `/api/dashboard/stats`  | Admin | Occupancy statistics    |

---

## Troubleshooting

### "Cannot find module" errors

```bash
cd backend
npm install
npx prisma generate
```

### "Can't reach database server"

1. Ensure **WampServer is running** (green tray icon)
2. Check that MySQL service is active
3. Verify the `DATABASE_URL` in `.env` matches your MySQL credentials
4. Ensure the database `housing_db` exists

### Migration errors

If migrations fail, you can reset the database:

```bash
npx prisma migrate reset
```

> **Warning:** This drops all data and re-runs all migrations.

### "Port already in use"

If port 5000 is in use, change the `PORT` value in `.env`:

```dotenv
PORT=5001
```

If port 3000 is in use, change it in `frontend/vite.config.js`:

```js
server: { port: 3001 }
```

### Prisma Studio (visual database browser)

To inspect your database visually:

```bash
cd backend
npx prisma studio
```

Opens a browser at `http://localhost:5555` with a GUI for all tables.

### Frontend not connecting to backend

- Make sure **both** terminals are running (backend on port 5000, frontend on port 3000)
- The Vite proxy (`vite.config.js`) forwards `/api/*` to `http://localhost:5000`
- If you changed the backend port, update `vite.config.js` accordingly

---

## Technology Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Frontend       | Vite + Vanilla JavaScript + CSS |
| Backend        | Node.js + Express              |
| Database       | MySQL (WampServer)             |
| ORM            | Prisma 5                       |
| Authentication | JWT (jsonwebtoken)             |
| Password Hash  | bcrypt                         |
