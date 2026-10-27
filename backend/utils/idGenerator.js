/**
 * Smart ID Generation Engine
 *
 * Open-Credit Format:  [DeptName][YY][SemCode][3-digit serial]
 *   Example: CSE26FL012   (CSE dept, 2026, Fall intake, 12th student)
 *   Codes: SP=Spring, SM=Summer, FL=Fall
 *
 * Close-Credit Format: [DeptName][BatchNo][YY][3-digit serial]
 *   Example: CSE5426012   (CSE dept, 54th batch, 2026, 12th student)
 */

const SEMESTER_MAP = { 1: 'SP', 2: 'SM', 3: 'FL' };

/**
 * @param {object} p
 * @param {string} p.universityType  'open_credit' | 'close_credit'
 * @param {string} p.deptName        e.g. 'CSE'
 * @param {number} p.year            e.g. 2026
 * @param {number} p.semesterIndex   1, 2, or 3  (open_credit only)
 * @param {number} p.batchNumber     e.g. 54     (close_credit only)
 * @param {number} p.serial          next serial, e.g. 12
 * @returns {string}
 */
function generateStudentId({ universityType, deptName, year, semesterIndex, batchNumber, serial }) {
  const dept      = deptName.toUpperCase();
  const yy        = String(year).slice(-2);
  const serialStr = String(serial).padStart(3, '0');

  if (universityType === 'open_credit') {
    const semCode = SEMESTER_MAP[semesterIndex];
    if (!semCode) throw new Error(`Invalid semester index: ${semesterIndex}`);
    return `${dept}${yy}${semCode}${serialStr}`;
  }

  if (universityType === 'close_credit') {
    return `${dept}${batchNumber}${yy}${serialStr}`;
  }

  throw new Error(`Unknown university type: ${universityType}`);
}

module.exports = { generateStudentId, SEMESTER_MAP };
