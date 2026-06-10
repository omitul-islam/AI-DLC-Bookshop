interface CsvColumn<T> {
  key: keyof T;
  header: string;
}

function escapeCsvValue(value: any): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(data: T[], columns: CsvColumn<T>[]): string {
  const bom = '\uFEFF';
  const header = columns.map(c => c.header).join(',');
  const rows = data.map(item =>
    columns.map(c => escapeCsvValue(item[c.key])).join(',')
  );
  return bom + header + '\n' + rows.join('\n');
}
