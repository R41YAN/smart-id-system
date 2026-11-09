# Software Test Report
**Test plan, test cases and results (based on ISO/IEC/IEEE 29119-3)**

**Course:** Software Project Design and Development (CSE 416)  
**Project Title:** Smart ID Formatting System (SIFS)  
**Team ID:** Batch: CSE-54, Section: 7B1  
**Authors:** Md. Raiyan (ID: 0432320005101101) & Md. Fizul Islam Yamin (ID: 0432320005101114)  
**Course Instructor:** Dr. Mahfida Amjad Dipa  
**Testing Tools & Frameworks:** Jest, Supertest, Vitest, React Testing Library, Qodo (CodiumAI Methodology)  
**Repository:** [https://github.com/R41YAN/smart-id-system](https://github.com/R41YAN/smart-id-system)  
**Date of Submission:** 10 November 2026 (Updated with Features v1.2)  

---

## 1. Executive Summary & Objective

The objective of this comprehensive testing strategy is to rigorously verify and validate the **Smart ID Formatting System (SIFS)** across both its backend generation engine and its modern frontend user interface.

SIFS is a multi-tenant university admission and digital student credential platform featuring a dual-model institutional ID generation engine:
1. **Open-Credit System:** `[Dept][YY][SemCode][Serial]` (e.g., `CSE26FL012` for Fall intake)
2. **Close-Credit System:** `[Dept][Batch][YY][Serial]` (e.g., `CSE5426012` for 54th Batch)

### Scope of Newly Added Features & Enhancements (v1.2):
* **Dual Department Fields & Directory:** Distinct Full Department Name (`full_name`) and Short Code (`code`), with uppercase normalization, active code grid, and dropdown formatting `Full Name (CODE)`.
* **Phone-Scannable Code 128 Barcodes:** High-precision SVG barcode generation with verified optical scanning from mobile phone cameras.
* **Student Photo Lifecycle & Late Upload:** Automatic center-crop image container (`object-fit: cover`), client-side auto-resizing via Canvas, PostgreSQL storage (`students.photo TEXT`), late photo upload via `PATCH /api/students/:id/photo`, and default academic silhouette placeholder.
* **Option B "View / Print ID Card" Modal:** Interactive modal in the student directory featuring student ID card rendering, scannable barcode, photo management, and print stylesheet.
* **Institutional University Branding & Logos:** Multi-tenant university logos across Client Admin and Super Admin portals, clickable instant upload frames (`LOGO`), 10MB Express body payload support, and strict fallback to institution bank icons (never SIFS brand).

The testing process adheres strictly to the 4-step QA lifecycle mandated in the course guidelines:
* **Step 1 (Attempt):** Design unit test cases for core functions using **Equivalence Partitioning (EP)** and **Boundary Value Analysis (BVA)**, and write integration tests for critical end-to-end user journeys (Authentication, Concurrency-Safe Admission, Department Rosters, and Institutional Branding).
* **Step 2 (Refine):** Explore AI-driven edge cases (Qodo/CodiumAI methodology) testing parameter safety, whitespace handling, and structural integrity.
* **Step 3 (Deepen):** Uncover defect categories across logic, input sanitization, payload limits, and concurrency boundaries.
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
│ • Concurrency & RBAC Isolation  │             │ • Option B ID Card View Modal   │
│ • SQL Injection Defense         │             │ • Code 128 Barcode Rendering    │
│ • Dual Department Roster Tests  │             │ • Photo Auto-fit & Fallback     │
│ • Base64 Logo & Photo Updates   │             │ • Empty State Placeholders      │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 3. Master Test Cases Specification & Execution Table (58 Tests)

The following master test execution matrix documents all **58 automated test cases** executed across backend (40 tests) and frontend (18 tests) suites:

### Part A: Frontend UI Test Cases (Vitest + React Testing Library — 18 Tests)

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
| **TC_UI_LIST_04** | Option B ID Card Modal Open | Records in directory | 1. Click "ID Card" button on student row | Modal opens displaying student identity card preview, scannable barcode, and print buttons | Modal opened with card credentials | **PASS** |
| **TC_UI_LIST_05** | Option B Modal Dismiss | Modal is open | 1. Click Close (×) button on modal header | Modal is dismissed; directory returns to normal view | Modal cleanly unmounted | **PASS** |
| **TC_UI_BARCODE_01** | Code 128 Barcode Rendering | Barcode component loaded | 1. Pass `value="CSE26FL001"` to `<Barcode />` | Generates SVG element with valid Code 128 bars and specified height | Rendered SVG barcode | **PASS** |
| **TC_UI_BARCODE_02** | Barcode Null Value Safety | Barcode component loaded | 1. Pass `value=""` or `null` to `<Barcode />` | Gracefully returns `null` without throwing DOM rendering exception | No errors thrown; returns null | **PASS** |
| **TC_UI_CARD_01** | ID Card Institutional Logo | StudentIdCard loaded | 1. Pass `universityLogo` prop | Card displays institutional image logo; falls back to university icon | Logo rendered accurately | **PASS** |
| **TC_UI_CARD_02** | ID Card Photo Placeholder | No photo provided | 1. Pass `photo={null}` to `<StudentIdCard />` | Displays stylized gray photo frame with academic silhouette and "PHOTO" text | Placeholder frame rendered | **PASS** |
| **TC_UI_CARD_03** | ID Card Custom Photo Fit | Photo URL provided | 1. Pass Base64 photo string | Renders `<img>` element with `object-cover` and rounded border | Student photo rendered | **PASS** |

### Part B: Backend Authentication & Security Integration Tests (Jest + Supertest — 6 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Valid Super Admin Login | User exists in DB (`superadmin@smartid.com`) | 1. Send POST `/api/auth/login`<br>2. Payload: `{ email, password: 'admin123' }` | HTTP 200, JWT token returned, role is `super_admin` | Authenticated successfully; token issued | **PASS** |
| **TC_AUTH_02** | Invalid Password Attempt | User exists in DB | 1. Send POST `/api/auth/login`<br>2. Payload: `{ email, password: 'wrong' }` | HTTP 401, error message "Invalid credentials" | HTTP 401 returned; access blocked | **PASS** |
| **TC_AUTH_03** | Empty Login Credentials | App is running | 1. Send POST `/api/auth/login`<br>2. Blank email/password | HTTP 400, "email and password are required" | HTTP 400 validation error returned | **PASS** |
| **TC_AUTH_04** | SQL Injection Attack Check | App is running | 1. Send POST `/api/auth/login`<br>2. Email: `' OR 1=1 --` | HTTP 401, parameterized query sanitizes input; no crash | HTTP 401; safely denied without execution | **PASS** |
| **TC_AUTH_05** | Protected Route Access | Valid JWT token acquired | 1. Send GET `/api/auth/me`<br>2. Include `Bearer <token>` header | HTTP 200, authenticated user payload returned | Profile returned with email & role | **PASS** |
| **TC_AUTH_06** | Unauthorized Request | Request without token | 1. Send GET `/api/auth/me`<br>2. No Auth header | HTTP 401, access denied | HTTP 401 Unauthorized | **PASS** |

### Part C: Core ID Generation Unit Tests (Equivalence Partitioning & Boundary Value Analysis — 16 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_UNIT_EP01** | Open Credit - Spring Intake | `idGenerator.js` loaded | 1. Arrange `{ type: 'open_credit', dept: 'CSE', year: 2026, sem: 1, serial: 12 }`<br>2. Act `generateStudentId()` | Format matches `CSE26SP012` | Returns `CSE26SP012` | **PASS** |
| **TC_UNIT_EP02** | Open Credit - Summer Intake | `idGenerator.js` loaded | 1. Arrange `{ type: 'open_credit', dept: 'EEE', year: 2025, sem: 2, serial: 45 }`<br>2. Act `generateStudentId()` | Format matches `EEE25SM045` | Returns `EEE25SM045` | **PASS** |
| **TC_UNIT_EP03** | Open Credit - Fall Intake | `idGenerator.js` loaded | 1. Arrange `{ type: 'open_credit', dept: 'BBA', year: 2026, sem: 3, serial: 7 }`<br>2. Act `generateStudentId()` | Format matches `BBA26FL007` | Returns `BBA26FL007` | **PASS** |
| **TC_UNIT_EP04** | Close Credit Generation | `idGenerator.js` loaded | 1. Arrange `{ type: 'close_credit', dept: 'CSE', batch: 54, year: 2026, serial: 12 }`<br>2. Act `generateStudentId()` | Format matches `CSE5426012` | Returns `CSE5426012` | **PASS** |
| **TC_UNIT_EP05** | Invalid University Model | `idGenerator.js` loaded | 1. Pass `universityType: 'hybrid_credit'` | Throws Error: `Unknown university type` | Throws expected error | **PASS** |
| **TC_UNIT_EP06** | Out-of-Range Semester Index | `idGenerator.js` loaded | 1. Pass `semesterIndex: 0` or `4` | Throws Error: `Invalid semester index` | Throws expected error | **PASS** |
| **TC_UNIT_EP07** | Department Code Normalization | `idGenerator.js` loaded | 1. Pass lowercase `deptName: 'cse'` | Auto-uppercased to `CSE` | Returns `CSE26SP003` | **PASS** |
| **TC_UNIT_BVA01** | Min Boundary Serial (1) | `idGenerator.js` loaded | 1. Arrange `serial: 1` | Padded to 3 digits (`001`) | Returns `CSE26SP001` | **PASS** |
| **TC_UNIT_BVA02** | Transition Boundary (9 & 10) | `idGenerator.js` loaded | 1. Test serials 9 and 10 | Formatted as `009` and `010` | Formatted cleanly | **PASS** |
| **TC_UNIT_BVA03** | Transition Boundary (99 & 100) | `idGenerator.js` loaded | 1. Test serials 99 and 100 | Formatted as `099` and `100` | Formatted cleanly | **PASS** |
| **TC_UNIT_BVA04** | Max Boundary Serial (999) | `idGenerator.js` loaded | 1. Test serial 999 | Formatted as `999` without truncation | Returns `CSE5426999` | **PASS** |
| **TC_UNIT_BVA05** | Overflow Serial (1000) | `idGenerator.js` loaded | 1. Test serial 1000 | Four-digit representation preserved | Returns `CSE26SP1000` | **PASS** |
| **TC_UNIT_BVA06** | Century Year Boundary (2000) | `idGenerator.js` loaded | 1. Pass `year: 2000` | Two-digit slice produces `00` | Returns `LAW00SP005` | **PASS** |
| **TC_UNIT_BVA07** | Future Year Boundary (2099) | `idGenerator.js` loaded | 1. Pass `year: 2099` | Two-digit slice produces `99` | Returns `ENG1599002` | **PASS** |
| **TC_UNIT_BVA08** | Single Digit Batch (Batch 1) | `idGenerator.js` loaded | 1. Pass `batchNumber: 1` | Standard 2-digit batch padding (`01`) | Returns `CSE0126001` | **PASS** |
| **TC_UNIT_BVA09** | Large Batch (Batch 100) | `idGenerator.js` loaded | 1. Pass `batchNumber: 100` | Full batch number integrated | Returns `CSE10026050` | **PASS** |

### Part D: Qodo AI Edge-Cases, Robustness & Constants (7 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_UNIT_CONST** | Semester Mapping Integrity | `idGenerator.js` loaded | 1. Verify `SEMESTER_MAP` constants | `1: SP, 2: SM, 3: FL` | Strict mapping verified | **PASS** |
| **TC_EDGE_01** | Accidental Whitespace in Dept | `idGenerator.js` loaded | 1. Pass `deptName: '  CSE  '` | Trimmed and uppercased cleanly | Returns `CSE26SP010` | **PASS** |
| **TC_EDGE_02** | Null/Missing Department | `idGenerator.js` loaded | 1. Pass `deptName: null` | Throws validation error | Throws domain error | **PASS** |
| **TC_EDGE_03** | Missing Batch in Close Credit | `idGenerator.js` loaded | 1. Pass `close_credit` without `batchNumber` | Throws validation error | Throws domain error | **PASS** |
| **TC_EDGE_04** | Non-Positive Serials (0 or -5) | `idGenerator.js` loaded | 1. Pass `serial: 0` and `serial: -5` | Throws: `Invalid serial number` | Throws domain error | **PASS** |
| **TC_EDGE_05** | Numeric String Serial Parsing | `idGenerator.js` loaded | 1. Pass `serial: '42'` | Auto-converted to numeric 42 | Returns `CSE26SM042` | **PASS** |
| **TC_EDGE_06** | Complex Dept Codes (SWE, BBA) | `idGenerator.js` loaded | 1. Pass `deptName: 'SWE'` | Generated without distortion | Returns `SWE26FL099` | **PASS** |

### Part E: Student Admission & Multi-Tenant Integration Tests (7 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_ADM_01** | Admission Input Validation | NSU Client Admin logged in | 1. POST `/api/students` missing fields | HTTP 400, "fields are required" | HTTP 400 validation error | **PASS** |
| **TC_ADM_02** | Cross-Tenant RBAC Isolation | NSU Admin logged in | 1. Attempt to admit to MU Batch ID | HTTP 403, "Access denied" | HTTP 403 Forbidden | **PASS** |
| **TC_ADM_03** | Non-existent Batch Request | Authenticated Admin | 1. POST `/api/students` with batch 999999 | HTTP 404, "Batch not found" | HTTP 404 Not Found | **PASS** |
| **TC_ADM_04** | Role-Based Directory Scoping | Both Admin types tested | 1. GET `/api/students` for NSU vs Super | NSU sees only NSU; Super sees all | Scoped records matched | **PASS** |
| **TC_ADM_05** | Stored Student ID Verification | Students exist in DB | 1. Inspect DB student ID formats | Matches RegEx: `^[A-Z]{2,5}\d{2,6}...` | 100% regex format match | **PASS** |
| **TC_ADM_06** | Student Photo Lifecycle & Late Update | NSU Admin logged in | 1. POST `/api/students` with Base64 photo<br>2. PATCH `/api/students/:id/photo` with new photo | HTTP 201 with stored photo, HTTP 200 on late update | Photo stored and updated | **PASS** |
| **TC_ADM_07** | University Logo Association | Super Admin logged in | 1. GET `/api/universities` | Response contains valid `logo_url` property | University logo URL returned | **PASS** |

### Part F: Dual Department Fields & Institutional Branding Integration Tests (4 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_DEPT_01** | Dual Field Dept Creation | NSU Admin logged in | 1. POST `/api/departments` with `{ name: 'bba', code: 'bba', full_name: 'Department of Business Administration' }` | Code auto-uppercased to `BBA`, `full_name` saved | HTTP 201, department created | **PASS** |
| **TC_DEPT_02** | Department Roster Dual Fields | Departments exist | 1. GET `/api/departments?university_id=X` | Each item exposes `code`, `name`, and `full_name` | Dual fields returned | **PASS** |
| **TC_UNI_LOGO_01** | Institutional Logo Update | Client Admin logged in | 1. PUT `/api/universities/:id` with Base64 logo | HTTP 200, `logo_url` updated in PostgreSQL | Logo saved successfully | **PASS** |
| **TC_UNI_LOGO_02** | Logo Tenant RBAC Isolation | NSU Admin logged in | 1. PUT `/api/universities/:muId` attempting update to MU | HTTP 403 Forbidden, cross-tenant update denied | HTTP 403 Access denied | **PASS** |

---

## 4. Defect Tracking and Resolution Report

During testing and feature refinement, six critical defect categories were uncovered, resolved, and verified:

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
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ DEF_05  │ Express body parser rejected  │ Increased limit to '10mb' in │
│         │ Base64 logo/photo uploads.    │ backend/index.js.            │
├─────────┼───────────────────────────────┼──────────────────────────────┤
│ DEF_06  │ Fallback logo rendered SIFS   │ Updated getUniversityLogo()  │
│         │ badge for other institutions. │ to return null for bank icon.│
└─────────┴───────────────────────────────┴──────────────────────────────┘
```

---

## 5. Automated Execution Summary

### Backend Suites (Jest + Supertest — 40 Tests)
```
PS C:\Users\PC> cd "d:\Software Project Lab\Project\smart-id-system\backend"
PS D:\Software Project Lab\Project\smart-id-system\backend> npm test

> smart-id-system-backend@1.0.0 test
> jest --runInBand --detectOpenHandles --forceExit

 PASS  tests/integration/departmentsAndBranding.test.js
  ● Console
    console.log
      ✅ PostgreSQL connected

 PASS  tests/integration/studentAdmission.test.js
  ● Console
    console.log
      ✅ PostgreSQL connected

 PASS  tests/integration/auth.test.js
  ● Console
    console.log
      ✅ PostgreSQL connected

 PASS  tests/unit/idGenerator.test.js
 PASS  tests/unit/edgeCases.test.js

Test Suites: 5 passed, 5 total
Tests:       40 passed, 40 total
Snapshots:   0 total
Time:        6.574 s
Ran all test suites.
PS D:\Software Project Lab\Project\smart-id-system\backend>
```

```
 % Coverage report from Jest
--------------------------|---------|----------|---------|---------|----------------------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                
--------------------------|---------|----------|---------|---------|----------------------------------
All files                 |   67.64 |    44.79 |   46.87 |   69.85 |                                  
 backend                  |   72.72 |       25 |       0 |   72.72 | 22,34,39-40,45,48,52-54          
  index.js                |   72.72 |       25 |       0 |   72.72 | 22,34,39-40,45,48,52-54          
 backend/controllers      |   57.61 |    40.27 |   57.89 |   60.35 |                                  
  authController.js       |   57.44 |    43.47 |      50 |   58.69 | 8-27,69-70,88,94-103             
  batchController.js      |   34.14 |      7.4 |   33.33 |      35 | 12-13,15-16,22,27-52,57-64       
  departmentController.js |   68.96 |       40 |   66.66 |   70.37 | 16,26,37,40,45-49                
  studentController.js    |      75 |    65.85 |     100 |   80.88 | 30,70-71,100-106,117,134,143-144 
  universityController.js |      44 |    32.14 |      40 |   47.82 | 13,17,22-27,32-43,68,73-81       
 backend/db               |    87.5 |    14.28 |      50 |     100 |                                  
  connection.js           |    87.5 |    14.28 |      50 |     100 | 5-15                             
 backend/middleware       |   66.66 |       50 |      50 |   66.66 |                                  
  auth.js                 |   66.66 |       50 |      50 |   66.66 | 14,19-21,25-27,32                
 backend/routes           |     100 |      100 |     100 |     100 |                                  
  authRoutes.js           |     100 |      100 |     100 |     100 |                                  
  batchRoutes.js          |     100 |      100 |     100 |     100 |                                  
  departmentRoutes.js     |     100 |      100 |     100 |     100 |                                  
  studentRoutes.js        |     100 |      100 |     100 |     100 |                                  
  universityRoutes.js     |     100 |      100 |     100 |     100 |                                  
 backend/utils            |     100 |      100 |     100 |     100 |                                  
  idGenerator.js          |     100 |      100 |     100 |     100 |                                  
--------------------------|---------|----------|---------|---------|----------------------------------
```

### Frontend Suites (Vitest + React Testing Library — 18 Tests)
```
PS C:\Users\PC> cd "d:\Software Project Lab\Project\smart-id-system\frontend"
PS D:\Software Project Lab\Project\smart-id-system\frontend> npm test -- --run

> frontend@0.0.0 test
> vitest run --run

 RUN  v5.0.5 D:/Software Project Lab/Project/smart-id-system/frontend

 ✓ src/components/__tests__/Barcode.test.jsx (2 tests) 36ms
 ✓ src/components/__tests__/StudentIdCard.test.jsx (3 tests) 86ms
 ✓ src/pages/__tests__/Login.test.jsx (4 tests) 212ms
 ✓ src/pages/__tests__/AdmitStudent.test.jsx (4 tests) 391ms
 ✓ src/pages/__tests__/StudentList.test.jsx (5 tests) 454ms

 Test Files  5 passed (5)
      Tests  18 passed (18)
   Start at  01:35:07
   Duration  2.44s
PS D:\Software Project Lab\Project\smart-id-system\frontend>
```

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   48.16 |    59.07 |    54.9 |      50 |                   
 components        |    44.7 |    64.58 |   65.62 |      45 |                   
  Barcode.jsx      |   84.61 |    91.66 |     100 |      90 | 31                
  Icons.jsx        |   68.42 |    68.42 |   68.42 |   68.42 | ...94,149,171-180 
  Layout.jsx       |     100 |      100 |     100 |     100 |                   
  Sidebar.jsx      |      22 |    34.21 |   44.44 |   22.91 | 38-80,107,198     
  ...entIdCard.jsx |     100 |    92.59 |     100 |     100 | 91-98             
 context           |   58.33 |       50 |      60 |    61.9 |                   
  AuthContext.jsx  |   58.33 |       50 |      60 |    61.9 | 18-21,25-28       
 pages             |   46.69 |    53.84 |   48.43 |   49.11 |                   
  AdmitStudent.jsx |   60.19 |    70.11 |   59.25 |   61.79 | ...99-102,237-361 
  Login.jsx        |   89.47 |     62.5 |     100 |   89.47 | 20-21             
  StudentList.jsx  |   30.37 |    36.78 |   33.33 |   33.05 | ...84,326,380-417 
 utils             |      75 |    80.95 |     100 |   73.33 |                   
  ...rsityLogos.js |      75 |    80.95 |     100 |   73.33 | 13,16,19,22       
-------------------|---------|----------|---------|---------|-------------------
```

### Grand Total
$$\text{Total Test Cases Executed: } 58 \quad\Big|\quad \text{Passed: } 58 \quad\Big|\quad \text{Failed: } 0 \quad (\mathbf{100\% \text{ Pass Rate}})$$

---

## 6. How to Run the Tests

### 1. Run Backend Tests
```bash
# From project root:
cd backend

# Run all 40 backend unit & integration tests
npm test

# Run with full code coverage breakdown
npm run test:coverage
```

### 2. Run Frontend Tests
```bash
# From backend directory, switch to frontend:
cd ../frontend
# (Or from project root: cd frontend)

# Run all 18 UI component and simulation tests
npm test -- --run

# Run with full code coverage breakdown
npm run test:coverage
```

### 3. Build & Typecheck Frontend
```bash
# From frontend directory:
npm run build
```
