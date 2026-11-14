import { describe, test, expect } from 'vitest';
import { csvCell, toCsv } from '../csv';

describe('CSV export safety', () => {
  test('escapes quotes and keeps commas inside the cell', () => {
    expect(csvCell('Rahim "Rocky", Jr')).toBe('"Rahim ""Rocky"", Jr"');
  });

  test('neutralises spreadsheet formulas (CSV injection)', () => {
    expect(csvCell('=HYPERLINK("http://evil","x")')).toBe('"\'=HYPERLINK(""http://evil"",""x"")"');
    expect(csvCell('+8801700000000')).toBe('"\'+8801700000000"');
    expect(csvCell('@SUM(1)')).toBe('"\'@SUM(1)"');
  });

  test('handles empty values and builds rows', () => {
    expect(csvCell(null)).toBe('""');
    expect(toCsv(['A', 'B'], [[1, 'x']])).toBe('"A","B"\r\n"1","x"');
  });
});
