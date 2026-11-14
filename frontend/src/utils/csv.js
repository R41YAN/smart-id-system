/**
 * Makes one CSV cell safe:
 *  - escapes double quotes and wraps the value in quotes (commas / new lines stay inside the cell)
 *  - neutralises spreadsheet formulas: a value starting with = + - @ (or tab / carriage return)
 *    is prefixed with ' so Excel / Google Sheets show it as text instead of running it.
 */
export function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(headers, rows) {
  return [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n');
}
