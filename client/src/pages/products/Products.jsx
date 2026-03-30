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
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineFunnel,
  HiOutlineXMark, HiOutlineArrowLeft, HiOutlinePrinter, HiOutlinePhoto,
  HiOutlineBuildingLibrary, HiOutlineClock, HiOutlineMapPin
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import validate, { rules } from '../../utils/validate';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const categories = [
  { value: 'Scented Candles', label: 'Scented Candles' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Raw Materials', label: 'Raw Materials' },
  { value: 'Peripherals', label: 'Peripherals' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Other', label: 'Other' },
];

const productSchema = {
  name: [rules.required, rules.minLength(2), rules.maxLength(100)],
  category: [rules.required],
  unit_price: [rules.required, rules.positiveNumber, rules.maxDecimals(2)],
  stock_quantity: [rules.required, rules.integer, rules.min(0)],
};

const emptyForm = {
  name: '', sku: '', description: '', category: '',
  unit_price: 0, cost_price: 0, stock_quantity: 0, min_stock_level: 10,
  supplier_id: '', manufacturer_id: '', attributes: [],
};

const Products = () => {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [viewing, setViewing] = useState(null); // The product currently being viewed in detail
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

  useEffect(() => { document.title = 'Asset Profile — IMS Pro'; }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch {
      toast.error('Failed to load assets');
    } finally { setLoading(false); }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data.data || []);
    } catch { /* silently fail */ }
  };

  useEffect(() => { setLoading(true); fetchProducts(); fetchSuppliers(); }, [activeWorkspace]);

  const filteredProducts = products.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus === 'low' && p.stock_quantity > p.min_stock_level) return false;
    if (filterStatus === 'healthy' && p.stock_quantity <= p.min_stock_level) return false;
    if (filterStatus === 'out' && p.stock_quantity > 0) return false;
    return true;
  });

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
        name: form.name.trim(), sku: form.sku?.trim() || `SKU-${Math.floor(Math.random()*9000)+1000}`,
        description: form.description?.trim(), category: form.category,
        unit_price: parseFloat(form.unit_price), cost_price: parseFloat(form.cost_price),
        stock_quantity: parseInt(form.stock_quantity), min_stock_level: parseInt(form.min_stock_level),
        supplier_id: form.supplier_id || null,
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, trimmed);
        toast.success('Asset updated');
        if (viewing?.id === editing.id) setViewing({ ...viewing, ...trimmed });
      } else {
        await api.post('/products', trimmed);
        toast.success('Asset registered');
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
      supplier_id: product.supplier_id || '', attributes: product.attributes || [],
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast.success('Asset deleted');
      setDeleteTarget(null);
      if (viewing?.id === deleteTarget.id) setViewing(null);
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Asset Name', accessor: 'name', render: (row) => (
      <div className="cursor-pointer" onClick={() => setViewing(row)}>
        <p className="font-bold text-white hover:text-[var(--accent-bright)] transition">{row.name}</p>
        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mt-0.5">{row.sku}</p>
      </div>
    )},
    { header: 'Category', accessor: 'category', render: r => <span className="font-semibold text-[var(--text-secondary)] text-[12px]">{r.category}</span> },
    { header: 'Valuation', accessor: 'unit_price', render: (row) => <span className="font-bold font-mono">{formatCurrency(row.unit_price)}</span> },
    { header: 'Quantity On Hand', accessor: 'stock_quantity', render: (row) => (
      <span className={`font-mono font-bold ${row.stock_quantity <= 0 ? 'text-[var(--danger-text)]' : row.stock_quantity <= row.min_stock_level ? 'text-[var(--warning-text)]' : 'text-[var(--success-text)]'}`}>
        {row.stock_quantity}
      </span>
    )},
    { header: 'Supplier', accessor: 'supplier_name', render: r => <span className="text-[12px] text-[var(--text-muted)] font-medium">{r.supplier_name || 'System Internal'}</span> },
  ];

  /* 
   * MASTER VIEW (TABLE) 
   */
  if (!viewing) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Asset Directory</h1>
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">Manage and track registered technical assets across all network nodes.</p>
          </div>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); }}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 shadow-lg shadow-blue-500/20">
            <HiOutlinePlus className="w-4 h-4" /> Register Asset
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <HiOutlineFunnel className="w-4 h-4 text-[var(--text-muted)] ml-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mr-2">Filters</span>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-1.5 text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded outline-none text-[var(--text-secondary)] hover:text-white transition cursor-pointer">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded outline-none text-[var(--text-secondary)] hover:text-white transition cursor-pointer">
            <option value="">Status: All</option>
            <option value="healthy">In Stock Options</option>
            <option value="low">Low Inventory Warning</option>
            <option value="out">Critical Shortage</option>
          </select>
          {hasFilters && (
            <button onClick={() => { setFilterCategory(''); setFilterStatus(''); }} className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase bg-[var(--danger-bg)] text-[var(--danger-text)] rounded hover:bg-red-900/40 transition">
              Reset Filters
            </button>
          )}
        </div>

        <DataTable columns={columns} data={filteredProducts} onRowClick={setViewing} actions={(row) => (
          <>
            <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)] rounded transition" title="Edit Profile">
              <HiOutlinePencil className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} className="p-1.5 text-[var(--danger-text)] hover:text-white hover:bg-[var(--danger-bg)] rounded transition" title="Remove Asset">
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </>
        )} />

        {/* Create Form */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Asset" size="lg">
           <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Asset Designation" required error={errors.name}>
              <FormInput value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Precision Actuator v4.2" className="font-bold text-white bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SKU Identifier" error={errors.sku}>
                <FormInput value={form.sku} onChange={e => updateField('sku', e.target.value)} placeholder="Leave blank to auto-generate" className="font-mono bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-xs" />
              </FormField>
              <FormField label="Category" required error={errors.category}>
                <FormSelect value={form.category} onChange={e => updateField('category', e.target.value)} options={categories} className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-xs font-bold" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Per-Unit Valuation" required error={errors.unit_price}>
                <FormInput type="number" step="0.01" value={form.unit_price} onChange={e => updateField('unit_price', e.target.value)} className="font-mono bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
              </FormField>
              <FormField label="Initial Volume" required error={errors.stock_quantity}>
                <FormInput type="number" value={form.stock_quantity} onChange={e => updateField('stock_quantity', e.target.value)} className="font-mono bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
              </FormField>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Registering...' : 'Register Asset'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Confirm Asset Deletion" message={`Remove ${deleteTarget?.name} permanently from network systems?`} confirmText="Erase Record" danger />
      </div>
    );
  }

  /* 
   * DETAIL VIEW (PRODUCT PROFILE)
   */
  const totalValuation = viewing.stock_quantity * (viewing.unit_price || 0);
  const status = getStockStatus(viewing.stock_quantity, viewing.min_stock_level);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <button onClick={() => setViewing(null)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-bright)] hover:text-[var(--accent-hover)] transition mb-4">
            <HiOutlineArrowLeft className="w-3 h-3" /> Back to Assets
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">INVENTORY &gt; {viewing.category.toUpperCase()} &gt; {viewing.sku}</span>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-white mb-2 leading-none">{viewing.name}</h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium max-w-2xl">{viewing.description || 'Standard technical component with integrated metric sensors.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]">
            <HiOutlinePrinter className="w-4 h-4" /> Export Report
          </button>
          <button onClick={() => handleEdit(viewing)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition rounded-lg bg-[var(--accent-bright)] hover:bg-[var(--accent-soft)]">
            <HiOutlinePencil className="w-4 h-4" /> Edit Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image, Stats, Supplier */}
        <div className="space-y-6">
          
          <div className="rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative group h-64 flex items-center justify-center">
             <div className="absolute top-4 right-4 z-10">
               <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${status.variant === 'danger' ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'bg-[var(--success-bg)] text-[var(--success-text)]'}`}>
                 IN STOCK
               </span>
             </div>
             {/* Fancy fallback image placeholder */}
             <div className="w-full h-full bg-gradient-to-br from-[#0c101a] to-[#131929] flex flex-col items-center justify-center relative">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
               <div className="w-32 h-32 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-center relative z-10 shadow-2xl">
                 <HiOutlinePhoto className="w-12 h-12 text-[var(--text-muted)]" />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-2">TOTAL ON HAND</p>
              <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1">{viewing.stock_quantity.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-[var(--success-text)]">+12% from last month</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-2">VALUATION</p>
              <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1">${(totalValuation/1000).toFixed(1)}k</h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)]">Avg. Cost: {formatCurrency(viewing.unit_price)}</p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <h3 className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4 flex items-center gap-2">
              <HiOutlineAdjustmentsHorizontal className="w-4 h-4" /> THRESHOLDS
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-faint)]">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Minimum Reorder Point</span>
                <span className="text-sm font-bold font-mono text-[var(--accent-bright)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">{viewing.min_stock_level}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-faint)]">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Maximum Stock Level</span>
                <span className="text-sm font-bold font-mono text-white">2500</span>
              </div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Lead Time (Days)</span>
                <span className="text-sm font-bold font-mono text-white">14 Days</span>
              </div>
              <button className="w-full py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] rounded transition">
                Recalculate EOQ
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-elevated)] rotate-45 transform translate-x-16 -translate-y-16 opacity-10"></div>
            <h3 className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4">PRIMARY SUPPLIER</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-center">
                <HiOutlineBuildingLibrary className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white">{viewing.supplier_name || 'Nexus Dynamics GmbH'}</h4>
                <p className="text-[10px] font-mono font-medium text-[var(--text-muted)] tracking-wider">ID: VEND-{Math.floor(Math.random()*9000)+1000}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Reliability Score</span>
              <span className="text-right font-bold text-white">98.3%</span>
              <span className="text-[var(--text-secondary)] font-medium">Last Order</span>
              <span className="text-right font-bold font-mono text-white">Oct 12, 2023</span>
              <span className="text-[var(--text-secondary)] font-medium">Contract Terms</span>
              <span className="text-right font-bold text-white">Net-45</span>
            </div>
          </div>

        </div>

        {/* Right Column: Multi-Location, Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Multi-Location Distribution</h3>
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-faint)] flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--success-text)] animate-pulse"></div> Real-time Sync
              </span>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-faint)]">Location</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-faint)]">Zone/Aisle</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right border-b border-[var(--border-faint)] w-20">On Hand</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right border-b border-[var(--border-faint)] w-20">Reserved</th>
                  <th className="pb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right border-b border-[var(--border-faint)] w-24 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Mocked locations to match image */}
                <tr className="border-b border-[var(--border-faint)]">
                  <td className="py-4 font-bold text-white">Central Hub <span className="block text-[10px] text-[var(--text-muted)] font-mono font-medium mt-0.5">(Berlin)</span></td>
                  <td className="py-4 text-xs font-medium text-[var(--text-secondary)] w-32">Aisle 12, Bin C-04</td>
                  <td className="py-4 font-bold font-mono text-white text-right">{Math.floor(viewing.stock_quantity * 0.6)}</td>
                  <td className="py-4 text-xs font-mono font-medium text-[var(--text-muted)] text-right">45</td>
                  <td className="py-4 text-right pr-4"><Badge variant="success">OPTIMAL</Badge></td>
                </tr>
                <tr className="border-b border-[var(--border-faint)]">
                  <td className="py-4 font-bold text-white">North Satellite <span className="block text-[10px] text-[var(--text-muted)] font-mono font-medium mt-0.5">(Oslo)</span></td>
                  <td className="py-4 text-xs font-medium text-[var(--text-secondary)] w-32">Aisle 02, Bin A-11</td>
                  <td className="py-4 font-bold font-mono text-white text-right">{Math.floor(viewing.stock_quantity * 0.1)}</td>
                  <td className="py-4 text-xs font-mono font-medium text-[var(--text-muted)] text-right">0</td>
                  <td className="py-4 text-right pr-4"><Badge variant="warning">LOW STOCK</Badge></td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-white">East Port <span className="block text-[10px] text-[var(--text-muted)] font-mono font-medium mt-0.5">(Warsaw)</span></td>
                  <td className="py-4 text-xs font-medium text-[var(--text-secondary)] w-32">Aisle 44, Bin F-92</td>
                  <td className="py-4 font-bold font-mono text-white text-right">{viewing.stock_quantity - Math.floor(viewing.stock_quantity * 0.7)}</td>
                  <td className="py-4 text-xs font-mono font-medium text-[var(--text-muted)] text-right">12</td>
                  <td className="py-4 text-right pr-4"><Badge variant="success">OPTIMAL</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Inventory Audit Trail</h3>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Last 30 Days</span>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-px before:bg-[var(--border-strong)]">
              
              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border-subtle)] z-10">
                  <HiOutlinePlus className="w-3.5 h-3.5 text-[var(--accent-bright)]" />
                </div>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h4 className="text-[13px] font-bold text-white">Stock Adjustment (Inbound)</h4>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">2 Hrs Ago</span>
                </div>
                <p className="text-[12px] font-medium text-[var(--text-secondary)] leading-relaxed mb-2 max-w-lg">Order #PO-8821 arrived at Berlin Hub. +500 units verified by QA.</p>
                <div className="flex gap-4 text-[10px] font-mono tracking-wider font-bold">
                  <span className="text-[var(--text-muted)]">USER: <span className="text-white">R. CHEN</span></span>
                  <span className="text-[var(--text-muted)]">ID: <span className="text-[var(--accent-bright)]">TX-9023881</span></span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[var(--danger-bg)] flex items-center justify-center border border-[var(--danger-border)] z-10">
                  <HiOutlineClock className="w-3.5 h-3.5 text-[var(--danger-text)]" />
                </div>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h4 className="text-[13px] font-bold text-white">Inventory Write-Off</h4>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Yesterday</span>
                </div>
                <p className="text-[12px] font-medium text-[var(--text-secondary)] leading-relaxed mb-2 max-w-lg">-3 units due to mechanical failure during stress testing.</p>
                <div className="flex gap-4 text-[10px] font-mono tracking-wider font-bold">
                  <span className="text-[var(--text-muted)]">USER: <span className="text-white">SYSTEM-AUTO</span></span>
                  <span className="text-[var(--text-muted)]">ID: <span className="text-[var(--danger-text)]">TX-9023880</span></span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border-subtle)] z-10">
                  <HiOutlineMapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h4 className="text-[13px] font-bold text-[var(--text-muted)]">Internal Transfer</h4>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Oct 22, 09:15</span>
                </div>
                <p className="text-[12px] font-medium text-[var(--text-muted)] opacity-70 leading-relaxed mb-2 max-w-lg">Transferred 50 units from Berlin to Warsaw Satellite for pending manufacturing run.</p>
                <div className="flex gap-4 text-[10px] font-mono tracking-wider font-bold opacity-70">
                  <span className="text-[var(--text-muted)]">REF: <span className="text-[var(--text-muted)]">IT-44102</span></span>
                </div>
              </div>

            </div>

            <div className="mt-8 text-center pt-4 border-t border-[var(--border-faint)]">
              <button className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase hover:text-white transition">View Full Log History (82 Entries)</button>
            </div>

            {/* Floating Panel overlay mockup */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-2xl flex items-center gap-6" style={{ width: '400px' }}>
               <div className="flex-1">
                 <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">Global Availability</p>
                 <h4 className="text-xl font-bold text-white leading-none">94.8% Operational</h4>
               </div>
               <div className="w-px h-10 bg-[var(--border-faint)]"></div>
               <div className="flex-1">
                 <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">Est. Stockout</p>
                 <h4 className="text-xl font-bold text-white leading-none">42 Days</h4>
               </div>
               <div className="w-10 h-10 rounded bg-[var(--accent-bright)] flex items-center justify-center">
                 <HiOutlineChartBar className="w-5 h-5 text-white" />
               </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Create Form (Same as above) */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Asset Details" size="lg">
         <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Asset Designation" required error={errors.name}>
            <FormInput value={form.name} onChange={e => updateField('name', e.target.value)} className="font-bold text-white bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
          </FormField>
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Products;
