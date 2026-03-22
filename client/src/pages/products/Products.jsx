import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge, { statusBadgeVariant } from '../../components/Badge';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Products = () => {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', description: '', category: '', unit_price: 0, cost_price: 0, stock_quantity: 0, min_stock_level: 10 });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchProducts(); }, [activeWorkspace]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: '', sku: '', description: '', category: '', unit_price: 0, cost_price: 0, stock_quantity: 0, min_stock_level: 10 });
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name, sku: product.sku || '', description: product.description || '',
      category: product.category || '', unit_price: product.unit_price, cost_price: product.cost_price,
      stock_quantity: product.stock_quantity, min_stock_level: product.min_stock_level
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <div>
        <p className="font-semibold text-surface-800 dark:text-surface-200">{row.name}</p>
        <p className="text-xs text-surface-400">{row.sku}</p>
      </div>
    )},
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'unit_price', render: (row) => `$${parseFloat(row.unit_price).toFixed(2)}` },
    { header: 'Stock', accessor: 'stock_quantity', render: (row) => (
      <Badge variant={row.stock_quantity <= row.min_stock_level ? 'danger' : 'success'}>
        {row.stock_quantity}
      </Badge>
    )},
    { header: 'Supplier', accessor: 'supplier_name' }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Products</h1>
          <p className="text-sm text-surface-500">{products.length} products</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', sku: '', description: '', category: '', unit_price: 0, cost_price: 0, stock_quantity: 0, min_stock_level: 10 }); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500
                           text-white text-sm font-semibold shadow-lg shadow-primary-500/20
                           hover:shadow-xl hover:-translate-y-0.5 transition-all" id="add-product-btn">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <DataTable columns={columns} data={products} actions={(row) => (
        <>
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-primary-600">
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          {user?.role === 'admin' && (
            <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-surface-500 hover:text-rose-600">
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </>
      )} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4" id="product-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Category</label>
            <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Sell Price</label>
              <input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Cost Price</label>
              <input type="number" step="0.01" value={form.cost_price} onChange={e => setForm({...form, cost_price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Stock Qty</label>
              <input type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Min Stock Level</label>
              <input type="number" value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
