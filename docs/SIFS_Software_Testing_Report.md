# Software Test Report
**Test plan, test cases and results (based on ISO/IEC/IEEE 29119-3)**

**Course:** Software Project Design and Development (CSE 416)  
**Project Title:** Smart ID Formatting System (SIFS)  
**Team ID:** Batch: CSE-54, Section: 7B1  
**Authors & Team Roles:**  
- **Md. Raiyan** (ID: 0432320005101101) — Backend Architecture, ID Engine, Security & Test Lead  
- **Md. Fizul Islam Yamin** (ID: 0432320005101114) — Frontend, UI/UX, Component Architecture & Documentation  
**Course Instructor:** Dr. Mahfida Amjad Dipa  
**Testing Tools & Frameworks:** Jest, Supertest, Vitest, React Testing Library, Qodo (CodiumAI Methodology)  
**Repository:** [https://github.com/R41YAN/smart-id-system](https://github.com/R41YAN/smart-id-system)  
**Date of Submission:** 14 November 2026 (Updated with Features v1.4 — Enterprise Security Hardening, Multi-Tenant IDOR Shields, Monotonic Deadlock Safety & Role-Separated Recycle Bin)  

---

## 1. Executive Summary & Objective

The objective of this comprehensive testing strategy is to rigorously verify and validate the **Smart ID Formatting System (SIFS)** across both its backend generation engine and its modern frontend user interface.

SIFS is an enterprise multi-tenant university admission and digital student credential platform featuring a dual-model institutional ID generation engine:
1. **Open-Credit System:** `[Dept][YY][SemCode][Serial]` (e.g., `CSE26FL012` for Fall intake)
2. **Close-Credit System:** `[Dept][Batch][YY][Serial]` (e.g., `CSE5426012` for 54th Batch)

### Scope of Newly Added Features & Enhancements (v1.4 - Enterprise Hardening):
* **Multi-Tenant IDOR & RBAC Security Suite (19 Tests, `SEC_01`–`SEC_19`):** Comprehensive row-level authorization validation ensuring client admins of one university cannot delete, modify, or read records (students, batches, departments, universities) of another institution. Validates cross-tenant batch creation guards, soft-deleted batch enrollment locks, and leaked credential refusal.
* **Monotonic Serial Counter & Deadlock Safety:** Replaced fragile "recalibration" decrements with forward-only monotonic counters protected by compound `UNIQUE(batch_id, serial_number)` database constraints, guaranteeing that student deletions never trigger duplicate ID collisions or enrollment deadlocks.
* **Clean Role-Separated Recycle Bin & University Tenant Recovery:** Super Admin Recycle Bin strictly isolates university tenant decommissioning/restoration with zero exposure to campus student rosters, eliminating catastrophic cross-tenant purging risks.
* **CSV Formula Injection Shield (`csv.js`):** Enforces RFC 4180 prefix sanitization (escaping `=`, `+`, `-`, `@` with single quotes) preventing remote command execution in Microsoft Excel and LibreOffice upon roster export.
* **Login Brute-Force Rate Limiter:** Enforces IP and tenant credential throttling (HTTP `429 Too Many Requests`) against automated dictionary attacks.
* **Isolated Multi-Database Test Harness (`sifs_test`):** Complete isolation between live production/demo databases (`postgres`) and automated integration test runs (`sifs_test`), guaranteeing zero data loss during automated test execution.

---

## 2. Test Architecture & Methodology

All test cases implement the standard **AAA (Arrange, Act, Assert)** pattern:
* **Arrange:** Set up preconditions, test variables, credentials, and mock/live database states.
* **Act:** Invoke the target unit function, dispatch HTTP requests (`supertest`), or simulate user interaction (`@testing-library/react`).
* **Assert:** Verify expected outputs, return types, HTTP status codes, and reactive DOM states.

```text
       ┌─────────────────────────────────────────────────────────────┐
       │             SIFS Automated Test Suite Architecture          │
       │                   89 Total Automated Tests                  │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
         ┌────────────────────────────┴──────────────────────────────┐
         ▼                                                           ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│       Backend Test Suite        │             │       Frontend Test Suite       │
│  (Jest + Supertest — 61 Tests)  │             │   (Vitest + RTL — 28 Tests)     │
├─────────────────────────────────┤             ├─────────────────────────────────┤
│ • Core ID Engine Unit (17)      │             │ • Login UI & Error States (4)   │
│ • Edge Cases & Bounds (6)       │             │ • Interactive Live ID Card (4)  │
│ • Security & IDOR Suite (19)    │             │ • Student Directory Modals (6)  │
│ • Student Admission Flow (7)    │             │ • Recycle Bin & Recovery (3)    │
│ • Auth & Token Hardening (6)    │             │ • Digital ID Barcodes (2)       │
│ • Departments & Branding (4)    │             │ • Print & Avatar Lifecycles (3) │
│ • Bulk CSV & Trash Pipeline (2) │             │ • Dynamic File Naming (3)       │
│                                 │             │ • CSV Injection Defense (3)     │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 3. Master Test Cases Specification & Execution Table (89 Tests)

The following master test execution matrix documents all **89 automated test cases** executed across backend (61 tests) and frontend (28 tests) suites:

### Part A: Frontend UI & Helper Test Cases (Vitest + React Testing Library — 28 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_UI_AUTH_01** | Login Form Rendering | User on `/login` | 1. Render `<Login />` | Title, email/password inputs, and Sign In button visible | All elements rendered cleanly | **PASS** |
| **TC_UI_AUTH_02** | Input Value Updates | User on `/login` | 1. Type into Email & Password inputs | Input state updates to match typed string | Inputs reflect typed values | **PASS** |
| **TC_UI_AUTH_03** | Failed Login Alert Box | User on `/login` | 1. Enter invalid credentials<br>2. Submit form | API error displayed in red alert box | "Invalid credentials" alert shown | **PASS** |
| **TC_UI_AUTH_04** | Form Loading State | Form submitted | 1. Click submit button | Button text switches to "Authenticating..." and disables | Spinner shown and button disabled | **PASS** |
| **TC_UI_ADM_01** | Admission Form & Card Layout | Client Admin logged in | 1. Render `<AdmitStudent />` | Form on left and Digital Student ID Card on right visible | Split-screen UI rendered | **PASS** |
| **TC_UI_ADM_02** | Live Dynamic Name Typing | User on `/admin/admit` | 1. Type "Nusrat Jahan" in Full Name | ID Card preview on right updates live | Card live-updated in real-time | **PASS** |
| **TC_UI_ADM_03** | ID Format Preview Sync | User on `/admin/admit` | 1. Select Dept & Batch | ID Card preview updates format code (e.g. `CSE26FL•••`) | Format code rendered accurately | **PASS** |
| **TC_UI_ADM_04** | Admission Success Reveal | Form submitted with valid data | 1. Submit valid student data | Real generated ID revealed on card with print options | Card reveals issued ID | **PASS** |
| **TC_UI_LIST_01** | Student Directory Display | Students exist in DB | 1. Render `<StudentList />` | Displays student ID badge in monospace, name, department | Student records displayed | **PASS** |
| **TC_UI_LIST_02** | Directory Action Buttons | Records present | 1. Inspect action bar | "Export CSV" and "Print / PDF" buttons exist & enabled | Action buttons rendered | **PASS** |
| **TC_UI_LIST_03** | Directory Empty State | No students in DB | 1. Render directory with empty list | "No students enrolled yet" empty state message shown | Empty state rendered cleanly | **PASS** |
| **TC_UI_LIST_04** | View Modal Open | Student row visible | 1. Click "View ID Card" | Option B Modal opens displaying full digital credential | Modal rendered with student card | **PASS** |
| **TC_UI_LIST_05** | View Modal Dismiss | View modal open | 1. Click "Close" button | Modal dismisses cleanly and unmounts from DOM | Modal unmounted cleanly | **PASS** |
| **TC_UI_LIST_06** | A4 Batch Sheet Print Grid | Multiple students enrolled | 1. Click "Print A4 Sheet" in directory | Renders 2x4 CR-80 industrial grid with perimeter cut guidelines | Batch print modal rendered | **PASS** |
| **TC_UI_BARCODE_01** | Code 128 Barcode Rendering | Barcode component loaded | 1. Pass `value="CSE26FL001"` to `<Barcode />` | Generates SVG element with valid Code 128 bars | Rendered SVG barcode | **PASS** |
| **TC_UI_BARCODE_02** | Barcode Null Value Safety | Barcode component loaded | 1. Pass `value=""` or `null` | Gracefully returns `null` without throwing DOM exception | No errors thrown; returns null | **PASS** |
| **TC_UI_CARD_01** | University Logo Rendering | Student card rendered | 1. Pass `university_logo` base64/URL | Displays custom university logo image; falls back to icon | Logo rendered with fallback | **PASS** |
| **TC_UI_CARD_02** | Silhouette Avatar Fallback | Student has no photo | 1. Render card with `photo: null` | Displays neutral slate silhouette avatar with "PHOTO" label | Silhouette placeholder shown | **PASS** |
| **TC_UI_CARD_03** | Student Photo Object-Fit | Student has valid photo | 1. Render card with base64 image | Image rendered with `object-fit: cover` and center alignment | Photo rendered without distortion | **PASS** |
| **TC_UI_TRASH_01** | Recycle Bin Page & Tabs | User on `/recycle-bin` | 1. Render `<RecycleBin />` | Displays title, subtitle, and role-appropriate entity tabs | Page and entity tabs rendered | **PASS** |
| **TC_UI_TRASH_02** | Deleted Records Display | Soft-deleted records exist | 1. Select Students tab | Displays student ID, full name, timestamp, Restore/Delete | Deleted student rows rendered | **PASS** |
| **TC_UI_TRASH_03** | Restore Action Dispatch | Deleted record visible | 1. Click "Restore" button | Dispatches `POST /api/trash/restore` and removes row | Restore API invoked with ID | **PASS** |
| **TC_UI_EXPORT_01** | University Acronym Resolver | `exportHelpers.js` loaded | 1. Pass institutional names | Resolves standard short acronyms (UIU, DU, UITS, NSU, MU) | Acronyms matched accurately | **PASS** |
| **TC_UI_EXPORT_02** | Batch / Intake Slug Formatter | `exportHelpers.js` loaded | 1. Pass batch/intake metadata | Formats `54(2026)` for close-credit and `SP'26` for open-credit | Formatted slugs generated | **PASS** |
| **TC_UI_EXPORT_03** | Dynamic File Naming Builder | `exportHelpers.js` loaded | 1. Pass uni, dept, batch, context | Formats `SIFS - [Uni]_[Dept]_[Batch]_[Context]` dynamically | Institutional filenames matched | **PASS** |
| **TC_UI_CSV_01** | CSV Injection: Equals Sign | `csv.js` loaded | 1. Escape `=CMD('calc')` string | Escapes leading `=` with single quote: `'=CMD('calc')` | Neutralized formula injection | **PASS** |
| **TC_UI_CSV_02** | CSV Injection: Dangerous Ops | `csv.js` loaded | 1. Escape `+cmd`, `-cmd`, `@cmd` | Escapes leading `+`, `-`, `@` with single quote | All dangerous operators escaped | **PASS** |
| **TC_UI_CSV_03** | CSV Safe String Preservation | `csv.js` loaded | 1. Escape regular student name | Regular string returned unaltered without modification | Safe string preserved intact | **PASS** |

### Part B: Backend Integration & Security Tests (Supertest + Jest — 38 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_SEC_01** | IDOR: Cross-Tenant Student Soft-Delete | NSU Admin token | 1. DELETE `/api/students/:id` targeting UITS student | HTTP 404 Not Found (tenant-isolated) | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_02** | IDOR: Cross-Tenant Permanent Delete | NSU Admin token | 1. DELETE `/api/trash/permanent` targeting UITS record | HTTP 404 Not Found | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_03** | IDOR: Cross-Tenant Trash Restore | NSU Admin token | 1. POST `/api/trash/restore` targeting UITS trash record | HTTP 404 Not Found | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_04** | IDOR: Cross-Tenant Batch Delete | NSU Admin token | 1. DELETE `/api/batches/:id` targeting UITS batch | HTTP 404 Not Found | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_05** | IDOR: Cross-Tenant Department Delete | NSU Admin token | 1. DELETE `/api/departments/:id` targeting UITS dept | HTTP 404 Not Found | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_06** | IDOR: Cross-Tenant Batch Creation | NSU Admin token | 1. POST `/api/batches` targeting UITS department | HTTP 404 Not Found | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_07** | IDOR: Mismatched Department University | Client Admin token | 1. POST `/api/batches` with mismatched dept university | HTTP 404 Not Found | HTTP 404 Rejected | **PASS** |
| **TC_SEC_08** | Intake Guard: Soft-Deleted Batch | Client Admin token | 1. POST `/api/students` targeting soft-deleted batch | HTTP 409 Conflict ("Cannot admit to soft-deleted batch") | HTTP 409 Conflict | **PASS** |
| **TC_SEC_09** | Batch/Department Integrity Guard | Client Admin token | 1. POST `/api/students` with batch from different dept | HTTP 400 Bad Request ("Batch does not belong to dept") | HTTP 400 Rejected | **PASS** |
| **TC_SEC_10** | Tenant Query Isolation on Batches | Client Admin token | 1. GET `/api/batches?department_id=X` for another uni | Scoped strictly to caller's university; returns 0 records | Zero cross-tenant leakage | **PASS** |
| **TC_SEC_11** | IDOR: Cross-Tenant University Read | Client Admin token | 1. GET `/api/universities/:id` targeting other uni | HTTP 404 Not Found | HTTP 404 Forbidden IDOR | **PASS** |
| **TC_SEC_12** | RBAC: University Creation by Client Admin | Client Admin token | 1. POST `/api/universities` with client admin credentials | HTTP 403 Forbidden ("Super Admin access required") | HTTP 403 Forbidden | **PASS** |
| **TC_SEC_13** | RBAC: University Deletion by Client Admin | Client Admin token | 1. DELETE `/api/universities/:id` with client admin | HTTP 403 Forbidden ("Super Admin access required") | HTTP 403 Forbidden | **PASS** |
| **TC_SEC_14** | Privilege Escalation: Super Admin Creation | Client Admin token | 1. POST `/api/auth/register` with `role: super_admin` | HTTP 403 Forbidden ("Cannot create super_admin") | HTTP 403 Forbidden | **PASS** |
| **TC_SEC_15** | Monotonic Counter: Trailing Student Delete | 2 students admitted | 1. Delete student 2 (serial 002) | Batch `current_serial` remains 2 (forward-only monotonic) | Counter preserved at 2 | **PASS** |
| **TC_SEC_16** | Monotonic Counter: Deadlock-Free Enrollment | Student 2 in trash | 1. Enroll new student into batch | Generates serial 003 (`...003`) with zero duplicate collision | Issued ID with serial 003 | **PASS** |
| **TC_SEC_17** | JWT Hardening: Leaked Secret Rejection | Forged token | 1. Sign token with leaked secret string | HTTP 401 Unauthorized ("Invalid or expired token") | HTTP 401 Rejected | **PASS** |
| **TC_SEC_18** | Rate Limiting: Brute-Force Throttling | Multiple requests | 1. Dispatch 6 consecutive bad login attempts | 6th attempt returns HTTP 429 Too Many Requests | HTTP 429 Rate Limited | **PASS** |
| **TC_SEC_19** | Central Config: Secret Length Guard | Server startup | 1. Load config with key < 32 characters | Throws configuration error refusing startup | Startup halted safely | **PASS** |
| **TC_ADM_01** | Mandatory Field Validation | Client Admin token | 1. POST `/api/students` missing `name` | HTTP 400 with `Missing required fields` | HTTP 400 Bad Request | **PASS** |
| **TC_ADM_02** | Tenant Isolation Enforcement | NSU Admin token | 1. POST `/api/students` targeting MU batch | HTTP 403 Forbidden cross-tenant error | HTTP 403 Forbidden | **PASS** |
| **TC_ADM_03** | Non-Existent Batch Check | Client Admin token | 1. POST `/api/students` targeting batch ID 99999 | HTTP 404 Not Found error | HTTP 404 Not Found | **PASS** |
| **TC_ADM_04** | Role-Based Directory Scoping | Super & Client tokens | 1. GET `/api/students` with Client Admin vs Super Admin | Client sees only their university; Super Admin sees all | Records correctly partitioned | **PASS** |
| **TC_ADM_05** | ID Format Compliance | Enrolled students | 1. Query all issued student IDs | Match institutional regex (`^[A-Z]{2,4}[0-9]{2}[A-Z0-9]{2,4}[0-9]{3,4}$`) | 100% compliance across IDs | **PASS** |
| **TC_ADM_06** | Photo Lifecycle & Late PATCH | Enrolled student | 1. Admit with photo; late PATCH `/api/students/:id/photo` | Photo stored in DB; late update replaces image successfully | Photo updated & persisted | **PASS** |
| **TC_ADM_07** | Institutional Logo & Branding | Universities in DB | 1. Query `GET /api/universities` and `/api/students` | University roster includes `logo_url` / `university_logo` | Logo attributes exposed | **PASS** |
| **TC_DEPT_01** | Uppercase Normalization | Client Admin token | 1. POST `/api/departments` with `code: 'cse'` | Saved in DB as uppercase `CSE` | Code stored as `CSE` | **PASS** |
| **TC_DEPT_02** | Dual Field Department Support | Client Admin token | 1. POST `/api/departments` with `code` & `full_name` | Returns distinct code and full descriptive department name | Dual fields verified | **PASS** |
| **TC_DEPT_03** | Super Admin Logo Management | Super Admin token | 1. PUT `/api/universities/:id` with base64 logo | Logo saved; returns HTTP 200 with updated university record | Logo successfully stored | **PASS** |
| **TC_DEPT_04** | Cross-Tenant Logo Protection | Client Admin token | 1. PUT `/api/universities/:id` targeting other university | HTTP 403 Forbidden access denied | HTTP 403 Forbidden | **PASS** |
| **TC_AUTH_01** | Valid Super Admin Login | Valid credentials | 1. POST `/api/auth/login` with Super Admin credentials | HTTP 200, JWT token, role: 'super_admin' | Token & role returned | **PASS** |
| **TC_AUTH_02** | Invalid Password Rejection | Wrong password | 1. POST `/api/auth/login` with bad password | HTTP 401 Unauthorized with generic error message | HTTP 401 Unauthorized | **PASS** |
| **TC_AUTH_03** | Blank Field Validation | Empty fields | 1. POST `/api/auth/login` with blank email/password | HTTP 400 Bad Request with field validation errors | HTTP 400 Bad Request | **PASS** |
| **TC_AUTH_04** | SQL Injection Immunity | Malicious payload | 1. POST `/api/auth/login` with `' OR '1'='1` in email | SQL query parameterized; rejected with HTTP 401 | Injection neutralized | **PASS** |
| **TC_AUTH_05** | Protected Route Authentication | Valid Bearer token | 1. GET `/api/auth/me` with valid authorization header | Returns authenticated user profile, university, and role | User profile returned | **PASS** |
| **TC_AUTH_06** | Missing Token Rejection | No token provided | 1. GET `/api/auth/me` without authorization header | HTTP 401 Unauthorized ("No token provided") | HTTP 401 Rejected | **PASS** |
| **TC_BULK_01** | Concurrency-Safe Bulk CSV Admission | Valid CSV payload | 1. POST `/api/students/bulk` with multiple student rows | Enrolls in atomic transaction; serial numbers increment sequentially | Sequential IDs generated | **PASS** |
| **TC_TRASH_01** | Recycle Bin Soft-Delete & Restore | Enrolled student | 1. DELETE student; verify in `/api/trash`; POST restore | Record soft-deleted, visible in trash, restored to active list | Full recovery verified | **PASS** |

### Part C: Backend Unit Test Cases (Jest — 23 Tests)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_UNIT_EP01** | Open Credit: Spring Intake | Valid parameters | 1. Generate Open-Credit with Spring (code: 1, year: 2026, serial: 12) | Formats `CSE26SP012` | `CSE26SP012` | **PASS** |
| **TC_UNIT_EP02** | Open Credit: Summer Intake | Valid parameters | 1. Generate Open-Credit with Summer (code: 2, year: 2025, serial: 45) | Formats `EEE25SM045` | `EEE25SM045` | **PASS** |
| **TC_UNIT_EP03** | Open Credit: Fall Intake | Valid parameters | 1. Generate Open-Credit with Fall (code: 3, year: 2026, serial: 7) | Formats `BBA26FL007` | `BBA26FL007` | **PASS** |
| **TC_UNIT_EP04** | Close Credit: Cohort Formatting | Valid parameters | 1. Generate Close-Credit (dept: 'CSE', batch: 54, year: 2026, serial: 12) | Formats `CSE5426012` | `CSE5426012` | **PASS** |
| **TC_UNIT_EP05** | Unsupported University Type | Invalid type | 1. Pass `universityType: 'hybrid_credit'` | Throws `Unknown university type: hybrid_credit` | Error thrown cleanly | **PASS** |
| **TC_UNIT_EP06** | Out-of-Range Semester Index | Invalid index | 1. Pass `semesterIndex: 4` (or 0) | Throws `Invalid semester index: 4` | Error thrown cleanly | **PASS** |
| **TC_UNIT_EP07** | Lowercase Department Normalization | Lowercase code | 1. Pass `department: 'cse'` | Auto-uppercased to `CSE` in output ID | Uppercase normalized | **PASS** |
| **TC_UNIT_BVA01** | Minimum Serial Boundary | Serial = 1 | 1. Format serial 1 | Padded with two leading zeros to `001` | Padded to `001` | **PASS** |
| **TC_UNIT_BVA02** | Single-to-Double Transition | Serial = 9 and 10 | 1. Format serial 9 and serial 10 | Formats to `009` and `010` respectively | `009` and `010` | **PASS** |
| **TC_UNIT_BVA03** | Double-to-Triple Transition | Serial = 99 and 100 | 1. Format serial 99 and serial 100 | Formats to `099` and `100` respectively | `099` and `100` | **PASS** |
| **TC_UNIT_BVA04** | Maximum 3-Digit Boundary | Serial = 999 | 1. Format serial 999 | Formats to `999` without overflow or truncation | `999` formatted | **PASS** |
| **TC_UNIT_BVA05** | 4-Digit Overflow Handling | Serial = 1000 | 1. Format serial 1000 | Preserves full 4-digit token `1000` without truncation | `1000` preserved | **PASS** |
| **TC_UNIT_BVA06** | Century Year Boundary | Year = 2000 | 1. Pass year 2000 | Slices last two digits to `00` | Year token `00` | **PASS** |
| **TC_UNIT_BVA07** | Future Year Boundary | Year = 2099 | 1. Pass year 2099 | Slices last two digits to `99` | Year token `99` | **PASS** |
| **TC_UNIT_BVA08** | Single-Digit Batch Cohort | Batch = 1 | 1. Pass batchNumber = 1 in Close-Credit | Generates `CSE126001` without false zero padding | Batch 1 formatted | **PASS** |
| **TC_UNIT_BVA09** | Triple-Digit Batch Cohort | Batch = 100 | 1. Pass batchNumber = 100 in Close-Credit | Generates `CSE10026001` preserving all digits | Batch 100 formatted | **PASS** |
| **TC_UNIT_CONST** | Semester Mapping Constants | Module loaded | 1. Verify `SEMESTER_MAP` constant | Maps exactly `{ 1: 'SP', 2: 'SM', 3: 'FL' }` | Constants validated | **PASS** |
| **TC_EDGE_01** | Department Whitespace Trimming | Padded whitespace | 1. Pass `department: '  CSE  '` | Trims leading and trailing whitespace cleanly | `CSE` formatted | **PASS** |
| **TC_EDGE_02** | Missing Department Validation | Null department | 1. Pass `department: null` or `undefined` | Throws `Department code is required` | Error thrown cleanly | **PASS** |
| **TC_EDGE_03** | Missing Batch in Close-Credit | Missing batch | 1. Pass Close-Credit with `batchNumber: null` | Throws `Batch number is required for close-credit` | Error thrown cleanly | **PASS** |
| **TC_EDGE_04** | Non-Positive Serial Validation | Serial <= 0 | 1. Pass `serialNumber: 0` or `-5` | Throws `Serial number must be a positive integer` | Error thrown cleanly | **PASS** |
| **TC_EDGE_05** | Numeric String Serial Conversion | String serial | 1. Pass `serialNumber: '42'` | Auto-parses to integer `42` and formats `042` | Formats `042` | **PASS** |
| **TC_EDGE_06** | Multi-Character Department Codes | Varying lengths | 1. Pass codes `SWE`, `BBA`, `THM` | Formatted cleanly without truncating letters | Full codes preserved | **PASS** |

---

## 4. Requirements Traceability Matrix (RTM)

| Req ID | Requirement Description | Mapped Automated Test Cases | Status |
| :---: | :--- | :--- | :---: |
| **FR-01** | Super Admin & University Admin authentication & JWT token issuance | TC_AUTH_01, TC_AUTH_03, TC_UI_AUTH_01, TC_UI_AUTH_02 | **PASS** |
| **FR-02** | Authentication failure handling & structured error feedback | TC_AUTH_02, TC_UI_AUTH_03 | **PASS** |
| **FR-03** | Protected route authorization & current user profile retrieval | TC_AUTH_05, TC_AUTH_06 | **PASS** |
| **FR-06** | Department uppercase normalization & code preservation | TC_UNIT_EP07, TC_EDGE_06 | **PASS** |
| **FR-08** | Dynamic batch number formatting (single & triple digit cohorts) | TC_UNIT_BVA08, TC_UNIT_BVA09 | **PASS** |
| **FR-09** | Open-Credit ID formulation (`[Dept][YY][SemCode][Serial]`) | TC_UNIT_EP01, TC_UNIT_EP02, TC_UNIT_EP03 | **PASS** |
| **FR-10** | Close-Credit ID formulation (`[Dept][Batch][YY][Serial]`) | TC_UNIT_EP04, TC_UNIT_EP05 | **PASS** |
| **FR-11** | Serial number zero-padding (3-digit default, 4-digit expansion) | TC_UNIT_BVA01, TC_UNIT_BVA02, TC_UNIT_BVA03, TC_UNIT_BVA04, TC_UNIT_BVA05 | **PASS** |
| **FR-12** | Academic century and millennium year formulation | TC_UNIT_BVA06, TC_UNIT_BVA07 | **PASS** |
| **FR-13** | Deterministic unique serial allocation | TC_ADM_05, TC_UI_ADM_01 | **PASS** |
| **FR-14** | Input sanitization & department whitespace trimming | TC_EDGE_01, TC_UNIT_EP07 | **PASS** |
| **FR-15** | Null & undefined input safety handling | TC_EDGE_02, TC_EDGE_03 | **PASS** |
| **FR-16** | Positive serial constraint enforcement (> 0) | TC_EDGE_04, TC_UNIT_BVA01 | **PASS** |
| **FR-17** | String-to-number serial conversion robustness | TC_EDGE_05 | **PASS** |
| **FR-18** | Semester mapping constants integrity | TC_UNIT_EP06, TC_UNIT_CONST | **PASS** |
| **FR-19** | Student admission mandatory field validation | TC_ADM_01, TC_UI_ADM_01 | **PASS** |
| **FR-20** | Cross-tenant admission isolation enforcement | TC_ADM_02, TC_ADM_04, TC_SEC_01 | **PASS** |
| **FR-21** | Invalid batch reference rejection (404) | TC_ADM_03 | **PASS** |
| **FR-22** | Live reactive ID card interactive preview | TC_UI_ADM_02, TC_UI_ADM_03, TC_UI_ADM_04 | **PASS** |
| **FR-23** | Student roster display & monospaced ID formatting | TC_UI_LIST_01 | **PASS** |
| **FR-24** | Roster action bar & CSV / PDF print triggers | TC_UI_LIST_02 | **PASS** |
| **FR-25** | Roster empty state rendering | TC_UI_LIST_03 | **PASS** |
| **FR-26** | Phone-Scannable Code 128 Barcode generation | TC_UI_BARCODE_01, TC_UI_BARCODE_02 | **PASS** |
| **FR-27** | Student photo management & late upload PATCH | TC_ADM_06, TC_UI_CARD_02, TC_UI_CARD_03 | **PASS** |
| **FR-28** | Option B "View / Print ID Card" modal in directory | TC_UI_LIST_04, TC_UI_LIST_05 | **PASS** |
| **FR-29** | Dual department fields (Full Name + Code) | TC_DEPT_01, TC_DEPT_02 | **PASS** |
| **FR-30** | Institutional university logos & multi-tenant branding | TC_ADM_07, TC_DEPT_03, TC_DEPT_04, TC_UI_CARD_01 | **PASS** |
| **FR-31** | Bulk Student Admission via CSV under batch row locks | TC_BULK_01 | **PASS** |
| **FR-32** | Recycle Bin soft delete, restore & recovery | TC_TRASH_01, TC_UI_TRASH_01, TC_UI_TRASH_02, TC_UI_TRASH_03 | **PASS** |
| **FR-33** | Batch ID Card Sheet Print (2x4 CR-80 A4 Grid) | TC_UI_LIST_06 | **PASS** |
| **FR-34** | Dynamic institutional export & print file naming | TC_UI_EXPORT_01, TC_UI_EXPORT_02, TC_UI_EXPORT_03 | **PASS** |
| **FR-35** | Multi-Tenant IDOR and Row-Level Data Isolation Shield | TC_SEC_01, TC_SEC_02, TC_SEC_03, TC_SEC_04, TC_SEC_05, TC_SEC_06, TC_SEC_07, TC_SEC_10, TC_SEC_11 | **PASS** |
| **FR-36** | Monotonic Serial Counter & Deletion Deadlock Elimination | TC_SEC_15, TC_SEC_16 | **PASS** |
| **FR-37** | CSV Formula Injection Shield (=, +, -, @ escaping) | TC_UI_CSV_01, TC_UI_CSV_02, TC_UI_CSV_03 | **PASS** |
| **FR-38** | Login Brute-Force Rate Limiting (HTTP 429) | TC_SEC_18 | **PASS** |
| **FR-39** | Central Secret Key Length & Blacklist Guard | TC_SEC_17, TC_SEC_19 | **PASS** |
| **FR-40** | Clean Role-Separated Recycle Bin & University Tenant Recovery | TC_SEC_12, TC_SEC_13, TC_UI_TRASH_01 | **PASS** |

---

## 5. Automated Test Execution Evidence & Terminal Logs

### Backend Suite Execution (Jest + Supertest — 61 Tests Passed across 7 Suites)
```text
> smart-id-system-backend@1.0.0 test
> jest --runInBand --detectOpenHandles --forceExit

 PASS  integration  tests/integration/security.test.js (19 tests)
 PASS  integration  tests/integration/bulkAndTrash.test.js (2 tests)
 PASS  integration  tests/integration/studentAdmission.test.js (7 tests)
 PASS  integration  tests/integration/departmentsAndBranding.test.js (4 tests)
 PASS  integration  tests/integration/auth.test.js (6 tests)
 PASS  unit         tests/unit/idGenerator.test.js (17 tests)
 PASS  unit         tests/unit/edgeCases.test.js (6 tests)

Test Suites: 7 passed, 7 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        27.614 s, estimated 28 s
Ran all test suites in 2 projects.
```

### Frontend Suite Execution (Vitest + React Testing Library — 28 Tests Passed across 8 Suites)
```text
> frontend@0.0.0 test
> vitest run

 RUN  v5.0.5 D:/smart-id-system/frontend

 ✓ src/utils/__tests__/csv.test.js (3 tests) 4ms
 ✓ src/utils/__tests__/exportHelpers.test.js (3 tests) 4ms
 ✓ src/components/__tests__/Barcode.test.jsx (2 tests) 31ms
 ✓ src/components/__tests__/StudentIdCard.test.jsx (3 tests) 84ms
 ✓ src/pages/__tests__/Login.test.jsx (4 tests) 231ms
 ✓ src/pages/__tests__/AdmitStudent.test.jsx (4 tests) 394ms
 ✓ src/pages/__tests__/RecycleBin.test.jsx (3 tests) 331ms
 ✓ src/pages/__tests__/StudentList.test.jsx (6 tests) 626ms

 Test Files  8 passed (8)
      Tests  28 passed (28)
   Start at  18:56:46
   Duration  2.81s
```

### Master Test Execution Summary
$$\text{Total Automated Tests: } 89 \quad\Big|\quad \text{Passed: } 89 \quad\Big|\quad \text{Failed: } 0 \quad (\mathbf{100\% \text{ Pass Rate}})$$

---

## 6. Test Execution Results & Summary

### 6.1 Summary by Test Layer

| Level / Layer | Runs | Passed | Failed | Pass % |
| :--- | :---: | :---: | :---: | :---: |
| **Unit** (Core ID Generator Engine & Boundary Values) | 23 | 23 | 0 | 100% |
| **Integration & Security** (API Auth, Admission, Multi-Tenant IDOR, Bulk & Trash) | 38 | 38 | 0 | 100% |
| **Component / UI & Helpers** (React 19 UI, Modals, A4 Sheet Print, CSV Injection) | 28 | 28 | 0 | 100% |
| **Total Full-Stack Suite** | **89** | **89** | **0** | **100%** |

---

## 7. Defect Log & Remediation Matrix (Critical Issues Resolved)

| Defect ID | Defect Summary & Root Cause | Severity | Remediation & Refactoring Strategy Applied | Status |
| :---: | :--- | :---: | :--- | :---: |
| **D01** | **Race Condition in Parallel Admissions:** Concurrent admission requests targeting the same batch generated duplicate serial numbers. | **CRITICAL** | Wrapped admission routine in an ACID transaction with `SELECT * FROM batches WHERE id=$1 FOR UPDATE` pessimistic row-locking. | **RESOLVED** |
| **D07** | **Serial Desynchronization on Delete:** Deleting trailing students lowered the counter ("recalibration"), causing duplicate ID deadlocks on subsequent enrollments. | **HIGH** | Replaced recalibration with monotonic forward-only counters and added compound `UNIQUE(batch_id, serial_number)` database constraint. | **RESOLVED** |
| **D14** | **Print Background Degradation:** Browser print dialog stripped dark navy card header bands to plain white. | **MEDIUM** | Injected `-webkit-print-color-adjust: exact !important` globally and on all credential header card DOM nodes. | **RESOLVED** |
| **D22** | **CSV Export Photo String Pollution:** Exporting student directory populated CSV rows with megabyte-long Base64 strings. | **MEDIUM** | Sanitized export schema to exclude raw photo strings from student rosters while preserving photo URLs in bulk admission templates. | **RESOLVED** |
| **D31** | **Multi-Tenant IDOR Vulnerability:** Client Admins could delete or restore records of other universities by passing arbitrary record IDs. | **CRITICAL** | Implemented centralized tenant validation middleware (`tenant.js`) verifying ownership on every record mutation. | **RESOLVED** |
| **D32** | **CSV Formula Injection:** Leading dangerous formula operators (`=`, `+`, `-`, `@`) in student rosters could trigger remote code execution in spreadsheet software. | **HIGH** | Built `csv.js` sanitizer escaping dangerous leading characters with single quotes prior to export. | **RESOLVED** |
| **D33** | **Leaked Credentials in Version Control:** Hardcoded Supabase and JWT secrets in source code files. | **CRITICAL** | Built `config.js` central configuration refusing server startup if leaked secrets are detected or key length < 32 characters. | **RESOLVED** |
| **D34** | **Role Pollution in Recycle Bin:** Super Admin saw students and cohorts from all universities, risking catastrophic cross-tenant purging on "Empty Recycle Bin". | **MEDIUM** | Implemented Option A Clean Role Separation: Super Admin Recycle Bin strictly manages Universities; Client Admins manage campus records. | **RESOLVED** |

---

## 8. Conclusion & Sign-Off

The **Smart ID Formatting System (SIFS)** has achieved an exceptional quality standard with **89 automated tests** passing at a **100% pass rate** across all unit, integration, security, and UI component layers. All architectural defects, multi-tenant IDOR vectors, monotonic ID deadlocks, and CSV formula injection risks have been completely remediated. SIFS is production-grade, hardened, and ready for deployment and academic defense.
