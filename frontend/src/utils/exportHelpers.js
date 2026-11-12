// Export and Print institutional file naming helpers

const SEM_SHORT = {
  SP: 'SP',
  SM: 'SM',
  FL: 'FL',
  SPRING: 'SP',
  SUMMER: 'SM',
  FALL: 'FL'
};

/**
 * Returns a standardized short institutional code for any university
 * e.g. "United International University" -> "UIU", "Dhaka University" -> "DU"
 */
export function getUniversityShortName(name) {
  if (!name || typeof name !== 'string') return 'SIFS';
  const clean = name.trim().toUpperCase();

  if (clean.includes('UNITED INTERNATIONAL') || clean === 'UIU') return 'UIU';
  if (clean.includes('INFORMATION TECHNOLOGY') || clean.includes('UITS')) return 'UITS';
  if (clean.includes('DHAKA') || clean === 'DU') return 'DU';
  if (clean.includes('NORTH SOUTH') || clean === 'NSU') return 'NSU';
  if (clean.includes('BRAC') || clean === 'BRACU') return 'BRACU';
  if (clean.includes('METROPOLITAN') || clean === 'MU') return 'MU';
  if (clean.includes('AHSANULLAH') || clean === 'AUST') return 'AUST';
  if (clean.includes('AMERICAN INTERNATIONAL') || clean === 'AIUB') return 'AIUB';
  if (clean.includes('GREEN UNIVERSITY') || clean === 'GUB') return 'GUB';
  if (clean.includes('DAFFODIL') || clean === 'DIU') return 'DIU';
  if (clean.includes('INDEPENDENT UNIVERSITY') || clean === 'IUB') return 'IUB';
  if (clean.includes('EAST WEST') || clean === 'EWU') return 'EWU';

  // Fallback: Acronym of words (excluding prepositions)
  const words = clean.replace(/[^A-Z0-9\s]/g, '').split(/\s+/).filter(w => !['OF', 'AND', 'THE', 'FOR', 'IN'].includes(w));
  if (words.length >= 2) {
    return words.map(w => w[0]).join('');
  }
  return clean.slice(0, 4);
}

/**
 * Returns standard batch or intake string:
 * e.g. "54(2026)" or "SP'26"
 */
export function formatBatchOrIntakeSlug(batch) {
  if (!batch) return 'ALL-BATCHES';
  if (batch.semester_code) {
    const sem = SEM_SHORT[batch.semester_code.toUpperCase()] || batch.semester_code.toUpperCase();
    const yr = String(batch.year || new Date().getFullYear()).slice(-2);
    return `${sem}'${yr}`;
  }
  if (batch.batch_number != null) {
    const yr = batch.year || new Date().getFullYear();
    return `${batch.batch_number}(${yr})`;
  }
  return 'BATCH';
}

/**
 * Generates an institutional filename without extension
 * Pattern: "SIFS - [UniShort]_[Dept]_[Batch/Intake]_[Context]"
 */
export function buildExportFileName({ universityName, deptCode, batch, student, context = '' }) {
  const uni = getUniversityShortName(universityName);
  const dept = (deptCode || 'ALL-DEPTS').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const batchStr = formatBatchOrIntakeSlug(batch);

  let nameParts = ['SIFS - ' + `${uni}_${dept}_${batchStr}`];

  if (student) {
    const studentId = student.student_id ? `_${student.student_id}` : '';
    const studentName = student.name ? `_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    nameParts = ['SIFS - ' + `${uni}_${dept}${studentId}${studentName}`];
  } else if (context) {
    nameParts.push(context.replace(/[^a-zA-Z0-9_-]/g, '_'));
  }

  return nameParts.join('_').replace(/_+/g, '_');
}

/**
 * Sets document.title before printing so the browser uses it as the default PDF download filename
 */
export function triggerPrintWithFileName(fileName) {
  const originalTitle = document.title;
  document.title = fileName;
  try {
    window.print();
  } finally {
    // Restore original document title after user completes/cancels print dialog
    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  }
}
