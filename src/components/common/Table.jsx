import Loader from './Loader';
import EmptyState from './EmptyState';
import ErrorBanner from './ErrorBanner';

/**
 * Generic table renderer. `columns` = [{ key, header, render? }]
 * `render(row)` is optional per-column; defaults to row[key].
 */
export default function Table({ columns, rows, isLoading, error, emptyTitle, emptyDescription, keyField = '_id' }) {
  if (isLoading) return <Loader />;
  if (error) return <ErrorBanner message={error} />;
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle || 'Nothing here yet'} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium text-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-paper/60">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
