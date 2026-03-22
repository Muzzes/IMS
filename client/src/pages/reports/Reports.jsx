import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';

const Reports = () => {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats(data.stats);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, [activeWorkspace]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reports</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 transition">
          <HiOutlineDocumentArrowDown className="w-5 h-5" /> Export PDF
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 prose dark:prose-invert max-w-none">
        <h3>Summary ({activeWorkspace ? activeWorkspace.name : 'Global View'})</h3>
        <p>This section is a placeholder for detailed tabular reports. The current numbers are:</p>
        <ul>
          <li><strong>Total Products:</strong> {stats?.totalProducts}</li>
          <li><strong>Sales Revenue:</strong> ${stats?.salesRevenue}</li>
          <li><strong>Purchases Cost:</strong> ${stats?.purchasesCost}</li>
          <li><strong>Pending Bills:</strong> ${stats?.pendingBills}</li>
        </ul>
        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl border border-primary-200 dark:border-primary-800">
          Advanced reporting (filtering by date range, category-wise margins, ledger exports) would be implemented in this view, utilizing a data grid with CSV/PDF export.
        </div>
      </div>
    </div>
  );
};

export default Reports;
