import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge, { statusBadgeVariant } from '../../components/Badge';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlineDocumentPlus, HiOutlineEye, HiOutlineBanknotes } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Billing = () => {
  const { activeWorkspace } = useWorkspace();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: 0, payment_method: 'bank_transfer', reference: '' });

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/bills');
      setBills(data.data || []);
    } catch (err) { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchBills(); }, [activeWorkspace]);

  const handleView = async (bill) => {
    try {
      const { data } = await api.get(`/bills/${bill.id}`);
      setViewing(data.bill);
    } catch (err) { toast.error('Failed to fetch details'); }
  };

  const startPayment = (bill) => {
    setViewing(bill);
    setPayForm({ amount: bill.total_amount - bill.paid_amount, payment_method: 'bank_transfer', reference: '' });
    setPayModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/bills/${viewing.id}/payments`, payForm);
      toast.success('Payment recorded');
      setPayModal(false);
      handleView(viewing); // Refresh viewing details
      fetchBills();
    } catch (err) { toast.error('Failed to record payment'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Bill Number', accessor: 'bill_number', render: r => <span className="font-semibold">{r.bill_number}</span> },
    { header: 'Supplier', accessor: 'supplier_name' },
    { header: 'Amount', accessor: 'total_amount', render: r => `$${parseFloat(r.total_amount).toLocaleString()}` },
    { header: 'Balance', accessor: 'balance', render: r => <span className={r.total_amount - r.paid_amount > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 font-semibold'}>${parseFloat(r.total_amount - r.paid_amount).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <Badge variant={statusBadgeVariant(r.status)} className="capitalize">{r.status.replace('_', ' ')}</Badge> },
    { header: 'Due Date', accessor: 'due_date', render: r => new Date(r.due_date).toLocaleDateString() }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Bills & Payments</h1>
        <button onClick={() => toast('New bill form to be implemented', { icon: '🚧' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
          <HiOutlineDocumentPlus className="w-4 h-4" /> Create Bill
        </button>
      </div>

      <DataTable columns={columns} data={bills} actions={(row) => (
        <>
          <button onClick={() => handleView(row)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-500">
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {row.status !== 'paid' && row.status !== 'cancelled' && (
            <button onClick={() => startPayment(row)} title="Record Payment" className="flex items-center gap-1 p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 rounded-lg font-medium text-sm">
              <HiOutlineBanknotes className="w-4 h-4" /> Pay
            </button>
          )}
        </>
      )} />

      {/* Detail Modal */}
      <Modal isOpen={!!viewing && !payModal} onClose={() => setViewing(null)} title={`Bill Details - ${viewing?.bill_number}`} size="md">
        {viewing && (
           <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <div><p className="text-surface-500">Supplier</p><p className="font-semibold">{viewing.supplier_name}</p></div>
              <div><p className="text-surface-500">Status</p><Badge variant={statusBadgeVariant(viewing.status)} className="capitalize">{viewing.status.replace('_', ' ')}</Badge></div>
              <div><p className="text-surface-500">Total Amount</p><p className="font-semibold text-surface-800 dark:text-surface-200">${parseFloat(viewing.total_amount).toLocaleString()}</p></div>
              <div><p className="text-surface-500">Balance Due</p><p className="font-semibold text-rose-500">${parseFloat(viewing.total_amount - viewing.paid_amount).toLocaleString()}</p></div>
            </div>

            {viewing.payments?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Payment History</h4>
                <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
                  {viewing.payments.map(p => (
                    <div key={p.id} className="p-3 text-sm flex justify-between items-center bg-white dark:bg-surface-900">
                      <div>
                        <p className="font-medium">{new Date(p.payment_date).toLocaleDateString()}</p>
                        <p className="text-xs text-surface-500 capitalize">{p.payment_method.replace('_', ' ')} • Ref: {p.reference}</p>
                      </div>
                      <span className="font-semibold text-emerald-600">${parseFloat(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
           </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Record Payment">
        <form onSubmit={submitPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Amount *</label>
            <input type="number" step="0.01" max={viewing?.total_amount - viewing?.paid_amount} required value={payForm.amount} onChange={e => setPayForm({...payForm, amount: parseFloat(e.target.value)||0})} className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500" />
            <p className="text-xs text-surface-500 mt-1">Balance due: ${viewing?.total_amount - viewing?.paid_amount}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Method</label>
            <select value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Reference</label><input value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPayModal(false)} className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
