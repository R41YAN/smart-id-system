# 🪪 Smart ID Formatting System

> **7th Semester Software Project Lab Project**  
> **Team Members:** Md. Raiyan (Frontend, UI/UX & Documentation) & Md. Fizul Islam Yamin (Backend Architecture & Formatting Engine)

---

## 📌 Project Overview

The **Smart ID Formatting System** is a university admission management platform designed to automate and standardize the generation of collision-free, human-readable student IDs. It solves the critical issues of manual entry errors, race conditions during high-volume admissions, and inconsistencies across different academic credit systems.

### 🎯 Key Highlights
- **Dual Academic Model Support**: Supports both **Open-Credit** (Semester-based) and **Close-Credit / Fixed-Credit** (Batch-based) university architectures.
- **ACID Transaction & Concurrency Locking**: Employs PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) to prevent duplicate ID generation during concurrent admissions.
- **Role-Based Access Control (RBAC)**: Distinct portals for **Super Admin** (system-wide management) and **Client Admin** (university-specific operations).
- **Automated Serial Incrementation**: Auto-calculates 3-digit serials per department, year, and intake/batch (e.g., `001`, `002`, `012`).
- **Auditability & Integrity**: Prevents university configuration modification or deletion once admissions have begun (`is_locked` safeguard).

---

## 📐 ID Formatting Specifications

### 1. Open-Credit Universities (e.g., NSU, BRAC)
*Format:* `[Department Name][YY][Semester Code][3-Digit Serial]`  
*Semester Codes:* `SP` = Spring, `SM` = Summer, `FL` = Fall

| Department | Year | Semester | Serial | Generated ID |
|---|---|---|---|---|
| CSE | 2026 | Fall (`FL`) | 12 | **`CSE26FL012`** |
| BBA | 2026 | Spring (`SP`) | 1 | **`BBA26SP001`** |

### 2. Close-Credit Universities (e.g., Metropolitan University, Public Unis)
*Format:* `[Department Name][Batch Number][YY][3-Digit Serial]`

| Department | Batch | Year | Serial | Generated ID |
|---|---|---|---|---|
| CSE | 54 | 2026 | 12 | **`CSE5426012`** |
| EEE | 40 | 2026 | 5 | **`EEE4026005`** |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router 7, Axios |
| **Backend** | Node.js, Express.js, JWT, Bcrypt.js |
| **Database** | PostgreSQL (Relational schema, ENUM types, Foreign Keys, Indexes) |
| **Architecture**| RESTful API with Stateless JWT Authentication & ACID Row Locking |

---

## 📂 Project Structure

```text
smart-id-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Login, user registration, profile
│   │   ├── batchController.js       # Batch & semester intake CRUD
│   │   ├── departmentController.js  # Department management
│   │   ├── studentController.js     # Concurrency-safe student admission
│   │   └── universityController.js  # Multi-university management
│   ├── db/
│   │   ├── connection.js            # PostgreSQL pool configuration
│   │   ├── schema.sql               # Relational database schema
│   │   └── seed.js                  # Database initialization & sample data
│   ├── middleware/
│   │   └── auth.js                  # JWT token verification & RBAC
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── batchRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── studentRoutes.js
│   │   └── universityRoutes.js
│   ├── utils/
│   │   └── idGenerator.js           # Core ID generation engine
│   ├── .env                         # Server & database environment variables
│   ├── index.js                     # Express app entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js             # Axios client with auth interceptor
│   │   ├── components/
│   │   │   ├── Layout.jsx           # App layout with dynamic sidebar
│   │   │   ├── ProtectedRoute.jsx   # Role-guarded route wrapper
│   │   │   └── Sidebar.jsx          # Role-based navigation sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state & login/logout
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Sign in page
│   │   │   ├── SuperAdminDashboard.jsx
│   │   │   ├── ManageUniversities.jsx
│   │   │   ├── ManageAdmins.jsx
│   │   │   ├── ClientAdminDashboard.jsx
│   │   │   ├── ManageDepartments.jsx
│   │   │   ├── ManageBatches.jsx
│   │   │   ├── AdmitStudent.jsx     # Admission form with instant preview
│   │   │   └── StudentList.jsx      # Admitted students directory & filters
│   │   ├── App.jsx                  # Main router
│   │   ├── index.css                # Tailwind CSS v4 styling
│   │   └── main.jsx
│   ├── vite.config.js               # Vite config with backend API proxy
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Setup & Execution Guide

### 1. Prerequisites
- **Node.js**: v18+ installed
- **PostgreSQL**: installed and running locally on port `5432`

### 2. Configure Backend Database
1. Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE smart_id_system;
   ```
2. Verify or update `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=smart_id_system
   DB_PORT=5432
   JWT_SECRET=smart_id_super_secret_key_2026
   JWT_EXPIRES_IN=7d
   ```

3. Run the automated seed script to create all tables and initial accounts:
   ```bash
   cd backend
   npm run db:setup
   ```

### 3. Start the Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### 4. Start the Frontend Application
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🔑 Default Login Credentials

After running `npm run db:setup`, the following accounts are ready to test:

| Role | Organization / Type | Email | Password |
|---|---|---|---|
| **Super Admin** | System Administrator | `superadmin@smartid.com` | `admin123` |
| **Client Admin** | North South University (*Open-Credit*) | `nsu_admin@smartid.com` | `admin123` |
| **Client Admin** | Metropolitan University (*Close-Credit*) | `mu_admin@smartid.com` | `admin123` |

---

## 🧪 Testing ID Generation Flow

1. **Test Super Admin**:
   - Log in with `superadmin@smartid.com`.
   - View system statistics, create new universities (Open or Close credit), and provision Client Admin accounts.
2. **Test Open-Credit Admission (NSU)**:
   - Log in with `nsu_admin@smartid.com`.
   - Go to **Batches** → Create a semester intake (e.g., Spring / Summer / Fall).
   - Go to **Admit Student** → Select Department (`CSE`) & Semester → Admit a student.
   - Result: Student ID generated as `CSE26SP001` or `CSE26SP002`.
3. **Test Close-Credit Admission (MU)**:
   - Log in with `mu_admin@smartid.com`.
   - Go to **Batches** → Create a batch (e.g., 54th Batch).
   - Go to **Admit Student** → Select Department (`CSE`) & Batch → Admit a student.
   - Result: Student ID generated as `CSE5426001` or `CSE5426002`.
