/**
 * Smart ID Generation Engine
 *
 * Open-Credit Format:  [DeptName][YY][SemCode][3-digit serial]
 *   Example: CSE26FL012   (CSE dept, 2026, Fall intake, 12th student)
 *   Codes: SP=Spring, SM=Summer, FL=Fall
 *
 * Close-Credit Format: [DeptName][2-Digit BatchNo][YY][3-digit serial]
 *   Example: CSE5426012   (CSE dept, 54th batch, 2026, 12th student)
 *   Example: BBA0126001   (BBA dept, 1st batch, 2026, 1st student)
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
  if (!deptName || typeof deptName !== 'string' || !deptName.trim()) {
    throw new Error('Invalid or missing department name');
  }

  const numSerial = Number(serial);
  if (isNaN(numSerial) || numSerial <= 0) {
    throw new Error('Invalid serial number: must be a positive integer');
  }

  const dept      = deptName.trim().toUpperCase();
  const yy        = String(year).slice(-2);
  const serialStr = String(numSerial).padStart(3, '0');

  if (universityType === 'open_credit') {
    const semCode = SEMESTER_MAP[semesterIndex];
    if (!semCode) throw new Error(`Invalid semester index: ${semesterIndex}`);
    return `${dept}${yy}${semCode}${serialStr}`;
  }

  if (universityType === 'close_credit') {
    if (batchNumber === undefined || batchNumber === null || String(batchNumber).trim() === '') {
      throw new Error('Batch number is required for close_credit');
    }
    const batchStr = String(batchNumber).padStart(2, '0');
    return `${dept}${batchStr}${yy}${serialStr}`;
  }

  throw new Error(`Unknown university type: ${universityType}`);
}

module.exports = { generateStudentId, SEMESTER_MAP };