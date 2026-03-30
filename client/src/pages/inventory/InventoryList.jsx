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
  HiOutlineCheck, HiOutlineXMark, HiOutlineTrash, HiPlusCircle,
  HiOutlineFunnel, HiOutlineArrowDownTray,
  HiOutlineArrowTrendingUp, HiOutlineBuildingStorefront, HiOutlineExclamationCircle, HiOutlineInboxArrowDown
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const getStockStatus = (qty, threshold) => {
  if (qty <= 0) return { label: 'CRITICAL', variant: 'danger' };
  if (qty <= threshold) return { label: 'LOW STOCK', variant: 'warning' };
  return { label: 'STABLE', variant: 'success' };
};

const InventoryList = () => {
  const { activeWorkspace } = useWorkspace();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Multi-selection (Mockup shows checkboxes)
  const [selectedIds, setSelectedIds] = useState([]);

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

  useEffect(() => { document.title = 'Central Inventory Repository — IMS Pro'; }, []);

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
      if (filterStatus === 'healthy') return status.label === 'STABLE';
      if (filterStatus === 'low') return status.label === 'LOW STOCK';
      if (filterStatus === 'out') return status.label === 'CRITICAL';
      return true;
    })
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) setSelectedIds([]);
    else setSelectedIds(filteredProducts.map(p => p.id));
  };
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

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

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Central Inventory Repository</h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium max-w-2xl">
            Real-time tracking and logistics management for global asset distribution.
          </p>
        </div>
        
        {/* Top Stats */}
        <div className="flex items-center gap-6 pb-2">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">TOTAL ASSETS</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{products.reduce((acc, p) => acc + p.stock_quantity, 0).toLocaleString()}</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[var(--success-bg)] text-[var(--success-text)] rounded">+4.2%</span>
            </div>
          </div>
          <div className="w-px h-10 bg-[var(--border-subtle)]"></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">CRITICAL STOCK</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--danger-text)]">{products.filter(p => p.stock_quantity <= 0).length}</span>
              <span className="text-[10px] font-bold text-[var(--danger-text)]">Action Required</span>
            </div>
          </div>
          <div className="w-px h-10 bg-[var(--border-subtle)]"></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">ACTIVE SHIPMENTS</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">142</span>
              <span className="text-[10px] font-bold text-[var(--info-text)]">In Transit</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition rounded-lg"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-faint)' }}>
          <HiOutlineFunnel className="w-4 h-4" /> Advanced Filters
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">BULK ACTIONS:</span>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition rounded-lg hover:brightness-110"
                  style={{ background: 'var(--accent-bright)' }} onClick={openBulkModal}>
            Restock Selected
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition rounded-lg"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
            <HiOutlineArrowDownTray className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={openAddItem} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition rounded-lg hover:bg-[var(--accent-soft)] shadow-lg"
                  style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)' }}>
            <HiPlusCircle className="w-4 h-4" /> Register New Item
          </button>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="overflow-x-auto rounded-[12px] pb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-4 w-12 border-b-2 border-[var(--bg-muted)]">
                <input type="checkbox" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleSelectAll}
                       className="w-4 h-4 rounded border-[var(--border-strong)] bg-transparent checked:bg-[var(--accent-bright)]" />
              </th>
              {['Item Name & ID', 'SKU', 'Category', 'Current Stock', 'Unit Price', 'Supplier', 'Status', 'Actions'].map((h, i) => (
                <th key={h} className={`px-4 py-4 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b-2 border-[var(--bg-muted)] ${i === 3 || i === 4 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[var(--text-muted)] font-semibold text-sm">
                  No inventory items found.
                </td>
              </tr>
            ) : filteredProducts.map((p, i) => {
              const status = getStockStatus(p.stock_quantity, p.min_stock_level);
              const isSelected = selectedIds.includes(p.id);
              const isEditingStock = inlineEditId === p.id && inlineEditField === 'stock';
              return (
                <tr key={p.id} className={`transition group ${isSelected ? 'bg-[var(--accent-deep)]' : 'hover:bg-[var(--bg-subtle)]'}`} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)}
                           className="w-4 h-4 rounded border-[var(--border-strong)] bg-transparent checked:bg-[var(--accent-bright)]" />
                  </td>
                  <td className="px-4 py-4 font-bold text-white max-w-[200px] break-words">
                    <div className="leading-tight">
                      {p.name}
                      <p className="text-[10px] text-[var(--text-muted)] font-mono font-medium mt-1 uppercase tracking-wider">ID: INV-{p.id.toString().padStart(5, '0')}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-[10px] font-bold font-mono tracking-widest uppercase text-[var(--text-primary)] rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-faint)' }}>
                      {p.sku || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] font-semibold text-[var(--text-secondary)]">{p.category}</td>
                  <td className="px-4 py-4 text-right">
                    {isEditingStock ? (
                      <div className="flex items-center justify-end gap-1">
                        <input type="number" min="0" value={inlineValue} onChange={e => setInlineValue(e.target.value)} onKeyDown={handleInlineKeyDown}
                               autoFocus className="w-16 px-2 py-1 text-sm rounded outline-none font-mono font-bold"
                               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-bright)', color: 'var(--text-primary)' }} />
                        <button onClick={saveInlineEdit} className="p-1 text-[var(--success-text)] hover:bg-[var(--success-bg)] rounded"><HiOutlineCheck className="w-4 h-4" /></button>
                        <button onClick={cancelInlineEdit} className="p-1 text-[var(--danger-text)] hover:bg-[var(--danger-bg)] rounded"><HiOutlineXMark className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <span onClick={() => startInlineEdit(p.id, 'stock', p.stock_quantity)}
                            className={`cursor-pointer px-2 py-1 text-[13px] font-mono font-bold rounded hover:bg-[var(--bg-elevated)] transition ${status.variant === 'danger' ? 'text-[var(--danger-text)]' : 'text-white'}`}
                            title="Click to edit stock">
                        {p.stock_quantity.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right text-[13px] font-bold text-white font-mono">{formatCurrency(p.unit_price)}</td>
                  <td className="px-4 py-4 text-[12px] font-semibold text-[var(--text-secondary)]">{p.supplier_name || 'Global Core Industries'}</td>
                  <td className="px-4 py-4">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openAdjustModal(p)} className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white" title="Adjust Stock">
                        <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditItem(p)} className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-accent)] hover:text-white" title="Edit Item">
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-[var(--danger-bg)] text-[var(--danger-text)]" title="Delete Item">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Pagination/Status footer */}
        <div className="flex items-center justify-between px-6 pt-4 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">SHOWING 1-{filteredProducts.length} OF {products.length} ITEMS</p>
          <div className="flex items-center gap-1 text-xs">
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">&lt;</button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[var(--accent-bright)] text-white font-bold">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold">2</button>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold">3</button>
            <span className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)]">...</span>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold">48</button>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">&gt;</button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8">
        <div className="p-4 rounded-xl flex gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-accent)]" style={{ background: 'var(--bg-elevated)' }}>
             <HiOutlineBuildingStorefront className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-0.5">TOP SUPPLIER</p>
            <h4 className="text-sm font-bold text-white mb-0.5">Global Core Ind.</h4>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">45% of hardware stock</p>
          </div>
        </div>

        <div className="p-4 rounded-xl flex gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-accent)]" style={{ background: 'var(--bg-elevated)' }}>
             <HiOutlineArrowTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-0.5">STOCK TURNOVER</p>
            <h4 className="text-sm font-bold text-white mb-0.5">8.4x / Month</h4>
            <p className="text-[10px] text-[var(--success-text)] font-bold">+1.2 from last quarter</p>
          </div>
        </div>

        <div className="p-4 rounded-xl flex gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--success-text)]" style={{ background: 'var(--success-bg)' }}>
             <HiOutlineInboxArrowDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-0.5">INBOUND VALUE</p>
            <h4 className="text-sm font-bold text-white mb-0.5">$2.4M USD</h4>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">Processing current orders</p>
          </div>
        </div>

        <div className="p-4 rounded-xl flex gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--danger-text)]" style={{ background: 'var(--danger-bg)' }}>
             <HiOutlineExclamationCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-0.5">DISCREPANCIES</p>
            <h4 className="text-sm font-bold text-white mb-0.5">4 Flagged Items</h4>
            <p className="text-[10px] text-[var(--danger-text)] font-semibold">Audit required immediately</p>
          </div>
        </div>
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

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)] mt-6 py-2">
            <button type="button" onClick={() => setAdjustModal(null)} className="btn-ghost">Cancel</button>
            <button onClick={submitAdjustment} disabled={adjustSubmitting} className="btn-primary flex items-center gap-2">
              {adjustSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Apply Adjustment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Stock Restock" size="lg">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Quickly update stock for all items currently below their minimum threshold.</p>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-subtle)', maxHeight: '400px' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--bg-elevated)] z-10">
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th className="px-4 py-3 text-left font-bold tracking-wider text-[var(--text-muted)] text-[10px] uppercase">PRODUCT SCANNED</th>
                  <th className="px-4 py-3 text-right font-bold tracking-wider text-[var(--text-muted)] text-[10px] uppercase">CURRENT</th>
                  <th className="px-4 py-3 text-right font-bold tracking-wider text-[var(--text-muted)] text-[10px] uppercase">NEW QTY RECEIVED</th>
                </tr>
              </thead>
              <tbody>
                {lowItems.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-faint)' }} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[var(--danger-text)]">{p.stock_quantity}</td>
                    <td className="px-4 py-3 flex justify-end">
                      <input type="number" min="0" value={bulkUpdates[p.id] ?? p.stock_quantity}
                             onChange={e => setBulkUpdates(u => ({ ...u, [p.id]: parseInt(e.target.value) || 0 }))}
                             className="w-20 px-2 py-1 text-sm text-right font-mono font-bold rounded outline-none focus:ring-1 focus:ring-[var(--accent-bright)]"
                             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <button onClick={() => setBulkModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={submitBulk} disabled={bulkSubmitting || changedCount === 0}
                    className="btn-primary flex items-center gap-2">
              {bulkSubmitting ? <><LoadingSpinner size="sm" /> Updating...</> : `Confirm ${changedCount} Restock(s)`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={editItemId ? 'Edit Asset Record' : 'Register New Asset'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Asset Name *</label>
            <input name="name" value={itemForm.name} onChange={onItemChange} placeholder="e.g. Optical Sensor 60"
                   className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none" />
            {itemErrors.name && <span className="text-[10px] font-bold text-[var(--danger-text)] mt-1 block">{itemErrors.name}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">SKU/Identifier</label>
              <input name="sku" value={itemForm.sku} onChange={onItemChange} placeholder="e.g. OP-SENS-56" 
                     className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none font-mono text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Category</label>
              <input name="category" value={itemForm.category} onChange={onItemChange} placeholder="e.g. Electronics"
                     className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Unit Price</label>
              <input name="unit_price" type="number" step="0.01" min="0" value={itemForm.unit_price} onChange={onItemChange} placeholder="0.00"
                     className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Cost Price</label>
              <input name="cost_price" type="number" step="0.01" min="0" value={itemForm.cost_price} onChange={onItemChange} placeholder="0.00"
                     className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Initial Stock Qty</label>
              <input name="stock_quantity" type="number" min="0" value={itemForm.stock_quantity} onChange={onItemChange} placeholder="0"
                     className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Minimum Safety Stock</label>
              <input name="min_stock_level" type="number" min="0" value={itemForm.min_stock_level} onChange={onItemChange} placeholder="10"
                     className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white px-3 py-2 rounded focus:border-[var(--accent-bright)] outline-none font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)] mt-6 py-2">
            <button onClick={() => setItemModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveItem} disabled={itemSaving} className="btn-primary">
              {itemSaving ? 'Saving...' : editItemId ? 'Save Changes' : 'Register Asset'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Asset Record"
        message={`Are you sure you want to completely remove "${deleteTarget?.name}"? This action cannot be undone and will affect historical ledgers.`}
        confirmText="Confirm Deletion"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default InventoryList;
