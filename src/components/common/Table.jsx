import Loader from "./Loader";
import EmptyState from "./EmptyState";
import ErrorBanner from "./ErrorBanner";

export default function Table({ columns, rows, isLoading, error, emptyTitle, emptyDescription, keyField = "_id" }) {
  if (isLoading) return <Loader />;
  if (error) return <ErrorBanner message={error} />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle || "Nothing here yet"} description={emptyDescription} />;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map(col => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium text-muted">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(row => (
              <tr key={row[keyField]} className="hover:bg-paper/60">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-ink">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden divide-y divide-line">
        {rows.map(row => (
          <div key={row[keyField]} className="px-4 py-3 space-y-1.5">
            {columns.map(col => {
              if (!col.header) {
                // action column — show at bottom
                return (
                  <div key={col.key} className="pt-1">
                    {col.render ? col.render(row) : null}
                  </div>
                );
              }
              const val = col.render ? col.render(row) : row[col.key];
              if (val === null || val === undefined || val === "—") return null;
              return (
                <div key={col.key} className="flex items-start gap-2">
                  <span className="text-xs text-muted w-24 flex-shrink-0 pt-0.5">{col.header}</span>
                  <span className="text-sm text-ink flex-1">{val}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}