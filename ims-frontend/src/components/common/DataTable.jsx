import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  loading,
  emptyMessage = "No records found"
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 dark:border-gray-700 flex items-center px-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key}
                onClick={() => col.sortable !== false && requestSort(col.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.label}</span>
                  {sortConfig?.key === col.key && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedData.length > 0 ? paginatedData.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onEdit && <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors p-1"><Edit2 className="h-4 w-4 inline" /></button>}
                  {onDelete && <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"><Trash2 className="h-4 w-4 inline" /></button>}
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {data.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between sm:px-6 gap-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none px-2 py-1"
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
