# 🏢 The Tenant — Smart PG Accommodation & Property Management Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

> **A full-stack, enterprise-grade web application** for modern Paying Guest (PG) accommodation discovery, room booking, stay management, digital rent logging, maintenance ticketing, and multi-tenant administrative governance.

---

## 📌 Table of Contents

- [Overview & Objectives](#-overview--objectives)
- [Key Features](#-key-features)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Technical Architecture](#-technical-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Setup Instructions](#-quick-start--setup-instructions)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Demo Login Credentials](#-demo-login-credentials)
- [REST API Reference](#-rest-api-reference)
- [Database Schema](#-database-schema)
- [Project Artifacts & Reports](#-project-artifacts--reports)
- [License](#-license)

---

## 🎯 Overview & Objectives

In the modern urban housing market, students and working professionals frequently struggle with fragmented PG listings, unverified room availability, lack of formal rent receipts, and non-transparent complaint handling. PG owners face challenges managing multiple properties, tracking join inquiries, assigning rooms, and tracking monthly dues.

**The Tenant** solves these problems with a unified, role-based platform that offers:
1. **Seamless Discovery**: Instant PG search with live city filtering, pricing, amenities, and high-resolution photo galleries.
2. **Transparent Onboarding**: Digital join request lifecycle from inquiry submission to owner approval and room assignment.
3. **In-Stay Management**: Active stay overview, issue/complaint escalation, and rent payment history.
4. **Owner Management**: Property listings management, multi-image file uploads, tenant rosters, and complaint resolution.
5. **Super Admin Governance**: Platform-wide KPI dashboards, user moderation, property auditing, and financial reporting.

---

## ✨ Key Features

| Category | Feature Description |
|:---|:---|
| **Authentication** | Secure JWT-based authentication with bcrypt-hashed passwords and stateless token verification. |
| **Search & Discovery** | Instant multi-city search (Pune, Bangalore, etc.), real-time filtering, detailed PG cards with pricing, deposit, and amenities. |
| **PG Photo Upload** | Dedicated file upload pipeline (`/owner/properties/{id}/upload-image`) accepting JPG, PNG, WebP with static file serving. |
| **Join Request System** | Tenant sends join request $\rightarrow$ Owner reviews in dashboard $\rightarrow$ Status changes to `Approved` or `Rejected`. |
| **Active Stay Dashboard** | Approved tenants view room assignment, monthly rent, deposit records, and direct owner contact information. |
| **Complaint Ticketing** | Two-way maintenance tracking system: Tenants log complaints (`Open`) and Owners/Admins update status (`In Progress`, `Resolved`). |
| **Digital Rent & Payments** | Transaction logging (UPI, Net Banking, Cash) with status verification (`Paid`, `Pending`) and instant receipt generation. |
| **Super Admin Panel** | Dedicated portal at `/admin` featuring 9 live platform metrics, user management, property audit, complaint resolution, and payment logs. |
| **Reviews & Ratings** | Transparent star rating and feedback system displayed on PG detail pages. |
| **Wishlist / Saved PGs** | Save preferred properties for quick side-by-side comparison. |
| **Notification Feed** | System notifications alerting tenants and owners upon request approvals, status updates, or new tickets. |

---

## 👥 Role-Based Access Control (RBAC)

The platform enforces strict role-based authorization:

### 1. 🎓 Tenant Portal
- Search and bookmark accommodations.
- Submit join requests for specific PGs.
- Track active stay details and owner contact.
- File maintenance complaints with real-time progress tracking.
- View rent payment history and download digital payment receipts.

### 2. 🏠 PG Owner Portal
- Register and manage multiple PG properties.
- Upload high-resolution room and building photos directly to server storage.
- Accept or reject tenant join requests.
- Track active tenants, room occupancy, and dues.
- Resolve maintenance complaints filed by occupants.
- Record and verify rent collections.

### 3. 🛡️ Super Admin Portal (`/admin`)
- **System KPIs Dashboard**: Real-time metrics for total users, tenants, owners, listings, rooms, open/resolved complaints, and platform revenue.
- **User Moderation**: Inspect all registered users across roles, filter records, or delete non-compliant accounts.
- **Property Governance**: Review all listed accommodations, check room availability, and remove invalid listings.
- **Dispute Resolution**: Directly resolve or dismiss unresolved maintenance complaints.
- **Financial Audit**: Centralized ledger of all payment transactions across every registered PG.

---

## 🛠️ Technical Architecture

```
[ Frontend: React 18 + Vite ]
        │  (Axios / Fetch + JWT Bearer Auth)
        ▼
[ Backend: FastAPI (ASGI Server: Uvicorn) ]
   ├── Authentication & RBAC Middleware (python-jose, bcrypt)
   ├── REST API Routers (/auth, /pgs, /tenant, /owner, /admin)
   ├── Photo Upload Pipeline (aiofiles, StaticFiles at /static/uploads)
   └── SQLAlchemy ORM Layer
        │
        ▼
[ Database Engine: MySQL / SQLite ]
   (Tables: users, pgs, join_requests, complaints, payments, reviews, saved_properties, notifications)
```

- **Frontend**: React 18, Vite 5, React Router DOM, Lucide Icons, Custom Responsive CSS Design System.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic, Python-JOSE, Passlib / Bcrypt, Aiofiles, Python-Multipart.
- **Database**: MySQL (Default production) / SQLite (Zero-config local development).
- **API Documentation**: Auto-generated interactive OpenAPI/Swagger UI.

---

## 📂 Project Directory Structure

```text
Tanent/
├── Project_Report/                     # Project submission deliverables
│   ├── The Tenant - PG Accommodation Platform.pdf   # Complete Project Report
│   ├── Demo Video.mp4                  # Full walkthrough & screen recording
│   ├── Flow 1.png                      # End-to-end user lifecycle flowchart
│   └── Flow 2.png                      # Technical architecture diagram
├── backend/                            # FastAPI REST Backend
│   ├── app/
│   │   ├── models/
│   │   │   └── domain.py               # SQLAlchemy Database Models
│   │   ├── routes/
│   │   │   ├── admin.py                # Super Admin panel endpoints
│   │   │   ├── auth.py                 # User registration & JWT login
│   │   │   ├── owner.py                # PG listings, tenant roster, photo upload
│   │   │   ├── pgs.py                  # Public PG search & detail queries
│   │   │   └── tenant.py               # Join requests, complaints, payments
│   │   ├── schemas/
│   │   │   └── dto.py                  # Pydantic input/output validation models
│   │   ├── services/
│   │   │   └── auth.py                 # Password hashing & JWT token utility
│   │   ├── static/
│   │   │   └── uploads/                # Saved uploaded property photos
│   │   ├── config.py                   # App configuration & environment loader
│   │   ├── database.py                 # SQLAlchemy engine & session factory
│   │   ├── main.py                     # FastAPI entrypoint, CORS, static routes
│   │   └── seed.py                     # Automated mock database seeder
│   ├── .env.example                    # Sample environment variables
│   ├── create_db.py                    # Standalone table initialization script
│   └── requirements.txt                # Python backend dependencies
├── frontend/                           # React 18 + Vite Frontend
│   ├── public/                         # Public assets & SVG icons
│   ├── src/
│   │   ├── assets/                     # Hero & brand imagery
│   │   ├── components/
│   │   │   └── Navbar.jsx              # Role-aware responsive navigation bar
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx          # Super Admin dashboard & moderation UI
│   │   │   ├── Dashboard.jsx           # Unified Tenant & Owner portal
│   │   │   ├── Home.jsx                # Landing page with hero & features
│   │   │   ├── Login.jsx               # JWT login page
│   │   │   ├── PGDetails.jsx           # Detailed PG page with gallery & booking
│   │   │   ├── Search.jsx              # Interactive PG search with city filters
│   │   │   └── Signup.jsx              # Role-based user registration
│   │   ├── App.jsx                     # Application routing & layouts
│   │   ├── index.css                   # Comprehensive design system styles
│   │   └── main.jsx                    # React DOM entrypoint
│   ├── package.json                    # Frontend dependencies & scripts
│   └── vite.config.js                  # Vite configuration
└── README.md                           # Master Project Documentation
```

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.x or higher & npm
- **Database**: MySQL 8.x (or use SQLite for zero-config local development)

---

### 1. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd Tanent/backend
   ```

2. **Create and activate a Python virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Database Connection**:
   - Create a `.env` file in `backend/` (or duplicate `.env.example`):
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=tanent_db
     CORS_ORIGINS=http://localhost:5173
     ```
   - Ensure the database exists in MySQL:
     ```sql
     CREATE DATABASE tanent_db;
     ```

   *(Optional: To run with **SQLite** without running MySQL, edit `backend/app/config.py` and set `DATABASE_URL` property to return `"sqlite:///./sql_app.db"`).*

5. **Initialize Database & Seed Demo Data**:
   ```bash
   python -m app.seed
   ```
   *This initializes all relational tables and seeds full demo records (owners, tenants, super admin, PGs, complaints, and payments).*

6. **Start the FastAPI Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **Backend API**: `http://localhost:8000`
   - **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`
   - **Alternative API Docs (ReDoc)**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the frontend folder**:
   ```bash
   cd Tanent/frontend
   ```

2. **Install Node modules**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   - **Frontend Application**: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

The database seeder (`python -m app.seed`) provisions the following ready-to-test accounts:

| Role | Email | Password | Access / Capabilities |
|:---|:---|:---|:---|
| **🛡️ Super Admin** | `admin@the-tenant.com` | `password123` | Access `/admin` — Full platform analytics, user & property moderation, dispute audit |
| **🏠 PG Owner 1** | `owner1@the-tenant.com` | `password123` | Access `/dashboard` — Manages *Imperial PG-2* & *Sunrise Girls Accommodation*, uploads photos, handles join requests |
| **🏠 PG Owner 2** | `owner2@the-tenant.com` | `password123` | Access `/dashboard` — Manages *Elite Co-Living*, *Green View Homes* & *Viman Nagar Nest* |
| **🎓 Tenant** | `tenant@the-tenant.com` | `password123` | Access `/dashboard` — Active stay at *Imperial PG-2*, raises complaints, views payments & notifications |

---

## 📡 REST API Reference

Interactive API testing is available at `http://localhost:8000/docs`.

### Authentication
- `POST /register` — Register a new account (`tenant` or `owner`).
- `POST /login` — Authenticate credentials and receive JWT access token.

### Public Accommodations
- `GET /pgs/` — Fetch listed properties (supports `city`, `skip`, `limit` query parameters).
- `GET /pgs/{id}` — Retrieve detailed PG profile with amenities, images, reviews, and owner contact.

### Tenant Services (`Authorization: Bearer <token>`)
- `POST /tenant/join` — Submit join request for a property.
- `GET /tenant/active-stay` — Retrieve current approved stay details.
- `POST /tenant/complaints` — Submit maintenance ticket (`title`, `description`).
- `GET /tenant/complaints` — View logged complaints and resolution status.
- `GET /tenant/payments` — View rent invoices and payment history.
- `POST /tenant/save-property/{pg_id}` — Add PG to bookmarks.
- `GET /tenant/notifications` — Retrieve tenant notification updates.

### PG Owner Services (`Authorization: Bearer <token>`)
- `GET /owner/dashboard` — Overview of owned properties, tenant rosters, and pending join requests.
- `POST /owner/properties` — Create a new PG listing.
- `POST /owner/properties/{id}/upload-image` — Upload PG photos directly to static storage.
- `PUT /owner/join-requests/{id}` — Approve or reject tenant join request.
- `GET /owner/complaints` — View complaints raised by tenants.
- `PUT /owner/complaints/{id}` — Update complaint status (`In Progress`, `Resolved`).
- `POST /owner/payments` — Log tenant rent receipt.

### Super Admin Services (`Authorization: Bearer <token>` + `role: super_admin`)
- `GET /admin/stats` — Retrieve 9 live platform KPIs.
- `GET /admin/users` — List all registered users (filter by `role`).
- `DELETE /admin/users/{id}` — Permanently delete user account.
- `GET /admin/pgs` — List all listed PGs across all owners.
- `DELETE /admin/pgs/{id}` — Remove non-compliant PG listing.
- `GET /admin/complaints` — View platform-wide maintenance complaints.
- `PUT /admin/complaints/{id}` — Force update complaint status.
- `DELETE /admin/complaints/{id}` — Delete complaint record.
- `GET /admin/payments` — Platform-wide financial ledger.

---

## 🗄️ Database Schema

The relational database comprises 8 normalized entities:

```
  ┌──────────────┐          1:N         ┌──────────────┐
  │    users     │─────────────────────▶│     pgs      │
  └──────────────┘                      └──────────────┘
    │          │                              │
    │ 1:N      │ 1:N                          │ 1:N
    ▼          ▼                              ▼
┌──────────────┐ ┌──────────────┐      ┌──────────────┐
│join_requests │ │  complaints  │      │   reviews    │
└──────────────┘ └──────────────┘      └──────────────┘
    │                   │                     │
    │ 1:N               │ 1:N                 │ 1:N
    ▼                   ▼                     ▼
┌──────────────┐ ┌──────────────┐      ┌──────────────┐
│   payments   │ │notifications │      │saved_proper. │
└──────────────┘ └──────────────┘      └──────────────┘
```

1. **`users`**: `id`, `email`, `hashed_password`, `full_name`, `phone_number`, `role` (`tenant`, `owner`, `super_admin`), `created_at`.
2. **`pgs`**: `id`, `name`, `location`, `city`, `rent`, `deposit`, `description`, `owner_id`, `image_url`, `created_at`.
3. **`join_requests`**: `id`, `tenant_id`, `pg_id`, `status` (`Pending`, `Approved`, `Rejected`), `created_at`.
4. **`complaints`**: `id`, `tenant_id`, `pg_id`, `title`, `description`, `status` (`Open`, `In Progress`, `Resolved`), `created_at`.
5. **`payments`**: `id`, `tenant_id`, `pg_id`, `amount`, `description`, `method` (`UPI`, `Net Banking`, `Cash`), `status` (`Paid`, `Pending`), `date`.
6. **`reviews`**: `id`, `tenant_id`, `pg_id`, `rating` (1–5), `comment`, `created_at`.
7. **`saved_properties`**: `id`, `tenant_id`, `pg_id`.
8. **`notifications`**: `id`, `user_id`, `message`, `is_read`, `created_at`.

---

## 📦 Project Artifacts & Reports

Full submission deliverables are located inside the [`Project_Report/`](./Project_Report/) directory:

- 📄 **[Project Report (PDF)](./Project_Report/The%20Tenant%20-%20PG%20Accommodation%20Platform.pdf)**: Comprehensive project document containing conceptual model, requirements, system design, test cases, and execution strategy.
- 🎥 **[Video Demonstration (MP4)](./Project_Report/Demo%20Video.mp4)**: Complete screen-recorded video walkthrough showcasing live features, workflows, and role interactions.
- 📊 **[Lifecycle Flowchart (PNG)](./Project_Report/Flow%201.png)**: End-to-end user navigation, approval escalation, and data flow.
- 🏛️ **[Architecture Diagram (PNG)](./Project_Report/Flow%202.png)**: Technical presentation tier, service layer, and database architecture.

---

## 📄 License

This project is licensed under the MIT License — see the repository for details.



