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
  createTable
} = require('./report_helpers');

function getAppendicesAndJustificationChildren() {
  const children = [];

  // APPENDIX A
  children.push(
    chapterHeading('Appendix A: Tool Usage Log'),
    paragraph(
      'In strict adherence to the UITS CSE Department and CSE 416 assessment guidelines, Table A.1 records the chronological use of assistive engineering tools throughout the 14-week project lifecycle. Every entry demonstrates that the engineering team conceived, designed, and authored solutions independently first, utilizing tools exclusively to refine, explore, or verify designs prior to validation.'
    ),
    tableCaption('Table A.1. 14-Week Assistive Tool Usage and Engineering Verification Ledger'),
    createTable(
      ['Wk', 'Task / Artifact', 'Tool Used', 'Own Design First (What we did)', 'Tool\'s Role (Refine / Explore / Verify)', 'How Output was Verified', 'Decision (Accepted / Modified / Rejected)'],
      [
        ['W1', 'Domain Research & Literature Survey', 'Google Gemini', 'Conducted manual interviews with 4 university registrars; mapped credit system differences.', 'Explore: Queried global academic identifier standards (US FERPA, UK HESA).', 'Cross-referenced against UGC Bangladesh credit transfer guidelines.', 'Accepted context; retained focus on dual credit models.'],
        ['W3', 'Deterministic ID Algorithm Formulation', 'VS Code Copilot', 'Designed mathematical string composition: [Dept][Batch][YY][Serial] vs [Dept][YY][Term][Serial].', 'Refine: Suggested JavaScript template literal formatting syntax.', 'Unit tested with 25 manual mock inputs covering edge cases.', 'Accepted string interpolation syntax.'],
        ['W5', 'Concurrency Lock Design (Postgres)', 'Qodo AI', 'Identified race condition vulnerability in SELECT MAX(serial); selected row-level locking.', 'Explore: Queried performance differences between SHARE LOCK and FOR UPDATE.', 'Constructed multi-threaded test with Supertest firing 50 concurrent requests.', 'Accepted FOR UPDATE; rejected optimistic versioning.'],
        ['W7', 'JWT Middleware & RBAC Architecture', 'ChatGPT (GPT-4o)', 'Drafted 3-tier role hierarchy (Super Admin, Client Admin, Officer) and payload schema.', 'Verify: Evaluated JWT payload security and signature expiration rules.', 'Audited against OWASP JWT Cheat Sheet guidelines.', 'Accepted 24h expiration; modified to include tenant university_id in claims.'],
        ['W9', 'Bulk CSV Parser & Validation Flow', 'Qodo AI', 'Designed asynchronous CSV stream parsing with non-blocking error array collection.', 'Refine: Suggested regex pattern for validating comma-separated student emails.', 'Executed edge test with 50-row CSV containing 5 malformed emails.', 'Accepted regex validator; added photo URL sanity checks.'],
        ['W11', 'Print Engine Background Loss Fix', 'Gemini', 'Observed browser print engine stripping dark-navy card header bands to white in PDF.', 'Explore: Queried CSS paged media specifications for color forcing.', 'Tested print output across Chrome, Edge, and Firefox print dialogs.', 'Accepted -webkit-print-color-adjust: exact on root body and card nodes.'],
        ['W13', 'Automated Test Suite Expansion', 'Jest CLI Runner', 'Authored 55 unit and integration tests covering API endpoints and UI state machines.', 'Verify: Analyzed branch coverage gaps in recycle bin recalibration logic.', 'Authored 12 additional test cases bringing total to 67 automated tests.', 'Accepted: Reached 100% pass rate across 67 automated tests.'],
        ['W14', 'GitHub Actions CI/CD Pipeline', 'GitHub Copilot', 'Outlined 5-stage pipeline: Checkout, Node setup, Lint, Test, and Vite build.', 'Refine: Suggested caching strategy for npm dependencies to reduce build times.', 'Triggered 6 pipeline runs on feature branches to verify runner stability.', 'Accepted node_modules caching; pipeline execution time dropped from 4m to 1m 15s.']
      ],
      [6, 18, 14, 20, 16, 14, 12]
    ),

    // APPENDIX B
    chapterHeading('Appendix B: Team Contribution Record'),
    paragraph(
      'SIFS was developed collaboratively by two equal-partnership engineers. Both team members contributed across all project phases, with primary technical leads assigned to ensure modular ownership, accountability, and seamless repository integration.'
    ),
    paragraph('Repository URL: https://github.com/R41YAN/smart-id-system.git'),
    tableCaption('Table B.1. Team Member Technical Contribution and Ownership Breakdown'),
    createTable(
      ['Team Member (Name & Student ID)', 'Architectural Modules Owned', 'Git Commits & Pull Requests', 'Documentation, Testing & Review Role'],
      [
        ['Md. Raiyan\nID: 0432320005101101\nSection: 7B1', '• Lead: Backend RESTful API & Express 5 Routing\n• Lead: PostgreSQL Schema & Relational Modeling\n• Lead: Pessimistic Row-Locking (SELECT FOR UPDATE)\n• Lead: Deterministic ID Algorithm (idService.js)\n• Lead: Bulk CSV Ingestion & Multer Pipeline\n• Lead: Recycle Bin Endpoints & Serial Recalibration\n• Lead: Code 128 Barcode Engine Integration\n• Lead: GitHub Actions CI/CD Pipeline Setup', '• 48 Commits on main & feature branches\n• 14 Authored Pull Requests\n• Reviewed 12 Frontend PRs\n• Co-authored 5 Hotfix Commits', '• Lead: Backend Testing (42 Jest/Supertest Tests)\n• Lead: Concurrency Stress Test Suite (6 tests)\n• Lead: Security Hardening (OWASP, Bcrypt, JWT)\n• Co-Author: SIFS Software Testing QA Report\n• Co-Author: SIFS Course Project Report (Docx/MD)'],
        ['Md. Fizul Islam Yamin\nID: 0432320005101114\nSection: 7B1', '• Lead: Frontend SPA Architecture (React 19 & Vite 8)\n• Lead: UI Component Library (Tailwind CSS v4)\n• Lead: Interactive 3D PVC Tilt Card Simulation\n• Lead: Batch A4 Sheet Print Engine (2x4 CR-80 Grid)\n• Lead: CSS Print Color Preservation (-webkit-print)\n• Lead: Dynamic File Naming (buildExportFileName)\n• Lead: Bulk Admission Preview Data-Table UX\n• Lead: Static Photo Avatars (Dashboard & Recycle Bin)', '• 44 Commits on main & feature branches\n• 12 Authored Pull Requests\n• Reviewed 14 Backend PRs\n• Co-authored 5 Hotfix Commits', '• Lead: Frontend Testing (25 Vitest/RTL Tests)\n• Lead: UI Component Responsiveness & Accessibility\n• Lead: Friend PC Setup Guide (PDF)\n• Co-Author: SIFS Software Testing QA Report\n• Co-Author: SIFS Course Project Report (Docx/MD)']
      ],
      [24, 30, 22, 24]
    ),

    // JUSTIFICATION REPORT
    chapterHeading('Justification Report (ABET / BAETE Accreditation)'),
    paragraph(
      'Below is the comprehensive Course Outcome to Program Outcome (CO-PO) Mapping and Complex Engineering Problem (CEP) / Complex Engineering Activity (CEA) Justification Report for the project titled "Smart ID Formatting System (SIFS)", submitted for CSE 416 (Software Project Design and Development) in Autumn 2026 under the Board of Accreditation for Engineering and Technical Education (BAETE) accreditation framework.'
    ),
    sectionHeading('CO-PO Mapping Matrix'),
    tableCaption('Table JR.1. Course Outcome (CO) Specification and Attribute Mapping'),
    createTable(
      ['CO No.', 'Course Outcome Description', 'Mapped PO', 'Domain / Level', 'KP', 'CP / CA Attributes'],
      [
        ['CO1', 'Analyze project requirements and design a software solution for a real-life problem, using modern requirements and modeling tools to refine and verify the design.', 'PO(c)', 'Cognitive (C) — Level 4 (Analyzing)', 'K5', 'WP1, WP2, WP3'],
        ['CO2', 'Apply modern engineering tools and techniques across the SDLC (design, coding, review, DevOps) to build effective software solutions.', 'PO(e)', 'Cognitive (C) — Level 3 (Applying)', 'K6', 'EA1, EA2'],
        ['CO3', 'Create and implement robust testing and quality-assurance mechanisms to ensure software quality.', 'PO(i)', 'Cognitive (C) — Level 5 (Evaluating)', 'K6', 'WP1, WP2, WP3'],
        ['CO4', 'Implement, deploy and manage a real-life complex software product end-to-end, with version control, CI/CD and release management.', 'PO(k)', 'Cognitive (C) — Level 6 (Creating)', 'K6', 'EA1, EA2, EA3'],
        ['CO5', 'Investigate a real-life problem by evaluating alternative solutions and justifying design decisions with evidence.', 'PO(d)', 'Cognitive (C) — Level 5 (Evaluating)', 'K8', 'WP1, WP2, WP3'],
        ['CO6', 'Communicate software engineering work effectively through professional documentation, reports and oral presentation.', 'PO(g)', 'Affective / Cog (C/A) — L4 / A3', 'K7', 'EA1, EA2, EA5'],
        ['CO7', 'Function effectively as a member of a two-person team, sharing responsibility and integrating individual contributions.', 'PO(h)', 'Affective (A) — Level 3 (Valuing)', 'K7', 'EA1, EA2'],
        ['CO8', 'Demonstrate ethical and professional responsibility in software licensing, secure data handling and honest disclosure of tool use.', 'PO(f)', 'Affective (A) — Level 3 (Valuing)', 'K7', 'EA1']
      ],
      [8, 44, 12, 18, 6, 12]
    ),
    sectionHeading('Mapping of COs with Program Outcomes (POs)'),
    paragraph(
      'Correlation Strength: 3 = High, 2 = Medium, 1 = Low.'
    ),
    tableCaption('Table JR.2. Correlation Strength Matrix: Course Outcomes vs. Program Outcomes'),
    createTable(
      ['CO', 'PO(a)', 'PO(b)', 'PO(c)', 'PO(d)', 'PO(e)', 'PO(f)', 'PO(g)', 'PO(h)', 'PO(i)', 'PO(j)', 'PO(k)', 'PO(l)'],
      [
        ['CO1', '-', '-', '3', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
        ['CO2', '-', '-', '-', '-', '3', '-', '-', '-', '-', '-', '-', '-'],
        ['CO3', '-', '-', '-', '-', '-', '-', '-', '-', '3', '-', '-', '-'],
        ['CO4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3', '-'],
        ['CO5', '-', '-', '-', '2', '-', '-', '-', '-', '-', '-', '-', '-'],
        ['CO6', '-', '-', '-', '-', '-', '-', '2', '-', '-', '-', '-', '-'],
        ['CO7', '-', '-', '-', '-', '-', '-', '-', '2', '-', '-', '-', '-'],
        ['CO8', '-', '-', '-', '-', '-', '2', '-', '-', '-', '-', '-', '-']
      ],
      [12, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7]
    ),
    sectionHeading('Detailed Justification of Program Outcomes (POs) Through COs'),
    paragraph(
      'This sub-section provides exhaustive engineering justifications demonstrating how each mapped Course Outcome satisfies its corresponding Program Outcome, citing the exact sections of this report where theoretical and empirical evidence resides.'
    ),
    bulletItem(
      'Justification: The real-world problem of institutional credential fragmentation and race conditions was rigorously investigated through interviews and empirical analysis of university credit models. The problem was formalized into an SRS comprising 10 functional requirements, 5 non-functional requirements, and 1 core constraint (Section 2.4, Table 2.2). The engineering design was synthesized into comprehensive structural and behavioral models: Use-Case Diagram (Section 3.4.1), Entity-Relationship Diagram (Section 3.4.2), Concurrency Sequence Diagram (Section 3.4.3), Activity Diagram (Section 3.4.4), Component Architecture (Section 3.3), and UI Wireframes (Section 3.5). The design was refined and verified using modern modeling tools and validated through automated API testing.',
      { boldPrefix: 'CO1 -> PO(c) [Design/Development of Solutions] (Correlation: 3 - High)' }
    ),
    bulletItem(
      'Justification: A modern, cloud-native engineering toolchain was deployed across every phase of the SDLC. Frontend development utilized React 19, Vite 8, and Tailwind CSS v4; the backend utilized Node.js 24 and Express 5; data persistence relied on PostgreSQL 15; testing was orchestrated via Jest, Supertest, and Vitest; CI/CD was managed via GitHub Actions. Human-first engineering was strictly preserved: architectural foundations and algorithms were conceived and authored prior to assistive tool engagement for syntax exploration and edge-case verification (Section 3.3, Table 3.1; Section 4.2–4.5; Appendix A, Table A.1).',
      { boldPrefix: 'CO2 -> PO(e) [Modern Tool Usage] (Correlation: 3 - High)' }
    ),
    bulletItem(
      'Justification: A robust quality assurance framework was constructed to evaluate system correctness, ACID transaction isolation, and UI responsiveness. The test harness executed 13 automated test suites comprising 67 automated test cases (42 Backend tests and 25 Frontend tests), achieving a 100% pass rate. Concurrency testing validated zero duplicate student ID collisions under 50 simultaneous threads utilizing PostgreSQL row-level locks. Over 38 technical defects were systematically triaged and resolved (Section 5.2, Table 5.1 & Table 5.2; Section 5.3, Table 5.3).',
      { boldPrefix: 'CO3 -> PO(i) [Individual and Team Work / Quality Assurance] (Correlation: 3 - High)' }
    ),
    bulletItem(
      'Justification: The SIFS platform was implemented as a production-grade software system and managed under professional engineering workflows. Source code was versioned in a public Git repository with strict branching rules and Conventional Commits. A 5-stage automated CI/CD pipeline was constructed in GitHub Actions to execute automated testing and build verification on push, producing releases v1.0.0 and v1.1.0 (Section 4.2–4.4; Section 5.4–5.5, Fig. 5.1, Table 5.4).',
      { boldPrefix: 'CO4 -> PO(k) [Project Management and Finance / DevOps] (Correlation: 3 - High)' }
    ),
    bulletItem(
      'Justification: The engineering team conducted a comparative investigation of existing solutions (spreadsheets and commercial ERPs) against SIFS across 9 technical parameters (Section 2.2, Table 2.1). Three distinct architectural alternatives were conceptualized and evaluated against technical, economic, and operational feasibility (Section 2.5). Critical architectural trade-offs—including pessimistic row-locking vs. optimistic versioning, Code 128 barcodes vs. QR codes, and soft-delete recalibration—were justified with empirical test data (Section 3.6, Table 3.2).',
      { boldPrefix: 'CO5 -> PO(d) [Investigation of Complex Problems] (Correlation: 2 - Medium)' }
    ),
    bulletItem(
      'Justification: The technical design, implementation, and experimental findings were communicated through professional engineering documentation: the formal Software Requirements Specification (SRS), Software Testing QA Report, comprehensive README.md repository guide, Friend PC Setup Guide, this 35+ page Course Project Report, and the final viva demonstration (Section 5.4; Appendix B; Justification Report).',
      { boldPrefix: 'CO6 -> PO(g) [Communication] (Correlation: 2 - Medium)' }
    ),
    bulletItem(
      'Justification: SIFS was built by a two-member engineering team functioning under Agile-Scrum principles. Technical responsibilities were partitioned between Backend/Database Lead (Md. Raiyan) and Frontend/UI Lead (Md. Fizul Islam Yamin). Integration was coordinated through 26 pull requests, peer code reviews, and shared automated testing harnesses (Section 1.5, Table 1.1; Appendix B, Table B.1).',
      { boldPrefix: 'CO7 -> PO(h) [Ethics and Professional Responsibility / Teamwork] (Correlation: 2 - Medium)' }
    ),
    bulletItem(
      'Justification: Ethical standards and data security were maintained throughout the project. Administrative credentials were protected via Bcrypt hashing (10 salt rounds) and JWT authentication. All third-party libraries were verified under permissive MIT open-source licenses. In full compliance with academic integrity, all AI tool usage was disclosed chronologically in Appendix A (Section 5.3; Section 6.2; Appendix A, Table A.1).',
      { boldPrefix: 'CO8 -> PO(f) [The Engineer and Society / Professional Ethics] (Correlation: 2 - Medium)' }
    ),
    sectionHeading('Complex Engineering Problem (CEP) Justification'),
    paragraph(
      'In accordance with BAETE accreditation guidelines, SIFS satisfies the requirements of a Complex Engineering Problem (CEP) as demonstrated across one mandatory attribute (WP1) and two supporting attributes (WP2 and WP3):'
    ),
    bulletItem(
      'WP1: Depth of Knowledge Required (Mandatory Attribute — Linked COs: CO1, CO3, CO5): SIFS cannot be resolved using routine software engineering techniques. Solving the concurrent admission collision problem requires in-depth engineering knowledge (K5) of relational transaction isolation levels, row-level locking primitives (SELECT ... FOR UPDATE), and database deadlock prevention. Furthermore, unifying open-credit and close-credit academic structures requires knowledge of research literature (K8) regarding academic enterprise modeling and deterministic identifier formulation (Section 1.1; Section 2.1–2.2; Section 3.3; Section 4.3).',
      { boldPrefix: 'Mandatory Attribute WP1' }
    ),
    bulletItem(
      'WP2: Range of Conflicting Requirements (Supporting Attribute — Linked COs: CO1, CO3, CO5): SIFS resolves multiple severe engineering trade-offs: (1) High-throughput bulk admission processing vs. strict ACID sequential row-locking; (2) Preserving rich physical card styling (dark navy gradients) vs. default browser printer drivers that strip background colors for ink saving; (3) Soft-delete recovery flexibility vs. sequential batch counter synchronization (Section 2.4, Table 2.2; Section 3.6, Table 3.2; Section 5.3, Table 5.3).',
      { boldPrefix: 'Supporting Attribute WP2' }
    ),
    bulletItem(
      'WP3: Depth of Analysis Required (Supporting Attribute — Linked COs: CO1, CO3, CO5): SIFS involved rigorous analysis extending far beyond standard coding tasks. The team modeled concurrency race conditions mathematically, conducted stress benchmarking across 50 simultaneous admission threads, analyzed CSS print engine paged media specifications, and triaged 38 distinct software defects to establish a 100% passing test baseline (Section 1.2, Fig. 1.1; Section 3.6, Table 3.2; Section 5.2, Table 5.2; Section 5.3, Table 5.3).',
      { boldPrefix: 'Supporting Attribute WP3' }
    ),
    sectionHeading('Range of Complex Engineering Activities (CEA) Justification'),
    paragraph(
      'The engineering activities undertaken during the project satisfy the criteria for Complex Engineering Activities (CEA):'
    ),
    bulletItem(
      'EA1: Range of Resources (Linked COs: CO4, CO6, CO7): Engaged a diverse array of enterprise tools, full-stack frameworks (React 19, Node 24, PostgreSQL 15), testing environments (Jest, Supertest, Vitest), cloud CI/CD infrastructure (GitHub Actions), and multi-tenant hosting architectures.',
      { boldPrefix: 'Attribute EA1' }
    ),
    bulletItem(
      'EA2: Level of Interaction (Linked COs: CO4, CO6, CO7): Navigated complex interactions between disparate academic stakeholders (registrars, IT officers, students), bridging conflicting administrative requirements between open-credit and close-credit operational paradigms.',
      { boldPrefix: 'Attribute EA2' }
    ),
    bulletItem(
      'EA3: Innovation (Linked COs: CO4): Conceived novel technical solutions including the deterministic dual-credit algorithmic engine, browser-native 2x4 CR-80 card sheet printing with CSS print color locking, and dynamic institutional file naming patterns.',
      { boldPrefix: 'Attribute EA3' }
    ),
    bulletItem(
      'EA5: Familiarity (Linked COs: CO6): Extended far beyond routine coursework projects by engineering production-grade concurrency locking, multi-tenant database isolation, automated serial counter recalibration, and enterprise recycle bin recovery mechanisms.',
      { boldPrefix: 'Attribute EA5' }
    ),
    sectionHeading('Mapping to Communication (CO6)'),
    paragraph(
      'Written Technical Documents: This formal 35+ page Course Project Report, the Software Requirements Specification (SRS), the Software Testing QA Report, and the GitHub README repository manual were compiled following strict professional formatting standards.\n' +
      'Oral Presentations & Viva: Technical architecture, concurrency locking proofs, and tool usage logs were defended in live demonstrations before the course instructor and examination panel.\n' +
      'Visual Representations: The project features 10 formal technical diagrams, including Gantt charts, multi-tier component topologies, Use-Case diagrams, Entity-Relationship diagrams (ERD), sequence diagrams, activity workflows, wireframe mockups, and CI/CD pipelines.'
    )
  );

  return children;
}

module.exports = {
  getAppendicesAndJustificationChildren
};
