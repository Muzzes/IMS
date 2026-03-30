import { useState, useEffect, useMemo } from 'react';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const POS = ({ onCancel, onSuccess }) => {
  const { activeWorkspace } = useWorkspace();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(10); // Default 10%
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data.data || []);
      } catch {
        toast.error('Failed to load inventory');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [activeWorkspace]);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0, stock_quantity: 0, name: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'product_id') {
      const selected = products.find(p => p.id.toString() === value.toString());
      if (selected) {
        newItems[index] = {
          ...newItems[index],
          product_id: selected.id,
          unit_price: parseFloat(selected.unit_price),
          stock_quantity: selected.stock_quantity,
          name: selected.name,
          quantity: 1
        };
      }
    } else if (field === 'quantity') {
      let qty = parseInt(value) || 0;
      if (qty > newItems[index].stock_quantity) qty = newItems[index].stock_quantity;
      if (qty < 1) qty = 1;
      newItems[index].quantity = qty;
    }
    setItems(newItems);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  }, [items]);

  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax - parseFloat(discountAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Add at least one item');
    if (items.some(i => !i.product_id)) return toast.error('Please select a product for all rows');
    
    setIsSubmitting(true);
    try {
      // Backend validates real unit prices, we send our dummy UI prices anyway.
      const payload = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        discount: discountAmount,
        tax,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
      };
      
      const { data } = await api.post('/sales', payload);
      toast.success('Sale created successfully');
      onSuccess(data.sale || data); // pass back the created sale to view invoice
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white transition">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-white mb-1 leading-none">New Invoice</h1>
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">Create a sale and automatically deduce inventory.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <h2 className="text-lg font-bold text-white mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Customer Name (Optional)</label>
                <input value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-white border border-[var(--border-subtle)] outline-none focus:border-[var(--accent-bright)] text-sm font-medium transition" placeholder="Customer Name" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email</label>
                <input value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-white border border-[var(--border-subtle)] outline-none focus:border-[var(--accent-bright)] text-sm font-medium transition" placeholder="Customer Email" />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Order Items</h2>
              <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-[11px] font-bold text-[var(--accent-bright)] hover:text-[var(--accent-hover)] uppercase tracking-wider transition">
                <HiOutlinePlus className="w-4 h-4" /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-end p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-faint)] relative">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Product</label>
                    <select value={item.product_id} onChange={e => handleItemChange(idx, 'product_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] text-white border border-[var(--border-subtle)] outline-none text-xs font-bold">
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                          {p.name} {p.stock_quantity <= 0 ? '(Out of Stock)' : `(${p.stock_quantity} available)`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Qty</label>
                    <input type="number" min="1" max={item.stock_quantity || 1} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                           className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] text-white font-mono border border-[var(--border-subtle)] outline-none text-sm" disabled={!item.product_id} />
                  </div>
                  <div className="w-28">
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Unit Price</label>
                    <div className="px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-transparent text-sm text-[var(--text-secondary)] font-mono cursor-not-allowed">
                      {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="w-28 text-right font-bold text-white font-mono text-sm py-2">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </div>
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-[var(--danger-text)] hover:bg-[var(--danger-bg)] rounded-lg transition mb-0.5">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-8 text-center text-[12px] font-bold text-[var(--text-muted)] border-2 border-dashed border-[var(--border-subtle)] rounded-xl">
                  No items added to invoice yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] sticky top-24">
            <h2 className="text-[14px] font-bold text-white mb-6 uppercase tracking-wider">Payment Summary</h2>
            <div className="space-y-5 text-[13px]">
              <div className="flex justify-between items-center text-[var(--text-secondary)] font-medium">
                <span>Subtotal</span>
                <span className="font-bold font-mono text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] font-medium">Tax (%)</span>
                <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value)||0)} className="w-20 px-2 py-1 text-right rounded font-mono font-bold bg-[var(--bg-elevated)] text-white border border-[var(--border-subtle)] outline-none" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] font-medium">Discount ($)</span>
                <input type="number" min="0" value={discountAmount} onChange={e => setDiscountAmount(parseFloat(e.target.value)||0)} className="w-24 px-2 py-1 text-right rounded font-mono font-bold bg-[var(--bg-elevated)] text-white border border-[var(--border-subtle)] outline-none" />
              </div>
              <hr className="border-[var(--border-faint)] my-6" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-[var(--success-text)] font-mono text-2xl tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}
                    className="btn-primary w-full mt-8 py-3.5 flex justify-center items-center gap-2 text-sm tracking-wide">
              <HiOutlineCheck className="w-5 h-5" /> 
              {isSubmitting ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
