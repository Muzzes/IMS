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
import { HiOutlinePlus, HiOutlineEye, HiOutlineCheckCircle, HiOutlinePencil, HiOutlineTrash, HiOutlineXCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const emptyForm = {
  supplier_id: '', order_date: new Date().toISOString().split('T')[0],
  expected_date: '', status: 'ordered', notes: '',
  items: [{ product_id: '', quantity: 1, unit_cost: 0 }],
  tax_rate: 0,
};

const Purchases = () => {
  const { activeWorkspace } = useWorkspace();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  // Create/Edit form
  const [formModal, setFormModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Confirm dialogs
  const [receiveConfirm, setReceiveConfirm] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { document.title = 'Purchases — IMS Pro'; }, []);

  const fetchAll = async () => {
    try {
      const [resPurchases, resSuppliers, resProducts] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers'),
        api.get('/products'),
      ]);
      setPurchases(resPurchases.data.data || []);
      setSuppliers(resSuppliers.data.data || []);
      setProducts(resProducts.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchAll(); }, [activeWorkspace]);

  // Line item handlers
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1, unit_cost: 0 }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      if (field === 'product_id') {
        const product = products.find(p => p.id.toString() === value.toString());
        items[idx] = { ...items[idx], product_id: value, unit_cost: product ? parseFloat(product.cost_price) : 0 };
      } else {
        items[idx] = { ...items[idx], [field]: value };
      }
      return { ...f, items };
    });
  };

  const subtotal = form.items.reduce((sum, i) => sum + (parseFloat(i.unit_cost) || 0) * (parseInt(i.quantity) || 0), 0);
  const taxAmount = subtotal * (parseFloat(form.tax_rate) || 0) / 100;
  const total = subtotal + taxAmount;

  const validate = () => {
    const errs = {};
    if (!form.supplier_id) errs.supplier_id = 'Required';
    if (!form.order_date) errs.order_date = 'Required';
    if (form.items.length === 0) errs.items = 'At least one item required';
    form.items.forEach((item, i) => {
      if (!item.product_id) errs[`item_${i}_product`] = 'Required';
      if (!item.quantity || item.quantity < 1) errs[`item_${i}_qty`] = 'Min 1';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormModal(true);
  };

  const openEditForm = async (purchase) => {
    try {
      const { data } = await api.get(`/purchases/${purchase.id}`);
      const po = data.purchase;
      setEditing(po);
      setForm({
        supplier_id: po.supplier_id || '', order_date: po.order_date?.split('T')[0] || '',
        expected_date: po.expected_date?.split('T')[0] || '', status: po.status,
        notes: po.notes || '', tax_rate: 0,
        items: po.items?.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_cost: parseFloat(i.unit_cost) })) || [],
      });
      setErrors({});
      setFormModal(true);
    } catch { toast.error('Failed to load purchase details'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        supplier_id: parseInt(form.supplier_id),
        order_date: form.order_date,
        expected_date: form.expected_date || null,
        status: form.status,
        notes: form.notes,
        total_amount: total,
        items: form.items.map(i => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity),
          unit_cost: parseFloat(i.unit_cost),
          total_cost: parseFloat(i.unit_cost) * parseInt(i.quantity),
        })),
      };

      if (editing) {
        await api.put(`/purchases/${editing.id}`, payload);
        toast.success('Purchase order updated');
      } else {
        await api.post('/purchases', payload);
        toast.success('Purchase order created');
      }
      setFormModal(false);
      setEditing(null);
      setForm(emptyForm);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setIsSubmitting(false); }
  };

  const handleMarkReceived = async () => {
    if (!receiveConfirm) return;
    try {
      await api.put(`/purchases/${receiveConfirm.id}/status`, { status: 'received' });
      toast.success('Purchase marked as received. Stock updated.');
      setReceiveConfirm(null);
      if (viewing?.id === receiveConfirm.id) setViewing({ ...viewing, status: 'received' });
      fetchAll();
    } catch { toast.error('Failed to update status'); }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    try {
      await api.put(`/purchases/${cancelConfirm.id}/status`, { status: 'cancelled' });
      toast.success('Purchase order cancelled');
      setCancelConfirm(null);
      fetchAll();
    } catch { toast.error('Failed to cancel'); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/purchases/${deleteConfirm.id}`);
      toast.success('Purchase order deleted');
      setDeleteConfirm(null);
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const handleView = async (purchase) => {
    try {
      const { data } = await api.get(`/purchases/${purchase.id}`);
      setViewing(data.purchase);
    } catch { toast.error('Failed to fetch details'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'PO Number', accessor: 'purchase_number', render: r => <span className="font-semibold">{r.purchase_number}</span> },
    { header: 'Supplier', accessor: 'supplier_name' },
    { header: 'Date', accessor: 'order_date', render: r => new Date(r.order_date).toLocaleDateString() },
    { header: 'Total', accessor: 'total_amount', render: r => formatCurrency(r.total_amount) },
    { header: 'Status', accessor: 'status', render: r => <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge> }
  ];

  const canEdit = (s) => s === 'pending' || s === 'ordered';
  const canDelete = (s) => s === 'pending' || s === 'ordered';

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Purchase Orders</h1>
        <button onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all"
                style={{ background: 'var(--accent-bright)' }}>
          <HiOutlinePlus className="w-4 h-4" /> New Purchase Order
        </button>
      </div>

      <DataTable columns={columns} data={purchases} actions={(row) => (
        <>
          <button onClick={() => handleView(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {canEdit(row.status) && (
            <button onClick={() => openEditForm(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlinePencil className="w-4 h-4" />
            </button>
          )}
          {row.status !== 'received' && row.status !== 'cancelled' && (
            <button onClick={() => setReceiveConfirm(row)} title="Mark Received" className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--success-bg)'; e.currentTarget.style.color = 'var(--success-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlineCheckCircle className="w-4 h-4" />
            </button>
          )}
          {canEdit(row.status) && (
            <button onClick={() => setCancelConfirm(row)} title="Cancel" className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--warning-bg)'; e.currentTarget.style.color = 'var(--warning-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlineXCircle className="w-4 h-4" />
            </button>
          )}
          {canDelete(row.status) && (
            <button onClick={() => setDeleteConfirm(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </>
      )} />

      {/* Detail Modal */}
      <Modal isOpen={!!viewing && !formModal} onClose={() => setViewing(null)} title={`Purchase Order — ${viewing?.purchase_number || ''}`} size="lg">
        {viewing && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
              <div><p style={{ color: 'var(--text-muted)' }}>Supplier</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewing.supplier_name}</p></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Order Date</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(viewing.order_date).toLocaleDateString()}</p></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Status</p><Badge variant={statusBadgeVariant(viewing.status)}>{viewing.status}</Badge></div>
              <div><p style={{ color: 'var(--text-muted)' }}>Created By</p><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewing.created_by_name}</p></div>
            </div>

            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Items</h4>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-faint)' }}>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)' }}>
                      <th className="px-4 py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Product</th>
                      <th className="px-4 py-2 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Qty</th>
                      <th className="px-4 py-2 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Unit Cost</th>
                      <th className="px-4 py-2 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewing.items?.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                        <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>{item.product_name}</td>
                        <td className="px-4 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>{item.quantity}</td>
                        <td className="px-4 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>${parseFloat(item.unit_cost).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>${parseFloat(item.total_cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--bg-subtle)' }}>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Total</td>
                      <td className="px-4 py-3 text-right text-lg font-bold" style={{ color: 'var(--success-text)' }}>{formatCurrency(viewing.total_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {viewing.status !== 'received' && viewing.status !== 'cancelled' && (
                <>
                  <button onClick={() => { setViewing(null); setCancelConfirm(viewing); }}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition"
                          style={{ border: '1px solid var(--warning-text)', color: 'var(--warning-text)' }}>
                    Cancel Order
                  </button>
                  <button onClick={() => { setViewing(null); setReceiveConfirm(viewing); }}
                          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition"
                          style={{ background: 'var(--success-text)' }}>
                    Mark as Received
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Form Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editing ? 'Edit Purchase Order' : 'New Purchase Order'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Supplier" required error={errors.supplier_id}>
              <FormSelect value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                          options={suppliers.map(s => ({ value: s.id, label: s.name }))} error={errors.supplier_id} placeholder="Select supplier" />
            </FormField>
            <FormField label="Order Date" required error={errors.order_date}>
              <FormInput type="date" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))} error={errors.order_date} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expected Delivery">
              <FormInput type="date" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} />
            </FormField>
            <FormField label="Status">
              <FormSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                          options={[{ value: 'ordered', label: 'Ordered' }, { value: 'pending', label: 'Pending' }]} />
            </FormField>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Line Items</p>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm font-medium"
                      style={{ color: 'var(--accent-bright)' }}>
                <HiOutlinePlus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {errors.items && <p className="text-xs mb-2" style={{ color: 'var(--danger-text)' }}>{errors.items}</p>}
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
                  <div className="col-span-5">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Product</label>
                    <FormSelect value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}
                                options={products.map(p => ({ value: p.id, label: p.name }))} error={errors[`item_${idx}_product`]} placeholder="Select product" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Qty</label>
                    <FormInput type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} error={errors[`item_${idx}_qty`]} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Unit Cost</label>
                    <FormInput type="number" step="0.01" min="0" prefix="$" value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', e.target.value)} />
                  </div>
                  <div className="col-span-2 text-right py-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Subtotal</label>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency((parseFloat(item.unit_cost) || 0) * (parseInt(item.quantity) || 0))}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded-lg" style={{ color: 'var(--danger-text)' }}>
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Tax (%)</span>
              <input type="number" min="0" max="100" step="0.1" value={form.tax_rate}
                     onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))}
                     className="w-20 px-2 py-1 text-right text-sm rounded-lg outline-none"
                     style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Tax Amount</span>
              <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(taxAmount)}</span>
            </div>
            <hr style={{ borderColor: 'var(--border-faint)' }} />
            <div className="flex justify-between text-lg font-bold">
              <span style={{ color: 'var(--text-primary)' }}>Total</span>
              <span style={{ color: 'var(--success-text)' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <FormField label="Notes">
            <FormTextarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {isSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog isOpen={!!receiveConfirm} onClose={() => setReceiveConfirm(null)} onConfirm={handleMarkReceived}
        title="Mark as Received" message={`Mark ${receiveConfirm?.purchase_number} as received? This will increment stock levels for all items.`}
        confirmText="Mark Received" danger={false} />

      <ConfirmDialog isOpen={!!cancelConfirm} onClose={() => setCancelConfirm(null)} onConfirm={handleCancel}
        title="Cancel Order" message={`Cancel ${cancelConfirm?.purchase_number}? Stock will not change.`}
        confirmText="Cancel Order" danger />

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete Purchase Order" message={`Delete ${deleteConfirm?.purchase_number}? This cannot be undone.`}
        confirmText="Delete" danger />
    </div>
  );
};

export default Purchases;
