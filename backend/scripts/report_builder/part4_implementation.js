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
  codeSnippet,
  createTable
} = require('./report_helpers');

function getChapter4Children() {
  const children = [];

  children.push(
    chapterHeading('4. Implementation'),
    sectionHeading('4.1 Introduction'),
    paragraph(
      'The implementation phase translates architectural models and design specifications into production-grade, executable code. SIFS was engineered following modern full-stack JavaScript/Node.js conventions, emphasizing clean code, strict modularization, ACID transaction integrity, defensive programming, and type safety. This chapter details the development environment, Git branching strategies, core business logic implementations, client-side print engines, and the human-first tool-assisted refinement workflow.'
    ),
    sectionHeading('4.2 Development Environment and Repository Setup'),
    paragraph(
      'The development environment was standardized across the engineering team to guarantee reproducibility across development, automated testing, and continuous integration pipelines.'
    ),
    bulletItem('Workstation Hardware & OS: AMD Ryzen 5 / 16 GB RAM, Microsoft Windows 11 Professional (64-bit).', { boldPrefix: 'Hardware & OS' }),
    bulletItem('Runtimes & Compilers: Node.js v24.21.0 (LTS), NPM v10.8.2, PostgreSQL v15.0.', { boldPrefix: 'Runtimes' }),
    bulletItem('IDE & Tooling: Visual Studio Code, Git v2.43, Postman API Platform, Chrome DevTools.', { boldPrefix: 'Tooling' }),
    bulletItem('Repository Hosting: GitHub Public Repository (https://github.com/R41YAN/smart-id-system.git).', { boldPrefix: 'Source Control' }),
    paragraph(
      'The codebase is organized as a clean monorepo separating server-side API services from the client-side single-page application.'
    ),
    tableCaption('Table 4.1. Repository Directory Structure and Component Topology'),
    createTable(
      ['Directory / Path', 'Module Scope', 'Key Files & Technical Purpose'],
      [
        ['backend/src/controllers/', 'API Business Logic', 'studentController.js (Admission, bulk CSV, locking), universityController.js, departmentController.js, recycleBinController.js.'],
        ['backend/src/services/', 'Core Domain Engines', 'idService.js (generateStudentId, serial calculations, regex rules), barcodeService.js (Code 128 rendering).'],
        ['backend/src/middleware/', 'Security & Interceptors', 'auth.js (JWT verification, role guard), errorHandler.js, multerUpload.js (CSV ingestion boundary).'],
        ['backend/src/routes/', 'HTTP Route Definitions', 'api.js (Central router defining all institutional endpoints and parameter validators).'],
        ['backend/src/db/', 'Data Layer & Pool', 'index.js (PostgreSQL connection pooling, transactional client acquisition helpers).'],
        ['backend/tests/', 'Backend Test Suites', 'auth.test.js, departments.test.js, batches.test.js, students.test.js, recycleBin.test.js, concurrency.test.js.'],
        ['frontend/src/pages/', 'UI View Modules', 'ClientAdminDashboard.jsx, StudentList.jsx, AdmitStudent.jsx, RecycleBin.jsx, Login.jsx, SuperAdminDashboard.jsx.'],
        ['frontend/src/components/', 'Reusable UI Atoms', 'Navbar.jsx, Sidebar.jsx, StudentCardModal.jsx (3D PVC Card Previewer), BarcodeRenderer.jsx.'],
        ['frontend/src/pages/__tests__/', 'Frontend Test Suites', 'Vitest UI test suites validating modal interactions, batch sheet print, CSV imports, and recycle bin tabs.']
      ],
      [26, 20, 54]
    ),
    paragraph(
      'Branching Strategy & Commit Conventions: Development strictly adhered to a feature-branching Git workflow. Direct commits to main were prohibited; all contributions required pull requests (PRs) accompanied by passing automated test runs. Commits followed the Conventional Commits specification (feat, fix, docs, refactor, test, chore), ensuring semantic traceability throughout the Git history.'
    ),
    sectionHeading('4.3 Core Module Implementation'),
    paragraph(
      'This section highlights the critical algorithmic and transactional components implemented within the SIFS domain layer.'
    ),
    subSectionHeading('4.3.1 Deterministic Student ID Formulation Algorithm'),
    paragraph(
      'The algorithmic heart of SIFS resides in idService.js. The generateStudentId function computes IDs deterministically based on whether the tenant institution utilizes an Open-Credit or Close-Credit model, applying standardized zero-padding.'
    ),
    codeSnippet(
`// backend/src/services/idService.js
function generateStudentId({ creditSystem, deptCode, batchNumber, year, termSeason, serial }) {
  const cleanDept = (deptCode || 'GEN').toUpperCase().trim();
  const yr2 = String(year).slice(-2); // Standard 2-digit year (e.g. 2026 -> 26)
  const padSerial3 = String(serial).padStart(3, '0'); // e.g. 1 -> 001
  const padSerial4 = String(serial).padStart(4, '0'); // e.g. 1 -> 0001
  const padBatch2 = String(batchNumber).padStart(2, '0'); // e.g. 54 -> 54, 2 -> 02

  if (creditSystem === 'open') {
    // Open Credit (e.g. UIU / BRACU / NSU): [Dept][YY][Term][4-Digit Serial]
    const termMap = { 'spring': '1', 'summer': '2', 'fall': '3', 'autumn': '3' };
    const termCode = termMap[(termSeason || 'spring').toLowerCase()] || '1';
    return \`\${cleanDept}\${yr2}\${termCode}\${padSerial4}\`;
  } else {
    // Close Credit (e.g. UITS / DU / BUET): [Dept][2-Digit Batch][YY][3-Digit Serial]
    return \`\${cleanDept}\${padBatch2}\${yr2}\${padSerial3}\`;
  }
}`,
      'Code Excerpt 4.1: Deterministic Student ID formulation algorithm supporting dual credit models.'
    ),
    subSectionHeading('4.3.2 Concurrency-Safe Admission with Transactional Row-Locking'),
    paragraph(
      'To prevent race conditions during simultaneous enrollments across admission counters, the student admission handler initiates an ACID transaction, acquires a row lock on the target batch row via SELECT ... FOR UPDATE, increments the counter, and inserts the student record before committing.'
    ),
    codeSnippet(
`// backend/src/controllers/studentController.js
async function admitStudent(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Acquire exclusive pessimistic row-lock on target batch
    const batchRes = await client.query(
      'SELECT * FROM batches WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
      [req.body.batch_id]
    );
    if (batchRes.rows.length === 0) throw new Error('Target batch not found or locked.');
    
    const batch = batchRes.rows[0];
    const nextSerial = (batch.current_serial || 0) + 1;
    
    // 2. Compute deterministic student ID
    const studentId = generateStudentId({
      creditSystem: req.tenant.credit_system,
      deptCode: req.body.department_code,
      batchNumber: batch.batch_number,
      year: batch.year,
      termSeason: batch.term_season,
      serial: nextSerial
    });
    
    // 3. Persist student credential
    const insertRes = await client.query(
      \`INSERT INTO students (student_id, name, email, phone, photo, batch_id, serial_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *\`,
      [studentId, req.body.name, req.body.email, req.body.phone, req.body.photo, batch.id, nextSerial]
    );
    
    // 4. Update batch counter & commit transaction
    await client.query('UPDATE batches SET current_serial = $1 WHERE id = $2', [nextSerial, batch.id]);
    await client.query('COMMIT');
    
    return res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(409).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
}`,
      'Code Excerpt 4.2: Concurrency-safe admission transaction utilizing PostgreSQL pessimistic row-locking.'
    ),
    subSectionHeading('4.3.3 Bulk CSV Ingestion Pipeline with Photo Fallback Silhouette'),
    paragraph(
      'Bulk admissions parse applicant CSV streams asynchronously. If an applicant record lacks a valid photo URL, the pipeline does not abort; it automatically assigns a default silhouette and applies a visual [Photo Pending] badge.'
    ),
    codeSnippet(
`// backend/src/controllers/studentController.js (Bulk Ingestion Excerpt)
const parsedRows = parseCSV(req.file.buffer);
for (const row of parsedRows) {
  const photoUrl = (row['Photo URL'] || row['photo'] || '').trim();
  const hasPhoto = photoUrl.startsWith('http') || photoUrl.startsWith('data:image');
  
  const studentPhoto = hasPhoto ? photoUrl : null; // null triggers default silhouette
  const photoStatus = hasPhoto ? 'verified' : 'pending';
  
  await insertBulkStudent(client, {
    name: row['Full Name'],
    email: row['Email'],
    phone: row['Phone'],
    photo: studentPhoto,
    photo_status: photoStatus
  });
}`,
      'Code Excerpt 4.3: Bulk CSV ingestion pipeline handling photo validation and non-blocking fallback.'
    ),
    subSectionHeading('4.3.4 Soft-Delete and Automated Batch Serial Recalibration Engine'),
    paragraph(
      'When students or batches are deleted, SIFS applies a soft-delete tombstone (deleted_at = NOW()). When records are permanently purged or restored from the Recycle Bin, the recalibration engine queries the actual active maximum serial number and resets current_serial, completely eliminating ghost gaps in subsequent admissions.'
    ),
    codeSnippet(
`// backend/src/controllers/recycleBinController.js (Recalibration Excerpt)
async function recalibrateBatchSerial(client, batchId) {
  // Query true maximum serial among remaining non-deleted students
  const maxRes = await client.query(
    'SELECT COALESCE(MAX(serial_number), 0) AS max_serial FROM students WHERE batch_id = $1 AND deleted_at IS NULL',
    [batchId]
  );
  const trueMax = parseInt(maxRes.rows[0].max_serial, 10);
  
  // Synchronize batch current_serial counter
  await client.query('UPDATE batches SET current_serial = $1 WHERE id = $2', [trueMax, batchId]);
  return trueMax;
}`,
      'Code Excerpt 4.4: Batch serial recalibration engine preventing ghost counter drift upon record deletion.'
    ),
    sectionHeading('4.4 Interface Implementation and System Integration'),
    paragraph(
      'The frontend Single-Page Application (SPA) was constructed with React 19 and Tailwind CSS v4, achieving high visual fidelity, seamless responsiveness, and native print-media handling.'
    ),
    bulletItem('Interactive 3D PVC Tilt Card Simulation: Utilizes CSS 3D perspective transforms (transform: rotateX(...) rotateY(...)) calculated dynamically from pointer coordinates, simulating physical card reflection and texture.', { boldPrefix: '3D Card Engine' }),
    bulletItem('Batch A4 Sheet Printing Engine: Renders an 8-card (2x4) grid matching physical CR-80 card specifications (85.6mm x 53.98mm). Enforces -webkit-print-color-adjust: exact !important to prevent browser printer drivers from stripping dark navy gradients during PDF export.', { boldPrefix: 'A4 Print Layout' }),
    bulletItem('Dynamic Institutional Export Naming: Dynamically generates standard file names based on institutional context (buildExportFileName: SIFS - [UniShort]_[Dept]_[Batch/Intake]_[Action].pdf).', { boldPrefix: 'Dynamic Naming' }),
    bulletItem('Static Read-Only Photo Avatars: Table views in the Executive Dashboard and Recycle Bin render 32x32px circular student photos or capitalized initial badges with zero click triggers, preventing accidental edit modals.', { boldPrefix: 'Read-Only Avatars' }),
    sectionHeading('4.5 Tool-Assisted Refinement'),
    paragraph(
      'In accordance with ethical engineering practices and the CSE 416 tool disclosure policy, AI development tools were engaged strictly under a Human-First paradigm. The engineering team conceived, designed, and authored all architectural components before utilizing assistive tools for syntax exploration, unit test case scaffolding, or edge-case validation.'
    ),
    bulletItem('Pessimistic Row-Locking Formulation: The team designed the SELECT ... FOR UPDATE transaction flow. Qodo AI was prompted to suggest alternative lock modes (SHARE vs. UPDATE). Decision: Accepted EXCLUSIVE UPDATE lock; rejected optimistic versioning due to admission retry overhead.', { boldPrefix: 'Tool Interaction 1' }),
    bulletItem('Print Color Degradation Workaround: Browser print engines were stripping navy headers to plain white. Tool was used to inspect CSS print media query specifications. Decision: Accepted injection of -webkit-print-color-adjust: exact on root body and card headers.', { boldPrefix: 'Tool Interaction 2' }),
    bulletItem('Bulk CSV Photo Ingestion: Tool suggested requiring photo URLs as mandatory CSV fields. Decision: REJECTED tool suggestion. Enforced photo-optional ingestion with dynamic [Photo Pending] silhouettes to eliminate intake bottlenecks.', { boldPrefix: 'Tool Interaction 3' })
  );

  return children;
}

module.exports = {
  getChapter4Children
};
