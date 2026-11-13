const fs = require('fs');
const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  ImageRun
} = require('D:/ক PDF 1/7th Semester/Software Project Lab/Project/smart-id-system/backend/node_modules/docx');

const {
  FONT_PRIMARY,
  C_NAVY,
  C_BLUE,
  C_DARK,
  C_BODY,
  C_MUTED,
  docTitle,
  docSubtitle,
  chapterHeading,
  sectionHeading,
  subSectionHeading,
  paragraph,
  bulletItem,
  numberedItem,
  tableCaption,
  figureCaption,
  calloutBox,
  createTable,
  diagramCard,
  logoPath
} = require('./report_helpers');

function getCoverPageChildren() {
  const children = [];

  // University Logo
  if (fs.existsSync(logoPath)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 140 },
        children: [
          new ImageRun({
            data: fs.readFileSync(logoPath),
            transformation: { width: 110, height: 110 }
          })
        ]
      })
    );
  }

  // University Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 30 },
      children: [
        new TextRun({
          text: 'UNIVERSITY OF INFORMATION TECHNOLOGY AND SCIENCES (UITS)',
          bold: true,
          size: 24, // 12pt
          font: FONT_PRIMARY,
          color: C_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 180 },
      children: [
        new TextRun({
          text: 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING',
          bold: true,
          size: 20, // 10pt
          font: FONT_PRIMARY,
          color: C_MUTED
        })
      ]
    })
  );

  // Document Title & Subtitle
  children.push(
    docTitle('Smart ID Formatting System (SIFS)'),
    docSubtitle('A Cloud-Native Multi-Tenant Deterministic Academic Credential Formulation & Lifecycle Management Engine'),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 180 },
      children: [
        new TextRun({
          text: 'COURSE PROJECT REPORT',
          bold: true,
          size: 22,
          font: FONT_PRIMARY,
          color: C_BLUE
        })
      ]
    })
  );

  // Metadata Table: Authors and Course details
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            shading: { fill: 'F8FAFC', val: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({ text: 'Submitted By:', bold: true, size: 20, font: FONT_PRIMARY, color: C_NAVY })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({ text: '1. Md. Raiyan', bold: true, size: 20, font: FONT_PRIMARY, color: C_DARK }),
                  new TextRun({ text: '\n   Student ID: 0432320005101101', size: 19, font: FONT_PRIMARY, color: C_BODY }),
                  new TextRun({ text: '\n   Section: 7B1', size: 19, font: FONT_PRIMARY, color: C_BODY })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 0 },
                children: [
                  new TextRun({ text: '2. Md. Fizul Islam Yamin', bold: true, size: 20, font: FONT_PRIMARY, color: C_DARK }),
                  new TextRun({ text: '\n   Student ID: 0432320005101114', size: 19, font: FONT_PRIMARY, color: C_BODY }),
                  new TextRun({ text: '\n   Section: 7B1', size: 19, font: FONT_PRIMARY, color: C_BODY })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            shading: { fill: 'F8FAFC', val: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({ text: 'Course & Supervision:', bold: true, size: 20, font: FONT_PRIMARY, color: C_NAVY })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({ text: 'Course Code: ', bold: true, size: 19, font: FONT_PRIMARY, color: C_DARK }),
                  new TextRun({ text: 'CSE 416\n', size: 19, font: FONT_PRIMARY, color: C_BODY }),
                  new TextRun({ text: 'Course Title: ', bold: true, size: 19, font: FONT_PRIMARY, color: C_DARK }),
                  new TextRun({ text: 'Software Project Design & Development\n', size: 19, font: FONT_PRIMARY, color: C_BODY }),
                  new TextRun({ text: 'Semester: ', bold: true, size: 19, font: FONT_PRIMARY, color: C_DARK }),
                  new TextRun({ text: 'Autumn 2026\n\n', size: 19, font: FONT_PRIMARY, color: C_BODY }),
                  new TextRun({ text: 'Course Instructor:\n', bold: true, size: 19, font: FONT_PRIMARY, color: C_DARK }),
                  new TextRun({ text: 'Dr. Mahfida Amjad Dipa\n', bold: true, size: 20, font: FONT_PRIMARY, color: C_BLUE }),
                  new TextRun({ text: 'Assistant Professor, Department of CSE\nUniversity of Information Technology & Sciences', size: 18, font: FONT_PRIMARY, color: C_BODY })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  children.push(metaTable);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 260, after: 0 },
      children: [
        new TextRun({
          text: 'Date of Submission: November 2026',
          bold: true,
          size: 20,
          font: FONT_PRIMARY,
          color: C_NAVY
        })
      ]
    })
  );

  return children;
}

