# HIMS – Housing Information Management System

**Kenya Prisons Service – Nairobi Region**
Digital platform for application, tracking, and allocation of rental housing units for prison staff.

---

## Table of Contents

1. [Getting Started (from Zip File)](#getting-started-from-zip-file)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [Default Login Credentials](#default-login-credentials)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started (from Zip File)

### Step 1: Extract the zip file

1. Locate the downloaded `PROJECT housing.zip` file (e.g. in your **Downloads** folder)
2. **Right-click** the zip file → select **Extract All…**
3. Choose a destination folder (e.g. `C:\Users\YourName\Desktop\`) and click **Extract**
4. This creates a folder called `PROJECT housing` containing the full project

> **Tip:** You can also use tools like **7-Zip** or **WinRAR** to extract.

### Step 2: Open the project folder

Navigate into the extracted folder. You should see:

```
PROJECT housing/
├── backend/       ← Node.js API server
├── frontend/      ← Static HTML/CSS/JS frontend
├── LICENSE
└── README.md      ← This file
```

### Step 3: Follow setup instructions

1. Complete the [Prerequisites](#prerequisites) below
2. Follow [Backend Setup](#backend-setup) to install dependencies and set up the database
3. Start the backend server
4. Open [Frontend Setup](#frontend-setup) — just open the HTML file in your browser

---

## Prerequisites

Before starting, ensure the following are installed on your machine:

| Software       | Version    | Download Link                                      |
| -------------- | ---------- | -------------------------------------------------- |
| **Node.js**    | v18 or v20 | https://nodejs.org/                                |
| **MySQL**      | 5.7+ / 8+  | Included with WampServer                           |

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
├── frontend/                 # Static HTML/CSS/JS (no build tools needed)
│   ├── index.html            # Main HTML page — open directly in browser
│   ├── style.css             # All CSS styles
│   └── app.js                # All application logic (SPA router, pages, API)
│
├── LICENSE
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

The frontend is **plain HTML, CSS, and JavaScript** — no build tools or npm required.

### Step 1: Open the frontend

Simply open the file in your browser:

- **Windows:** Double-click `frontend/index.html`, or right-click → **Open with** → your browser
That's it — no installation, no build step needed.

> **Important:** The backend server must be running at `http://localhost:5000` for the app to work. The frontend makes API calls directly to that address.

---

## Running the Application

### Terminal 1 – Start the Backend

```bash
cd backend
npm run dev
```

### Open the Frontend

Open `frontend/index.html` directly in your web browser (double-click the file).

Then you should see the HIMS landing page with **Login** and **Register** buttons.

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

Then also update the `API_BASE` variable at the top of `frontend/app.js` to match:

```js
var API_BASE = "http://localhost:5001/api";
```

### Prisma Studio (visual database browser)

To inspect your database visually:

```bash
cd backend
npx prisma studio
```

Opens a browser at `http://localhost:5555` with a GUI for all tables.

### Frontend not connecting to backend

- Make sure the backend is running on port 5000 before opening `frontend/index.html`
- The frontend calls `http://localhost:5000/api` directly — no proxy is used
- If you changed the backend port, update `API_BASE` in `frontend/app.js` accordingly
- Check the browser console (F12 → Console) for CORS or network errors

---

## Technology Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | HTML + CSS + Vanilla JavaScript     |
| Backend        | Node.js + Express                   |
| Database       | MySQL (WampServer)                  |
| ORM            | Prisma 5                            |
| Authentication | JWT (jsonwebtoken)                  |
| Password Hash  | bcrypt                              |
