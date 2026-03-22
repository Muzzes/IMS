import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import {
  HiOutlineCube, HiOutlineTruck, HiOutlineBanknotes, HiOutlineShoppingCart,
  HiOutlineExclamationTriangle, HiOutlineDocumentText, HiOutlineChartBar
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageLoader } from '../../components/LoadingSpinner';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

const Dashboard = () => {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, chartRes, productsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/sales-chart'),
          api.get('/reports/top-products')
        ]);
        setStats(statsRes.data.stats);
        setChartData(chartRes.data.chartData);
        setTopProducts(productsRes.data.products);

        if (user?.role === 'admin') {
          const compRes = await api.get('/reports/workspace-comparison');
          setComparison(compRes.data.comparison);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeWorkspace, user]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {activeWorkspace ? `Overview for ${activeWorkspace.name}` : 'Global overview across all workspaces'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={HiOutlineCube} color="primary" />
        <StatCard title="Total Sales" value={`$${(stats?.salesRevenue || 0).toLocaleString()}`} icon={HiOutlineBanknotes} color="green" />
        <StatCard title="Low Stock Items" value={stats?.lowStockCount || 0} icon={HiOutlineExclamationTriangle} color="amber" />
        <StatCard title="Pending Bills" value={`$${(stats?.pendingBills || 0).toLocaleString()}`} icon={HiOutlineDocumentText} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Chart */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2">
            <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
            Sales Revenue
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2">
            <HiOutlineCube className="w-5 h-5 text-primary-500" />
            Top Products by Sales
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={topProducts} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                     dataKey="total_sold" nameKey="name" label={({ name, percent }) => `${name.slice(0, 12)}… ${(percent*100).toFixed(0)}%`}
                     labelLine={false}>
                  {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-surface-400">No sales data available</div>
          )}
        </div>
      </div>

      {/* Workspace Comparison (Admin Only) */}
      {user?.role === 'admin' && comparison.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2">
            <HiOutlineTruck className="w-5 h-5 text-primary-500" />
            Workspace Comparison
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.map(ws => (
              <div key={ws.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-700
                                        hover:border-primary-300 dark:hover:border-primary-600 transition">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.color }} />
                  <span className="font-semibold text-surface-800 dark:text-surface-200">{ws.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-surface-400">Products</p>
                    <p className="font-bold text-surface-800 dark:text-surface-200">{ws.products}</p>
                  </div>
                  <div>
                    <p className="text-surface-400">Revenue</p>
                    <p className="font-bold text-emerald-600">${parseFloat(ws.revenue).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-surface-400">Sales</p>
                    <p className="font-bold text-surface-800 dark:text-surface-200">{ws.sales_count}</p>
                  </div>
                  <div>
                    <p className="text-surface-400">Purchases</p>
                    <p className="font-bold text-surface-800 dark:text-surface-200">${parseFloat(ws.purchases_total).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
