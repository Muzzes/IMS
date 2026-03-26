import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField from '../../components/common/FormField';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormTextarea from '../../components/common/FormTextarea';
import { PageLoader } from '../../components/LoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  HiOutlinePencilSquare, HiOutlineArrowPath, HiOutlineAdjustmentsHorizontal,
  HiOutlineCheck, HiOutlineXMark, HiOutlineTrash, HiPlusCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const getStockStatus = (qty, threshold) => {
  if (qty <= 0) return { label: 'Out of Stock', variant: 'danger' };
  if (qty <= threshold) return { label: 'Low Stock', variant: 'warning' };
  return { label: 'Healthy', variant: 'success' };
};

const InventoryList = () => {
  const { activeWorkspace } = useWorkspace();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Inline editing
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineEditField, setInlineEditField] = useState(null); // 'stock' or 'threshold'
  const [inlineValue, setInlineValue] = useState('');

  // Stock adjustment modal
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'set', value: 0, reason: 'manual', notes: '' });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Bulk update modal
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({});
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Add/Edit item modal
  const emptyItem = { name: '', sku: '', description: '', category: '', unit_price: '', cost_price: '', stock_quantity: '', min_stock_level: '10' };
  const [itemModal, setItemModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [itemForm, setItemForm] = useState({ ...emptyItem });
  const [itemSaving, setItemSaving] = useState(false);
  const [itemErrors, setItemErrors] = useState({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { document.title = 'Inventory — IMS Pro'; }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setLoading(true); fetchProducts(); }, [activeWorkspace, fetchProducts]);

  // Filtered and sorted products
  const filteredProducts = products
    .filter(p => {
      if (filterStatus === 'all') return true;
      const status = getStockStatus(p.stock_quantity, p.min_stock_level);
      if (filterStatus === 'healthy') return status.label === 'Healthy';
      if (filterStatus === 'low') return status.label === 'Low Stock';
      if (filterStatus === 'out') return status.label === 'Out of Stock';
      return true;
    })
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  // Inline edit handlers
  const startInlineEdit = (productId, field, currentValue) => {
    setInlineEditId(productId);
    setInlineEditField(field);
    setInlineValue(String(currentValue));
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineEditField(null);
    setInlineValue('');
  };

  const saveInlineEdit = async () => {
    const val = parseInt(inlineValue);
    if (isNaN(val) || val < 0) { toast.error('Must be a non-negative integer'); return; }
    const field = inlineEditField === 'stock' ? 'stock_quantity' : 'min_stock_level';
    try {
      await api.put(`/products/${inlineEditId}`, { [field]: val });
      setProducts(prev => prev.map(p => p.id === inlineEditId ? { ...p, [field]: val } : p));
      toast.success(`${inlineEditField === 'stock' ? 'Stock' : 'Threshold'} updated`);
    } catch { toast.error('Failed to update'); }
    finally { cancelInlineEdit(); }
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === 'Enter') saveInlineEdit();
    if (e.key === 'Escape') cancelInlineEdit();
  };

  // Stock adjustment modal
  const openAdjustModal = (product) => {
    setAdjustModal(product);
    setAdjustForm({ type: 'set', value: product.stock_quantity, reason: 'manual', notes: '' });
  };

  const getPreviewQty = () => {
    if (!adjustModal) return 0;
    const current = adjustModal.stock_quantity;
    const val = parseInt(adjustForm.value) || 0;
    switch (adjustForm.type) {
      case 'set': return val;
      case 'add': return current + val;
      case 'remove': return Math.max(0, current - val);
      default: return current;
    }
  };

  const submitAdjustment = async () => {
    const newQty = getPreviewQty();
    if (newQty < 0) { toast.error('Stock cannot be negative'); return; }
    if (adjustForm.type === 'remove' && parseInt(adjustForm.value) > adjustModal.stock_quantity) {
      toast.error('Cannot remove more than current stock');
      return;
    }
    setAdjustSubmitting(true);
    try {
      await api.put(`/products/${adjustModal.id}`, { stock_quantity: newQty });
      setProducts(prev => prev.map(p => p.id === adjustModal.id ? { ...p, stock_quantity: newQty } : p));
      toast.success(`Stock updated to ${newQty}`);
      setAdjustModal(null);
    } catch { toast.error('Failed to update stock'); }
    finally { setAdjustSubmitting(false); }
  };

  // Bulk update
  const openBulkModal = () => {
    const lowItems = products.filter(p => p.stock_quantity <= p.min_stock_level);
    const initial = {};
    lowItems.forEach(p => { initial[p.id] = p.stock_quantity; });
    setBulkUpdates(initial);
    setBulkModal(true);
  };

  const submitBulk = async () => {
    const changed = Object.entries(bulkUpdates).filter(([id, qty]) => {
      const product = products.find(p => p.id === parseInt(id));
      return product && qty !== product.stock_quantity;
    });
    if (changed.length === 0) { toast.error('No changes to save'); return; }
    setBulkSubmitting(true);
    try {
      await Promise.all(changed.map(([id, qty]) =>
        api.put(`/products/${id}`, { stock_quantity: parseInt(qty) })
      ));
      toast.success(`${changed.length} item(s) updated`);
      setBulkModal(false);
      fetchProducts();
    } catch { toast.error('Some updates failed'); }
    finally { setBulkSubmitting(false); }
  };

  const lowItems = products.filter(p => p.stock_quantity <= p.min_stock_level);
  const changedCount = Object.entries(bulkUpdates).filter(([id, qty]) => {
    const p = products.find(p => p.id === parseInt(id));
    return p && qty !== p.stock_quantity;
  }).length;

  // ── Add/Edit item handlers ──
  const openAddItem = () => {
    setEditItemId(null);
    setItemForm({ ...emptyItem });
    setItemErrors({});
    setItemModal(true);
  };

  const openEditItem = (p) => {
    setEditItemId(p.id);
    setItemForm({
      name: p.name || '', sku: p.sku || '', description: p.description || '',
      category: p.category || '', unit_price: p.unit_price ?? '', cost_price: p.cost_price ?? '',
      stock_quantity: p.stock_quantity ?? '', min_stock_level: p.min_stock_level ?? '10',
    });
    setItemErrors({});
    setItemModal(true);
  };

  const validateItem = () => {
    const errs = {};
    if (!itemForm.name.trim()) errs.name = 'Name is required';
    setItemErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveItem = async () => {
    if (!validateItem()) return;
    setItemSaving(true);
    try {
      const payload = {
        name: itemForm.name.trim(), sku: itemForm.sku.trim() || null,
        description: itemForm.description.trim() || null, category: itemForm.category.trim() || null,
        unit_price: itemForm.unit_price !== '' ? Number(itemForm.unit_price) : 0,
        cost_price: itemForm.cost_price !== '' ? Number(itemForm.cost_price) : 0,
        stock_quantity: itemForm.stock_quantity !== '' ? Number(itemForm.stock_quantity) : 0,
        min_stock_level: itemForm.min_stock_level !== '' ? Number(itemForm.min_stock_level) : 10,
      };
      if (editItemId) {
        const { data } = await api.put(`/products/${editItemId}`, payload);
        setProducts(prev => prev.map(p => p.id === editItemId ? (data.product || { ...p, ...payload }) : p));
        toast.success('Item updated');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts(prev => [data.product || { ...payload, id: Date.now() }, ...prev]);
        toast.success('Item added');
      }
      setItemModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setItemSaving(false); }
  };

  const onItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ ...prev, [name]: value }));
    if (itemErrors[name]) setItemErrors(prev => ({ ...prev, [name]: null }));
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  const statusTabs = [
    { key: 'all', label: 'All', count: products.length },
    { key: 'healthy', label: 'Healthy', count: products.filter(p => getStockStatus(p.stock_quantity, p.min_stock_level).label === 'Healthy').length },
    { key: 'low', label: 'Low Stock', count: products.filter(p => getStockStatus(p.stock_quantity, p.min_stock_level).label === 'Low Stock').length },
    { key: 'out', label: 'Out of Stock', count: products.filter(p => p.stock_quantity <= 0).length },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{filteredProducts.length} items</p>
        </div>
        {lowItems.length > 0 && (
          <button onClick={openBulkModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-text)' }}>
            <HiOutlineArrowPath className="w-4 h-4" /> Bulk Update ({lowItems.length})
          </button>
        )}
          <button onClick={openAddItem} className="btn-primary flex items-center gap-2">
            <HiPlusCircle className="w-5 h-5" /> Add Item
          </button>
        </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
        {statusTabs.map(tab => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: filterStatus === tab.key ? 'var(--bg-overlay)' : 'transparent',
                    color: filterStatus === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: filterStatus === tab.key ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  }}>
            {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-[12px]" style={{ border: '1px solid var(--border-faint)' }}>
        <table className="w-full text-sm" style={{ background: 'transparent' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)' }}>
              {['Product', 'SKU', 'Category', 'Price', 'In Stock', 'Threshold', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap uppercase font-semibold"
                    style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center" style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No inventory items found.
                </td>
              </tr>
            ) : filteredProducts.map((p, i) => {
              const status = getStockStatus(p.stock_quantity, p.min_stock_level);
              const isEditingStock = inlineEditId === p.id && inlineEditField === 'stock';
              const isEditingThreshold = inlineEditId === p.id && inlineEditField === 'threshold';
              return (
                <tr key={p.id} className="table-row-hover" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    <span className="font-semibold">{p.name}</span>
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{p.sku}</td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{formatCurrency(p.unit_price)}</td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {isEditingStock ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={inlineValue} onChange={e => setInlineValue(e.target.value)} onKeyDown={handleInlineKeyDown}
                               autoFocus className="w-20 px-2 py-1 text-sm rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-bright)', color: 'var(--text-primary)' }} />
                        <button onClick={saveInlineEdit} className="p-1 rounded" style={{ color: 'var(--success-text)' }}><HiOutlineCheck className="w-4 h-4" /></button>
                        <button onClick={cancelInlineEdit} className="p-1 rounded" style={{ color: 'var(--danger-text)' }}><HiOutlineXMark className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <span onClick={() => startInlineEdit(p.id, 'stock', p.stock_quantity)}
                            className="cursor-pointer px-2 py-1 rounded-lg transition font-semibold"
                            style={{ color: status.variant === 'danger' ? 'var(--danger-text)' : status.variant === 'warning' ? 'var(--warning-text)' : 'var(--success-text)' }}
                            title="Click to edit">
                        {p.stock_quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {isEditingThreshold ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={inlineValue} onChange={e => setInlineValue(e.target.value)} onKeyDown={handleInlineKeyDown}
                               autoFocus className="w-20 px-2 py-1 text-sm rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-bright)', color: 'var(--text-primary)' }} />
                        <button onClick={saveInlineEdit} className="p-1 rounded" style={{ color: 'var(--success-text)' }}><HiOutlineCheck className="w-4 h-4" /></button>
                        <button onClick={cancelInlineEdit} className="p-1 rounded" style={{ color: 'var(--danger-text)' }}><HiOutlineXMark className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <span onClick={() => startInlineEdit(p.id, 'threshold', p.min_stock_level)}
                            className="cursor-pointer px-2 py-1 rounded-lg transition" style={{ color: 'var(--text-muted)' }} title="Click to edit">
                        {p.min_stock_level}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openAdjustModal(p)}
                              className="p-1.5 rounded-lg transition"
                              style={{ color: 'var(--text-secondary)' }}
                              title="Adjust Stock">
                        <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditItem(p)}
                              className="p-1.5 rounded-lg transition"
                              style={{ color: 'var(--text-accent)' }}
                              title="Edit Item">
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-lg transition"
                              style={{ color: 'var(--danger-text)' }}
                              title="Delete Item">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} title={`Adjust Stock — ${adjustModal?.name || ''}`}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current quantity: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{adjustModal?.stock_quantity}</span>
          </div>

          <FormField label="Adjustment Type" required>
            <FormSelect value={adjustForm.type} onChange={e => setAdjustForm(f => ({ ...f, type: e.target.value }))}
                        options={[{ value: 'set', label: 'Set to exact value' }, { value: 'add', label: 'Add to stock' }, { value: 'remove', label: 'Remove from stock' }]} />
          </FormField>

          <FormField label="Value" required>
            <FormInput type="number" min="0" value={adjustForm.value} onChange={e => setAdjustForm(f => ({ ...f, value: e.target.value }))} />
          </FormField>

          <FormField label="Reason">
            <FormSelect value={adjustForm.reason} onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))}
                        options={[
                          { value: 'manual', label: 'Manual Adjustment' },
                          { value: 'damaged', label: 'Damaged Goods' },
                          { value: 'stocktake', label: 'Stocktake Correction' },
                          { value: 'return', label: 'Return' },
                          { value: 'other', label: 'Other' },
                        ]} />
          </FormField>

          <FormField label="Notes">
            <FormTextarea value={adjustForm.notes} onChange={e => setAdjustForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." rows={2} />
          </FormField>

          <div className="p-3 rounded-xl text-sm flex items-center justify-between" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-accent)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>New quantity will be:</span>
            <span className="text-lg font-bold" style={{ color: 'var(--accent-bright)' }}>{getPreviewQty()}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAdjustModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={submitAdjustment} disabled={adjustSubmitting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {adjustSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Apply'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Stock Update" size="lg">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Update stock for low/critical items. Only changed values will be saved.</p>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-faint)', maxHeight: '400px' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>PRODUCT</th>
                  <th className="px-4 py-2 text-right font-semibold" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>CURRENT</th>
                  <th className="px-4 py-2 text-right font-semibold" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>NEW QTY</th>
                </tr>
              </thead>
              <tbody>
                {lowItems.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                    <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                    <td className="px-4 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{p.stock_quantity}</td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" min="0" value={bulkUpdates[p.id] ?? p.stock_quantity}
                             onChange={e => setBulkUpdates(u => ({ ...u, [p.id]: parseInt(e.target.value) || 0 }))}
                             className="w-20 px-2 py-1 text-sm text-right rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {changedCount > 0 && (
            <p className="text-sm font-medium" style={{ color: 'var(--accent-bright)' }}>{changedCount} item(s) will be updated</p>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setBulkModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={submitBulk} disabled={bulkSubmitting || changedCount === 0}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {bulkSubmitting ? <><LoadingSpinner size="sm" /> Updating...</> : `Apply ${changedCount} Change(s)`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={editItemId ? 'Edit Item' : 'Add Item'} size="md">
        <div className="space-y-4">
          <div>
            <label>Product Name *</label>
            <input name="name" value={itemForm.name} onChange={onItemChange} placeholder="e.g. Soy Wax 5kg" />
            {itemErrors.name && <span className="error-msg">{itemErrors.name}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>SKU</label>
              <input name="sku" value={itemForm.sku} onChange={onItemChange} placeholder="e.g. RAW-001" />
            </div>
            <div>
              <label>Category</label>
              <input name="category" value={itemForm.category} onChange={onItemChange} placeholder="e.g. Raw Materials" />
            </div>
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" value={itemForm.description} onChange={onItemChange} rows="2" placeholder="Optional description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Unit Price</label>
              <input name="unit_price" type="number" step="0.01" min="0" value={itemForm.unit_price} onChange={onItemChange} placeholder="0.00" />
            </div>
            <div>
              <label>Cost Price</label>
              <input name="cost_price" type="number" step="0.01" min="0" value={itemForm.cost_price} onChange={onItemChange} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Stock Quantity</label>
              <input name="stock_quantity" type="number" min="0" value={itemForm.stock_quantity} onChange={onItemChange} placeholder="0" />
            </div>
            <div>
              <label>Min Stock Level</label>
              <input name="min_stock_level" type="number" min="0" value={itemForm.min_stock_level} onChange={onItemChange} placeholder="10" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setItemModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveItem} disabled={itemSaving} className="btn-primary">
              {itemSaving ? 'Saving...' : editItemId ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default InventoryList;
