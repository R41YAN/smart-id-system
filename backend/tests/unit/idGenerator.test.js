/**
 * ============================================================================
 * UNIT TEST SUITE: Smart ID Generation Engine (idGenerator.js)
 * ============================================================================
 * Methodology:
 *  - AAA Pattern: Arrange, Act, Assert (as mandated by Software QA Guidelines)
 *  - Equivalence Partitioning (EP): Valid & Invalid Classes
 *  - Boundary Value Analysis (BVA): Min, Mid, Max, and Boundary Limits
 * ============================================================================
 */

const { generateStudentId, SEMESTER_MAP } = require('../../utils/idGenerator');

describe('Unit Tests: Core ID Generation Engine', () => {

  // ==========================================================================
  // SECTION 1: EQUIVALENCE PARTITIONING (EP)
  // ==========================================================================
  describe('Equivalence Partitioning (EP)', () => {

    test('EP_01 [Valid Open Credit - Spring Intake]: should format as [Dept][YY]SP[Serial]', () => {
      // 1. Arrange
      const input = {
        universityType: 'open_credit',
        deptName: 'CSE',
        year: 2026,
        semesterIndex: 1, // Spring (SP)
        serial: 12
      };

      // 2. Act
      const result = generateStudentId(input);

      // 3. Assert
      expect(result).toBe('CSE26SP012');
    });

    test('EP_02 [Valid Open Credit - Summer Intake]: should format as [Dept][YY]SM[Serial]', () => {
      // 1. Arrange
      const input = {
        universityType: 'open_credit',
        deptName: 'EEE',
        year: 2025,
        semesterIndex: 2, // Summer (SM)
        serial: 45
      };

      // 2. Act
      const result = generateStudentId(input);

      // 3. Assert
      expect(result).toBe('EEE25SM045');
    });

    test('EP_03 [Valid Open Credit - Fall Intake]: should format as [Dept][YY]FL[Serial]', () => {
      // 1. Arrange
      const input = {
        universityType: 'open_credit',
        deptName: 'BBA',
        year: 2026,
        semesterIndex: 3, // Fall (FL)
        serial: 7
      };

      // 2. Act
      const result = generateStudentId(input);

      // 3. Assert
      expect(result).toBe('BBA26FL007');
    });

    test('EP_04 [Valid Close Credit]: should format as [Dept][Batch][YY][Serial]', () => {
      // 1. Arrange
      const input = {
        universityType: 'close_credit',
        deptName: 'CSE',
        year: 2026,
        batchNumber: 54,
        serial: 12
      };

      // 2. Act
      const result = generateStudentId(input);

      // 3. Assert
      expect(result).toBe('CSE5426012');
    });

    test('EP_05 [Invalid University Type]: should throw an informative error', () => {
      // 1. Arrange
      const input = {
        universityType: 'hybrid_credit',
        deptName: 'CSE',
        year: 2026,
        serial: 1
      };

      // 2. Act & 3. Assert
      expect(() => generateStudentId(input)).toThrow('Unknown university type: hybrid_credit');
    });

    test('EP_06 [Invalid Semester Index - Out of Range]: should throw for index 0 or 4', () => {
      // 1. Arrange
      const invalidLower = {
        universityType: 'open_credit',
        deptName: 'CSE',
        year: 2026,
        semesterIndex: 0,
        serial: 1
      };
      const invalidUpper = {
        universityType: 'open_credit',
        deptName: 'CSE',
        year: 2026,
        semesterIndex: 4,
        serial: 1
      };

      // 2. Act & 3. Assert
      expect(() => generateStudentId(invalidLower)).toThrow('Invalid semester index: 0');
      expect(() => generateStudentId(invalidUpper)).toThrow('Invalid semester index: 4');
    });

    test('EP_07 [Input Normalization]: should convert lowercase department codes to uppercase', () => {
      // 1. Arrange
      const input = {
        universityType: 'open_credit',
        deptName: 'cse', // Lowercase
        year: 2026,
        semesterIndex: 1,
        serial: 3
      };

      // 2. Act
      const result = generateStudentId(input);

      // 3. Assert
      expect(result).toBe('CSE26SP003');
    });

  });

  // ==========================================================================
  // SECTION 2: BOUNDARY VALUE ANALYSIS (BVA)
  // ==========================================================================
  describe('Boundary Value Analysis (BVA)', () => {

    describe('Serial Padding Boundaries', () => {
      test('BVA_01 [Minimum Boundary Serial = 1]: should pad to exactly 3 digits (001)', () => {
        // Arrange
        const input = { universityType: 'open_credit', deptName: 'CSE', year: 2026, semesterIndex: 1, serial: 1 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('CSE26SP001');
      });

      test('BVA_02 [Single-to-Double Digit Boundary = 9 and 10]: should format as 009 and 010', () => {
        // Arrange & Act
        const res9 = generateStudentId({ universityType: 'open_credit', deptName: 'CSE', year: 2026, semesterIndex: 1, serial: 9 });
        const res10 = generateStudentId({ universityType: 'open_credit', deptName: 'CSE', year: 2026, semesterIndex: 1, serial: 10 });
        // Assert
        expect(res9).toBe('CSE26SP009');
        expect(res10).toBe('CSE26SP010');
      });

      test('BVA_03 [Double-to-Triple Digit Boundary = 99 and 100]: should format as 099 and 100', () => {
        // Arrange & Act
        const res99 = generateStudentId({ universityType: 'open_credit', deptName: 'CSE', year: 2026, semesterIndex: 1, serial: 99 });
        const res100 = generateStudentId({ universityType: 'open_credit', deptName: 'CSE', year: 2026, semesterIndex: 1, serial: 100 });
        // Assert
        expect(res99).toBe('CSE26SP099');
        expect(res100).toBe('CSE26SP100');
      });

      test('BVA_04 [Maximum Standard Boundary Serial = 999]: should format without truncation (999)', () => {
        // Arrange
        const input = { universityType: 'close_credit', deptName: 'CSE', year: 2026, batchNumber: 54, serial: 999 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('CSE5426999');
      });

      test('BVA_05 [Overflow Boundary Serial = 1000]: should handle four-digit serial appropriately', () => {
        // Arrange
        const input = { universityType: 'open_credit', deptName: 'CSE', year: 2026, semesterIndex: 1, serial: 1000 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('CSE26SP1000');
      });
    });

    describe('Year Digit Boundaries', () => {
      test('BVA_06 [Century Year = 2000]: should extract last 2 digits as "00"', () => {
        // Arrange
        const input = { universityType: 'open_credit', deptName: 'LAW', year: 2000, semesterIndex: 1, serial: 5 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('LAW00SP005');
      });

      test('BVA_07 [Future Century Boundary = 2099]: should extract last 2 digits as "99"', () => {
        // Arrange
        const input = { universityType: 'close_credit', deptName: 'ENG', year: 2099, batchNumber: 15, serial: 2 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('ENG1599002');
      });
    });

    describe('Batch Number Boundaries (Close Credit)', () => {
      test('BVA_08 [Single Digit Batch = 1]: should format correctly with 2-digit zero-padding', () => {
        // Arrange
        const input = { universityType: 'close_credit', deptName: 'CSE', year: 2026, batchNumber: 1, serial: 1 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('CSE0126001');
      });

      test('BVA_09 [Triple Digit Batch = 100]: should format seamlessly with large cohort numbers', () => {
        // Arrange
        const input = { universityType: 'close_credit', deptName: 'CSE', year: 2026, batchNumber: 100, serial: 50 };
        // Act
        const result = generateStudentId(input);
        // Assert
        expect(result).toBe('CSE10026050');
      });
    });

  });

  // ==========================================================================
  // SECTION 3: CONSTANT INTEGRITY
  // ==========================================================================
  describe('Constant Integrity: SEMESTER_MAP', () => {
    test('SEMESTER_MAP should strictly map 1 to SP, 2 to SM, 3 to FL', () => {
      expect(SEMESTER_MAP[1]).toBe('SP');
      expect(SEMESTER_MAP[2]).toBe('SM');
      expect(SEMESTER_MAP[3]).toBe('FL');
    });
  });

});