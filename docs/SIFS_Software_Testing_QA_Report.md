# Software Testing and Quality Assurance Lab Report

**Project Title:** Smart ID Formatting System (SIFS)  
**Mapped Course Outcome:** CO3 — Software Testing and Quality Assurance  
**Testing Tools & Frameworks:** Jest, Supertest, Vitest, React Testing Library, Qodo (CodiumAI Methodology)  
**Authors:** Md. Raiyan & Md. Fizul Islam Yamin  
**Repository:** [https://github.com/R41YAN/smart-id-system](https://github.com/R41YAN/smart-id-system)  

---

## 1. Executive Summary & Objective

The objective of this comprehensive testing strategy is to rigorously verify and validate the **Smart ID Formatting System (SIFS)** across both its backend generation engine and its modern frontend user interface.

SIFS is a multi-tenant university admission platform featuring a dual-model institutional ID generation engine:
1. **Open-Credit System:** `[Dept][YY][SemCode][Serial]` (e.g., `CSE26FL012` for Fall intake)
2. **Close-Credit System:** `[Dept][Batch][YY][Serial]` (e.g., `CSE5426012` for 54th Batch)

The testing process adheres strictly to the 4-step QA lifecycle mandated in the course guidelines:
* **Step 1 (Attempt):** Design unit test cases for core functions using **Equivalence Partitioning (EP)** and **Boundary Value Analysis (BVA)**, and write integration tests for critical end-to-end user journeys (Authentication and Concurrency-Safe Student Admission).
* **Step 2 (Refine):** Explore AI-driven edge cases (Qodo/CodiumAI methodology) testing parameter safety, whitespace handling, and structural integrity.
* **Step 3 (Deepen):** Uncover defect categories across logic, input sanitization, and concurrency boundaries.
* **Step 4 (Verify):** Resolve discovered defects, achieve full pass rates, and justify code coverage across both backend and frontend layers.

---

## 2. Test Architecture & Methodology

All test cases implement the standard **AAA (Arrange, Act, Assert)** pattern:
* **Arrange:** Set up preconditions, test variables, credentials, and mock/live database states.
* **Act:** Invoke the target unit function, dispatch HTTP requests (`supertest`), or simulate user interaction (`@testing-library/react`).
* **Assert:** Verify expected outputs, return types, HTTP status codes, and reactive DOM states.

```
       ┌──────────────────────────────────────────────────────────────────┐
       │               SIFS Full-Stack Testing Architecture               │
       └─────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│       Backend Test Suite        │             │       Frontend Test Suite       │
│        (Jest + Supertest)       │             │    (Vitest + Testing Library)   │
├─────────────────────────────────┤             ├─────────────────────────────────┤
│ • Equivalence Partitioning (EP) │             │ • Login UI & Error States       │
│ • Boundary Value Analysis (BVA) │             │ • Interactive Live ID Card      │
│ • Qodo AI Edge-Case Refinements │             │ • Real-time Name & Code Sync    │
│ • Concurrency & RBAC Isolation  │             │ • Roster Listing & CSV Export   │
│ • SQL Injection Defense         │             │ • Empty State Placeholders      │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 3. Master Test Cases Specification & Execution Table (45 Tests)

The following master test execution matrix documents all 45 automated test cases executed across backend and frontend suites:

### Part A: Frontend UI Test Cases (Vitest + React Testing Library)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_UI_AUTH_01** | Login Form Rendering | User on `/login` | 1. Render `<Login />` | Title "Smart ID Formatting System", email/password inputs, and Sign In button are visible | All elements rendered cleanly | **PASS** |
| **TC_UI_AUTH_02** | Input Value Updates | User on `/login` | 1. Type into Email input<br>2. Type into Password input | Values in inputs update to match typed string | Inputs reflect typed values | **PASS** |
| **TC_UI_AUTH_03** | Failed Login Alert Box | User on `/login` | 1. Enter invalid credentials<br>2. Click 'Sign In to Dashboard' | API error message displayed in red alert card | "Invalid credentials or login failed" alert shown | **PASS** |
| **TC_UI_AUTH_04** | Form Loading State | Form submitted | 1. Click submit button | Button text switches to "Authenticating..." and button disables | Spinner shown and button disabled | **PASS** |
| **TC_UI_ADM_01** | Admission Form & Card Layout | Client Admin logged in | 1. Render `<AdmitStudent />` | Form on left and Digital Student ID Card on right both visible | Split-screen UI rendered | **PASS** |
| **TC_UI_ADM_02** | Live Dynamic Name Typing | User on `/admin/admit` | 1. Type "Nusrat Jahan" in Full Name | ID Card avatar block on right updates live to "Nusrat Jahan" | Card live-updated in real-time | **PASS** |
| **TC_UI_ADM_03** | ID Format Preview Sync | User on `/admin/admit` | 1. Select Dept & Batch | ID Card preview updates format code (e.g. `CSE26FL•••`) | Format code rendered accurately | **PASS** |
| **TC_UI_ADM_04** | Admission Success Reveal | Form submitted with valid data | 1. Submit valid student data | Real generated ID revealed on card; "Print Student ID Card" and "Enroll Another" buttons appear | Card reveals issued ID with print options | **PASS** |
| **TC_UI_LIST_01** | Student Directory Display | Students exist in DB | 1. Render `<StudentList />` | Displays student ID badge in monospace, student name, and department | Student records displayed | **PASS** |
| **TC_UI_LIST_02** | Directory Action Buttons | Records present | 1. Inspect action bar | "Export CSV" and "Print / PDF" buttons exist and are active | Both action buttons present | **PASS** |
| **TC_UI_LIST_03** | Directory Empty State | No students in DB | 1. Render `<StudentList />` with empty list | Displays friendly "No students found" empty state | Empty state message rendered | **PASS** |

### Part B: Backend Authentication & Security Integration Tests (Jest + Supertest)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Valid Super Admin Login | User exists in DB (`superadmin@smartid.com`) | 1. Send POST `/api/auth/login`<br>2. Payload: `{ email, password: 'admin123' }` | HTTP 200, JWT token returned, role is `super_admin` | Authenticated successfully; token issued | **PASS** |
| **TC_AUTH_02** | Invalid Password Attempt | User exists in DB | 1. Send POST `/api/auth/login`<br>2. Payload: `{ email, password: 'wrong' }` | HTTP 401, error message "Invalid credentials" | HTTP 401 returned; access blocked | **PASS** |
| **TC_AUTH_03** | Empty Login Credentials | App is running | 1. Send POST `/api/auth/login`<br>2. Blank email/password | HTTP 400, "email and password are required" | HTTP 400 validation error returned | **PASS** |
| **TC_AUTH_04** | SQL Injection Attack Check | App is running | 1. Send POST `/api/auth/login`<br>2. Email: `' OR 1=1 --` | HTTP 401, parameterized query sanitizes input; no crash | HTTP 401; safely denied without execution | **PASS** |
| **TC_AUTH_05** | Protected Route Access | Valid JWT token acquired | 1. Send GET `/api/auth/me`<br>2. Include `Bearer <token>` header | HTTP 200, authenticated user payload returned | Profile returned with email & role | **PASS** |
| **TC_AUTH_06** | Unauthorized Request | Request without token | 1. Send GET `/api/auth/me`<br>2. No Auth header | HTTP 401, access denied | HTTP 401 Unauthorized | **PASS** |

### Part C: Core ID Generation Unit Tests (Equivalence Partitioning & Boundary Value Analysis)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_UNIT_EP01** | Open Credit - Spring Intake | `idGenerator.js` loaded | 1. Arrange `{ type: 'open_credit', dept: 'CSE', year: 2026, sem: 1, serial: 12 }`<br>2. Act `generateStudentId()` | Format matches `CSE26SP012` | Returns `CSE26SP012` | **PASS** |
| **TC_UNIT_EP02** | Open Credit - Summer Intake | `idGenerator.js` loaded | 1. Arrange `{ type: 'open_credit', dept: 'EEE', year: 2025, sem: 2, serial: 45 }`<br>2. Act `generateStudentId()` | Format matches `EEE25SM045` | Returns `EEE25SM045` | **PASS** |
| **TC_UNIT_EP03** | Open Credit - Fall Intake | `idGenerator.js` loaded | 1. Arrange `{ type: 'open_credit', dept: 'BBA', year: 2026, sem: 3, serial: 7 }`<br>2. Act `generateStudentId()` | Format matches `BBA26FL007` | Returns `BBA26FL007` | **PASS** |
| **TC_UNIT_EP04** | Close Credit Generation | `idGenerator.js` loaded | 1. Arrange `{ type: 'close_credit', dept: 'CSE', batch: 54, year: 2026, serial: 12 }`<br>2. Act `generateStudentId()` | Format matches `CSE5426012` | Returns `CSE5426012` | **PASS** |
| **TC_UNIT_EP05** | Invalid University Model | `idGenerator.js` loaded | 1. Pass `universityType: 'hybrid_credit'` | Throws Error: `Unknown university type` | Throws expected error | **PASS** |
| **TC_UNIT_EP06** | Out-of-Range Semester Code | `idGenerator.js` loaded | 1. Pass `semesterIndex: 0` or `4` | Throws Error: `Invalid semester index` | Throws expected error | **PASS** |
| **TC_UNIT_EP07** | Department Code Normalization | `idGenerator.js` loaded | 1. Pass lowercase `deptName: 'cse'` | Auto-uppercased to `CSE` | Returns `CSE26SP003` | **PASS** |
| **TC_UNIT_BVA01** | Min Boundary Serial (1) | `idGenerator.js` loaded | 1. Arrange `serial: 1` | Padded to 3 digits (`001`) | Returns `CSE26SP001` | **PASS** |
| **TC_UNIT_BVA02** | Transition Boundary (9 & 10) | `idGenerator.js` loaded | 1. Test serials 9 and 10 | Formatted as `009` and `010` | Formatted cleanly | **PASS** |
| **TC_UNIT_BVA03** | Transition Boundary (99 & 100) | `idGenerator.js` loaded | 1. Test serials 99 and 100 | Formatted as `099` and `100` | Formatted cleanly | **PASS** |
| **TC_UNIT_BVA04** | Max Boundary Serial (999) | `idGenerator.js` loaded | 1. Test serial 999 | Formatted as `999` without truncation | Returns `CSE5426999` | **PASS** |
| **TC_UNIT_BVA05** | Overflow Serial (1000) | `idGenerator.js` loaded | 1. Test serial 1000 | Four-digit representation preserved | Returns `CSE26SP1000` | **PASS** |
| **TC_UNIT_BVA06** | Century Year Boundary (2000) | `idGenerator.js` loaded | 1. Pass `year: 2000` | Two-digit slice produces `00` | Returns `LAW00SP005` | **PASS** |
| **TC_UNIT_BVA07** | Future Year Boundary (2099) | `idGenerator.js` loaded | 1. Pass `year: 2099` | Two-digit slice produces `99` | Returns `ENG1599002` | **PASS** |
| **TC_UNIT_BVA08** | Single Digit Batch (Batch 1) | `idGenerator.js` loaded | 1. Pass `batchNumber: 1` | Correct cohort code without false pad | Returns `CSE126001` | **PASS** |
| **TC_UNIT_BVA09** | Large Batch (Batch 100) | `idGenerator.js` loaded | 1. Pass `batchNumber: 100` | Full batch number integrated | Returns `CSE10026050` | **PASS** |
| **TC_UNIT_CONST** | Semester Mapping Integrity | `idGenerator.js` loaded | 1. Verify `SEMESTER_MAP` constants | `1: SP, 2: SM, 3: FL` | Strict mapping verified | **PASS** |

### Part D: Qodo AI Edge-Cases & Multi-Tenant Integration Tests

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_EDGE_01** | Accidental Whitespace in Dept | `idGenerator.js` loaded | 1. Pass `deptName: '  CSE  '` | Trimmed and uppercased cleanly | Returns `CSE26SP010` | **PASS** |
| **TC_EDGE_02** | Null/Missing Department | `idGenerator.js` loaded | 1. Pass `deptName: null` | Throws validation error | Throws domain error | **PASS** |
| **TC_EDGE_03** | Missing Batch in Close Credit | `idGenerator.js` loaded | 1. Pass `close_credit` without `batchNumber` | Throws validation error | Throws domain error | **PASS** |
| **TC_EDGE_04** | Non-Positive Serials (0 or -5) | `idGenerator.js` loaded | 1. Pass `serial: 0` and `serial: -5` | Throws: `Invalid serial number` | Throws domain error | **PASS** |
| **TC_EDGE_05** | Numeric String Serial Parsing | `idGenerator.js` loaded | 1. Pass `serial: '42'` | Auto-converted to numeric 42 | Returns `CSE26SM042` | **PASS** |
| **TC_EDGE_06** | Complex Dept Codes (SWE, BBA) | `idGenerator.js` loaded | 1. Pass `deptName: 'SWE'` | Generated without distortion | Returns `SWE26FL099` | **PASS** |
| **TC_ADM_01** | Admission Input Validation | NSU Client Admin logged in | 1. POST `/api/students` missing fields | HTTP 400, "fields are required" | HTTP 400 validation error | **PASS** |
| **TC_ADM_02** | Cross-Tenant RBAC Isolation | NSU Admin logged in | 1. Attempt to admit to MU Batch ID | HTTP 403, "Access denied" | HTTP 403 Forbidden | **PASS** |
| **TC_ADM_03** | Non-existent Batch Request | Authenticated Admin | 1. POST `/api/students` with batch 999999 | HTTP 404, "Batch not found" | HTTP 404 Not Found | **PASS** |
| **TC_ADM_04** | Role-Based Directory Scoping | Both Admin types tested | 1. GET `/api/students` for NSU vs Super | NSU sees only NSU; Super sees all | Scoped records matched | **PASS** |
| **TC_ADM_05** | Stored Student ID Verification | Students exist in DB | 1. Inspect DB student ID formats | Matches RegEx: `^[A-Z]{2,5}\d{2,6}...` | 100% regex format match | **PASS** |

---

## 4. Defect Tracking and Resolution Report (Steps 2, 3, & 4)

During the **Refine (Step 2)** and **Deepen (Step 3)** phases using Qodo (CodiumAI) edge-case testing, four distinct defects were uncovered in `backend/utils/idGenerator.js`. All four were resolved and verified in **Step 4**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Defect Resolution Log                           │
├─────────┬───────────────────────────────┬──────────────────────────────┤
│ Defect  │ Root Cause Description        │ Resolution & Fix Applied     │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ DEF_01  │ Leading/trailing whitespace   │ Applied .trim().toUpperCase()│
│         │ in dept name was preserved.   │ to sanitize inputs.          │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ DEF_02  │ Passing null/undefined dept   │ Added explicit type check:   │
│         │ caused raw TypeError crash.   │ throws descriptive error.    │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ DEF_03  │ Close-credit accepted missing │ Added mandatory batchNumber  │
│         │ batchNumber generating 'null'.│ check for close_credit.      │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ DEF_04  │ Serial allowed 0 and negative │ Added positive number check: │
│         │ values (e.g., CSE26SP000).    │ throws for serial <= 0.      │
└─────────┴───────────────────────────────┴──────────────────────────────┘
```

---

## 5. Automated Execution Summary

### Backend Suites (Jest + Supertest)
```
Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        4.048 s
Coverage:    100% on Core ID Engine & 100% on API Routes
```

### Frontend Suites (Vitest + React Testing Library)
```
Test Files:  3 passed, 3 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        1.90 s
```

### Grand Total
$$\text{Total Test Cases Executed: } 45 \quad\Big|\quad \text{Passed: } 45 \quad\Big|\quad \text{Failed: } 0 \quad (\mathbf{100\% \text{ Pass Rate}})$$

---

## 6. How to Run the Tests

### 1. Run Backend Tests
```bash
cd "backend"

# Run all 34 backend unit & integration tests
npm test

# Run with full code coverage breakdown
npm run test:coverage
```

### 2. Run Frontend Tests
```bash
cd "frontend"

# Run all 11 UI component and simulation tests
npm test
```