function getDeclarationChildren() {
  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 160 },
      children: [
        new TextRun({
          text: 'DECLARATION OF ORIGINALITY & TOOL USAGE DISCLOSURE',
          bold: true,
          size: 26,
          font: FONT_PRIMARY,
          color: C_NAVY
        })
      ]
    }),
    paragraph(
      'We, the undersigned students of the Department of Computer Science and Engineering, University of Information Technology and Sciences (UITS), hereby declare that the work presented in this course project report entitled "Smart ID Formatting System (SIFS)" is the outcome of our own engineering design, implementation, and rigorous experimental testing conducted during the Autumn 2026 semester under the course CSE 416 (Software Project Design and Development).'
    ),
    paragraph(
      'This project has not been submitted in whole or in part to any other course, institution, or academic evaluation. All direct quotations, external software libraries, and third-party algorithmic concepts have been properly cited and attributed in accordance with IEEE academic referencing standards.'
    ),
    paragraph(
      'Declaration on Assistive Tool Usage: In strict compliance with the evaluation policy of CSE 416, we explicitly disclose that AI coding assistants (including Qodo AI and Google Gemini) were utilized strictly as assistive secondary tools for syntax exploration, unit test case scaffolding, and defect triage. The entire system architecture, database relational model, deterministic ID formatting algorithm, concurrency row-locking mechanisms, and physical badge sheet layout engine were independently conceived, designed, authored, and verified by us prior to any tool interaction. A complete, chronological week-by-week ledger of all assistive tool interactions, including own design first records, verification methods, and accepted/rejected decisions, is formally provided in Appendix A (Tool Usage Log).'
    ),
    new Paragraph({ spacing: { before: 180, after: 80 } }),
    createTable(
      ['Student Name', 'Student ID', 'Academic Section', 'Signature & Date'],
      [
        ['Md. Raiyan', '0432320005101101', 'Section 7B1', '__________________\nDate: 13/11/2026'],
        ['Md. Fizul Islam Yamin', '0432320005101114', 'Section 7B1', '__________________\nDate: 13/11/2026']
      ],
      [28, 24, 20, 28]
    )
  );

  return children;
}

