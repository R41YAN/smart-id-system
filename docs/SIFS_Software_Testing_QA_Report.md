# Software Testing and Quality Assurance Lab Report

**Project Title:** Smart ID Formatting System (SIFS)  
**Mapped Course Outcome:** CO3 — Software Testing and Quality Assurance  
**Testing Tools & Frameworks:** Jest, Supertest, Qodo (CodiumAI Methodology)  
**Authors:** Md. Raiyan & Md. Fizul Islam Yamin  
**Repository:** [https://github.com/R41YAN/smart-id-system](https://github.com/R41YAN/smart-id-system)  

---

## 1. Executive Summary & Objective

The objective of this testing strategy is to rigorously verify and validate the **Smart ID Formatting System (SIFS)**. SIFS is a multi-tenant university admission platform featuring a dual-model institutional ID generation engine:
1. **Open-Credit System:** `[Dept][YY][SemCode][Serial]` (e.g., `CSE26FL012` for Fall intake)
2. **Close-Credit System:** `[Dept][Batch][YY][Serial]` (e.g., `CSE5426012` for 54th Batch)

The testing process adheres strictly to the 4-step QA lifecycle mandated in the course guidelines:
* **Step 1 (Attempt):** Design unit test cases for the core engine using **Equivalence Partitioning (EP)** and **Boundary Value Analysis (BVA)**, and write integration tests for critical end-to-end user journeys (Authentication and Concurrency-Safe Student Admission).
* **Step 2 (Refine):** Explore AI-driven edge cases (Qodo/CodiumAI methodology) testing parameter safety, whitespace handling, and structural integrity.
* **Step 3 (Deepen):** Uncover defect categories across logic, input sanitization, and concurrency boundaries.
* **Step 4 (Verify):** Resolve discovered defects, achieve full pass rates, and justify code coverage.

---

## 2. Test Architecture & Methodology

All test cases implement the standard **AAA (Arrange, Act, Assert)** pattern:
* **Arrange:** Set up preconditions, test variables, credentials, and mock/live database states.
* **Act:** Invoke the target unit function or dispatch HTTP requests using `supertest(app)`.
* **Assert:** Verify expected outputs, return types, HTTP status codes, and database state transitions.

```
       ┌────────────────────────────────────────────────────────┐
       │             SIFS Testing Strategy Architecture         │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│     Unit Testing Layer        │           │   Integration Testing Layer   │
├───────────────────────────────┤           ├───────────────────────────────┤
│ • Equivalence Partitioning    │           │ • Authentication Flow         │
│ • Boundary Value Analysis     │           │ • SQL Injection Defense       │
│ • Edge Cases (Qodo/CodiumAI)  │           │ • RBAC & Tenant Isolation     │
│ • AAA (Arrange, Act, Assert)  │           │ • Sequential Student Admission│
└───────────────────────────────┘           └───────────────────────────────┘
```

---

## 3. Test Cases Specification & Execution Table

The following master test execution matrix documents all 34 automated test cases executed across unit and integration suites:

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Valid Super Admin Login | User exists in DB (`superadmin@smartid.com`) | 1. Send POST `/api/auth/login`<br>2. Payload: `{ email, password: 'admin123' }` | HTTP 200, JWT token returned, role is `super_admin` | Authenticated successfully; token issued | **PASS** |
| **TC_AUTH_02** | Invalid Password Attempt | User exists in DB | 1. Send POST `/api/auth/login`<br>2. Payload: `{ email, password: 'wrong' }` | HTTP 401, error message "Invalid credentials" | HTTP 401 returned; access blocked | **PASS** |
| **TC_AUTH_03** | Empty Login Credentials | App is running | 1. Send POST `/api/auth/login`<br>2. Blank email/password | HTTP 400, "email and password are required" | HTTP 400 validation error returned | **PASS** |
| **TC_AUTH_04** | SQL Injection Attack Check | App is running | 1. Send POST `/api/auth/login`<br>2. Email: `' OR 1=1 --` | HTTP 401, parameterized query sanitizes input; no crash | HTTP 401; safely denied without execution | **PASS** |
| **TC_AUTH_05** | Protected Route Access | Valid JWT token acquired | 1. Send GET `/api/auth/me`<br>2. Include `Bearer <token>` header | HTTP 200, authenticated user payload returned | Profile returned with email & role | **PASS** |
| **TC_AUTH_06** | Unauthorized Request | Request without token | 1. Send GET `/api/auth/me`<br>2. No Auth header | HTTP 401, access denied | HTTP 401 Unauthorized | **PASS** |
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

## 5. Code Coverage Report

Test suite executed using `jest --runInBand --detectOpenHandles --forceExit --coverage`:

```
--------------------------|---------|----------|---------|---------|------------------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s            
--------------------------|---------|----------|---------|---------|------------------------------
All files                 |   57.06 |    35.66 |   29.03 |   59.14 |                              
 backend                  |   71.87 |       25 |       0 |   71.87 | 21,33,38-39,44,47,51-53      
  index.js                |   71.87 |       25 |       0 |   71.87 |                              
 backend/controllers      |   40.45 |    25.68 |   27.77 |   42.64 |                              
  authController.js       |   56.52 |    42.85 |      50 |   57.77 | 8-27,58-59,73,79-87          
  batchController.js      |   34.14 |      7.4 |   33.33 |      35 | 12-13,15-16,22,27-52,57-64   
  departmentController.js |   19.23 |        0 |       0 |   21.73 | 4-14,19-31,36-40             
  studentController.js    |   58.73 |    54.83 |   66.66 |    62.5 | 30,68-106,113-117            
  universityController.js |    15.9 |        0 |       0 |    17.5 | 4-17,22-27,32-43,48-57,62-70 
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
--------------------------|---------|----------|---------|---------|------------------------------
Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        4.048 s
```

* **Core ID Generator Engine (`idGenerator.js`):** **100% Statements, 100% Branch, 100% Functions, 100% Lines.**
* **All Backend Routes:** **100% Statements, 100% Lines.**
* **Overall Test Result:** **34 passed, 0 failed.**

---

## 6. How to Run the Tests

To execute the test suites and generate coverage reports locally:

```bash
# Navigate to the backend directory
cd backend

# 1. Run all unit and integration tests
npm test

# 2. Run test suite with full code coverage breakdown
npm run test:coverage

# 3. Run individual test suites
npm test tests/unit/idGenerator.test.js
npm test tests/integration/auth.test.js
npm test tests/integration/studentAdmission.test.js
npm test tests/unit/edgeCases.test.js
```
