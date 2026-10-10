# 🗳️ Online College Election Voting System

A full-stack web application for managing college elections — from creating elections and registering candidates to casting votes and publishing audited results.

## Features

- **Three role-based panels**: Admin, Student/Voter, Candidate
- **Election lifecycle**: Draft → Upcoming → Active → Closed → Results Published
- **Secure voting**: One vote per voter per position, enforced server-side
- **Admin dashboard** with live statistics and turnout
- **Student management**: Add, search, filter by department/semester, CSV import, eligibility toggle, password reset
- **Candidate management**: Approve/reject, assign to election & position
- **Results panel** with Chart.js visualizations (doughnut + per-position bars)
- **Audit log** of every admin action
- **JWT authentication** with bcrypt password hashing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Node.js + Express |
| Database | MySQL 8.0 (via Docker) |
| Auth | JWT + bcryptjs |

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ and npm

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

This launches MySQL 8.0 with the schema auto-created from `backend/scripts/schema.sql`.

### 2. Initialize the database (idempotent)

```bash
cd backend
npm run init-db
```

### 3. Seed demo data (optional, for a working demo)

```bash
npm run seed
```

This creates an admin, 5 students, an active election, positions, and approved candidates.

### 4. Install & start the backend

```bash
cd backend
npm install
npm start        # http://localhost:5000
```

### 5. Install & start the frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:4000
```

The Vite dev server proxies `/api` to the backend on port 5000.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@college.edu` | `Admin@123` |
| Student | any seeded student ID email | `Password123!` |

> Change credentials in `backend/scripts/seed.js` or `.env`.

## Project Structure

```
voting_college/
├── backend/
│   ├── server.js              # Express app + SPA fallback
│   ├── src/
│   │   ├── config/            # env, db pool
│   │   ├── controllers/       # auth, student, election, position, candidate, vote, audit
│   │   ├── middleware/        # auth, role authorization
│   │   ├── routes/            # API routing
│   │   └── utils/jwt.js
│   └── scripts/
│       ├── schema.sql         # full DB schema
│       ├── init-db.js         # create tables
│       └── seed.js            # demo data
├── frontend/
│   ├── src/
│   │   ├── components/ui/     # Button, Card, Badge, Input, StatCard
│   │   ├── context/           # AuthProvider
│   │   ├── pages/             # Login + all role pages
│   │   ├── utils/api.js       # typed API client
│   │   └── App.jsx            # router
│   └── ...
├── docker-compose.yml
└── README.md
```

## Security Notes

- Passwords hashed with bcrypt (10 rounds).
- JWT-signed sessions; tokens sent in `Authorization: Bearer`.
- Vote casting is validated server-side: election must be `active`, position belongs to the election, candidate is approved, and each voter can vote once per position.
- Admin routes are protected by role middleware (`authorize('admin')`).