function getChapter1Children() {
  const children = [];

  children.push(
    chapterHeading('1. Introduction'),
    sectionHeading('1.1 Introduction'),
    paragraph(
      'In contemporary tertiary academic institutions, the student identification number represents the foundational legal and administrative anchor of the student lifecycle. It links course registrations, financial billing, examination halls, library access, and national regulatory reporting. Despite its critical role, universities in developing economies—most notably private universities in Bangladesh—consistently encounter operational fragmentation due to the coexistence of divergent academic credit systems. Specifically, institutions operate under either a Close-Credit Model (batch-based, fixed cohort progression typical of public universities and traditional engineering faculties) or an Open-Credit Model (trimester/semester-based flexible credit registration common in North American curriculum frameworks).'
    ),
    paragraph(
      'Historically, universities attempt to resolve this dual-model challenge through disparate manual spreadsheets (Microsoft Excel, Google Sheets) or legacy custom-built enterprise resource planning (ERP) modules. These legacy approaches suffer from critical architectural deficiencies: they lack deterministic formatting engines, rely on unsafe serial counter lookups that induce high-concurrency race conditions, fail to generate print-ready physical credentials, and offer zero data-recovery resilience upon accidental record deletion.'
    ),
    paragraph(
      'The Smart ID Formatting System (SIFS) is a cloud-native, multi-tenant software platform engineered to definitively solve academic credential formulation and lifecycle management. Built upon a decoupled single-page application (SPA) frontend and a transactional RESTful backend with pessimistic row-locking concurrency control, SIFS unifies open-credit and close-credit institutional rulesets into a single deterministic engine. SIFS provides automated single and bulk CSV student enrollment, dynamic photo fallback management, 3D interactive PVC badge simulations, print-color-preserved A4 sheet batch printing, and an enterprise recycle bin with automated serial counter recalibration.'
    ),
    sectionHeading('1.2 Motivation'),
    paragraph(
      'The motivation driving the development of SIFS originates from severe systemic failures observed during seasonal university intake cycles. During peak admission weeks, multiple admission desks concurrently enroll hundreds of students across multiple academic faculties. In traditional spreadsheet or naive database implementations, assigning the next sequential student ID relies on an unbounded aggregate query (e.g., SELECT MAX(serial) FROM students). When two admission officers submit enrollment requests simultaneously, both transactions read the exact same maximum serial number. Consequently, both students receive identical identification numbers, culminating in catastrophic primary key collisions, student record overwrites, or emergency manual counter patches by panicked IT staff.'
    ),
    paragraph(
      'Furthermore, commercial higher education ERPs (such as Ellucian Banner or Oracle PeopleSoft) require millions of dollars in licensing fees, multi-year deployment cycles, and heavy specialized maintenance, placing them entirely out of reach for small-to-medium universities, polytechnic institutes, and colleges. Conversely, lightweight SaaS tools fail to support physical credential manufacturing: admission offices must manually export data into graphic design suites (Photoshop, Illustrator) to generate printable ID cards, creating massive operational backlogs and typographical errors.'
    ),
    paragraph(
      'To systematically isolate the root causes of academic ID failures, an Ishikawa (Fishbone) cause-and-effect analysis was performed across four operational dimensions: Technology, People, Process, and Policy.'
    ),
    diagramCard(
      'Fig. 1.1: Ishikawa Cause-and-Effect (Fishbone) Diagram of Academic Credential Failures',
`  TECHNOLOGY                             PEOPLE
  +-- Concurrency Race Conditions        +-- Staff Fatigue during Intake
  +-- No ACID Row-Level Locking          +-- Manual Typing & Copy-Paste
  +-- Spreadsheet Desynchronization      +-- Accidental Record Deletions
  \\                                      /
   \\                                    /
    +----------------------------------+--------------------> [ SYSTEMIC ACADEMIC ]
   /                                    \\                     [ CREDENTIAL COLLISION ]
  /                                      \\                    [ & DATA FRAGMENTATION ]
  +-- Manual Graphic Design Export       +-- Incompatible Credit Models
  +-- No Batch A4 Sheet Printing         +-- Unstandardized Dept Formats
  +-- Inflexible CR-80 Card Layout       +-- Absence of Audit Trails
  PROCESS                                POLICY`,
      'The Ishikawa root-cause analysis demonstrates that institutional credential failures stem not merely from human error, but from fundamentally flawed architectural foundations: the absence of deterministic database row locks and the lack of unified credit-system encoding.'
    ),
    figureCaption('Fig. 1.1. Ishikawa cause-and-effect diagram analyzing institutional credential failures.'),
    sectionHeading('1.3 Aims and Objectives'),
    paragraph(
      'The overarching engineering aim of the SIFS project is to design, develop, verify, and deploy a robust, multi-tenant academic credential formulation and lifecycle management platform that guarantees absolute zero duplicate ID collisions under high concurrency, dynamically accommodates both open-credit and close-credit institutional conventions, and automates end-to-end credential manufacturing.'
    ),
    paragraph('To achieve this aim, eight specific, measurable engineering objectives were defined and executed:'),
    numberedItem('O1', 'Deterministic Format Rule Engine: Implement an algorithmic formatting core capable of synthesizing structurally compliant academic IDs from institutional parameters (Department Code, Batch, Year, Season, and Sequential Serial) across both Close-Credit and Open-Credit frameworks.', { boldPrefix: 'Objective 1' }),
    numberedItem('O2', 'ACID-Compliant Concurrency Control: Engineer a transactional admission pipeline utilizing PostgreSQL pessimistic row-level locking (SELECT ... FOR UPDATE) to eliminate race conditions and guarantee zero duplicate IDs during simultaneous multi-user enrollments.', { boldPrefix: 'Objective 2' }),
    numberedItem('O3', 'High-Throughput Bulk CSV Ingestion: Build an asynchronous bulk admission engine capable of parsing, validating, and ingesting hundreds of student records per batch, featuring dynamic photo fallback silhouettes and non-blocking administrative workflows.', { boldPrefix: 'Objective 3' }),
    numberedItem('O4', 'Physical Badge Sheet Layout Engine: Design a client-side A4 printing sub-system rendering an 8-card (2x4) CR-80 grid with industrial cut guidelines and browser color-preservation directives (-webkit-print-color-adjust: exact).', { boldPrefix: 'Objective 4' }),
    numberedItem('O5', 'Machine-Readable Barcode Integration: Embed dynamic Code 128 linear barcode generation with automated checksum calculation directly into the credential render pipeline for optical scanner verification.', { boldPrefix: 'Objective 5' }),
    numberedItem('O6', 'Resilient Data Recovery & Serial Recalibration: Construct an enterprise Recycle Bin implementing soft-delete semantics (deleted_at timestamps) and automated batch serial counter recalibration to prevent ghost numbering upon record purging.', { boldPrefix: 'Objective 6' }),
    numberedItem('O7', 'Multi-Tenant Role-Based Access Control (RBAC): Implement secure institutional tenant isolation enforced by JSON Web Tokens (JWT), Bcrypt password hashing (10 salt rounds), and multi-tier role authorization (Super Admin, Client Admin, Admission Officer).', { boldPrefix: 'Objective 7' }),
    numberedItem('O8', 'Automated Verification & Zero-Defect Baseline: Establish a 100% passing automated test suite spanning unit, integration, and UI component layers (minimum 65 automated tests) integrated into a continuous integration (CI) pipeline.', { boldPrefix: 'Objective 8' }),
    sectionHeading('1.4 Scope and Limitations'),
    paragraph(
      'Establishing well-defined functional boundaries is essential for engineering rigor. SIFS is designed for rapid institutional adoption while maintaining tight architectural boundaries.'
    ),
    bulletItem('Multi-tenant university onboarding and institutional profile management.', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Configurable departmental schema and cohort/intake batch initialization.', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Deterministic algorithmic student ID synthesis (Open-Credit & Close-Credit).', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Single student interactive enrollment with client-side canvas photo cropping.', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Bulk CSV admission with validation grid and [Photo Pending] visual badges.', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Interactive 3D PVC ID card simulation with dynamic Code 128 barcodes.', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Batch ID card sheet printing (2x4 CR-80 card matrix per A4 page).', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Dynamic institutional export file naming (SIFS - [UniShort]_[Dept]_[Batch]_[Action]).', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Soft-delete recycle bin with one-click restore and serial recalibration.', { boldPrefix: 'In-Scope Functionality' }),
    bulletItem('Direct payment gateway integration for student tuition fee processing (managed by university accounts departments).', { boldPrefix: 'Out-of-Scope Boundaries' }),
    bulletItem('Physical hardware smart-card magnetic stripe encoding (SIFS focuses on visual CR-80 and optical barcode standards).', { boldPrefix: 'Out-of-Scope Boundaries' }),
    bulletItem('Turnstile gate controller hardware firmware integration (reserved for future NFC/RFID extensions).', { boldPrefix: 'Out-of-Scope Boundaries' }),
    bulletItem('Operational Assumptions: Institutional administrators possess valid administrative authority; client browser environments run modern standards-compliant engines (Chromium/Gecko); backend infrastructure maintains persistent connectivity to PostgreSQL 15+.', { boldPrefix: 'System Assumptions' }),
    sectionHeading('1.5 Team Organization and Individual Contributions'),
    paragraph(
      'SIFS was developed collaboratively by a two-member engineering team under an Agile-Scrum framework. Responsibilities were strictly divided across the architectural stack to ensure complete module ownership, rigorous peer code review, and seamless integration through the central Git repository (https://github.com/R41YAN/smart-id-system.git).'
    ),
    tableCaption('Table 1.1. Work Breakdown Structure (WBS) and Technical Ownership Matrix'),
    createTable(
      ['Domain / Work Package', 'Md. Raiyan (ID: 0432320005101101)', 'Md. Fizul Islam Yamin (ID: 0432320005101114)'],
      [
        ['System Architecture & Backend', 'Lead: RESTful API design, Express 5 controller hierarchy, middleware pipeline, multi-tenant routing.', 'Contributor: API contract alignment, client axios interceptor integration, error payload handling.'],
        ['Database & Concurrency', 'Lead: PostgreSQL schema, relational foreign keys, row-level locking (SELECT FOR UPDATE), ACID transaction boundaries.', 'Contributor: Data normalization review, query parameter structure verification, seed data modeling.'],
        ['Core Formatting Engine', 'Lead: Algorithmic ID formulation (generateStudentId), regex pattern validation, zero-pad serial math.', 'Contributor: UI rule previewers, client-side format breakdown tooltips, example ID generators.'],
        ['Bulk CSV & Lifecycle', 'Lead: Multer CSV ingestion pipeline, asynchronous validation parser, photo URL fallback logic, soft-delete SQL.', 'Contributor: Client-side CSV template generator, validation data-table preview modal, photo pending badge UX.'],
        ['Recycle Bin & Recalibration', 'Lead: Soft-delete endpoints, permanent purge triggers, batch serial recalculation engine (MAX serial sync).', 'Contributor: Recycle Bin multi-tab UI (Students/Batches/Depts), 1-click restore/purge modal flows.'],
        ['Frontend & Card Engine', 'Contributor: Barcode stream endpoints, photo data-URL persistence verification.', 'Lead: React 19 SPA architecture, Tailwind CSS v4 styling, 3D interactive tilt simulation, JsBarcode integration.'],
        ['Batch A4 Sheet Printing', 'Contributor: Print endpoint payload optimization, server-side data sanitization.', 'Lead: Industrial 2x4 CR-80 card grid on A4, cut-guide styling, -webkit-print-color-adjust color lock, dynamic naming.'],
        ['Quality Assurance & CI/CD', 'Lead: Jest & Supertest backend suites (42 automated tests), GitHub Actions CI workflow, deployment orchestration.', 'Lead: Vitest & React Testing Library UI suites (25 automated tests), comprehensive user manual, documentation.']
      ],
      [22, 39, 39]
    )
  );

  return children;
}

module.exports = {
  getCoverPageChildren,
  getDeclarationChildren,
  getChapter1Children
};
