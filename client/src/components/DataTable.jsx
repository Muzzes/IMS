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
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search details..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-bright)] outline-none transition text-white"
            id="table-search"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-[12px] pb-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.accessor || col.header}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                  className={`px-4 py-4 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b-2 border-[var(--bg-muted)]
                             ${col.accessor ? 'cursor-pointer select-none hover:text-white transition' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.accessor && (sortDir === 'asc' ? <HiChevronUp className="w-3 h-3 text-[var(--accent-bright)]" /> : <HiChevronDown className="w-3 h-3 text-[var(--accent-bright)]" />)}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-4 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b-2 border-[var(--bg-muted)] text-right">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-[var(--text-muted)] font-semibold text-sm">
                  No records to display.
                </td>
              </tr>
            ) : paginated.map((row, i) => {
              return (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`transition group border-b border-[var(--border-faint)] hover:bg-[var(--bg-subtle)] ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.accessor || col.header} className="px-4 py-4 whitespace-nowrap text-[13px] font-medium text-white">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            )})}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 pt-4 mt-2 border-t border-[var(--border-subtle)]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              SHOWING {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} OF {sorted.length} RECORDS
            </p>
            <div className="flex items-center gap-1 text-xs">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] disabled:opacity-30 disabled:hover:bg-transparent">
                <HiChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                const isActive = p === page;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-6 h-6 flex items-center justify-center rounded font-bold transition
                                ${isActive ? 'bg-[var(--accent-bright)] text-white' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'}`}>
                    {p}
                  </button>
                );
              })}

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] disabled:opacity-30 disabled:hover:bg-transparent">
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
