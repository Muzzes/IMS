import { useState, useEffect } from 'react';
import api from '../../api/axios';
import FormField from '../../components/common/FormField';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const DispatchForm = ({ onSuccess, onCancel }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ supplier_id: '', expected_date: '', items: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const [s, p] = await Promise.all([api.get('/suppliers'), api.get('/products')]);
        setSuppliers(s.data.data || []);
        setProducts(p.data.data || []);
      } catch {
        toast.error('Failed to load form dependencies');
      }
    };
    fetchDeps();
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1, unit_cost: 0 }] });
  
  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    if (field === 'product_id') {
      const prod = products.find(p => p.id.toString() === value.toString());
      if (prod) newItems[index].unit_cost = prod.cost_price || 0;
    }
    setForm({ ...form, items: newItems });
  };
  
  const removeItem = (index) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) return toast.error('Add at least one item');
    if (!form.supplier_id) return toast.error('Select a supplier');
    
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/purchases', {
        supplier_id: form.supplier_id,
        expected_date: form.expected_date || null,
        items: form.items
      });
      toast.success('Dispatch Order Submitted');
      onSuccess(data.purchase);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = form.items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Supplier *">
          <FormSelect value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}
                      options={suppliers.map(s => ({ value: s.id, label: s.name }))} required placeholder="Select source hub..." />
        </FormField>
        <FormField label="Expected Delivery (ETA)">
          <FormInput type="date" value={form.expected_date} onChange={e => setForm({...form, expected_date: e.target.value})} />
        </FormField>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">Manifest Items</label>
        </div>
        
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 pb-2">
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] backdrop-blur-md">
              <div className="flex-1">
                <FormSelect value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
                            options={products.map(p => ({ value: p.id, label: p.name }))} required placeholder="Select product..." />
              </div>
              <div className="w-24">
                <FormInput type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value)||1)} required placeholder="Qty" />
              </div>
              <div className="w-28 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-bold">$</span>
                <FormInput type="number" step="0.01" min="0" value={item.unit_cost} onChange={e => updateItem(i, 'unit_cost', parseFloat(e.target.value)||0)} required placeholder="Cost" style={{ paddingLeft: '24px' }} />
              </div>
              <div className="w-28 flex flex-col justify-center items-end pr-2">
                <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Subtotal</span>
                <span className="text-[13px] font-mono font-bold text-white">${(item.quantity * item.unit_cost).toFixed(2)}</span>
              </div>
              <button type="button" onClick={() => removeItem(i)} className="flex items-center justify-center p-2.5 text-[var(--text-secondary)] hover:text-[var(--danger-text)] hover:bg-[var(--danger-bg)] rounded-lg transition" title="Remove Item">
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--border-strong)] rounded-lg text-sm font-semibold tracking-wide text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-bright)] transition hover:bg-[var(--accent-glow)]">
            <HiOutlinePlus className="w-4 h-4" /> Expand Manifest
          </button>
        </div>
        
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-[var(--border-strong)] mt-4">
        <div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Estimated Capital Flow</span>
          <span className="text-2xl font-bold text-[var(--success-text)] font-mono tracking-tighter">${total.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm font-bold tracking-wide text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)] transition">Abort</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-black text-[13px] font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-2 hover:brightness-110 transition shadow-lg" style={{ background: 'var(--accent-bright)', boxShadow: '0 4px 20px var(--accent-glow)' }}>
            {isSubmitting ? <><LoadingSpinner size="sm" /> Transmitting...</> : 'Authorize Dispatch'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DispatchForm;
