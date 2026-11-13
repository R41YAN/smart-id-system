const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType
} = require('D:/ক PDF 1/7th Semester/Software Project Lab/Project/smart-id-system/backend/node_modules/docx');

const {
  FONT_PRIMARY,
  C_NAVY,
  C_BLUE,
  C_DARK,
  C_BODY,
  chapterHeading,
  sectionHeading,
  subSectionHeading,
  paragraph,
  bulletItem,
  tableCaption,
  figureCaption,
  createTable,
  diagramCard,
  screenshotPlaceholderBox
} = require('./report_helpers');

function getChapter3Children() {
  const children = [];

  children.push(
    chapterHeading('3. System Design and Methodology'),
    sectionHeading('3.1 Introduction'),
    paragraph(
      'System design translates formalized requirements into an implementable, modular, and maintainable software architecture. SIFS adopts a decoupled, multi-tiered architecture that strictly isolates presentation logic, business and algorithmic computation, and transactional data persistence. This chapter elaborates the iterative 14-week software development lifecycle (SDLC), the multi-tier system topology, technology choices, formal structural and behavioral UML models, user interface wireframes, and the engineering rationale underpinning critical architectural decisions.'
    ),
    sectionHeading('3.2 Development Methodology and Project Plan'),
    paragraph(
      'To manage evolving requirements and ensure rigorous continuous verification, SIFS was developed under a 14-week Agile/Iterative methodology structured into four bi-weekly sprint cycles and a final deployment hardening phase. Task tracking, user stories, and defect triage were managed via GitHub Issues and GitHub Projects boards.'
    ),
    diagramCard(
      'Fig. 3.1: 14-Week Development Timeline and Milestones (Gantt Chart Representation)',
`Wk  1-2  : Requirements Gathering, Domain Elicitation & Relational Schema Modeling  [=========]
Wk  3-4  : Core Algorithmic ID Engine & Concurrency Row-Locking Prototype         [=========]
Wk  5-6  : RESTful API Layer, Auth & Tenant Routing (Express 5 & Bcrypt)            [=========]
Wk  7-8  : React 19 Frontend Shell, 3D PVC Tilt Engine & JsBarcode Integration        [=========]
Wk  9-10 : Bulk CSV Admission Pipeline, Asynchronous Validation & Photo Fallback        [=========]
Wk 11-12 : Batch A4 Sheet Print Engine, Recycle Bin & Serial Recalibration                [=========]
Wk 13-14 : Automated QA Hardening (67/67 Tests), CI/CD Pipeline & Final Deployment           [=========]
---------------------------------------------------------------------------------------------------------
Milestones:  M1: Architecture Signoff  ->  M2: ACID Engine  ->  M3: UI Sync  ->  M4: Production Release`,
      'The 14-week iterative schedule ensured that concurrency control and database transaction primitives were validated in the early sprints before building the frontend presentation layers.'
    ),
    figureCaption('Fig. 3.1. 14-week iterative development timeline and milestone roadmap (Gantt Chart).'),
    sectionHeading('3.3 System Architecture and Technology Stack'),
    paragraph(
      'SIFS is structured into a four-tier decoupled architecture: Presentation Tier, API Gateway & Security Tier, Domain & Business Logic Tier, and Data Persistence Tier.'
    ),
    diagramCard(
      'Fig. 3.2: SIFS Multi-Tier Component Architecture',
`+---------------------------------------------------------------------------------------+
|                                  PRESENTATION TIER                                    |
|   React 19 SPA | Vite 8 Bundler | Tailwind CSS v4 | Lucide Icons | JsBarcode Canvas   |
|   - 3D Interactive PVC Card Simulation  |  - Batch A4 Badge Sheet Layout Engine       |
|   - Bulk CSV Importer with Fallback     |  - Enterprise Multi-Tab Recycle Bin UI      |
+---------------------------------------------------------------------------------------+
                                           |  HTTPS / JSON Payloads
                                           v
+---------------------------------------------------------------------------------------+
|                             API GATEWAY & SECURITY TIER                              |
|   Node.js 24 Runtime | Express 5 Framework | CORS | Multer Ingestion | Express-Rate   |
|   - JWT Authentication Middleware       |  - Multi-Tenant university_id Scoping       |
|   - Bcrypt Salt Hashing (10 rounds)     |  - Request Body Sanitization & Limits       |
+---------------------------------------------------------------------------------------+
                                           |  Controller Routing
                                           v
+---------------------------------------------------------------------------------------+
|                            DOMAIN & BUSINESS LOGIC TIER                               |
|   - Deterministic ID Formulation Engine (Open-Credit vs Close-Credit Formatting)     |
|   - Batch Serial Allocation Service with Dynamic Pad Calculations                     |
|   - Bulk Admission CSV Ingestion & Validation Parser with Photo Fallback Pipeline     |
|   - Recycle Bin Soft-Delete Handler & Automated Batch Serial Recalibration Engine     |
+---------------------------------------------------------------------------------------+
                                           |  Pessimistic Row-Locking (SELECT FOR UPDATE)
                                           v
+---------------------------------------------------------------------------------------+
|                                DATA PERSISTENCE TIER                                  |
|   PostgreSQL 15 Database (Relational Engine with ACID Transaction Isolation)          |
|   - Universities Table (Multi-tenant root) | - Departments Table                      |
|   - Batches Table (Serial counter locks)   | - Students Table (Credential records)    |
|   - Audit Logs Table (Security trail)      | - Soft-Delete Tombstones (deleted_at)    |
+---------------------------------------------------------------------------------------+`,
      'The layered architecture ensures that client presentation concerns cannot bypass transactional locking rules in the data persistence tier, guaranteeing strict data integrity.'
    ),
    figureCaption('Fig. 3.2. SIFS multi-tier component architecture.'),
    tableCaption('Table 3.1. Technology Stack and Selection Rationale'),
    createTable(
      ['Layer / Component', 'Selected Technology', 'Version', 'Engineering Selection Rationale'],
      [
        ['Client Framework', 'React / React DOM', 'v19.0.0', 'Modern declarative component model with seamless state management and sub-millisecond DOM reconciliation.'],
        ['Build Tooling', 'Vite', 'v8.0.0', 'Instant Hot Module Replacement (HMR) and highly optimized ES-module bundling for rapid development cycles.'],
        ['CSS Framework', 'Tailwind CSS', 'v4.0.0', 'Utility-first styling with native CSS variable support and strict print-media query isolation for physical badge rendering.'],
        ['Iconography', 'Lucide React', 'v0.454.0', 'Clean, tree-shakeable SVG icon set for modern institutional user interface controls.'],
        ['Barcode Engine', 'JsBarcode', 'v3.11.6', 'High-precision, vector-accurate Code 128 barcode rendering directly on HTML5 Canvas elements.'],
        ['Backend Runtime', 'Node.js', 'v24.21.0', 'Non-blocking, asynchronous event-driven I/O ideal for handling concurrent institutional admission requests.'],
        ['Web Framework', 'Express.js', 'v5.0.0', 'Lightweight, robust HTTP routing engine with native asynchronous error-handling middleware.'],
        ['Authentication', 'JSON Web Tokens (JWT)', 'v9.0.2', 'Stateless, cryptographically signed bearer tokens encapsulating institutional tenant claims.'],
        ['Password Security', 'BcryptJS', 'v2.4.3', 'Adaptive key derivation function using 10 salt rounds to resist brute-force cryptographic attacks.'],
        ['Relational Database', 'PostgreSQL', 'v15.0', 'Enterprise-grade relational database providing robust ACID transactions and row-level locking primitives.'],
        ['Unit/Integration Test', 'Jest & Supertest', 'v29.7.0', 'De facto industry-standard testing framework providing isolated execution environments and API mocking.'],
        ['UI Component Testing', 'Vitest & RTL', 'v3.0.0', 'Vite-native test runner with JSDOM simulation for rapid, browser-like React component testing.'],
        ['CI/CD Pipeline', 'GitHub Actions', 'v4', 'Automated cloud CI workflow executing linting, unit tests, integration tests, and build verification on push.']
      ],
      [18, 18, 10, 54]
    ),
    sectionHeading('3.4 System Models'),
    subSectionHeading('3.4.1 Use-Case Modeling'),
    paragraph(
      'The SIFS functional scope spans four primary actors: Super Administrator, Client University Administrator, Admission Officer, and Student. Fig. 3.3 illustrates the actor-to-use-case relationships.'
    ),
    diagramCard(
      'Fig. 3.3: SIFS System Use-Case Diagram',
`     [ Super Admin ]
            |
            +---> ( Provision Client University Tenant )
            +---> ( Monitor Global Audit Logs & System Health )
            +---> ( Manage Multi-Tenant Database Migrations )

   [ Client Admin ]
            |
            +---> ( Configure Institutional Profile & Credit System )
            +---> ( Manage Academic Departments & Batches )
            +---> ( Lock / Unlock Admission Engine )
            +---> ( Manage Recycle Bin & Restore Deleted Data )
            +---> ( Purge Soft-Deleted Records Permanently )

  [ Admission Officer ]
            |
            +---> ( Execute Single Student Admission with Photo Crop )
            +---> ( Ingest Bulk Student Roster via CSV Template )
            +---> ( Search & Filter Student Directory )
            +---> ( Generate Interactive 3D PVC ID Card Preview )
            +---> ( Print Batch A4 ID Card Sheets [2x4 CR-80 Grid] )
            +---> ( Export Student Roster with Institutional Dynamic Filename )

      [ Student ]
            |
            +---> ( Present Physical CR-80 Badge for Optical Scanning )
            +---> ( Verify Formatted Identification Number & Department Info )`,
      'Actors possess strictly partitioned privileges enforced at the API route layer via JWT role verification middleware.'
    ),
    figureCaption('Fig. 3.3. SIFS system use-case diagram.'),
    subSectionHeading('3.4.2 Entity-Relationship Modeling (ERD)'),
    paragraph(
      'The data model is normalized to Third Normal Form (3NF) to guarantee referential integrity and eliminate update anomalies. It comprises five core entities: Universities, Departments, Batches, Students, and Audit Logs.'
    ),
    diagramCard(
      'Fig. 3.4: SIFS Entity-Relationship Diagram (ERD)',
`+-----------------------------+        1:N        +-----------------------------+
|        UNIVERSITIES         |------------------->|         DEPARTMENTS         |
+-----------------------------+                    +-----------------------------+
| PK  id           INT        |                    | PK  id           INT        |
|     name         VARCHAR(150|                    | FK  university_id INT       |
|     short_name   VARCHAR(20)|                    |     name         VARCHAR(100|
|     code         VARCHAR(10)|                    |     code         VARCHAR(10)|
|     credit_sys   VARCHAR(10)|                    |     created_at   TIMESTAMP  |
|     logo_url     TEXT       |                    |     deleted_at   TIMESTAMP  |
|     is_locked    BOOLEAN    |                    +-----------------------------+
+-----------------------------+                                   |
              |                                                   | 1:N
              | 1:N                                               v
              |                                    +-----------------------------+
              |                                    |           BATCHES           |
              |                                    +-----------------------------+
              |                                    | PK  id           INT        |
              |                                    | FK  department_id INT       |
              |                                    |     batch_number INT        |
              |                                    |     year         INT        |
              |                                    |     term_season  VARCHAR(10)|
              |                                    |     current_ser  INT        |
              |                                    |     is_active    BOOLEAN    |
              |                                    |     deleted_at   TIMESTAMP  |
              |                                    +-----------------------------+
              v                                                   |
+-----------------------------+                                   | 1:N
|         AUDIT_LOGS          |                                   v
+-----------------------------+                    +-----------------------------+
| PK  id           INT        |                    |          STUDENTS           |
| FK  university_id INT       |                    +-----------------------------+
|     action       VARCHAR(50)|                    | PK  id           INT        |
|     performed_by INT        |                    | FK  batch_id     INT        |
|     details      JSONB      |                    |     student_id   VARCHAR(30)|
|     timestamp    TIMESTAMP  |                    |     name         VARCHAR(100|
+-----------------------------+                    |     email        VARCHAR(100|
                                                   |     phone        VARCHAR(20)|
                                                   |     photo        TEXT       |
                                                   |     serial_num   INT        |
                                                   |     deleted_at   TIMESTAMP  |
                                                   +-----------------------------+`,
      'The schema enforces soft deletes via deleted_at nullable timestamp columns across Departments, Batches, and Students, enabling complete data restoration without breaking foreign-key cascades.'
    ),
    figureCaption('Fig. 3.4. SIFS entity-relationship diagram (ERD) with relational foreign keys and tombstones.'),
    subSectionHeading('3.4.3 Sequence Modeling: Concurrency-Safe Student Admission'),
    paragraph(
      'To guarantee zero duplicate ID collisions during peak intake, SIFS employs pessimistic row-level locking within an atomic database transaction. Fig. 3.5 illustrates the sequential execution pipeline.'
    ),
    diagramCard(
      'Fig. 3.5: Sequence Diagram of Concurrency-Safe Student Admission Flow',
`Client / UI         API Router         StudentController        Postgres Database
     |                   |                     |                        |
     |--- POST /admit -->|                     |                        |
     |    (Student Data) |--- verifyToken() -->|                        |
     |                   |    checkLocked()    |                        |
     |                   |                     |--- BEGIN TRANSACTION ->|
     |                   |                     |                        |
     |                   |                     |--- SELECT * FROM ------|
     |                   |                     |    batches WHERE       |
     |                   |                     |    id=$1 FOR UPDATE -->|
     |                   |                     |    [LOCK ACQUIRED]     |
     |                   |                     |<-- (Current Batch Data)|
     |                   |                     |                        |
     |                   |                     |-- compute next serial -|
     |                   |                     |-- generateStudentId() -|
     |                   |                     |                        |
     |                   |                     |--- INSERT INTO --------|
     |                   |                     |    students (...) ---->|
     |                   |                     |                        |
     |                   |                     |--- UPDATE batches -----|
     |                   |                     |    SET current_ser=N ->|
     |                   |                     |                        |
     |                   |                     |--- COMMIT ------------>|
     |                   |                     |    [LOCK RELEASED]     |
     |                   |<-- 201 Created -----|<-- Transaction OK -----|
     |<-- Student + ID --|    (Payload + ID)   |                        |`,
      'The SELECT ... FOR UPDATE primitive forces concurrent admission threads targeting the same academic batch to queue sequentially, guaranteeing deterministic sequential numbering with zero collision risk.'
    ),
    figureCaption('Fig. 3.5. Sequence diagram of concurrency-safe admission flow under pessimistic row-locking.'),
    subSectionHeading('3.4.4 Activity Modeling: Single and Bulk CSV Admission Logic'),
    paragraph(
      'The activity diagram in Fig. 3.6 demonstrates the decision paths executed during single and bulk admission operations, illustrating pre-import CSV validation, photo verification, dynamic placeholder allocation, and rollback boundaries.'
    ),
    diagramCard(
      'Fig. 3.6: Activity Diagram: Admission and Ingestion Pipeline',
`      ( Start Admission )
               |
               v
     [ Mode Selection? ]
      /               \\
 [Single Student]    [Bulk CSV File]
     |                     |
     v                     v
 [Fill Form Fields]  [Parse CSV Matrix]
     |                     |
     v                     v
 [Crop Photo Canvas] [Validate Headers & Format]
     |                     |
     |               < Validation Passed? >
     |                /                  \\
     |             [Yes]                 [No] -> ( Abort with Row Errors )
     |               |
     +---------------+
     |
     v
 [ Acquire Batch Row-Lock (SELECT FOR UPDATE) ]
     |
     v
 [ Iterate Students in Batch Transaction ]
     |
     +---> < Photo Attached? >
     |      /             \\
     |   [Yes]            [No]
     |     |                |
     |  [Store Base64]   [Assign Silhouette & Flag "Photo Pending"]
     |     \\                /
     |      +--------------+
     |             |
     |             v
     |      [ Compute Next Sequential Serial ]
     |      [ Synthesize Formatted Student ID ]
     |      [ Insert Student Record & Render Barcode ]
     |
     v
 [ Update Batch current_serial Counter ]
     |
     v
 [ Commit ACID Transaction & Release Locks ]
     |
     v
 ( Admission Complete: Return Response to UI )`,
      'The ingestion pipeline ensures that records lacking photos are not rejected; instead, they receive valid IDs and are badged [Photo Pending] for subsequent 1-click administrative photo attachment.'
    ),
    figureCaption('Fig. 3.6. Activity diagram of single and bulk CSV student admission logic.'),
    sectionHeading('3.5 User Interface Design'),
    paragraph(
      'The user interface of SIFS was engineered following modern human-computer interaction (HCI) principles, emphasizing cognitive ease, visual hierarchy, responsive typography, and operational efficiency. The administrative portal features an executive dashboard, real-time interactive credential builders, high-throughput bulk ingestion tools, a searchable student directory, a multi-card industrial print preview engine, and a resilient data recovery recycle bin.'
    ),
    paragraph(
      'Below are the architectural wireframe models followed by dedicated screenshot frames. Each framed section clearly specifies the target route, exact UI elements to display, and instructions for embedding the high-resolution interface captures.'
    ),
    diagramCard(
      'Fig. 3.7: Wireframe Representation of Executive Admission Dashboard',
`+---------------------------------------------------------------------------------------+
| SIFS  [ Admission Dashboard ]                         [ University of Dhaka ] (Locked)|
+---------------------------------------------------------------------------------------+
| Active Departments: 7    | Enrolled Students: 2    | Admission Engine: LOCKED        |
| [ Available for intake ] | [ 2 Verified Smart IDs] | [ Admissions paused by Admin ]   |
+---------------------------------------------------------------------------------------+
| Recent Student Admissions                                          [ View Full Roster -> ] |
|---------------------------------------------------------------------------------------|
| STUDENT ID    | FULL NAME           | DEPARTMENT       | ADMISSION DATE               |
| CE0227002     | [Avatar] Muskan Layla| Civil Engineering| Nov 11, 2026                 |
| CS126001      | [Avatar] Roni Taluk | Computer Science | Oct 30, 2026                 |
+---------------------------------------------------------------------------------------+`,
      'The Executive Dashboard provides instant visibility into active faculties, total smart credentials issued, and recent enrollment activity featuring static read-only photo avatars.'
    ),
    figureCaption('Fig. 3.7. Wireframe model of SIFS Executive Admission Dashboard.'),
    screenshotPlaceholderBox({
      title: 'High-Resolution Screenshot of SIFS Executive Admission Dashboard',
      screenName: 'Executive Admission Dashboard',
      route: 'http://localhost:5173/ (Root Dashboard)',
      elementsToInclude: 'Top institutional banner (Dhaka University emblem & active format rule: [Dept Code] + [Batch] + [YY] + [3-Digit Serial]), active department counter card (7), enrolled student counter card (2 Verified), Admission Engine status pill (Locked/Active toggle), and the "Recent Student Admissions" table displaying student IDs, static photo avatars, student names, departments, and enrollment dates.',
      instructions: 'Start the frontend dev server (`npm run dev`), open the dashboard in browser at 100% zoom, capture the full viewport, and paste the image into this framed box.'
    }),
    figureCaption('Fig. 3.8. SIFS Executive Admission Dashboard showing institutional counters and recent student admissions with photo avatars.'),
    screenshotPlaceholderBox({
      title: 'High-Resolution Screenshot of Single Student Admission Modal with Live ID Preview',
      screenName: 'Single Student Admission & Real-Time ID Card Preview',
      route: 'Triggered via "+ Admit Student" button on Dashboard or Student Directory',
      elementsToInclude: 'Admission dialog modal showing two distinct columns: Left Column containing admission form fields (Department dropdown, Batch/Intake selector, Full Name, Email, Phone, and Photo upload canvas cropper); Right Column containing the live reactive 3D Student ID Card preview that updates keystroke-by-keystroke with student details, institutional crest, and Code 128 barcode.',
      instructions: 'Click "+ Admit Student" on the Dashboard, enter sample student data (e.g., Department: CSE, Batch: 54, Name: Tanvir Hasan), capture the modal dialog with the reactive ID card rendered on the right, and paste into this framed box.'
    }),
    figureCaption('Fig. 3.9. Single Student Admission interface featuring input form controls on the left and real-time reactive 3D ID card preview on the right.'),
    screenshotPlaceholderBox({
      title: 'High-Resolution Screenshot of Bulk Student Admission via CSV Engine',
      screenName: 'Bulk Student Admission via CSV Modal',
      route: 'Triggered via "Bulk Admission (CSV)" button on Student Directory',
      elementsToInclude: 'Bulk admission modal dialog showing CSV drag-and-drop file upload dropzone, sample CSV schema guide (Full Name, Department Code, Batch/Intake, Email, Phone, Photo URL Optional), pre-ingestion matrix preview table displaying parsed student rows, validation status badges, and automatic [📷 Photo Pending] fallback flags.',
      instructions: 'Open the Student Directory, click "Bulk Admission", load a sample CSV file or view the template upload dropzone, capture the modal, and paste into this framed box.'
    }),
    figureCaption('Fig. 3.10. Bulk Student Admission modal showing CSV drag-and-drop ingestion zone, schema matrix preview, and photo fallback badging.'),
    screenshotPlaceholderBox({
      title: 'High-Resolution Screenshot of Student Directory & Institutional Credential Roster',
      screenName: 'Student Directory & Administrative Management Roster',
      route: 'http://localhost:5173/students (/students Route)',
      elementsToInclude: 'Complete student directory table with numbered rows, generated smart IDs, student photo avatars alongside student names, department badges, batch/intake labels, email addresses, admission dates, action buttons ("ID Card", "Delete"), search filter input bar, department filter dropdown, batch filter dropdown, and top action buttons: [Print ID Cards (N)], [Export CSV], and [Print / PDF].',
      instructions: 'Navigate to `/students` in the running application, ensure multiple enrolled student rows with avatars are visible, capture the full table layout and action toolbar, and paste into this framed box.'
    }),
    figureCaption('Fig. 3.11. SIFS Student Directory displaying searchable roster, static student photo avatars, and batch action toolbar.'),
    diagramCard(
      'Fig. 3.12: Wireframe Representation of Batch A4 Sheet Print Engine (2x4 CR-80 Grid)',
`+---------------------------------------------------------------------------------------+
| SIFS Student Directory                 [ Print ID Cards (2) ] [ Export CSV ] [ Print ]|
+---------------------------------------------------------------------------------------+
| A4 SHEET LAYOUT (210mm x 297mm) -- 8 Cards per Sheet (2 Columns x 4 Rows)             |
|                                                                                       |
| +-----------------------------------+   +-----------------------------------+         |
| | DHAKA UNIVERSITY       [OFFICIAL] |   | DHAKA UNIVERSITY       [OFFICIAL] |         |
| |-----------------------------------|   |-----------------------------------|         |
| | [Photo]  Komol Islam              |   | [Photo]  Muskan Layla             |         |
| |          DEPT: CE | Batch: 2nd '27|   |          DEPT: CE | Batch: 2nd '27|         |
| |          ID: CE0227001            |   |          ID: CE0227002            |         |
| | ||||||||||||||||||||| [VERIFIED]  |   | ||||||||||||||||||||| [VERIFIED]  |         |
| +-----------------------------------+   +-----------------------------------+         |
|      ( Industrial Cut Guide )                ( Industrial Cut Guide )                 |
| +-----------------------------------+   +-----------------------------------+         |
| | [ Card Slot 3 ]                   |   | [ Card Slot 4 ]                   |         |
| +-----------------------------------+   +-----------------------------------+         |
+---------------------------------------------------------------------------------------+`,
      'The Batch Sheet Print engine formats cards strictly according to CR-80 physical dimensions (85.6mm x 53.98mm) arranged in a 2x4 matrix per A4 page with crisp dashed cut guidelines.'
    ),
    figureCaption('Fig. 3.12. Wireframe model of Batch ID Card A4 Sheet Print layout engine.'),
    screenshotPlaceholderBox({
      title: 'High-Resolution Screenshot of Batch ID Card Sheet Print Layout (2x4 CR-80 Grid)',
      screenName: 'Batch ID Card Sheet Print Preview (A4 Industrial Layout)',
      route: 'Triggered via "Print ID Cards (N)" button on Student Directory',
      elementsToInclude: 'A4 print preview viewport displaying physical CR-80 badges arranged in an industrial 2-column by 4-row layout (8 cards per page). Each badge showcases the dark navy header band with university emblem, student photograph, department and batch information, student ID placed directly next to the "ID:" label, scannable Code 128 barcode, [VERIFIED] badge, and subtle dashed perimeter cut guides.',
      instructions: 'In the Student Directory, click "Print ID Cards (N)", open the print preview or modal view displaying multiple formatted ID badges on an A4 sheet, capture the sheet view, and paste into this framed box.'
    }),
    figureCaption('Fig. 3.13. Batch ID Card Sheet Print layout showing 2x4 CR-80 standard card matrix with dark navy headers and industrial cut guidelines.'),
    screenshotPlaceholderBox({
      title: 'High-Resolution Screenshot of Recycle Bin & Data Recovery Portal',
      screenName: 'Recycle Bin & Data Recovery Management',
      route: 'http://localhost:5173/recycle-bin (/recycle-bin Route)',
      elementsToInclude: 'Recycle Bin portal displaying header with "Empty Recycle Bin" button, tabbed navigation pills ("Students (N)", "Batches (0)", "Departments (0)"), and deleted records table showing student ID, static read-only photo avatar, student full name, department & batch, soft-deletion timestamp, and individual action buttons: [Restore] and [Delete] (permanent purge confirmation).',
      instructions: 'Navigate to `/recycle-bin` (after soft-deleting a test student), capture the Recycle Bin interface showing the student record with photo avatar and [Restore] button, and paste into this framed box.'
    }),
    figureCaption('Fig. 3.14. SIFS Recycle Bin and Data Recovery portal demonstrating soft-delete audit trail and restoration controls.'),
    sectionHeading('3.6 Design Decisions and Rationale'),
    paragraph(
      'During the engineering lifecycle, several fundamental architectural trade-offs were encountered. Table 3.2 documents the critical design choices, alternative strategies evaluated, and empirical evidence justifying the adopted approach.'
    ),
    tableCaption('Table 3.2. Critical Architectural Design Decisions and Engineering Rationale'),
    createTable(
      ['Decision Topic', 'Chosen Strategy (SIFS)', 'Alternative Evaluated', 'Empirical Engineering Rationale'],
      [
        ['Concurrency Control', 'Pessimistic Row-Locking (SELECT ... FOR UPDATE)', 'Optimistic Concurrency Control (OCC) / Versioning', 'OCC requires high-retry loops under peak admission bursts; failed transactions frustrate admission officers. Pessimistic row-locking queues requests cleanly with zero duplicate collisions and sub-15ms overhead.'],
        ['Barcode Symbology', 'Code 128 Linear Barcode with dynamic checksums', 'QR Code (2D Matrix)', 'Higher education campuses utilize existing handheld laser barcode wands tuned for linear symbology. Code 128 encodes alphanumeric student IDs compactly with superior optical scan reliability across worn physical badges.'],
        ['Department Schema', 'Dual Fields: code (3-letter uppercase) and name', 'Single code or single full name string', 'Formatting rules require compact codes (CSE, BBA, CE) to keep ID lengths manageable (8-10 chars), while physical ID badges require full institutional department titles for academic prestige and regulatory clarity.'],
        ['Record Deletion', 'Soft Delete (deleted_at) with Serial Recalibration', 'Hard Deletion (CASCADE DELETE) / Static Counters', 'Accidental deletions during admission intake are common. Soft deletes preserve complete audit trails. The automated serial recalibration engine ensures that purging trailing records prevents ghost counter gaps in subsequent admissions.'],
        ['Badge Sheet Styling', 'CSS Print Engine (-webkit-print-color-adjust: exact)', 'HTML Canvas / PDF Image Blitting', 'Rendering PDF via canvas rasterization blurs fine barcode lines and text at 300 DPI. Native browser print CSS preserves crisp vector typography and barcodes while enforcing exact dark-navy background gradients.'],
        ['Export File Naming', 'Dynamic Institutional Pattern (SIFS - [Uni]_[Dept]_[Batch])', 'Generic static names (students.pdf, roster.csv)', 'In real university offices, staff manage dozens of downloaded files across intakes. Dynamic institutional filenames eliminate accidental file overwrites and provide instant administrative traceability.']
      ],
      [18, 26, 20, 36]
    )
  );

  return children;
}

module.exports = {
  getChapter3Children
};
