import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge, { statusBadgeVariant } from '../../components/Badge';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlineEye, HiOutlineCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Purchases = () => {
  const { activeWorkspace } = useWorkspace();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const fetchPurchases = async () => {
    try {
      const { data } = await api.get('/purchases');
      setPurchases(data.data || []);
    } catch (err) { toast.error('Failed to load purchases'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchPurchases(); }, [activeWorkspace]);

  const handleMarkReceived = async (id) => {
    if (!confirm('Mark as received? This will increment stock levels for all items.')) return;
    try {
      await api.put(`/purchases/${id}/status`, { status: 'received' });
      toast.success('Purchase marked as received. Stock updated.');
      fetchPurchases();
      if (viewing?.id === id) setViewing({ ...viewing, status: 'received' });
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleView = async (purchase) => {
    try {
      const { data } = await api.get(`/purchases/${purchase.id}`);
      setViewing(data.purchase);
    } catch (err) { toast.error('Failed to fetch details'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'PO Number', accessor: 'purchase_number', render: r => <span className="font-semibold">{r.purchase_number}</span> },
    { header: 'Supplier', accessor: 'supplier_name' },
    { header: 'Date', accessor: 'order_date', render: r => new Date(r.order_date).toLocaleDateString() },
    { header: 'Total', accessor: 'total_amount', render: r => `$${parseFloat(r.total_amount).toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: r => <Badge variant={statusBadgeVariant(r.status)} className="capitalize">{r.status}</Badge> }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Purchase Orders</h1>
        <button onClick={() => toast('New PO form to be implemented', { icon: '🚧' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500
                           text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
          <HiOutlinePlus className="w-4 h-4" /> Create PO
        </button>
      </div>

      <DataTable columns={columns} data={purchases} actions={(row) => (
        <>
          <button onClick={() => handleView(row)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-500">
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {row.status !== 'received' && (
            <button onClick={() => handleMarkReceived(row.id)} title="Mark Received" className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-surface-500 hover:text-emerald-600 rounded-lg">
              <HiOutlineCheckCircle className="w-4 h-4" />
            </button>
          )}
        </>
      )} />

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={`Purchase Order Details - ${viewing?.purchase_number}`} size="lg">
        {viewing && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <div><p className="text-surface-500">Supplier</p><p className="font-semibold">{viewing.supplier_name}</p></div>
              <div><p className="text-surface-500">Order Date</p><p className="font-semibold">{new Date(viewing.order_date).toLocaleDateString()}</p></div>
              <div><p className="text-surface-500">Status</p><Badge variant={statusBadgeVariant(viewing.status)} className="capitalize">{viewing.status}</Badge></div>
              <div><p className="text-surface-500">Created By</p><p className="font-semibold">{viewing.created_by_name}</p></div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-50 dark:bg-surface-800/50">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Product</th>
                      <th className="px-4 py-2 font-semibold text-right">Qty</th>
                      <th className="px-4 py-2 font-semibold text-right">Unit Cost</th>
                      <th className="px-4 py-2 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {viewing.items?.map(item => (
                      <tr key={item.id} className="dark:bg-surface-900">
                        <td className="px-4 py-2">{item.product_name}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${parseFloat(item.unit_cost).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">${parseFloat(item.total_cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-50 dark:bg-surface-800 text-right font-bold">
                    <tr><td colSpan={3} className="px-4 py-3">Total Amount</td><td className="px-4 py-3 text-lg text-emerald-600">${parseFloat(viewing.total_amount).toLocaleString()}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {viewing.status !== 'received' && (
              <div className="flex justify-end pt-2">
                <button onClick={() => handleMarkReceived(viewing.id)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition">
                  Mark as Received
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;
