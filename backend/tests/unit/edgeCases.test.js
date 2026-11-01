/**
 * ============================================================================
 * UNIT TEST SUITE: Edge Cases & Robustness (Qodo / CodiumAI Refinement)
 * ============================================================================
 * Aligned with Step 2 & Step 3 of Teacher QA Guidelines:
 *  - Whitespace trimming and string normalization
 *  - Missing mandatory parameters (null/undefined safety)
 *  - Non-numeric or negative serial numbers
 *  - Missing batchNumber in close-credit architecture
 * ============================================================================
 */

const { generateStudentId } = require('../../utils/idGenerator');

describe('Unit Tests: Edge Cases & Robustness (Refinement Phase)', () => {

  // --------------------------------------------------------------------------
  // EDGE_01: Whitespace Trimming in Department Code
  // --------------------------------------------------------------------------
  test('EDGE_01: should trim accidental leading/trailing whitespace in department name', () => {
    // Arrange
    const input = {
      universityType: 'open_credit',
      deptName: '  CSE  ',
      year: 2026,
      semesterIndex: 1,
      serial: 10
    };

    // Act
    const result = generateStudentId(input);

    // Assert: Must be clean without internal whitespace
    expect(result).toBe('CSE26SP010');
  });

  // --------------------------------------------------------------------------
  // EDGE_02: Null or Missing Department Name Validation
  // --------------------------------------------------------------------------
  test('EDGE_02: should throw an error when deptName is missing or null', () => {
    // Arrange
    const nullDept = {
      universityType: 'open_credit',
      deptName: null,
      year: 2026,
      semesterIndex: 1,
      serial: 10
    };

    // Act & Assert
    expect(() => generateStudentId(nullDept)).toThrow(/Invalid or missing department name/i);
  });

  // --------------------------------------------------------------------------
  // EDGE_03: Missing Batch Number in Close-Credit Architecture
  // --------------------------------------------------------------------------
  test('EDGE_03: should throw error if batchNumber is missing in close_credit mode', () => {
    // Arrange
    const missingBatch = {
      universityType: 'close_credit',
      deptName: 'CSE',
      year: 2026,
      batchNumber: null, // missing
      serial: 5
    };

    // Act & Assert
    expect(() => generateStudentId(missingBatch)).toThrow(/Batch number is required for close_credit/i);
  });

  // --------------------------------------------------------------------------
  // EDGE_04: Zero or Negative Serial Number
  // --------------------------------------------------------------------------
  test('EDGE_04: should reject non-positive serial numbers (0 or negative)', () => {
    // Arrange
    const zeroSerial = {
      universityType: 'open_credit',
      deptName: 'CSE',
      year: 2026,
      semesterIndex: 1,
      serial: 0
    };
    const negativeSerial = {
      universityType: 'open_credit',
      deptName: 'CSE',
      year: 2026,
      semesterIndex: 1,
      serial: -5
    };

    // Act & Assert
    expect(() => generateStudentId(zeroSerial)).toThrow(/Invalid serial number/i);
    expect(() => generateStudentId(negativeSerial)).toThrow(/Invalid serial number/i);
  });

  // --------------------------------------------------------------------------
  // EDGE_05: String Serial Number Handling
  // --------------------------------------------------------------------------
  test('EDGE_05: should parse valid numeric strings for serial without failure', () => {
    // Arrange
    const stringSerial = {
      universityType: 'open_credit',
      deptName: 'CSE',
      year: 2026,
      semesterIndex: 2,
      serial: '42'
    };

    // Act
    const result = generateStudentId(stringSerial);

    // Assert
    expect(result).toBe('CSE26SM042');
  });

  // --------------------------------------------------------------------------
  // EDGE_06: Multi-Word / Complex Department Code
  // --------------------------------------------------------------------------
  test('EDGE_06: should support hyphenated or multi-character department codes', () => {
    // Arrange
    const input = {
      universityType: 'open_credit',
      deptName: 'SWE',
      year: 2026,
      semesterIndex: 3,
      serial: 99
    };

    // Act
    const result = generateStudentId(input);

    // Assert
    expect(result).toBe('SWE26FL099');
  });

});