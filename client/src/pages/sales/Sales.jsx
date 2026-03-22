import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge, { statusBadgeVariant } from '../../components/Badge';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlineEye } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Sales = () => {
  const { activeWorkspace } = useWorkspace();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const fetchSales = async () => {
    try {
      const { data } = await api.get('/sales');
      setSales(data.data || []);
    } catch (err) { toast.error('Failed to load sales'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchSales(); }, [activeWorkspace]);

  const handleView = async (sale) => {
    try {
      const { data } = await api.get(`/sales/${sale.id}`);
      setViewing(data.sale);
    } catch (err) { toast.error('Failed to fetch details'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Inv Number', accessor: 'sale_number', render: r => <span className="font-semibold">{r.sale_number}</span> },
    { header: 'Customer', accessor: 'customer_name', render: r => r.customer_name || '-' },
    { header: 'Date', accessor: 'created_at', render: r => new Date(r.created_at).toLocaleDateString() },
    { header: 'Net Amount', accessor: 'net_amount', render: r => `$${parseFloat(r.net_amount).toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: r => <Badge variant={statusBadgeVariant(r.status)} className="capitalize">{r.status}</Badge> }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Sales</h1>
        <button onClick={() => toast('New Sale POS to be implemented', { icon: '🚧' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
          <HiOutlinePlus className="w-4 h-4" /> New Sale
        </button>
      </div>

      <DataTable columns={columns} data={sales} actions={(row) => (
        <button onClick={() => handleView(row)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-500">
          <HiOutlineEye className="w-4 h-4" />
        </button>
      )} />

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={`Invoice Details - ${viewing?.sale_number}`} size="lg">
        {viewing && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <div><p className="text-surface-500">Customer</p><p className="font-semibold">{viewing.customer_name || 'Walk-in Customer'}</p></div>
              <div><p className="text-surface-500">Invoice Date</p><p className="font-semibold">{new Date(viewing.created_at).toLocaleString()}</p></div>
              <div><p className="text-surface-500">Status</p><Badge variant={statusBadgeVariant(viewing.status)} className="capitalize">{viewing.status}</Badge></div>
              <div><p className="text-surface-500">Billed By</p><p className="font-semibold">{viewing.created_by_name}</p></div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-50 dark:bg-surface-800/50">
                    <tr><th className="px-4 py-2">Product</th><th className="px-4 py-2 text-right">Qty</th><th className="px-4 py-2 text-right">Price</th><th className="px-4 py-2 text-right">Total</th></tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {viewing.items?.map(item => (
                      <tr key={item.id} className="dark:bg-surface-900">
                        <td className="px-4 py-2">{item.product_name}</td><td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">${parseFloat(item.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-50 dark:bg-surface-800 text-right text-sm">
                    <tr><td colSpan={3} className="px-4 py-2 text-surface-500">Subtotal</td><td className="px-4 py-2">${parseFloat(viewing.total_amount).toFixed(2)}</td></tr>
                    {viewing.discount > 0 && <tr><td colSpan={3} className="px-4 py-2 text-surface-500">Discount</td><td className="px-4 py-2 text-rose-500">-${parseFloat(viewing.discount).toFixed(2)}</td></tr>}
                    {viewing.tax > 0 && <tr><td colSpan={3} className="px-4 py-2 text-surface-500">Tax</td><td className="px-4 py-2">${parseFloat(viewing.tax).toFixed(2)}</td></tr>}
                    <tr className="font-bold text-base"><td colSpan={3} className="px-4 py-3">Net Amount</td><td className="px-4 py-3 text-emerald-600">${parseFloat(viewing.net_amount).toLocaleString()}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
