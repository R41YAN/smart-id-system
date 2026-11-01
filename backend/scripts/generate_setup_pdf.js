const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const repoDocsPath = path.resolve(__dirname, '../../docs/SIFS_Friend_PC_Setup_Guide.pdf');
const brainPath = 'C:/Users/PC/.gemini/antigravity/brain/759ab480-6004-4326-bc06-9def4a24f295/SIFS_Friend_PC_Setup_Guide.pdf';

// Ensure directories exist
fs.mkdirSync(path.dirname(repoDocsPath), { recursive: true });
fs.mkdirSync(path.dirname(brainPath), { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 45, left: 45, right: 45 },
  bufferPages: true
});

const writeStreamRepo = fs.createWriteStream(repoDocsPath);
doc.pipe(writeStreamRepo);

// Helper constants
const pageWidth = 595.28;
const pageHeight = 841.89;
const contentWidth = pageWidth - 90; // 505.28

const C_PRIMARY = '#1E3A8A';   // Dark Blue
const C_SECONDARY = '#2563EB'; // Vibrant Blue
const C_DARK = '#0F172A';      // Slate 900
const C_BODY = '#334155';      // Slate 700
const C_MUTED = '#64748B';     // Slate 500
const C_BG_CODE = '#0F172A';   // Dark code block
const C_TEXT_CODE = '#38BDF8'; // Cyan code text
const C_BOX_BG = '#F8FAFC';    // Light Slate
const C_BORDER = '#E2E8F0';    // Border Slate
const C_WARN_BG = '#FEF3C7';   // Amber 100
const C_WARN_BORDER = '#F59E0B'; // Amber 500
const C_WARN_TEXT = '#92400E'; // Amber 800
const C_SUCCESS_BG = '#ECFDF5'; // Emerald 50
const C_SUCCESS_BORDER = '#10B981'; // Emerald 500
const C_SUCCESS_TEXT = '#065F46'; // Emerald 800

function addHeaderBanner() {
  doc.rect(45, doc.y, contentWidth, 54).fill(C_PRIMARY);
  const startY = doc.y - 54;
  
  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('SMART ID CARD FORMULATION SYSTEM (SIFS)', 55, startY + 10, { width: contentWidth - 20, align: 'center' });

  doc.font('Helvetica')
     .fontSize(10)
     .fillColor('#93C5FD')
     .text('Friend’s PC Setup & Teacher Presentation Defense Guide', 55, startY + 32, { width: contentWidth - 20, align: 'center' });

  doc.y = startY + 62;
}

function addMetaRow() {
  doc.rect(45, doc.y, contentWidth, 22).fill('#F1F5F9');
  const y = doc.y - 22;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_DARK);
  doc.text('Target OS: Windows 10/11', 55, y + 6);
  doc.text('Database: Cloud Supabase PostgreSQL', 190, y + 6);
  doc.text('Repo: R41YAN/smart-id-system', 360, y + 6);
  doc.y = y + 28;
}

function sectionTitle(title, stepNumber = '') {
  if (doc.y > pageHeight - 100) {
    doc.addPage();
  }
  
  const y = doc.y;
  doc.roundedRect(45, y, contentWidth, 24, 3).fill('#EFF6FF');
  doc.rect(45, y, 4, 24).fill(C_SECONDARY);
  
  doc.font('Helvetica-Bold')
     .fontSize(11)
     .fillColor(C_PRIMARY)
     .text(stepNumber ? `STEP ${stepNumber}: ${title.toUpperCase()}` : title.toUpperCase(), 56, y + 6);
  
  doc.y = y + 30;
}

function codeBlock(codeLines) {
  const lineCount = Array.isArray(codeLines) ? codeLines.length : codeLines.split('\n').length;
  const blockHeight = lineCount * 13 + 14;
  
  if (doc.y + blockHeight > pageHeight - 50) {
    doc.addPage();
  }

  const y = doc.y;
  doc.roundedRect(45, y, contentWidth, blockHeight, 4).fill(C_BG_CODE);
  
  const text = Array.isArray(codeLines) ? codeLines.join('\n') : codeLines;
  doc.font('Courier')
     .fontSize(8.5)
     .fillColor(C_TEXT_CODE)
     .text(text, 55, y + 7, { width: contentWidth - 20, lineGap: 2 });

  doc.y = y + blockHeight + 8;
}

function infoBox(text, title = 'INFO') {
  const boxHeight = 44;
  if (doc.y + boxHeight > pageHeight - 50) {
    doc.addPage();
  }
  const y = doc.y;
  doc.roundedRect(45, y, contentWidth, boxHeight, 4).fill(C_BOX_BG);
  doc.rect(45, y, 3, boxHeight).fill(C_SECONDARY);

  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_SECONDARY).text(title, 55, y + 6);
  doc.font('Helvetica').fontSize(8).fillColor(C_BODY).text(text, 55, y + 18, { width: contentWidth - 20, lineGap: 1.5 });
  doc.y = y + boxHeight + 8;
}

