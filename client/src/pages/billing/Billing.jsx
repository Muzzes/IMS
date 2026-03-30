import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge, { statusBadgeVariant } from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField from '../../components/common/FormField';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormTextarea from '../../components/common/FormTextarea';
import { PageLoader } from '../../components/LoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineDocumentPlus, HiOutlineEye, HiOutlineBanknotes, HiOutlinePrinter, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const today = () => new Date().toISOString().split('T')[0];
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };

const Billing = () => {
  const { activeWorkspace } = useWorkspace();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  // Payment modal
  const [payModal, setPayModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payForm, setPayForm] = useState({ amount: 0, payment_method: 'bank_transfer', reference: '', payment_date: today(), notes: '' });

  // Create/Edit form
  const [formModal, setFormModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { document.title = 'Billing — IMS Pro'; }, []);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/bills');
      setBills(data.data || []);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchBills(); }, [activeWorkspace]);

  const handleView = async (bill) => {
    try {
      const { data } = await api.get(`/bills/${bill.id}`);
      setViewing(data.bill);
    } catch { toast.error('Failed to fetch details'); }
  };

  // Payment
  const startPayment = (bill) => {
    setViewing(bill);
    const outstanding = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount);
    setPayForm({ amount: outstanding > 0 ? outstanding : 0, payment_method: 'bank_transfer', reference: '', payment_date: today(), notes: '' });
    setPayModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const outstanding = parseFloat(viewing?.total_amount || 0) - parseFloat(viewing?.paid_amount || 0);
    if (payForm.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
    if (payForm.amount > outstanding) { toast.error(`Amount cannot exceed outstanding balance of ${formatCurrency(outstanding)}`); return; }
    setIsSubmitting(true);
    try {
      await api.post(`/bills/${viewing.id}/payments`, payForm);
      toast.success('Payment recorded');
      setPayModal(false);
      handleView(viewing);
      fetchBills();
    } catch { toast.error('Failed to record payment'); }
    finally { setIsSubmitting(false); }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/bills/${deleteTarget.id}`);
      toast.success('Bill deleted');
      setDeleteTarget(null);
      fetchBills();
    } catch { toast.error('Failed to delete bill'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Bill Number', accessor: 'bill_number', render: r => <span className="font-semibold">{r.bill_number}</span> },
    { header: 'Supplier', accessor: 'supplier_name' },
    { header: 'Amount', accessor: 'total_amount', render: r => formatCurrency(r.total_amount) },
    { header: 'Balance', accessor: 'balance', render: r => {
      const bal = parseFloat(r.total_amount || 0) - parseFloat(r.paid_amount || 0);
      return <span className="font-semibold font-mono-val text-sm" style={{ color: bal > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>{formatCurrency(bal)}</span>;
    }},
    { header: 'Status', accessor: 'status', render: r => <Badge variant={statusBadgeVariant(r.status)}>{(r.status || '').replace('_', ' ')}</Badge> },
    { header: 'Due Date', accessor: 'due_date', render: r => new Date(r.due_date).toLocaleDateString() }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Bills & Payments</h1>
      </div>

      <DataTable columns={columns} data={bills} actions={(row) => (
        <>
          <button onClick={() => handleView(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {row.status !== 'paid' && row.status !== 'cancelled' && (
            <button onClick={() => startPayment(row)} title="Record Payment"
                    className="flex items-center gap-1 p-1.5 rounded-lg font-medium text-sm transition"
                    style={{ color: 'var(--success-text)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--success-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <HiOutlineBanknotes className="w-4 h-4" /> Pay
            </button>
          )}
          {(row.status === 'pending' || row.status === 'draft') && (
            <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </>
      )} />

      {/* Detail Modal */}
      <Modal isOpen={!!viewing && !payModal} onClose={() => setViewing(null)} title={`Bill Summary — ${viewing?.bill_number || ''}`} size="lg">
        {viewing && (
          <div className="space-y-6 print-area text-white">
            <div className="flex justify-end print:hidden">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-faint)' }}>
                <HiOutlinePrinter className="w-4 h-4" /> Print PDF
              </button>
            </div>

            {/* Print Header */}
            <div className="border-b pb-4 mb-4 flex justify-between items-end" style={{ borderColor: 'var(--border-faint)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeWorkspace?.name || 'Company Name'}</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Bill #{viewing.bill_number}</p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-light uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Account Payable</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
              <div><p style={{ color: 'var(--text-muted)' }}>Supplier / Vendor</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewing.supplier_name}</p></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Due Date</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(viewing.due_date).toLocaleDateString()}</p></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Status</p><div className="print:hidden"><Badge variant={statusBadgeVariant(viewing.status)}>{(viewing.status || '').replace('_', ' ')}</Badge></div></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Billed Amount</p><p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{formatCurrency(viewing.total_amount)}</p></div>
              <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Amount Paid</p>
                <p className="font-semibold pt-1" style={{ color: 'var(--success-text)' }}>{formatCurrency(viewing.paid_amount)}</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Balance Due</p>
                <p className="font-semibold pt-1" style={{ color: 'var(--danger-text)' }}>{formatCurrency(parseFloat(viewing.total_amount || 0) - parseFloat(viewing.paid_amount || 0))}</p>
              </div>
            </div>

            {viewing.payments?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 mt-4 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-faint)' }}>Payment History</h4>
                <div className="rounded-xl overflow-hidden divide-y" style={{ border: '1px solid var(--border-faint)' }}>
                  {viewing.payments.map(p => (
                    <div key={p.id} className="p-3 text-sm flex justify-between items-center" style={{ background: 'var(--bg-subtle)' }}>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{new Date(p.payment_date).toLocaleDateString()}</p>
                        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{(p.payment_method || '').replace('_', ' ')} • Ref: {p.reference}</p>
                      </div>
                      <span className="font-semibold font-mono-val" style={{ color: 'var(--success-text)', fontSize: '14px' }}>{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {viewing.status !== 'paid' && viewing.status !== 'cancelled' && (
              <div className="flex justify-end pt-2 print:hidden">
                <button onClick={() => { setViewing(null); startPayment(viewing); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition"
                        style={{ background: 'var(--success-text)' }}>
                  <HiOutlineBanknotes className="w-4 h-4" /> Record Payment
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Record Payment">
        <form onSubmit={submitPayment} className="space-y-4">
          <FormField label="Amount" required hint={`Balance due: ${formatCurrency(parseFloat(viewing?.total_amount || 0) - parseFloat(viewing?.paid_amount || 0))}`}>
            <FormInput type="number" step="0.01" min="0.01" value={payForm.amount}
                       onChange={e => setPayForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} prefix="$" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Method">
              <FormSelect value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}
                          options={[
                            { value: 'bank_transfer', label: 'Bank Transfer' },
                            { value: 'credit_card', label: 'Credit Card' },
                            { value: 'cash', label: 'Cash' },
                            { value: 'cheque', label: 'Cheque' },
                            { value: 'online', label: 'Online' },
                          ]} />
            </FormField>
            <FormField label="Payment Date">
              <FormInput type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Reference">
            <FormInput value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} placeholder="Transaction ID, cheque number..." />
          </FormField>
          <FormField label="Notes">
            <FormTextarea value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional notes..." />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPayModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--success-text)' }}>
              {isSubmitting ? <><LoadingSpinner size="sm" /> Recording...</> : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Bill" message={`Delete ${deleteTarget?.bill_number}? This cannot be undone.`}
        confirmText="Delete" danger />
    </div>
  );
};

export default Billing;
