import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import {
  HiOutlineCube, HiOutlineTruck, HiOutlineBanknotes, HiOutlineShoppingCart,
  HiOutlineExclamationTriangle, HiOutlineDocumentText, HiOutlineChartBar, HiOutlineBeaker,
  HiOutlinePlus, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineClock
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageLoader } from '../../components/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const Dashboard = () => {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => { document.title = 'Operational Overview — IMS Pro'; }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, chartRes, productsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/sales-chart'),
          api.get('/products') // Fetch products for the watchlist
        ]);
        setStats(statsRes.data.stats);
        setChartData(chartRes.data.chartData || []);
        
        // Filter low stock products for watchlist
        const allProducts = productsRes.data.data || [];
        setLowStockItems(allProducts.filter(p => p.stock_quantity <= p.min_stock_level)
                                    .sort((a,b) => a.stock_quantity - b.stock_quantity)
                                    .slice(0, 5));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeWorkspace, user]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-1">Operational Overview</h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium">
            Real-time inventory health and supply chain velocity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-strong)]">
            <HiOutlineDocumentText className="w-4 h-4 text-[var(--text-muted)]" /> EXPORT LEDGER
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition bg-[var(--accent-bright)] text-white hover:bg-[var(--accent-soft)]">
            <HiOutlinePlus className="w-4 h-4" /> NEW PURCHASE ORDER
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stock Value" value={formatCurrency(stats?.salesRevenue)} trend={12.4} color="green" />
        <StatCard title="Out-Of-Stock Items" value={stats?.lowStockCount || 0} subtitle="Critical Risk" color="rose" />
        <StatCard title="Low Stock Alerts" value={stats?.lowStockCount || 0} subtitle="Restock Pending" color="amber" />
        <StatCard title="Pending Orders" value="156" subtitle="$1.2M In Transit" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Warehouse Efficiency Matrix Chart */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">Turnover Trends</p>
                <h3 className="text-lg font-bold text-white">Warehouse Efficiency Matrix</h3>
              </div>
              <div className="flex gap-2 p-1 rounded-lg bg-[var(--bg-base)] border border-[var(--border-faint)]">
                <button className="px-3 py-1 text-xs font-bold rounded text-[var(--text-muted)] hover:text-white">7 DAYS</button>
                <button className="px-3 py-1 text-xs font-bold rounded bg-[var(--accent-bright)] text-white shadow">30 DAYS</button>
                <button className="px-3 py-1 text-xs font-bold rounded text-[var(--text-muted)] hover:text-white">90 DAYS</button>
              </div>
            </div>
            
            <div className="h-[260px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-faint)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--chart-label)' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--chart-label)' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} contentStyle={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="revenue" fill="var(--accent-bright)" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm font-semibold">No efficiency data available</div>
              )}
            </div>
            
            {/* Chart Legend Mock */}
            <div className="flex items-center justify-center gap-6 mt-6 border-t border-[var(--border-faint)] pt-4">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent-bright)]"></span><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Inbound Flow</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#cbd5e1]"></span><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Outbound Flow</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--success-text)]"></span><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Storage Optimization</span></div>
            </div>
          </div>

          {/* Critical Inventory Watchlist */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">Critical Inventory Watchlist</h3>
              <a href="/inventory" className="text-xs font-bold text-[var(--accent-bright)] hover:underline">View All Assets</a>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)]">Asset Name</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)]">SKU ID</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)] text-right">Current Stock</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)] pl-6">Status</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)] text-right">Velocity</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-faint)] hover:bg-[var(--bg-subtle)] transition">
                    <td className="py-4 font-bold text-white max-w-[180px] break-words">{item.name}</td>
                    <td className="py-4 text-xs font-medium text-[var(--text-muted)]">{item.sku || 'N/A'}</td>
                    <td className="py-4 font-bold text-white text-right font-mono">{item.stock_quantity}</td>
                    <td className="py-4 pl-6">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${item.stock_quantity === 0 ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'}`}>
                        {item.stock_quantity === 0 ? 'Critical' : 'Low Warning'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="w-8 h-1 bg-[var(--danger-text)] ml-auto rounded-full opacity-80" />
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-6 text-center text-[var(--text-muted)] text-sm font-semibold">No critical items to display</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Area (Right 1/3) */}
        <div className="space-y-6">
          
          {/* System Health Panel */}
          <div className="p-6 rounded-xl border border-[var(--border-subtle)]" style={{ background: 'linear-gradient(to bottom, #1e293b, var(--bg-surface))' }}>
            <h3 className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4">System Health Status</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--bg-base)] border-l-2 border-[var(--danger-text)]">
                <div className="flex items-start gap-2">
                  <HiOutlineExclamationCircle className="w-4 h-4 text-[var(--danger-text)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Inbound Shipment Delayed</h4>
                    <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed">Cargo vessel "Ever Dawm" delayed by 48h. Estimated impact: $215k in OOS risk.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-base)] border-l-2 border-[var(--success-text)]">
                <div className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-4 h-4 text-[var(--success-text)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Node 4 Efficiency Peak</h4>
                    <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed">Chicago Warehouse reached record 98.4% throughput capacity today.</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] border border-[var(--border-faint)] transition">
                VIEW INCIDENT LOG
              </button>
            </div>
          </div>

          {/* Audit Feed Timeline */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] min-h-[400px]">
            <h3 className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-6 flex items-center justify-between">
              Audit Feed <HiOutlineClock className="w-4 h-4 opacity-50" />
            </h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-[var(--border-faint)]">
              
              <div className="relative">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-subtle)] z-10">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-bright)]"></span>
                </div>
                <h4 className="text-[13px] font-bold text-white mb-1">Batch Release: B-9942</h4>
                <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed mb-1">1,200 units assigned to Regional Hub East.</p>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">12:42 PM - System</span>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--danger-bg)] flex items-center justify-center border border-[var(--danger-border)] z-10">
                  <span className="w-2 h-2 rounded-full bg-[var(--danger-text)]"></span>
                </div>
                <h4 className="text-[13px] font-bold text-white mb-1">Stock Deficiency Detected</h4>
                <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed mb-1">SKU PBU-0021-A dropped below emergency threshold (15).</p>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">10:15 AM - Automated</span>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--success-bg)] flex items-center justify-center border border-[var(--success-border)] z-10">
                  <span className="w-2 h-2 rounded-full bg-[var(--success-text)]"></span>
                </div>
                <h4 className="text-[13px] font-bold text-white mb-1">Audit Complete: Zone D</h4>
                <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed mb-1">Cycle count finished. 0.02% variance detected (Within tolerance).</p>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">09:30 AM - Sarah Chen</span>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--info-bg)] flex items-center justify-center border border-[var(--info-border)] z-10">
                  <span className="w-2 h-2 rounded-full bg-[var(--info-text)]"></span>
                </div>
                <h4 className="text-[13px] font-bold text-white mb-1">New Purchase Requisition</h4>
                <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed mb-1">PR-401 created for Raw Steel bulk order.</p>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Yesterday - David Lo</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