function alertBox(text, title = 'CRITICAL SECURITY NOTE') {
  const boxHeight = 52;
  if (doc.y + boxHeight > pageHeight - 50) {
    doc.addPage();
  }
  const y = doc.y;
  doc.roundedRect(45, y, contentWidth, boxHeight, 4).fill(C_WARN_BG);
  doc.rect(45, y, 4, boxHeight).fill(C_WARN_BORDER);

  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_WARN_TEXT).text(title, 55, y + 6);
  doc.font('Helvetica').fontSize(8).fillColor(C_WARN_TEXT).text(text, 55, y + 18, { width: contentWidth - 20, lineGap: 1.5 });
  doc.y = y + boxHeight + 8;
}

function paragraph(text, boldPrefix = '') {
  if (doc.y > pageHeight - 55) {
    doc.addPage();
  }
  doc.font('Helvetica').fontSize(9).fillColor(C_BODY);
  if (boldPrefix) {
    doc.font('Helvetica-Bold').fillColor(C_DARK).text(boldPrefix + ' ', { continued: true });
    doc.font('Helvetica').fillColor(C_BODY).text(text, { lineGap: 2 });
  } else {
    doc.text(text, { lineGap: 2 });
  }
  doc.y += 4;
}

// ================= PAGE 1 =================
addHeaderBanner();
addMetaRow();

paragraph('This guide provides complete instructions to set up, configure, and execute the Smart ID Card Formulation System (SIFS) on another machine (e.g., your friend\'s PC) to present the working project and automated testing suite to your teacher or evaluation panel.');

infoBox(
  'SIFS uses a cloud-hosted PostgreSQL database on Supabase. Your friend DOES NOT need to install PostgreSQL, configure pgAdmin, or run local database seeds. The backend connects directly to the Supabase cloud cluster over the internet.',
  'ARCHITECTURE ADVANTAGE'
);

sectionTitle('Prerequisites Installation', '1');
paragraph('Ensure your friend’s computer has the following two tools installed before proceeding:');
paragraph('Download Node.js 18.x or 20.x LTS from https://nodejs.org. Run the installer with default settings. Node.js includes npm.', '• 1. Node.js (LTS Version):');
paragraph('Download from https://git-scm.com. Standard installer settings are completely fine.', '• 2. Git for Windows:');

infoBox(
  'NO! Default installation settings are 100% sufficient. Setting up git config (user.name and user.email) is ONLY required if your friend wants to commit or push code. For cloning, building, running, and testing, ZERO git configuration is required.',
  'FAQ: DOES YOUR FRIEND NEED TO CONFIGURE GIT AFTER DOWNLOADING?'
);

sectionTitle('Clone the Project Repository', '2');
paragraph('Open Command Prompt (cmd) or PowerShell on your friend’s computer, navigate to the desired working folder (e.g., Desktop or Projects), and clone the repository:');

codeBlock([
  'git clone https://github.com/R41YAN/smart-id-system.git',
  'cd smart-id-system'
]);

sectionTitle('Backend Environment Setup (.env)', '3');
paragraph('Navigate into the backend directory and create a configuration file named .env:', 'A. Create backend/.env:');

codeBlock([
  'cd backend',
  '# On Windows PowerShell, create the file using notepad:',
  'notepad .env'
]);

paragraph('Paste the following environment variables into the backend/.env file and save it:', 'B. Environment Variables:');

codeBlock([
  'PORT=5000',
  'DATABASE_URL=postgresql://postgres.qwqnrvpubmnarseleegr:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  'JWT_SECRET=smart_id_super_secret_key_2026',
  'NODE_ENV=development'
]);

alertBox(
  'The repository code and this guide replace the real database password with [YOUR_PASSWORD] to protect your Supabase cluster from unauthorized access on public Git. You (the repository owner) must supply the real password privately to your friend when filling the .env file.',
  'CRITICAL SECURITY: REPLACE [YOUR_PASSWORD]'
);

infoBox(
  'JWT_SECRET is a cryptographic signing key used by JSON Web Token (JWT) during administrator authentication. When an admin logs in, the backend signs the session token with this secret key. The default value (smart_id_super_secret_key_2026) is fully functional for local demonstration.',
  'EXPLANATION: WHAT IS JWT_SECRET?'
);

// ================= PAGE 2 =================
doc.addPage();

sectionTitle('Install Backend Dependencies & Launch Server', '4');
paragraph('Inside the backend/ directory, install the required packages and start the Node.js API server:');

codeBlock([
  '# Inside smart-id-system/backend',
  'npm install',
  'npm run dev'
]);

paragraph('You should see confirmation messages indicating successful initialization:', 'Expected Console Output:');
codeBlock([
  '[nodemon] starting `node server.js`',
  'Server running on port 5000',
  'Database connected successfully to Supabase PostgreSQL'
]);

