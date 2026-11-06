import type { Key, ReactNode } from 'react';

export interface TableColumn<T> {
  id: string;
  heading: ReactNode;
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, rows, getRowKey, caption, emptyMessage = 'No hay registros para mostrar.' }: {
  columns: TableColumn<T>[]; rows: T[]; getRowKey: (row: T) => Key; caption: string; emptyMessage?: string;
}) {
  return <div className="ui-table-scroll" role="region" aria-label={caption} tabIndex={0}>
    <table className="ui-table"><caption className="ui-sr-only">{caption}</caption>
      <thead><tr>{columns.map(column => <th key={column.id} scope="col">{column.heading}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map(row => <tr key={getRowKey(row)}>{columns.map(column => <td key={column.id}>{column.cell(row)}</td>)}</tr>) :
        <tr><td className="ui-table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>}
      </tbody>
    </table>
  </div>;
}
