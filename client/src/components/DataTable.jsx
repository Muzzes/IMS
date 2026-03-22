import { useState, useMemo } from 'react';
import { HiChevronUp, HiChevronDown, HiMagnifyingGlass, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const DataTable = ({ columns, data, onRowClick, actions, searchable = true, pageSize = 10 }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-sm">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700
                       bg-white dark:bg-surface-800 text-sm
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            id="table-search"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800/50">
              {columns.map(col => (
                <th
                  key={col.accessor || col.header}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                  className={`px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-400 whitespace-nowrap
                             ${col.accessor ? 'cursor-pointer select-none hover:text-primary-600' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.accessor && (sortDir === 'asc' ? <HiChevronUp className="w-3 h-3" /> : <HiChevronDown className="w-3 h-3" />)}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold text-surface-600 dark:text-surface-400">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-surface-400">
                  No data found.
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`bg-white dark:bg-surface-900 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors
                           ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.accessor || col.header} className="px-4 py-3 text-surface-700 dark:text-surface-300 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
              <HiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition
                    ${p === page ? 'bg-primary-600 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
