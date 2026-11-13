const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType
} = require('docx');

const {
  FONT_PRIMARY,
  C_NAVY,
  C_MUTED,
  repoDocxPath,
  brainDocxPath
} = require('./report_builder/report_helpers');

const { getCoverPageChildren, getDeclarationChildren, getChapter1Children } = require('./report_builder/part1_cover_and_intro');
const { getChapter2Children } = require('./report_builder/part2_background_and_srs');
const { getChapter3Children } = require('./report_builder/part3_system_design');
const { getChapter4Children } = require('./report_builder/part4_implementation');
const { getChapter5and6Children } = require('./report_builder/part5_testing_and_results');
const { getAppendicesAndJustificationChildren } = require('./report_builder/part6_appendices_and_justification');

console.log('[BUILDER] Starting compilation of SIFS Course Project Report (CSE 416)...');

// 1. Cover & Declaration Section Children
const coverChildren = [
  ...getCoverPageChildren(),
  new Paragraph({
    children: [new TextRun({ text: '', break: 1 })],
    pageBreakBefore: true
  }),
  ...getDeclarationChildren(),
  new Paragraph({
    children: [new TextRun({ text: '', break: 1 })],
    pageBreakBefore: true
  })
];

// 2. Main Body Children (Chapters 1-6, References, Appendices, Justification)
const bodyChildren = [
  ...getChapter1Children(),
  new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }),
  ...getChapter2Children(),
  new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }),
  ...getChapter3Children(),
  new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }),
  ...getChapter4Children(),
  new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }),
  ...getChapter5and6Children(),
  new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }),
  ...getAppendicesAndJustificationChildren()
];

// 3. Assemble Full Document with Sections, Headers, Footers, and Page Numbers
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT_PRIMARY,
          size: 21, // 10.5pt
          color: '334155'
        }
      }
    }
  },
  sections: [
    // Section 1: Title and Declaration (No running headers/footers)
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      children: coverChildren
    },
    // Section 2: Main Body Report
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          pageNumbers: {
            start: 1,
            formatType: NumberFormat.DECIMAL
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 0, after: 120 },
              children: [
                new TextRun({
                  text: 'SIFS: Smart ID Formatting System',
                  bold: true,
                  size: 17,
                  font: FONT_PRIMARY,
                  color: C_NAVY
                }),
                new TextRun({
                  text: '\t\tCSE 416 Course Project Report',
                  italics: true,
                  size: 17,
                  font: FONT_PRIMARY,
                  color: C_MUTED
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 120, after: 0 },
              children: [
                new TextRun({
                  text: 'Department of CSE, UITS',
                  size: 17,
                  font: FONT_PRIMARY,
                  color: C_MUTED
                }),
                new TextRun({
                  text: '\t\tPage ',
                  size: 17,
                  font: FONT_PRIMARY,
                  color: C_MUTED
                }),
                PageNumber.CURRENT,
                new TextRun({
                  text: ' of ',
                  size: 17,
                  font: FONT_PRIMARY,
                  color: C_MUTED
                }),
                PageNumber.TOTAL_PAGES
              ]
            })
          ]
        })
      },
      children: bodyChildren
    }
  ]
});

// 4. Pack and write to disk
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(repoDocxPath, buffer);
  console.log(`[SUCCESS] Wrote ${buffer.length} bytes to ${repoDocxPath}`);
  try {
    fs.writeFileSync(brainDocxPath, buffer);
    console.log(`[SUCCESS] Wrote ${buffer.length} bytes to ${brainDocxPath}`);
  } catch(e) {}
}).catch(err => {
  console.error('[ERROR] Failed to compile document:', err);
  process.exit(1);
});
