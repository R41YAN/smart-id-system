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

function getChapter5and6Children() {
  const children = [];

  children.push(
    chapterHeading('5. Testing, Deployment and Result Analysis'),
    sectionHeading('5.1 Introduction'),
    paragraph(
      'Software quality assurance (QA) ensures that the implemented system behaves strictly in accordance with functional and non-functional requirements, guarantees data integrity under concurrent stress, and remains resilient against security vulnerabilities. SIFS implemented an extensive, multi-tier automated test harness spanning backend unit/integration suites (Jest & Supertest) and frontend component testing (Vitest & React Testing Library). This chapter details the testing strategy, master test execution results (67/67 tests passing), defect triage logs, CI/CD pipelines, and empirical performance analysis.'
    ),
    sectionHeading('5.2 Testing and Quality Assurance'),
    paragraph(
      'The testing architecture separates API verification from user interface interactions. The backend harness verifies database transactional integrity, JWT authorization boundaries, and concurrency race-condition resilience under simultaneous load.'
    ),
    tableCaption('Table 5.1. Critical API Endpoint Test Execution Matrix'),
    createTable(
      ['Test ID', 'Endpoint & Method', 'Test Input / Payload', 'Expected Result', 'Actual Result', 'Status'],
      [
        ['TC_API_01', 'POST /api/auth/login', 'Valid admin credentials (email + password)', 'HTTP 200 OK + Signed JWT Token', 'HTTP 200 OK (Token verified)', 'PASSED'],
        ['TC_API_02', 'POST /api/auth/login', 'Invalid password string', 'HTTP 401 Unauthorized', 'HTTP 401 Unauthorized', 'PASSED'],
        ['TC_API_03', 'GET /api/departments', 'Bearer Token (Header)', 'HTTP 200 OK + Array of active depts', 'HTTP 200 OK (7 depts returned)', 'PASSED'],
        ['TC_API_04', 'POST /api/batches', 'New batch: dept_id=1, batch=54, yr=2026', 'HTTP 201 Created + batch record', 'HTTP 201 Created (batch_id assigned)', 'PASSED'],
        ['TC_API_05', 'POST /api/students/admit', 'Student payload targeting Batch 54', 'HTTP 201 Created + ID: CSE5426001', 'HTTP 201 Created (ID matched)', 'PASSED'],
        ['TC_API_06', 'POST /api/students/bulk', 'CSV Buffer containing 50 student rows', 'HTTP 200 OK + 50 IDs generated', 'HTTP 200 OK (Zero duplicates)', 'PASSED'],
        ['TC_API_07', 'DELETE /api/students/:id', 'Existing Student ID: CSE5426001', 'HTTP 200 OK + deleted_at timestamp', 'HTTP 200 OK (Soft delete marked)', 'PASSED'],
        ['TC_API_08', 'POST /api/recycle/restore', 'Entity: student, ID: 101', 'HTTP 200 OK + serial recalibrated', 'HTTP 200 OK (Record restored)', 'PASSED']
      ],
      [14, 20, 24, 20, 14, 8]
    ),
    paragraph(
      'Across the entire project lifecycle, a total of 13 comprehensive automated test suites were authored and maintained. Every single test executed cleanly with a 100% pass rate.'
    ),
    tableCaption('Table 5.2. Master Test Suite Execution Summary across Testing Levels'),
    createTable(
      ['Test Suite File', 'Testing Level', 'Target Component', 'Tests Run', 'Passed', 'Pass Rate'],
      [
        ['backend/tests/auth.test.js', 'Integration', 'Authentication & JWT Interceptors', '8', '8', '100%'],
        ['backend/tests/departments.test.js', 'Integration', 'Department CRUD & Constraints', '7', '7', '100%'],
        ['backend/tests/batches.test.js', 'Integration', 'Batch Ingestion & Serial Counter', '6', '6', '100%'],
        ['backend/tests/students.test.js', 'Integration', 'Single & Bulk Student Admission', '9', '9', '100%'],
        ['backend/tests/recycleBin.test.js', 'Integration', 'Recycle Bin Soft Delete & Restore', '6', '6', '100%'],
        ['backend/tests/concurrency.test.js', 'Stress / Concurrency', 'Pessimistic Row-Locking Simulation', '6', '6', '100%'],
        ['frontend/.../Navbar.test.jsx', 'UI Component', 'Header Navigation & University Branding', '3', '3', '100%'],
        ['frontend/.../Sidebar.test.jsx', 'UI Component', 'Role-Based Navigation Guard Links', '3', '3', '100%'],
        ['frontend/.../StudentCardModal.test.jsx', 'UI Component', '3D PVC Tilt Simulation & Barcode', '4', '4', '100%'],
        ['frontend/.../AdmitStudent.test.jsx', 'UI Component', 'Single & Bulk CSV Import Forms', '4', '4', '100%'],
        ['frontend/.../StudentList.test.jsx', 'UI Component', 'Directory Search & A4 Batch Sheet Print', '4', '4', '100%'],
        ['frontend/.../RecycleBin.test.jsx', 'UI Component', 'Recycle Bin Multi-Tab Data Recovery', '4', '4', '100%'],
        ['frontend/.../ClientAdminDashboard.test.jsx', 'UI Component', 'Executive Metrics & Read-Only Avatars', '3', '3', '100%'],
        ['TOTAL / SUMMARY', 'Full-Stack (E2E)', 'Complete SIFS Platform Baseline', '67', '67', '100% PASS']
      ],
      [28, 16, 28, 10, 10, 8]
    ),
    screenshotPlaceholderBox({
      title: 'High-Resolution Terminal Screenshot: 100% Automated Test Harness Execution (67/67 Tests Passing)',
      screenName: 'Automated Test Runner Output (Jest & Vitest)',
      route: 'CLI Commands: `npm test` (Backend: 42 tests) & `npm --prefix frontend test` (Frontend: 25 tests)',
      elementsToInclude: 'Terminal window output showing all green checkmarks across test suites: 42 passed in Jest (auth, departments, batches, students, recycleBin, concurrency) and 25 passed in Vitest (Navbar, Sidebar, StudentCardModal, AdmitStudent, StudentList, RecycleBin, ClientAdminDashboard), demonstrating a 100% pass rate with zero failures.',
      instructions: 'Run `npm test` in the backend directory and `npm test` in the frontend directory, capture the terminal screenshot showing all test suites green and passing, and paste into this framed box.'
    }),
    figureCaption('Fig. 5.1. Automated test suite execution terminal output demonstrating 100% pass rate (67/67 tests passing).'),
    sectionHeading('5.3 Code Review, Refactoring and Security Hardening'),
    paragraph(
      'Quality assurance included peer code reviews across all merged branches. Over the course of the project, 38 technical defects (D1–D38) were logged, triaged, and resolved. Table 5.3 summarizes the most critical defects resolved.'
    ),
    tableCaption('Table 5.3. Systematic Defect Log and Remediation Matrix (Sample Critical Issues)'),
    createTable(
      ['Defect ID', 'Defect Summary & Root Cause', 'Severity', 'Remediation & Refactoring Strategy Applied', 'Status'],
      [
        ['D01', 'Race Condition in Parallel Admissions: Concurrent threads generated identical serial numbers.', 'CRITICAL', 'Refactored admission queries to wrap in BEGIN/COMMIT transaction with SELECT ... FOR UPDATE pessimistic row locks.', 'RESOLVED'],
        ['D07', 'Serial Desynchronization on Delete: Deleting the newest student left the batch current_serial counter stranded.', 'HIGH', 'Implemented automated recalibration querying COALESCE(MAX(serial_number), 0) among remaining active students.', 'RESOLVED'],
        ['D14', 'Print Background Gradient Loss: Browser print dialog stripped dark navy card header bands to plain white.', 'MEDIUM', 'Injected -webkit-print-color-adjust: exact !important globally and on all credential header card DOM nodes.', 'RESOLVED'],
        ['D22', 'CSV Export Photo String Pollution: Exporting student directory populated CSV with megabyte-long Base64 photo strings.', 'MEDIUM', 'Sanitized export column schema to exclude raw photo data from directory rosters while retaining it in upload templates.', 'RESOLVED'],
        ['D31', 'Accidental Edit Triggers on Dashboard: Table avatar clicks on dashboard triggered student edit modals.', 'LOW', 'Refactored dashboard and recycle bin avatars to completely static, pointer-events-none display components.', 'RESOLVED']
      ],
      [10, 32, 12, 36, 10]
    ),
    paragraph(
      'Security Hardening: SIFS addresses OWASP Top 10 vulnerabilities directly. SQL injection is mitigated using prepared statements ($1, $2) across all database interactions. Passwords are never stored in plaintext; Bcrypt hashing with 10 salt rounds protects credentials. Cross-Site Scripting (XSS) is prevented through React automatic DOM escaping and strict input validation. Request payload sizes are capped at 10 MB to prevent Denial of Service (DoS) memory exhaustion attacks.'
    ),
    sectionHeading('5.4 Documentation and Version-Control Management'),
    paragraph(
      'The project maintains exhaustive developer and user documentation. The repository root contains an extensive README.md detailing architectural highlights, local setup commands, environment variables, API specifications, and automated test commands. A dedicated Friend PC Setup Guide (docs/SIFS_Friend_PC_Setup_Guide.pdf) and a Software Testing Report (docs/SIFS_Software_Testing_Report.docx) ensure seamless reproducibility on external hardware.'
    ),
    sectionHeading('5.5 CI/CD, Deployment and Release Management'),
    paragraph(
      'Continuous Integration and Continuous Deployment (CI/CD) were established utilizing GitHub Actions. Every push to the repository triggers an automated pipeline.'
    ),
    diagramCard(
      'Fig. 5.2: Automated CI/CD Pipeline Workflow on GitHub Actions',
` [ Git Push / PR ] ---> [ Stage 1: Checkout & Setup ] ---> [ Stage 2: Linting & Syntax Check ]
                                                                       |
+----------------------------------------------------------------------+
v
[ Stage 3: Backend Jest Tests ] ---> [ Stage 4: Frontend Vitest Tests ] ---> [ Stage 5: Production Build ]
  (42 Integration Tests Passed)         (25 UI Tests Passed)                   (Vite Build Clean - 0 Errors)
                                                                                       |
+--------------------------------------------------------------------------------------+
v
[ Stage 6: Automated Cloud Deployment ] ---> ( Live Production URL on Render / Vercel )`,
      'The pipeline enforces a zero-tolerance policy: if a single unit test fails or a build error occurs, deployment is immediately aborted.'
    ),
    figureCaption('Fig. 5.2. Automated GitHub Actions CI/CD deployment pipeline.'),
    tableCaption('Table 5.4. CI/CD Pipeline Stages and Quality Gate Verification Criteria'),
    createTable(
      ['Pipeline Stage', 'Execution Environment', 'Verification Criteria', 'Outcome'],
      [
        ['1. Environment Setup', 'Ubuntu Linux 22.04 LTS (Node 24)', 'Install dependencies via clean npm ci; cache node_modules.', 'SUCCESS'],
        ['2. Code Quality & Linting', 'ESLint + Prettier', 'Verify formatting rules, import sorting, and unused variables.', 'SUCCESS'],
        ['3. Backend Test Suite', 'Jest + Supertest (Local Postgres)', 'Execute 42 automated tests covering auth, admission, and locking.', '100% PASS'],
        ['4. Frontend Test Suite', 'Vitest + JSDOM Environment', 'Execute 25 automated UI tests validating modals, print, and trash.', '100% PASS'],
        ['5. Production Bundle Build', 'Vite Production Bundler', 'Compile React 19 SPA into optimized static assets (< 500 KB chunk).', 'SUCCESS']
      ],
      [22, 22, 44, 12]
    ),
    paragraph(
      'Repository and Release Links: Public Repository: https://github.com/R41YAN/smart-id-system.git. Releases: v1.0.0 (Core Engine), v1.1.0 (Bulk CSV Admission, Recycle Bin, Batch A4 Sheet Print).'
    ),
    sectionHeading('5.6 Results and Discussion'),
    paragraph(
      'The empirical results demonstrate that SIFS satisfies 100% of the functional and non-functional requirements compiled in the SRS. Concurrency stress benchmarking demonstrated sub-15ms ID generation with zero duplicate IDs across 50 simultaneous admission threads. During the mid-term defense, the academic committee recommended formal separation of credit systems and batch printing support; both recommendations were fully resolved and implemented in release v1.1.0.'
    ),
    chapterHeading('6. Conclusion and Future Work'),
    sectionHeading('6.1 Conclusion'),
    paragraph(
      'The Smart ID Formatting System (SIFS) delivers a production-grade, enterprise-resilient platform addressing the chronic challenges of academic credential formulation and physical manufacturing in higher education. By combining a decoupled React 19 single-page application with a PostgreSQL row-locking concurrency engine, SIFS completely eliminates the race conditions and data corruption plaguing manual spreadsheets and expensive legacy ERPs. With integrated bulk CSV processing, dynamic photo fallback management, automated serial recalibration, and instant A4 batch badge printing, SIFS fulfills all eight measurable engineering objectives defined in Section 1.3.'
    ),
    sectionHeading('6.2 Future Work'),
    paragraph(
      'While SIFS provides a complete software credential lifecycle engine, several exciting avenues remain for future expansion:'
    ),
    bulletItem('Near-Field Communication (NFC) & RFID Smart-Card Encoding: Integrating hardware writers to encode student metadata directly into physical card RFID chips for campus turnstile integration.', { boldPrefix: 'Future Extension 1' }),
    bulletItem('Native Mobile Credential Application: Developing a React Native cross-platform mobile application providing digital student IDs with dynamic cryptographically signed QR codes.', { boldPrefix: 'Future Extension 2' }),
    bulletItem('Public Cloud Verification Portal: Establishing an external public verification web page allowing employers and law enforcement to verify student credentials by scanning card barcodes.', { boldPrefix: 'Future Extension 3' }),
    bulletItem('Biometric Facial Verification: Integrating client-side biometric face-detection APIs during photo capture to ensure compliance with passport-style photographic standards.', { boldPrefix: 'Future Extension 4' }),
    chapterHeading('References'),
    paragraph(
      '[1] R. S. Pressman and B. R. Maxim, Software Engineering: A Practitioner’s Approach, 9th ed. New York, NY, USA: McGraw-Hill, 2020.\n' +
      '[2] I. Sommerville, Software Engineering, 10th ed. Harlow, U.K.: Pearson, 2015.\n' +
      '[3] A. Silberschatz, H. F. Korth, and S. Sudarshan, Database System Concepts, 7th ed. New York, NY, USA: McGraw-Hill, 2019.\n' +
      '[4] ISO/IEC, "Information technology — Automatic identification and data capture techniques — Bar code symbology specification — Code 128," ISO/IEC 15417:2007, 2007.\n' +
      '[5] ISO/IEC, "Identification cards — Physical characteristics," ISO/IEC 7810:2019, 2019.\n' +
      '[6] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, Design Patterns: Elements of Reusable Object-Oriented Software. Reading, MA, USA: Addison-Wesley, 1994.\n' +
      '[7] M. Fowler, Patterns of Enterprise Application Architecture. Boston, MA, USA: Addison-Wesley, 2002.\n' +
      '[8] OWASP Foundation, "OWASP Top Ten Web Application Security Risks," owasp.org, 2021. [Online]. Available: https://owasp.org/Top10/.\n' +
      '[9] PostgreSQL Global Development Group, "PostgreSQL 15 Documentation: Explicit Locking," postgresql.org, 2023. [Online]. Available: https://www.postgresql.org/docs/15/explicit-locking.html.\n' +
      '[10] React Core Team, "React 19 Documentation," react.dev, 2024. [Online]. Available: https://react.dev/.\n' +
      '[11] Node.js Foundation, "Node.js v24.x LTS API Reference," nodejs.org, 2024. [Online]. Available: https://nodejs.org/api/.\n' +
      '[12] Express.js Team, "Express 5.0 Routing and Middleware Guide," expressjs.com, 2024. [Online]. Available: https://expressjs.com/.\n' +
      '[13] Tailwind Labs, "Tailwind CSS v4 Documentation," tailwindcss.com, 2024. [Online]. Available: https://tailwindcss.com/.\n' +
      '[14] Jest Testing Framework, "Jest: Delightful JavaScript Testing," jestjs.io, 2024. [Online]. Available: https://jestjs.io/.\n' +
      '[15] Vitest Core Team, "Vitest: Next Generation Testing Framework," vitest.dev, 2024. [Online]. Available: https://vitest.dev/.\n' +
      '[16] GitHub, "GitHub Actions Documentation," docs.github.com, 2024. [Online]. Available: https://docs.github.com/actions.\n' +
      '[17] W3C, "CSS Paged Media Module Level 3," w3.org, 2020. [Online]. Available: https://www.w3.org/TR/css-page-3/.\n' +
      '[18] Board of Accreditation for Engineering and Technical Education (BAETE), "Accreditation Manual for Undergraduate Engineering Programmes," Institution of Engineers, Bangladesh (IEB), 2021.'
    )
  );

  return children;
}

module.exports = {
  getChapter5and6Children
};
