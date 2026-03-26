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

      <div className="overflow-x-auto rounded-[16px] glass-card">
        <table className="w-full text-sm" style={{ background: 'transparent' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.accessor || col.header}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                  className={`px-4 py-3 text-left whitespace-nowrap uppercase font-semibold
                             ${col.accessor ? 'cursor-pointer select-none hover:opacity-80' : ''}`}
                  style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.6px', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.accessor && (sortDir === 'asc' ? <HiChevronUp className="w-3 h-3" /> : <HiChevronDown className="w-3 h-3" />)}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right uppercase font-semibold" style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.6px', borderBottom: '1px solid var(--border-subtle)' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center" style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No data found.
                </td>
              </tr>
            ) : paginated.map((row, i) => {
              return (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`table-row-hover ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{ background: 'transparent' }}
              >
                {columns.map(col => (
                  <td key={col.accessor || col.header} className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg disabled:opacity-30 nav-item"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}>
              <HiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              
              const isActive = p === page;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition nav-item"
                  style={{
                    background: isActive ? 'var(--accent-glow)' : 'var(--bg-subtle)',
                    border: isActive ? '1px solid var(--border-accent)' : '1px solid var(--border-faint)',
                    color: isActive ? 'var(--accent-bright)' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg-overlay)')}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'var(--bg-subtle)')}
                >
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg disabled:opacity-30 nav-item"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}>
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