sectionTitle('Install Frontend Dependencies & Start Client', '5');
paragraph('Leave the backend terminal running. Open a SECOND terminal window or tab, navigate to the frontend folder, and launch the Vite development server:');

codeBlock([
  '# Open a new PowerShell / Command Prompt window',
  'cd smart-id-system/frontend',
  'npm install',
  'npm run dev'
]);

paragraph('Vite will output the local development URL. Open your web browser and navigate to:', 'Expected Console Output:');
codeBlock([
  '  VITE v5.x.x  ready in 320 ms',
  '  ➜  Local:   http://localhost:5173/'
]);

sectionTitle('Teacher Presentation & Defense Demonstration', '6');
paragraph('Follow this exact workflow to demonstrate the full capabilities of the system to your course instructor:');

paragraph('Navigate to http://localhost:5173/login. Enter your administrator email and password to access the administrative dashboard.', '1. Administrative Authentication:');

paragraph('Demonstrate the student registration form. Input Department (CSE), Academic Year (2026), Batch (05), and Roll (001). Show how the unique Smart ID (2026CSE05001) is formulated deterministically following university business logic.', '2. Student Admission & ID Formulation:');

paragraph('Show the generated digital ID card containing the student profile picture, formatted barcode/QR code, academic credentials, and official stamp. Demonstrate one-click PDF/card export.', '3. Digital ID Card Generation:');

paragraph('Show that any student admitted on your friend\'s PC is instantly stored in the Supabase cloud PostgreSQL database and remains persistent across sessions.', '4. Real-Time Cloud Persistence:');

// ================= PAGE 3 =================
doc.addPage();

sectionTitle('Automated Testing Demonstration (CO3 Lab Requirement)', '7');
paragraph('Your course teacher will likely want to verify the software quality, unit testing, and test coverage implemented for the project. Run the automated test suites in front of the teacher:');

paragraph('Open terminal in backend/ and run the Jest test suite:', 'A. Backend Testing (34 Unit & Integration Tests):');
codeBlock([
  'cd smart-id-system/backend',
  'npm test'
]);
paragraph('To display the comprehensive code coverage report (100% coverage on core ID generator engine):');
codeBlock([
  'npm run test:coverage'
]);

paragraph('Open terminal in frontend/ and execute the Vitest test suite:', 'B. Frontend Component Testing (11 Component Tests):');
codeBlock([
  'cd smart-id-system/frontend',
  'npm test'
]);
paragraph('To display the frontend coverage table:');
codeBlock([
  'npm run test:coverage'
]);

sectionTitle('Troubleshooting & Common Questions', '8');

paragraph('Ensure your friend’s PC has an active internet connection. Verify that [YOUR_PASSWORD] was replaced with the actual database password and that there are no accidental brackets or trailing spaces in backend/.env.', '• Database Connection Refused / Timeout:');

paragraph('Open PowerShell as Administrator and execute: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass. This allows npm and nodemon scripts to run without restriction.', '• PowerShell Script Execution Policy Error:');

paragraph('Another service is occupying port 5000 or 5173. Run taskkill /F /IM node.exe in Command Prompt to terminate background node instances, then restart.', '• Port Already in Use (EADDRINUSE):');

paragraph('Only if you invite them as a GitHub Collaborator or if they fork the repository. By default, cloning allows them to pull, build, run, and test locally without any ability to modify your remote GitHub repository.', '• Can my friend edit or push to my GitHub repo?');

paragraph('No! Your friend uses the cloud database connection via backend/.env without ever logging in to Supabase. Only you (the project owner) need the Supabase admin login.', '• Does my friend need a Supabase account?');

// Final footer box
doc.y += 10;
const finalBoxY = doc.y;
doc.roundedRect(45, finalBoxY, contentWidth, 34, 4).fill(C_SUCCESS_BG);
doc.rect(45, finalBoxY, 3, 34).fill(C_SUCCESS_BORDER);
doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_SUCCESS_TEXT).text('READY FOR DEFENSE', 55, finalBoxY + 5);
doc.font('Helvetica').fontSize(8).fillColor(C_SUCCESS_TEXT).text('Your project is fully prepared for demonstration. All database persistence, authentication, and automated test coverage are self-contained and ready.', 55, finalBoxY + 17);

// Add page numbers
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor(C_MUTED)
     .text(
       `Smart ID Card Formulation System (SIFS)  |  Page ${i + 1} of ${range.count}`,
       45,
       pageHeight - 30,
       { width: contentWidth, align: 'center' }
     );
}

doc.end();

writeStreamRepo.on('finish', () => {
  // Also copy to brain artifact path
  try {
    fs.copyFileSync(repoDocsPath, brainPath);
    console.log(`Successfully generated PDF at: ${repoDocsPath}`);
    console.log(`Successfully mirrored to artifact path: ${brainPath}`);
  } catch (err) {
    console.error('Error copying to brain path:', err);
  }
});
