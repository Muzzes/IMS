import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PageLoader } from '../../components/LoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiMinus, HiPlus, HiPencilSquare, HiTrash, HiPlusCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  category: 'Raw Material',
  unit_price: '',
  cost_price: '',
  stock_quantity: '',
  min_stock_level: '10',
};

const RawMaterials = () => {
  const { activeWorkspace } = useWorkspace();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState(null);

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { document.title = 'Raw Materials — IMS'; }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get('/products?category=Raw Material');
      setMaterials(data.data || data || []);
    } catch (err) {
      console.error('Failed to load raw materials:', err);
      toast.error('Failed to load raw materials');
      setMaterials([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchMaterials(); }, [activeWorkspace]);

  // ── Stock adjustment ──
  const handleAdjustStock = async (id, currentStock, quantityChange) => {
    const newStock = currentStock + quantityChange;
    if (newStock < 0) { toast.error('Stock cannot be negative'); return; }
    setAdjustingId(id);
    try {
      await api.put(`/products/${id}/stock`, { quantityChange });
      setMaterials(prev => prev.map(m => m.id === id ? { ...m, stock_quantity: newStock } : m));
      toast.success('Stock adjusted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally { setAdjustingId(null); }
  };

  const handleManualInput = (id, currentStock, e) => {
    const newVal = parseInt(e.target.value);
    if (isNaN(newVal) || newVal === currentStock) return;
    handleAdjustStock(id, currentStock, newVal - currentStock);
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.unit_price !== '' && isNaN(Number(form.unit_price))) errs.unit_price = 'Invalid price';
    if (form.cost_price !== '' && isNaN(Number(form.cost_price))) errs.cost_price = 'Invalid cost';
    if (form.stock_quantity !== '' && isNaN(Number(form.stock_quantity))) errs.stock_quantity = 'Invalid quantity';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Open create/edit modal ──
  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name || '',
      sku: row.sku || '',
      description: row.description || '',
      category: 'Raw Material',
      unit_price: row.unit_price ?? '',
      cost_price: row.cost_price ?? '',
      stock_quantity: row.stock_quantity ?? '',
      min_stock_level: row.min_stock_level ?? '10',
    });
    setErrors({});
    setShowModal(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        description: form.description.trim() || null,
        category: 'Raw Material',
        unit_price: form.unit_price !== '' ? Number(form.unit_price) : 0,
        cost_price: form.cost_price !== '' ? Number(form.cost_price) : 0,
        stock_quantity: form.stock_quantity !== '' ? Number(form.stock_quantity) : 0,
        min_stock_level: form.min_stock_level !== '' ? Number(form.min_stock_level) : 10,
      };

      if (editId) {
        const { data } = await api.put(`/products/${editId}`, payload);
        setMaterials(prev => prev.map(m => m.id === editId ? (data.product || { ...m, ...payload }) : m));
        toast.success('Material updated');
      } else {
        const { data } = await api.post('/products', payload);
        setMaterials(prev => [data.product || { ...payload, id: Date.now() }, ...prev]);
        toast.success('Material added');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save material');
    } finally { setSaving(false); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setMaterials(prev => prev.filter(m => m.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete material');
    } finally { setDeleting(false); }
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Material Name', accessor: 'name', render: (row) => (
      <div>
        <p className="td-name">{row.name}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{row.sku || 'No SKU'}</p>
      </div>
    )},
    { header: 'Cost Price', accessor: 'cost_price', render: (row) => (
      <span style={{ color: 'var(--text-secondary)' }}>${Number(row.cost_price || 0).toFixed(2)}</span>
    )},
    { header: 'Stock Status', accessor: 'status', render: (row) => (
      <Badge variant={row.stock_quantity <= (row.min_stock_level || 0) ? 'danger' : 'success'}>
        {row.stock_quantity <= (row.min_stock_level || 0) ? 'Low Stock' : 'In Stock'}
      </Badge>
    )},
    { header: 'Stock Management', accessor: 'adjust', render: (row) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleAdjustStock(row.id, row.stock_quantity, -1); }}
          disabled={adjustingId === row.id || row.stock_quantity <= 0}
          className="p-1.5 rounded-lg transition disabled:opacity-30"
          style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
          title="Decrease Stock"
        >
          <HiMinus className="w-4 h-4" />
        </button>
        
        <div className="relative">
          {adjustingId === row.id && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg z-10 backdrop-blur-[1px]"
                 style={{ background: 'rgba(11,15,26,0.5)' }}>
              <LoadingSpinner size="sm"/>
            </div>
          )}
          <input 
            type="number"
            defaultValue={row.stock_quantity}
            key={row.stock_quantity}
            onBlur={(e) => handleManualInput(row.id, row.stock_quantity, e)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            onClick={(e) => e.stopPropagation()}
            disabled={adjustingId === row.id}
            className="w-20 text-center font-bold text-sm px-2 py-1.5 rounded-lg"
          />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); handleAdjustStock(row.id, row.stock_quantity, 1); }}
          disabled={adjustingId === row.id}
          className="p-1.5 rounded-lg transition disabled:opacity-30"
          style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}
          title="Increase Stock"
        >
          <HiPlus className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-heading)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Warehouse Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{materials.length} raw materials tracked</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiPlusCircle className="w-5 h-5" /> Add Material
        </button>
      </div>

      <DataTable
        columns={columns}
        data={materials}
        actions={(row) => (
          <>
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-lg transition"
              style={{ color: 'var(--text-accent)' }}
              title="Edit"
            >
              <HiPencilSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 rounded-lg transition"
              style={{ color: 'var(--danger-text)' }}
              title="Delete"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </>
        )}
      />

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Material' : 'Add Material'} size="md">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label>Material Name *</label>
            <input name="name" value={form.name} onChange={onInputChange} placeholder="e.g. Soy Wax" />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          {/* SKU */}
          <div>
            <label>SKU</label>
            <input name="sku" value={form.sku} onChange={onInputChange} placeholder="e.g. RAW-001" />
          </div>

          {/* Description */}
          <div>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={onInputChange} rows="2" placeholder="Optional description..." />
          </div>

          {/* Prices row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Unit Price</label>
              <input name="unit_price" type="number" step="0.01" min="0" value={form.unit_price} onChange={onInputChange} placeholder="0.00" />
              {errors.unit_price && <span className="error-msg">{errors.unit_price}</span>}
            </div>
            <div>
              <label>Cost Price</label>
              <input name="cost_price" type="number" step="0.01" min="0" value={form.cost_price} onChange={onInputChange} placeholder="0.00" />
              {errors.cost_price && <span className="error-msg">{errors.cost_price}</span>}
            </div>
          </div>

          {/* Stock row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Stock Quantity</label>
              <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={onInputChange} placeholder="0" />
              {errors.stock_quantity && <span className="error-msg">{errors.stock_quantity}</span>}
            </div>
            <div>
              <label>Min Stock Level</label>
              <input name="min_stock_level" type="number" min="0" value={form.min_stock_level} onChange={onInputChange} placeholder="10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editId ? 'Update Material' : 'Add Material'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default RawMaterials;
