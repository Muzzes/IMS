import { useState, useEffect } from 'react';
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
import { HiOutlinePlus, HiOutlineEye, HiOutlinePrinter, HiOutlinePencil, HiOutlineReceiptRefund, HiOutlineLockClosed } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import POS from './POS';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const Sales = () => {
  const { activeWorkspace } = useWorkspace();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit customer info
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', notes: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Refund modal
  const [refundModal, setRefundModal] = useState(false);
  const [refundItems, setRefundItems] = useState([]);
  const [refundReason, setRefundReason] = useState('');
  const [restock, setRestock] = useState(true);
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  useEffect(() => { document.title = 'Sales — IMS Pro'; }, []);

  const fetchSales = async () => {
    try {
      const { data } = await api.get('/sales');
      setSales(data.data || []);
    } catch { toast.error('Failed to load sales'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchSales(); }, [activeWorkspace]);

  const handleView = async (sale) => {
    try {
      const { data } = await api.get(`/sales/${sale.id}`);
      setViewing(data.sale);
    } catch { toast.error('Failed to fetch details'); }
  };

  // Edit customer info
  const openEditModal = () => {
    if (!viewing) return;
    setEditForm({
      customer_name: viewing.customer_name || '',
      customer_email: viewing.customer_email || '',
      customer_phone: viewing.customer_phone || '',
      notes: viewing.notes || '',
    });
    setEditModal(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (editSubmitting) return;
    setEditSubmitting(true);
    try {
      await api.put(`/sales/${viewing.id}`, editForm);
      toast.success('Sale details updated');
      setEditModal(false);
      handleView(viewing);
      fetchSales();
    } catch { toast.error('Failed to update'); }
    finally { setEditSubmitting(false); }
  };

  // Refund
  const openRefundModal = () => {
    if (!viewing?.items) return;
    setRefundItems(viewing.items.map(i => ({ ...i, selected: false, refund_qty: i.quantity })));
    setRefundReason('');
    setRestock(true);
    setRefundModal(true);
  };

  const toggleRefundItem = (idx) => {
    setRefundItems(items => items.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item));
  };

  const updateRefundQty = (idx, qty) => {
    setRefundItems(items => items.map((item, i) => i === idx ? { ...item, refund_qty: Math.min(qty, item.quantity) } : item));
  };

  const submitRefund = async () => {
    const selected = refundItems.filter(i => i.selected);
    if (selected.length === 0) { toast.error('Select at least one item to refund'); return; }
    setRefundSubmitting(true);
    try {
      // Refund via status update
      await api.put(`/sales/${viewing.id}/status`, {
        status: selected.length === viewing.items.length ? 'refunded' : 'partial_refund',
        refund_reason: refundReason,
        restock,
        refund_items: selected.map(i => ({ product_id: i.product_id, quantity: i.refund_qty })),
      });
      toast.success('Refund processed');
      setRefundModal(false);
      setViewing(null);
      fetchSales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    }
    finally { setRefundSubmitting(false); }
  };

  if (loading) return <PageLoader />;

  if (isCreating) {
    return <POS onCancel={() => setIsCreating(false)} onSuccess={(newSale) => { setIsCreating(false); fetchSales(); handleView(newSale); }} />;
  }

  const columns = [
    { header: 'Inv Number', accessor: 'sale_number', render: r => <span className="font-semibold">{r.sale_number}</span> },
    { header: 'Customer', accessor: 'customer_name', render: r => r.customer_name || '-' },
    { header: 'Date', accessor: 'created_at', render: r => new Date(r.created_at).toLocaleDateString() },
    { header: 'Net Amount', accessor: 'net_amount', render: r => formatCurrency(r.net_amount) },
    { header: 'Status', accessor: 'status', render: r => <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge> }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Sales</h1>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl shadow-lg shadow-primary-500/20 text-sm font-semibold transition"
                style={{ background: 'var(--accent-bright)' }}>
          <HiOutlinePlus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <DataTable columns={columns} data={sales} actions={(row) => (
        <button onClick={() => handleView(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <HiOutlineEye className="w-4 h-4" />
        </button>
      )} />

      {/* Invoice Detail Modal */}
      <Modal isOpen={!!viewing && !editModal && !refundModal} onClose={() => setViewing(null)} title={`Invoice — ${viewing?.sale_number || ''}`} size="lg">
        {viewing && (
          <div className="space-y-6 print-area bg-white dark:bg-transparent text-surface-900 dark:text-inherit">
            <div className="flex justify-end gap-2 print:hidden">
              <button onClick={openEditModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-faint)' }}>
                <HiOutlinePencil className="w-4 h-4" /> Edit Details
              </button>
              {viewing.status === 'completed' && (
                <button onClick={openRefundModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                        style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-text)' }}>
                  <HiOutlineReceiptRefund className="w-4 h-4" /> Refund
                </button>
              )}
              <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-faint)' }}>
                <HiOutlinePrinter className="w-4 h-4" /> Print
              </button>
            </div>

            {/* Invoice Header */}
            <div className="border-b pb-4 mb-4 flex justify-between items-end" style={{ borderColor: 'var(--border-faint)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeWorkspace?.name || 'Company Name'}</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Invoice #{viewing.sale_number}</p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-light uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Invoice</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
              <div><p style={{ color: 'var(--text-muted)' }}>Bill To</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewing.customer_name || 'Walk-in Customer'}</p></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Invoice Date</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(viewing.created_at).toLocaleString()}</p></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Status</p><div className="print:hidden"><Badge variant={statusBadgeVariant(viewing.status)}>{viewing.status}</Badge></div></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Agent</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewing.created_by_name}</p></div>
            </div>

            {/* Items Table */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Line Items</h4>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full print:hidden"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-faint)' }}>
                  <HiOutlineLockClosed className="w-3 h-3" /> Locked
                </span>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-faint)' }}>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)' }}>
                      <th className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>Product</th>
                      <th className="px-4 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Qty</th>
                      <th className="px-4 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Price</th>
                      <th className="px-4 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewing.items?.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{item.product_name}</td>
                        <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{item.quantity}</td>
                        <td className="px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>${parseFloat(item.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: 'var(--bg-subtle)' }}>
                    <tr style={{ borderTop: '1px solid var(--border-faint)' }}>
                      <td colSpan={3} className="px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>Subtotal</td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>${parseFloat(viewing.total_amount || 0).toFixed(2)}</td>
                    </tr>
                    {parseFloat(viewing.discount || 0) > 0 && (
                      <tr><td colSpan={3} className="px-4 py-2 text-right" style={{ color: 'var(--text-muted)' }}>Discount</td>
                        <td className="px-4 py-2 text-right" style={{ color: 'var(--danger-text)' }}>-${parseFloat(viewing.discount).toFixed(2)}</td></tr>
                    )}
                    {parseFloat(viewing.tax || 0) > 0 && (
                      <tr><td colSpan={3} className="px-4 py-2 text-right" style={{ color: 'var(--text-muted)' }}>Tax</td>
                        <td className="px-4 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>${parseFloat(viewing.tax).toFixed(2)}</td></tr>
                    )}
                    <tr className="font-bold text-lg">
                      <td colSpan={3} className="px-4 py-4 text-right uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Net Amount</td>
                      <td className="px-4 py-4 text-right" style={{ color: 'var(--success-text)' }}>{formatCurrency(viewing.net_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Sale Details">
        <form onSubmit={submitEdit} className="space-y-4">
          <FormField label="Customer Name">
            <FormInput value={editForm.customer_name} onChange={e => setEditForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Customer name" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email">
              <FormInput type="email" value={editForm.customer_email} onChange={e => setEditForm(f => ({ ...f, customer_email: e.target.value }))} />
            </FormField>
            <FormField label="Phone">
              <FormInput value={editForm.customer_phone} onChange={e => setEditForm(f => ({ ...f, customer_phone: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Notes">
            <FormTextarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={editSubmitting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {editSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Refund Modal */}
      <Modal isOpen={refundModal} onClose={() => setRefundModal(false)} title="Refund Sale" size="lg">
        <div className="space-y-4">
          <FormField label="Refund Reason">
            <FormSelect value={refundReason} onChange={e => setRefundReason(e.target.value)}
                        options={[{ value: 'customer_request', label: 'Customer Request' }, { value: 'defective', label: 'Defective Product' }, { value: 'wrong_item', label: 'Wrong Item' }, { value: 'other', label: 'Other' }]}
                        placeholder="Select reason" />
          </FormField>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Select items to refund:</p>
            <div className="space-y-2">
              {refundItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl transition"
                     style={{ background: item.selected ? 'var(--accent-glow)' : 'var(--bg-subtle)', border: `1px solid ${item.selected ? 'var(--border-accent)' : 'var(--border-faint)'}` }}>
                  <input type="checkbox" checked={item.selected} onChange={() => toggleRefundItem(idx)}
                         className="w-4 h-4 rounded accent-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Original qty: {item.quantity}</p>
                  </div>
                  {item.selected && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Refund qty:</label>
                      <input type="number" min={1} max={item.quantity} value={item.refund_qty}
                             onChange={e => updateRefundQty(idx, parseInt(e.target.value) || 1)}
                             className="w-16 px-2 py-1 text-sm text-center rounded-lg outline-none"
                             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={restock} onChange={e => setRestock(e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
            Return items to stock
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setRefundModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={submitRefund} disabled={refundSubmitting || refundItems.every(i => !i.selected)}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--warning-text)' }}>
              {refundSubmitting ? <><LoadingSpinner size="sm" /> Processing...</> : 'Process Refund'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
