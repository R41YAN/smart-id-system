const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun
} = require('D:/ক PDF 1/7th Semester/Software Project Lab/Project/smart-id-system/backend/node_modules/docx');

// Output target paths
const brainDocxPath = 'C:/Users/PC/.gemini/antigravity/brain/759ab480-6004-4326-bc06-9def4a24f295/SIFS_CSE416_Course_Project_Report.docx';
const repoDocxPath = 'D:/ক PDF 1/7th Semester/Software Project Lab/Project/smart-id-system/docs/SIFS_CSE416_Course_Project_Report.docx';
const logoPath = 'D:/ক PDF 1/7th Semester/Software Project Lab/Project/smart-id-system/frontend/public/logo.jpg';

// Visual Styling Palette (Strict Academic & Professional Engineering Theme)
const FONT_PRIMARY = 'Calibri';
const FONT_CODE = 'Consolas';

const C_NAVY = '1E3A8A';       // Deep Academic Navy (#1E3A8A)
const C_BLUE = '2563EB';       // Royal Blue (#2563EB)
const C_DARK = '0F172A';       // Slate 900
const C_BODY = '334155';       // Slate 700
const C_MUTED = '64748B';      // Slate 500
const C_BORDER = 'CBD5E1';     // Slate 300
const C_ROW_ALT = 'F8FAFC';    // Slate 50 alternate row fill
const C_HEADER_BG = '1E3A8A';  // Primary Navy Table Header
const C_CODE_BG = 'F8FAFC';    // Clean code background
const C_CODE_BORDER = '94A3B8';// Slate 400
const C_CALLOUT_BG = 'EFF6FF'; // Ice Blue callout box
const C_CALLOUT_BORDER = '3B82F6';

const BORDER_STYLE = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: C_BORDER
};

const CELL_BORDERS = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE
};

const CELL_MARGINS = {
  top: 100,
  bottom: 100,
  left: 140,
  right: 140
};

// Formatting Helper Functions
function docTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120, line: 280 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 46, // 23pt
        font: FONT_PRIMARY,
        color: C_NAVY
      })
    ]
  });
}

function docSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200, line: 260 },
    children: [
      new TextRun({
        text,
        italics: true,
        size: 23, // 11.5pt
        font: FONT_PRIMARY,
        color: C_MUTED
      })
    ]
  });
}

function chapterHeading(text) {
  return new Paragraph({
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        font: FONT_PRIMARY,
        color: C_NAVY
      })
    ]
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26, // 13pt
        font: FONT_PRIMARY,
        color: C_BLUE
      })
    ]
  });
}

function subSectionHeading(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22, // 11pt
        font: FONT_PRIMARY,
        color: C_DARK
      })
    ]
  });
}

function paragraph(text, options = {}) {
  const runs = [];
  if (options.boldPrefix) {
    runs.push(new TextRun({
      text: options.boldPrefix + ' ',
      bold: true,
      size: 21, // 10.5pt
      font: FONT_PRIMARY,
      color: C_DARK
    }));
  }
  runs.push(new TextRun({
    text,
    bold: options.bold || false,
    italics: options.italics || false,
    size: 21, // 10.5pt
    font: FONT_PRIMARY,
    color: options.color || C_BODY
  }));

  return new Paragraph({
    alignment: options.align || AlignmentType.JUSTIFIED,
    spacing: { before: 50, after: 90, line: 270, lineRule: 'auto' },
    children: runs
  });
}

function bulletItem(text, options = {}) {
  const runs = [];
  if (options.boldPrefix) {
    runs.push(new TextRun({
      text: options.boldPrefix + ': ',
      bold: true,
      size: 20, // 10pt
      font: FONT_PRIMARY,
      color: C_DARK
    }));
  }
  runs.push(new TextRun({
    text,
    bold: options.bold || false,
    italics: options.italics || false,
    size: 20, // 10pt
    font: FONT_PRIMARY,
    color: C_BODY
  }));

  return new Paragraph({
    bullet: { level: options.level || 0 },
    spacing: { before: 30, after: 50, line: 250 },
    children: runs
  });
}

function numberedItem(numStr, text, options = {}) {
  const runs = [
    new TextRun({
      text: numStr + ' ',
      bold: true,
      size: 20,
      font: FONT_PRIMARY,
      color: C_NAVY
    })
  ];
  if (options.boldPrefix) {
    runs.push(new TextRun({
      text: options.boldPrefix + ': ',
      bold: true,
      size: 20,
      font: FONT_PRIMARY,
      color: C_DARK
    }));
  }
  runs.push(new TextRun({
    text,
    bold: options.bold || false,
    italics: options.italics || false,
    size: 20,
    font: FONT_PRIMARY,
    color: C_BODY
  }));

  return new Paragraph({
    spacing: { before: 40, after: 50, line: 250 },
    children: runs
  });
}

function tableCaption(text) {
  // SPDD Template: Table captions are placed ABOVE the table
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 60 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 20, // 10pt
        font: FONT_PRIMARY,
        color: C_NAVY
      })
    ]
  });
}

