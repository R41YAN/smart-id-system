# 🪪 Smart ID Formatting System (SIFS)

> **Course:** Software Project Design and Development (CSE 416)  
> **Institution:** University of Information Technology and Sciences (UITS)  
> **Batch & Section:** CSE-54, Section: 7B1  
> **Team Members:**  
> - **Md. Raiyan** (ID: 0432320005101101) — *Backend Architecture, ID Engine, Security & Test Lead*  
> - **Md. Fizul Islam Yamin** (ID: 0432320005101114) — *Frontend, UI/UX, Component Architecture & Documentation*  
> **Course Instructor:** Dr. Mahfida Amjad Dipa

[![Tests](https://img.shields.io/badge/Automated%20Tests-58%20Passed%20(100%25)-success?style=flat-square&logo=jest)](docs/SIFS_Software_Testing_Report.md)
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
   - Permanent institutional badge with logo in Client Admin sidebar (`Sidebar.jsx`).
   - Instant clickable logo update in Client Admin Dashboard banner (`ClientAdminDashboard.jsx`).
   - Super Admin university tenant tables & admin access tables display institutional logos (`SuperAdminDashboard.jsx`, `ManageUniversities.jsx`, `ManageAdmins.jsx`).
   - Photo-style `"LOGO"` upload frame with client-side canvas auto-resizing.
   - Strict fallback to clean blue bank icon (never SIFS) when no custom logo is uploaded.
   - Top-left SIFS brand header preserved on all administrative portals.
   - Express body-parser increased to 10MB (`backend/index.js`) for Base64 logo & photo uploads.
8. **Automated Master Test Suite (58 Tests, 100% Pass Rate)**:
   - Full automated test suite across backend (40 tests, Jest + Supertest) and frontend (18 tests, Vitest + React Testing Library).

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
│   ├── index.js                     # Express app entrypoint (10MB body parser limit)
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
└── README.md
```

---

## 🚀 Quick Setup & Execution Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v24 LTS)
- **PostgreSQL**: Cloud Supabase (pre-configured) or local PostgreSQL port `5432`

### 2. Configure Backend Database
1. Update `backend/.env` with your database credentials:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   JWT_SECRET=smart_id_super_secret_key_2026
   JWT_EXPIRES_IN=7d
   ```
2. Run the seed script to populate institutions, departments, batches, and admin accounts:
   ```bash
   cd backend
   npm run db:setup
   ```

### 3. Start the Backend API Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### 4. Start the Frontend Application
```bash
# In a new terminal window:
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🧪 Automated Testing Instructions (58 Tests)

### 1. Run Backend Tests (40 Tests)
```bash
cd backend

# Run all 40 unit and integration tests
npm test

# Run with full code coverage breakdown
npm run test:coverage
```

### 2. Run Frontend Tests (18 Tests)
```bash
# Switch from backend to frontend directory:
cd ../frontend

# Run all 18 UI component and simulation tests
npm test -- --run

# Run with full code coverage breakdown
npm run test:coverage
```

### 3. Build Production Bundle
```bash
cd frontend
npm run build
```

---

## 🔑 Default Login Credentials

| Role | University / Scope | Email | Password |
|---|---|---|---|
| **Super Admin** | System-Wide Platform | `superadmin@smartid.com` | `admin123` |
| **Client Admin** | University of Information Technology and Sciences (UITS) | `uits_admin@smartid.com` | `admin123` |
| **Client Admin** | Dhaka University (DU) | `du_admin@smartid.com` | `admin123` |
| **Client Admin** | North South University (NSU) | `nsu_admin@smartid.com` | `admin123` |
| **Client Admin** | BRAC University (BRAC) | `brac_admin@smartid.com` | `admin123` |
| **Client Admin** | Metropolitan University (MU) | `mu_admin@smartid.com` | `admin123` |

---

## 📄 Academic Testing Reports

Comprehensive testing documentation following **ISO/IEC/IEEE 29119-3** standards is available in the `docs/` directory:
- [SIFS Software Testing Report (Markdown)](docs/SIFS_Software_Testing_Report.md)
- [SIFS Software Testing Report (Word DOCX)](docs/SIFS_Software_Testing_Report.docx)

---

## 📜 License

This project was developed for academic evaluation under **CSE 416 (Software Project Design and Development)** at the **University of Information Technology and Sciences (UITS)**. Distributed under the MIT License.
