import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const Reports = () => {
  const { activeWorkspace } = useWorkspace();
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Reports — IMS Pro'; }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, salesRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/sales?limit=10')
        ]);
        setStats(statsRes.data.stats);
        setRecentSales(salesRes.data.data || []);
      } catch {
        toast.error('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeWorkspace]);

  const exportCSV = () => {
    if (recentSales.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      // Add BOM character \uFEFF for proper Excel display of special characters
      const headers = ['Invoice', 'Customer', 'Date', 'Amount', 'Status'];
      const rows = recentSales.map(r => [
        r.sale_number,
        r.customer_name || 'Walk-in',
        new Date(r.created_at).toLocaleDateString(),
        r.net_amount,
        r.status
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Report exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Inv Number', accessor: 'sale_number' },
    { header: 'Customer', accessor: 'customer_name', render: r => r.customer_name || 'Walk-in' },
    { header: 'Date', accessor: 'created_at', render: r => new Date(r.created_at).toLocaleDateString() },
    { header: 'Net Amount', accessor: 'net_amount', render: r => <span className="font-semibold font-mono-val text-sm" style={{ color: 'var(--success-text)' }}>{formatCurrency(r.net_amount)}</span> },
    { header: 'Status', accessor: 'status', render: r => <span className="capitalize">{r.status}</span> }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Summary for {activeWorkspace ? activeWorkspace.name : 'Global View'}</p>
        </div>
        <button onClick={exportCSV} disabled={recentSales.length === 0}
                className="btn-ghost flex items-center gap-2"
                style={{ color: 'var(--text-secondary)' }}>
          <HiOutlineDocumentArrowDown className="w-5 h-5" style={{ color: 'var(--accent-bright)' }} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats?.totalProducts || 0} color="primary" />
        <StatCard title="Sales Revenue" value={formatCurrency(stats?.salesRevenue)} color="green" />
        <StatCard title="Purchases Cost" value={formatCurrency(stats?.purchasesCost)} color="amber" />
        <StatCard title="Pending Bills" value={formatCurrency(stats?.pendingBills)} color="rose" />
      </div>

      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>Recent Sales</h3>
        {recentSales.length > 0 ? (
           <DataTable columns={columns} data={recentSales} />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '40px 0', textAlign: 'center' }}>No recent sales data available.</div>
        )}
      </div>
    </div>
  );
};

export default Reports;