function figureCaption(text) {
  // SPDD Template: Figure captions are placed BELOW the figure. Short captions centered, long justified.
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 180 },
    children: [
      new TextRun({
        text,
        bold: true,
        italics: true,
        size: 19, // 9.5pt
        font: FONT_PRIMARY,
        color: C_MUTED
      })
    ]
  });
}

function codeSnippet(lines, title = null) {
  const lineArray = Array.isArray(lines) ? lines : lines.split('\n');
  const paragraphs = [];

  if (title) {
    paragraphs.push(new Paragraph({
      spacing: { before: 40, after: 60 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 18,
          font: FONT_PRIMARY,
          color: C_NAVY
        })
      ]
    }));
  }

  lineArray.forEach(line => {
    paragraphs.push(new Paragraph({
      spacing: { before: 12, after: 12, line: 210 },
      children: [
        new TextRun({
          text: line,
          font: FONT_CODE,
          size: 16.5, // 8.25pt
          color: '0F172A'
        })
      ]
    }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: C_CODE_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: C_CODE_BORDER },
              left: { style: BorderStyle.SINGLE, size: 4, color: C_BLUE },
              right: { style: BorderStyle.SINGLE, size: 1, color: C_CODE_BORDER }
            },
            shading: { fill: C_CODE_BG, val: ShadingType.CLEAR },
            margins: { top: 90, bottom: 90, left: 150, right: 150 },
            children: paragraphs
          })
        ]
      })
    ]
  });
}

function calloutBox(title, bodyText) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: C_CALLOUT_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: C_CALLOUT_BORDER },
              left: { style: BorderStyle.SINGLE, size: 5, color: C_CALLOUT_BORDER },
              right: { style: BorderStyle.SINGLE, size: 1, color: C_CALLOUT_BORDER }
            },
            shading: { fill: C_CALLOUT_BG, val: ShadingType.CLEAR },
            margins: { top: 110, bottom: 110, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 19,
                    font: FONT_PRIMARY,
                    color: C_NAVY
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 240 },
                children: [
                  new TextRun({
                    text: bodyText,
                    size: 18.5,
                    font: FONT_PRIMARY,
                    color: C_BODY
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header Row
  if (headers && headers.length > 0) {
    const headerCells = headers.map((h, i) => {
      const cellOpts = {
        borders: CELL_BORDERS,
        shading: { fill: C_HEADER_BG, val: ShadingType.CLEAR },
        margins: CELL_MARGINS,
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: h,
                bold: true,
                size: 17.5, // 8.75pt
                font: FONT_PRIMARY,
                color: 'FFFFFF'
              })
            ]
          })
        ]
      };
      if (colWidths[i]) {
        cellOpts.width = { size: colWidths[i], type: WidthType.PERCENTAGE };
      }
      return new TableCell(cellOpts);
    });
    tableRows.push(new TableRow({ children: headerCells }));
  }

  // Data Rows
  rows.forEach((row, rowIndex) => {
    const isAlt = rowIndex % 2 === 1;
    const cells = row.map((cellText, i) => {
      const cellOpts = {
        borders: CELL_BORDERS,
        shading: isAlt ? { fill: C_ROW_ALT, val: ShadingType.CLEAR } : undefined,
        margins: CELL_MARGINS,
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: cellText != null ? String(cellText) : '',
                size: 17, // 8.5pt
                font: FONT_PRIMARY,
                color: C_BODY
              })
            ]
          })
        ]
      };
      if (colWidths[i]) {
        cellOpts.width = { size: colWidths[i], type: WidthType.PERCENTAGE };
      }
      return new TableCell(cellOpts);
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

function diagramCard(title, asciiDiagram, explanation) {
  const lineArray = Array.isArray(asciiDiagram) ? asciiDiagram : asciiDiagram.split('\n');
  const paragraphs = [];

  if (title) {
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 30, after: 50 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 18.5,
          font: FONT_PRIMARY,
          color: C_NAVY
        })
      ]
    }));
  }

  lineArray.forEach(line => {
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 8, after: 8, line: 190 },
      children: [
        new TextRun({
          text: line,
          font: FONT_CODE,
          size: 14.5, // 7.25pt
          color: '0F172A'
        })
      ]
    }));
  });

  if (explanation) {
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 60, after: 15, line: 230 },
      children: [
        new TextRun({
          text: 'Architectural Analysis: ',
          bold: true,
          size: 17,
          font: FONT_PRIMARY,
          color: C_NAVY
        }),
        new TextRun({
          text: explanation,
          size: 17,
          font: FONT_PRIMARY,
          color: C_BODY
        })
      ]
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: CELL_BORDERS,
            shading: { fill: 'F8FAFC', val: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: paragraphs
          })
        ]
      })
    ]
  });
}

console.log('Helpers and visual elements initialized successfully.');
module.exports = {
  FONT_PRIMARY,
  FONT_CODE,
  C_NAVY,
  C_BLUE,
  C_DARK,
  C_BODY,
  C_MUTED,
  C_BORDER,
  C_ROW_ALT,
  C_HEADER_BG,
  C_CODE_BG,
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
  codeSnippet,
  calloutBox,
  createTable,
  diagramCard,
  logoPath,
  repoDocxPath,
  brainDocxPath
};
