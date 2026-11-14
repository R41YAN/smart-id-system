# 🪪 Smart ID Formatting System (SIFS)

> **Course:** Software Project Design and Development (CSE 416)  
> **Institution:** University of Information Technology and Sciences (UITS)  
> **Batch & Section:** CSE-54, Section: 7B1  
> **Team Members:**  
> - **Md. Raiyan** (ID: 0432320005101101) — *Backend Architecture, ID Engine, Security & Test Lead*  
> - **Md. Fizul Islam Yamin** (ID: 0432320005101114) — *Frontend, UI/UX, Component Architecture & Documentation*  
> **Course Instructor:** Dr. Mahfida Amjad Dipa

[![Tests](https://img.shields.io/badge/Automated%20Tests-89%20Passed%20(100%25)-success?style=flat-square&logo=jest)](docs/SIFS_Software_Testing_Report.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)](https://supabase.com/)

---

## 📌 Project Overview

The **Smart ID Formatting System (SIFS)** is a multi-tenant university student admission and digital credential management platform. It automates and standardizes the generation of deterministic, collision-free, human-readable student identification numbers across diverse academic structures.

SIFS solves the critical challenges of manual entry errors, race conditions during peak admission rushes, inconsistencies across different academic credit systems, and lack of unified digital ID card generation with physical scanning capabilities.

---

## 🎯 Key Highlights & Architecture Features

1. **Dual Academic Model ID Generation**:
   - **Open-Credit Model (Semester-Driven):** `[Dept][YY][SemCode][Serial]` (e.g., `CSE26FL012` for Fall 2026 intake).
   - **Close-Credit Model (Batch-Driven):** `[Dept][Batch][YY][Serial]` (e.g., `CSE5426012` for 54th Batch, 2026).
2. **ACID Transaction & Concurrency Locking**:
   - Uses PostgreSQL transactional row-level locks (`SELECT ... FOR UPDATE`) on the batch record to guarantee strictly sequential, gapless serial numbers (`001`, `002`, `003`...) even during high-concurrency simultaneous admissions.
3. **Phone-Scannable Code 128 Barcodes**:
   - Dynamic, high-resolution vector SVG barcodes generated using `jsbarcode` for every student ID card (`Barcode.jsx` & `StudentIdCard.jsx`).
   - Verified optically scannable by physical 1D laser scanners and smartphone cameras.
4. **Student Photo Management & Late Upload Lifecycle**:
   - Photo upload frame with bold `"PHOTO"` in admission form and live ID preview.
   - Client-side auto-crop container (`object-fit: cover`) and Canvas auto-resizing preventing distorted aspect ratios.
   - Database storage in PostgreSQL (`students.photo TEXT`).
   - Late photo upload via `PATCH /api/students/:id/photo` directly from the student directory.
   - Default academic silhouette placeholder when no photo is provided.
5. **Option B "View / Print ID Card" Modal**:
   - In Student Directory (`StudentList.jsx`), click "ID Card" button on any student row to open an interactive modal with full digital ID card, Code 128 barcode, student photo, late photo upload, and instant print stylesheet.
6. **Dual Department Fields & Active Directory**:
   - Full Department Name (`full_name`) + Normalized Short Code (`code`).
   - Active code grid in department management and formatted dropdowns `Full Name (CODE)` in Batches and Admission form.
7. **Multi-Tenant Institutional University Logos & Custom Branding**:
   - Institutional branding integrated directly into both **Uncollapsed (Wide — 256px)** and **Collapsed (Mini Rail — 80px)** navigation sidebars (`Sidebar.jsx`).
   - Dedicated university logo card on the right side of the Client Admin identity block in wide mode, and centered in the lower header rail in mini mode.
   - Prominent enlarged university logo (`w-12 h-12` / 48px) and institutional title situated at top right of Admission Dashboard (`ClientAdminDashboard.jsx`), with instant clickable upload modal (`📷`).
   - Super Admin university tenant tables & admin access tables display institutional logos (`SuperAdminDashboard.jsx`, `ManageUniversities.jsx`, `ManageAdmins.jsx`).
   - Photo-style upload frame with client-side canvas auto-resizing.
   - Strict fallback to clean university icon when no custom logo is uploaded.
   - Express body-parser configured for a 3 MB payload (`backend/index.js`); images are validated and limited to ~1 MB each.
8. **Option 3 Hybrid Modern UI/UX Architecture, 3D Smart Card Tilt & Collapsible Navigation**:
   - **Cinematic Dark Login Screen**: Deep-space slate (`#070C18`), ambient radial glow orbs, and frosted glassmorphic card (`backdrop-blur-2xl bg-slate-900/80`).
   - **Collapsible Dual-Mode Executive Sidebar**: One-click smooth transition between Wide (256px) and Mini Rail (80px) with `localStorage` state persistence (`sifs_sidebar_collapsed`).
   - **Pixel-Synchronized Vertical Alignment**: Header container (`h-[178px]`), role badge, active portal indicator, 5 navigation icons (`Dashboard`, `Departments`, `Batches`, `Admit Student`, `Student List`), and Sign Out footer maintain identical Y-coordinates with zero vertical shifting during collapse/expand.
   - **Zero Word Truncation Guarantee**: Admin names and institutional titles wrap naturally without clipping or premature ellipses.
   - **High-Density Executive Dashboard**: Crisp `#F8FAFC` canvas across Super Admin and Client Admin portals with live format rule breakdown pills.
   - **3D PVC Card Perspective Hover**: Interactive physical smart card physics (`.card-3d`, `.card-3d-wrap`, `perspective: 1200px`) with real-time keystroke rendering.
   - **Stacked Batch & Academic Year Display**: Renders batch name on Line 1 (`1st Batch`, `54th Batch`) and admission year on Line 2 (`(2026)`) directly underneath for close-credit institutions, preventing card truncation while preserving cohort years in dropdowns.
   - **Instant Directory Search**: Real-time client-side search filtering across Student IDs, student names, emails, and departments.
9. **Permanent, Never-Reused Serials**:
   - Serial counters only increase. A student moved to the Recycle Bin keeps their ID, so restoring them can never collide with a newer student, and no ID is ever given to two different people.
10. **Concurrency-Safe Bulk Student Admission via CSV/Excel (`/admin/admit`)**:
    - Dual admission mode: single enrollment or bulk CSV ingestion.
    - Dynamic CSV template generator (`Full Name, Department Code, Batch/Intake, Email, Phone, Photo URL (Optional)`).
    - Pre-import validation table checking department codes and batch numbers before committing.
    - Handles photograph imports: automated URL ingestion or default silhouette with `[📷 Photo Pending]` badge (updatable with 1 click).
    - ACID transaction with batch-row locking (`SELECT ... FOR UPDATE`) in `POST /api/students/bulk`.
11. **Institutional Recycle Bin & Data Recovery (`/admin/trash` & `/super-admin/trash`)**:
    - Non-destructive `deleted_at` soft delete across students, batches, and departments.
    - Multi-tab recovery interface with 1-click **Restore**, **Delete Permanently**, and **Empty Recycle Bin** bulk-purge actions.
    - Integrated Recycle Bin navigation link with live badge counts on both Client Admin and Super Admin sidebars.
12. **Batch ID Card Sheet Print (PDF) — Exclusively on Student List (`/admin/students`)**:
    - Dedicated `[ 🪪 Print ID Cards (${count}) ]` action button in the top-right header action cluster.
    - Standard A4 sheet grid ($2 \times 4 = 8$ CR-80 cards per page) with cut guidelines and Code 128 barcodes.
    - Color preservation (`-webkit-print-color-adjust: exact`) guaranteeing rich dark navy headers in physical prints and saved PDFs.
13. **Dynamic Institutional File Naming & Static Avatars**:
    - Standardized naming: `SIFS - [UniShort]_[Dept]_[Batch/Intake]_[Action]` (e.g., `SIFS - UIU_CSE_54(2026)_ID_Cards.pdf` or `SP'26`).
    - Static read-only student photo avatars across Recent Admissions and Recycle Bin.
14. **Automated Master Test Suite (89 Tests, 100% Pass Rate)**:
    - Backend: 61 tests (Jest + Supertest), including 19 security regression tests. Frontend: 28 tests (Vitest + React Testing Library).

---

## 📐 ID Formatting Specifications

### 1. Open-Credit Universities (e.g., NSU, BRAC)
*Structure:* `[Department Name][YY][Semester Code][3-Digit Serial]`  
*Semester Codes:* `SP` = Spring, `SM` = Summer, `FL` = Fall

| Department | Year | Semester | Serial | Generated ID |
|---|---|---|---|---|
| CSE | 2026 | Fall (`FL`) | 12 | **`CSE26FL012`** |
| BBA | 2026 | Spring (`SP`) | 1 | **`BBA26SP001`** |
| EEE | 2025 | Summer (`SM`) | 45 | **`EEE25SM045`** |

### 2. Close-Credit Universities (e.g., Metropolitan University, Public Unis)
*Structure:* `[Department Name][Batch Number][YY][3-Digit Serial]`

| Department | Batch | Year | Serial | Generated ID |
|---|---|---|---|---|
| CSE | 54 | 2026 | 12 | **`CSE5426012`** |
| EEE | 40 | 2026 | 5 | **`EEE4026005`** |
| BBA | 1 | 2026 | 1 | **`BBA0126001`** |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router 7, Axios, JsBarcode |
| **Backend** | Node.js 24, Express.js 5, JSON Web Token (JWT), Bcrypt.js, pg (node-postgres) |
| **Database** | PostgreSQL 15 (Supabase AWS Cloud Pooler / Local PostgreSQL) |
| **Testing** | Jest 30, Supertest 7, Vitest 5, React Testing Library 16, @vitest/coverage-v8, Qodo AI |
| **Architecture** | RESTful API, Stateless JWT RBAC, ACID Row Locking (`FOR UPDATE`) |

---

## 📂 Project Structure

```text
smart-id-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Login, user registration, profile & tenant join
│   │   ├── batchController.js       # Batch & semester intake CRUD
│   │   ├── departmentController.js  # Dual department fields (code & full_name)
│   │   ├── studentController.js     # Concurrency-safe admission & PATCH photo
│   │   └── universityController.js  # Multi-university tenant & logo management
│   ├── db/
│   │   ├── connection.js            # PostgreSQL pool configuration
│   │   ├── schema.sql               # Relational database schema with logo_url
│   │   └── seed.js                  # Database initialization & sample data
│   ├── middleware/
│   │   └── auth.js                  # JWT token verification & RBAC guards
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── batchRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── studentRoutes.js
│   │   └── universityRoutes.js
│   ├── utils/
│   │   └── idGenerator.js           # Core ID generation engine (100% test coverage)
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── idGenerator.test.js  # EP & BVA unit test cases (16 tests)
│   │   │   └── edgeCases.test.js    # Qodo AI edge-cases & constants (7 tests)
│   │   └── integration/
│   │       ├── auth.test.js         # Authentication & SQL injection tests (6 tests)
│   │       ├── studentAdmission.test.js # Admission, photo & scoping (7 tests)
│   │       └── departmentsAndBranding.test.js # Dual dept & branding (4 tests)
│   ├── scripts/
│   │   └── generate_test_report_docx.js # ISO/IEC/IEEE 29119-3 DOCX report generator
│   ├── index.js                     # Express app entrypoint (3 MB body limit, security headers)
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logos/                   # Vector SVGs for UITS, DU, BRAC, MU, NSU
│   ├── src/
│   │   ├── api/axios.js             # Axios client with auth token interceptor
│   │   ├── components/
│   │   │   ├── Barcode.jsx          # Phone-scannable Code 128 SVG barcode component
│   │   │   ├── Icons.jsx            # University bank icon, photo icon & UI badges
│   │   │   ├── Layout.jsx           # App shell layout
│   │   │   ├── ProtectedRoute.jsx   # Role-guarded route wrapper
│   │   │   ├── Sidebar.jsx          # Permanent institutional badge & navigation
│   │   │   ├── StudentIdCard.jsx    # Digital ID card with barcode, photo & logo
│   │   │   └── __tests__/
│   │   │       ├── Barcode.test.jsx # Code 128 barcode unit tests (2 tests)
│   │   │       └── StudentIdCard.test.jsx # ID card logo & photo tests (3 tests)
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state & user session
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Sign in page
│   │   │   ├── SuperAdminDashboard.jsx # Console with university tenant logos
│   │   │   ├── ManageUniversities.jsx  # Photo-style LOGO frame & auto-resize
│   │   │   ├── ManageAdmins.jsx     # Institutional access & SIFS super admin badge
│   │   │   ├── ClientAdminDashboard.jsx # Banner with clickable institutional logo
│   │   │   ├── ManageDepartments.jsx # Dual department fields & code roster
│   │   │   ├── ManageBatches.jsx    # Intake batches with credit model indicator
│   │   │   ├── AdmitStudent.jsx     # Admission form with live interactive ID card
│   │   │   ├── StudentList.jsx      # Student roster & Option B ID card modal
│   │   │   └── __tests__/
│   │   │       ├── Login.test.jsx   # Login UI tests (4 tests)
│   │   │       ├── AdmitStudent.test.jsx # Admission & live sync tests (4 tests)
│   │   │       └── StudentList.test.jsx  # Directory & modal tests (5 tests)
│   │   ├── utils/
│   │   │   └── universityLogos.js   # Institutional logo helper with strict bank fallback
│   │   ├── App.jsx                  # Main application routes
│   │   └── main.jsx
│   ├── vite.config.js               # Vite configuration with proxy
│   └── package.json
│
├── docs/
│   ├── SIFS_Software_Testing_Report.md   # Full ISO/IEC/IEEE 29119-3 Testing Report (58 Tests)
│   ├── SIFS_Software_Testing_Report.docx # Formatted Word testing report document
│   └── SIFS_Friend_PC_Setup_Guide.pdf    # Complete lab setup & presentation guide
│
├── package.json                         # Root project scripts (install:all, test, dev)
├── run.bat                              # One-click Windows full-stack launcher
└── README.md
```

---

## 🚀 Quick Setup & Execution Guide

### 1. Configure the backend (`backend/.env`)
Secrets are **never** stored in the code. Create your own config file once:
```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
```
Then edit `backend/.env`:
- `DATABASE_URL` — your Supabase connection string (Project Settings → Database), or local PostgreSQL settings
- `JWT_SECRET` — a long random value, generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `SEED_ADMIN_PASSWORD` — (optional) password for the demo admin accounts

The server refuses to start if `JWT_SECRET` or the database settings are missing.

### 2. Prepare the database
```bash
cd backend
npm run migrate              # existing database: adds missing columns, repairs serial counters (no data loss)
npm run seed -- --reset      # NEW/demo database only: ⚠️ deletes everything and creates demo data
```

### 3. Run
**Option A — Windows:** double-click **`run.bat`** (checks Node.js and `backend/.env`, installs packages, starts both servers, opens the browser).

**Option B — Terminal:**
```bash
npm run install:all
cd backend && npm run dev     # API → http://localhost:5000
cd frontend && npm run dev    # UI  → http://localhost:5173 (new terminal)
```

---

## 🧪 Automated Testing Instructions (89 Tests)

### 1. Backend Tests (61 Tests — Jest + Supertest)
Integration tests **delete and re-create all data** in the database they use, so they run only against a
separate throw-away database set in `TEST_DATABASE_URL` (never the real/demo one):
```bash
cd backend
# in backend/.env:  TEST_DATABASE_URL=postgresql://postgres:<password>@localhost:5432/sifs_test
npm test                # all 61 unit + integration tests (includes 19 security regression tests)
npm run test:unit       # only the 23 ID-engine unit tests (no database needed)
npm run test:coverage
```

### 2. Frontend Tests (28 Tests — Vitest + React Testing Library)
```bash
cd frontend
npm test -- --run
npm run test:coverage
```

### 3. Build Production Bundle
```bash
cd frontend
npm run build
```

---

## 🔑 Login Accounts

`npm run seed -- --reset` creates the demo accounts below and prints their password
(`SEED_ADMIN_PASSWORD` from `.env`, or a random one):

| Role | University / Scope | Email |
|---|---|---|
| **Super Admin** | System-Wide Platform | `superadmin@smartid.com` |
| **Client Admin** | North South University (NSU) | `nsu_admin@smartid.com` |
| **Client Admin** | Metropolitan University (MU) | `mu_admin@smartid.com` |

To change the password of any existing account: `cd backend && node scripts/set_password.js <email>`

---

## 🔐 Security Model

- **Secrets in `.env` only** — no database password or JWT secret in the source code; the server validates them at start-up.
- **Strict tenant isolation** — every endpoint that takes an id (students, batches, departments, universities, Recycle Bin) checks that the record belongs to the logged-in admin's university (`backend/utils/tenant.js`). Records of other universities answer *404 Not Found*.
- **IDs are never reused** — serial counters only go up; a deleted student keeps its ID and can always be restored. A `UNIQUE (batch_id, serial_number)` constraint guards this in the database.
- **Login protection** — 5 failed attempts per account/IP lock login for 15 minutes; tokens expire after 8 hours (configurable).
- **Input validation** — department codes (2–6 letters), batch numbers (1–99), semester code/index pairs, emails, phones and image uploads (PNG/JPEG/WEBP/GIF/SVG data or http(s) URL, max ~1 MB).
- **No internal error details** are sent to the browser; CSV exports are protected against spreadsheet formula injection.

---

## 📄 Academic Testing Reports

Comprehensive testing documentation following **ISO/IEC/IEEE 29119-3** standards is available in the `docs/` directory:
- [SIFS Software Testing Report (Markdown)](docs/SIFS_Software_Testing_Report.md)
- [SIFS Software Testing Report (Word DOCX)](docs/SIFS_Software_Testing_Report.docx)

---

## 📜 License

This project was developed for academic evaluation under **CSE 416 (Software Project Design and Development)** at the **University of Information Technology and Sciences (UITS)**. Distributed under the MIT License.
