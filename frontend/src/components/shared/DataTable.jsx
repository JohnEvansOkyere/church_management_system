import EmptyState from './EmptyState';

export default function DataTable({ columns, rows, emptyLabel = 'No data', emptyIcon }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  <EmptyState label={emptyLabel} icon={emptyIcon} />
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id ?? idx} className="transition-colors hover:bg-brand-50/40">
                  {columns.map((column, colIdx) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3.5 text-sm ${colIdx === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}
                    >
                      {column.render ? column.render(row) : (row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
