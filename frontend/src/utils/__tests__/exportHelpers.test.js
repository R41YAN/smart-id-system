import { describe, test, expect } from 'vitest';
import {
  getUniversityShortName,
  formatBatchOrIntakeSlug,
  buildExportFileName
} from '../exportHelpers';

describe('Export and Print Helpers (exportHelpers.js)', () => {
  test('TC_EXPORT_01: should resolve standard short names for universities', () => {
    expect(getUniversityShortName('United International University')).toBe('UIU');
    expect(getUniversityShortName('University of Dhaka')).toBe('DU');
    expect(getUniversityShortName('Dhaka University')).toBe('DU');
    expect(getUniversityShortName('University of Information Technology and Sciences')).toBe('UITS');
    expect(getUniversityShortName('North South University')).toBe('NSU');
    expect(getUniversityShortName('BRAC University')).toBe('BRACU');
    expect(getUniversityShortName('Metropolitan University')).toBe('MU');
  });

  test('TC_EXPORT_02: should format batch or intake slugs properly', () => {
    // Close credit batch: 54th batch of 2026
    expect(formatBatchOrIntakeSlug({ batch_number: 54, year: 2026 })).toBe('54(2026)');
    // Open credit intake: Spring 2026
    expect(formatBatchOrIntakeSlug({ semester_code: 'SP', year: 2026 })).toBe("SP'26");
    expect(formatBatchOrIntakeSlug({ semester_code: 'FL', year: 2026 })).toBe("FL'26");
    // Null batch
    expect(formatBatchOrIntakeSlug(null)).toBe('ALL-BATCHES');
  });

  test('TC_EXPORT_03: should generate institutional filenames matching requirement', () => {
    // Batch ID Cards PDF name
    const batchCardsName = buildExportFileName({
      universityName: 'United International University',
      deptCode: 'CSE',
      batch: { batch_number: 54, year: 2026 },
      context: 'ID_Cards'
    });
    expect(batchCardsName).toBe('SIFS - UIU_CSE_54(2026)_ID_Cards');

    // Open credit intake batch ID cards
    const openCreditCardsName = buildExportFileName({
      universityName: 'United International University',
      deptCode: 'CSE',
      batch: { semester_code: 'SP', year: 2026 },
      context: 'ID_Cards'
    });
    expect(openCreditCardsName).toBe("SIFS - UIU_CSE_SP'26_ID_Cards");

    // Single student ID card print
    const singleCardName = buildExportFileName({
      universityName: 'Dhaka University',
      deptCode: 'CE',
      student: { student_id: 'CE0227001', name: 'Komol Islam' }
    });
    expect(singleCardName).toBe('SIFS - DU_CE_CE0227001_Komol_Islam');

    // Student roster export
    const rosterName = buildExportFileName({
      universityName: 'United International University',
      deptCode: 'CSE',
      batch: { batch_number: 54, year: 2026 },
      context: 'Student_Roster'
    });
    expect(rosterName).toBe('SIFS - UIU_CSE_54(2026)_Student_Roster');
  });
});
