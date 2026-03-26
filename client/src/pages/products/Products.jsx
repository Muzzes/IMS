import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField from '../../components/common/FormField';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormTextarea from '../../components/common/FormTextarea';
import DynamicFieldList from '../../components/common/DynamicFieldList';
import { PageLoader } from '../../components/LoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArchiveBox, HiOutlineSparkles, HiOutlineFunnel, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import validate, { rules } from '../../utils/validate';

const categories = [
  { value: 'Scented Candles', label: 'Scented Candles' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Raw Materials', label: 'Raw Materials' },
  { value: 'Peripherals', label: 'Peripherals' },
  { value: 'Monitors', label: 'Monitors' },
  { value: 'Storage', label: 'Storage' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Apparel', label: 'Apparel' },
  { value: 'Food & Bev', label: 'Food & Bev' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Other', label: 'Other' },
];

const productSchema = {
  name: [rules.required, rules.minLength(2), rules.maxLength(100)],
  category: [rules.required],
  unit_price: [rules.required, rules.positiveNumber, rules.maxDecimals(2)],
  cost_price: [rules.positiveNumber, rules.maxDecimals(2)],
  stock_quantity: [rules.required, rules.integer, rules.min(0)],
  min_stock_level: [rules.integer, rules.min(0)],
};

const emptyForm = {
  name: '', sku: '', description: '', category: '',
  unit_price: 0, cost_price: 0, stock_quantity: 0, min_stock_level: 10,
  supplier_id: '', manufacturer_id: '',
  attributes: [],
};

const Products = () => {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const hasFilters = filterCategory || filterStatus;

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { document.title = 'Products — IMS Pro'; }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally { setLoading(false); }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data.data || []);
    } catch { /* silently fail */ }
  };

  useEffect(() => { setLoading(true); fetchProducts(); fetchSuppliers(); }, [activeWorkspace]);

  // Apply client-side filters
  const filteredProducts = products.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus === 'low' && p.stock_quantity > p.min_stock_level) return false;
    if (filterStatus === 'healthy' && p.stock_quantity <= p.min_stock_level) return false;
    if (filterStatus === 'out' && p.stock_quantity > 0) return false;
    return true;
  });

  const generateSku = () => {
    const prefix = 'SKU-';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setForm(f => ({ ...f, sku: prefix + rand }));
  };

  const handleValidate = () => {
    const validateFn = validate(productSchema);
    const errs = validateFn(form);
    setErrors(errs || {});
    return !errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const trimmed = {
        name: form.name.trim(), sku: form.sku.trim(),
        description: form.description.trim(), category: form.category,
        unit_price: parseFloat(form.unit_price), cost_price: parseFloat(form.cost_price),
        stock_quantity: parseInt(form.stock_quantity), min_stock_level: parseInt(form.min_stock_level),
        supplier_id: form.supplier_id || null,
        manufacturer_id: form.manufacturer_id || null,
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, trimmed);
        toast.success('Product updated');
      } else {
        await api.post('/products', trimmed);
        toast.success('Product created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setErrors({});
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setIsSubmitting(false); }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name, sku: product.sku || '', description: product.description || '',
      category: product.category || '', unit_price: product.unit_price, cost_price: product.cost_price,
      stock_quantity: product.stock_quantity, min_stock_level: product.min_stock_level,
      supplier_id: product.supplier_id || '', manufacturer_id: product.manufacturer_id || '',
      attributes: product.attributes || [],
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  // Attributes
  const addAttribute = () => {
    setForm(f => ({ ...f, attributes: [...f.attributes, { key: '', value: '' }] }));
  };
  const removeAttribute = (index) => {
    setForm(f => ({ ...f, attributes: f.attributes.filter((_, i) => i !== index) }));
  };
  const updateAttribute = (index, key, value) => {
    setForm(f => {
      const attrs = [...f.attributes];
      attrs[index] = { ...attrs[index], [key]: value };
      return { ...f, attributes: attrs };
    });
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <div>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{row.name}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.sku}</p>
      </div>
    )},
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'unit_price', render: (row) => `$${parseFloat(row.unit_price).toFixed(2)}` },
    { header: 'Cost', accessor: 'cost_price', render: (row) => `$${parseFloat(row.cost_price).toFixed(2)}` },
    { header: 'Stock', accessor: 'stock_quantity', render: (row) => (
      <Badge variant={row.stock_quantity <= 0 ? 'danger' : row.stock_quantity <= row.min_stock_level ? 'warning' : 'success'}>
        {row.stock_quantity}
      </Badge>
    )},
    { header: 'Supplier', accessor: 'supplier_name' },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{filteredProducts.length} products{hasFilters ? ' (filtered)' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); }}
                className="btn-primary flex items-center gap-2" id="add-product-btn">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <HiOutlineFunnel className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <option value="">All Stock</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition"
                  style={{ color: 'var(--danger-text)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <HiOutlineXMark className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <DataTable columns={columns} data={filteredProducts} actions={(row) => (
        <>
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                  className="p-1.5 rounded-lg transition"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          {user?.role === 'admin' && (
            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
                    className="p-1.5 rounded-lg transition"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </>
      )} />

      {/* Product Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4" id="product-form">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required error={errors.name}>
              <FormInput value={form.name} onChange={e => updateField('name', e.target.value)} error={errors.name} placeholder="Product name" />
            </FormField>
            <FormField label="SKU">
              <div className="flex gap-2">
                <FormInput value={form.sku} onChange={e => updateField('sku', e.target.value)} placeholder="SKU-1234" className="flex-1" />
                <button type="button" onClick={generateSku} className="px-3 py-2 text-xs font-medium rounded-[10px] transition whitespace-nowrap flex items-center gap-1"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent-bright)', border: '1px solid var(--border-accent)' }}>
                  <HiOutlineSparkles className="w-3.5 h-3.5" /> Auto
                </button>
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required error={errors.category}>
              <FormSelect value={form.category} onChange={e => updateField('category', e.target.value)} options={categories} error={errors.category} placeholder="Select category" />
            </FormField>
            <FormField label="Supplier">
              <FormSelect value={form.supplier_id} onChange={e => updateField('supplier_id', e.target.value)}
                          options={suppliers.map(s => ({ value: s.id, label: s.name }))} placeholder="Select supplier" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sell Price" required error={errors.unit_price}>
              <FormInput type="number" step="0.01" min="0" prefix="$" value={form.unit_price}
                         onChange={e => updateField('unit_price', e.target.value)} error={errors.unit_price} />
            </FormField>
            <FormField label="Cost Price" error={errors.cost_price}>
              <FormInput type="number" step="0.01" min="0" prefix="$" value={form.cost_price}
                         onChange={e => updateField('cost_price', e.target.value)} error={errors.cost_price} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Stock Qty" required error={errors.stock_quantity}>
              <FormInput type="number" min="0" step="1" value={form.stock_quantity}
                         onChange={e => updateField('stock_quantity', e.target.value)} error={errors.stock_quantity} />
            </FormField>
            <FormField label="Min Stock Level" error={errors.min_stock_level}>
              <FormInput type="number" min="0" step="1" value={form.min_stock_level}
                         onChange={e => updateField('min_stock_level', e.target.value)} error={errors.min_stock_level} />
            </FormField>
          </div>

          <FormField label="Description">
            <FormTextarea value={form.description} onChange={e => updateField('description', e.target.value)} maxLength={500} placeholder="Product description..." />
          </FormField>

          {/* Dynamic Attributes */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Custom Attributes</p>
            <DynamicFieldList
              fields={form.attributes}
              onAdd={addAttribute}
              onRemove={removeAttribute}
              onUpdate={updateAttribute}
              addLabel="Add Attribute"
              maxRows={20}
              renderField={(attr, idx, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <FormInput value={attr.key} onChange={e => update('key', e.target.value)} placeholder="Key (e.g. Color)" />
                  <FormInput value={attr.value} onChange={e => update('value', e.target.value)} placeholder="Value (e.g. Red)" />
                </div>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {isSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  );
};

export default Products;
