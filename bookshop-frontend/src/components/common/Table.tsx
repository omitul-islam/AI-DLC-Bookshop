import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function Table<T>({
  columns, data, keyExtractor, emptyMessage,
}: TableProps<T>) {
  if (data.length === 0 && emptyMessage) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, i) => (
            <tr
              key={keyExtractor(item)}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-50 transition-colors duration-100`}
            >
              {columns.map((col) => (
                <td key={`${keyExtractor(item)}-${col.key}`} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
