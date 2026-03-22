import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { mockProducts } from '../../utils/mockData';
import toast from 'react-hot-toast';

export default function SaleForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    items: []
  });
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: '', qty: 1, price: 0 }] });
  };

  const removeItem = (idx) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx][field] = value;
    
    if (field === 'product_id' && value) {
      const prod = mockProducts.find(p => p.id === Number(value));
      if (prod) newItems[idx].price = prod.price;
    }
    setFormData({ ...formData, items: newItems });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0);
  const taxRate = 0.08; // 8% mock tax
  const discountVal = Number(formData.discount || 0);
  const total = (subtotal - discountVal) * (1 + taxRate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return toast.error('Please add at least one item');
    
    let hasAlert = false;
    formData.items.forEach(i => {
       const prod = mockProducts.find(p => p.id === Number(i.product_id));
       if (prod && i.qty > prod.stockQty) hasAlert = true;
    });

    if (hasAlert && !window.confirm('Some items exceed available stock. Continue anyway?')) {
       return;
    }
    
    setLoading(true);
    setTimeout(() => {
      toast.success('Sale recorded successfully');
      setLoading(false);
      onSubmit({ ...formData, id: `SL-20${Math.floor(Math.random() * 100)}`, status: 'Completed', subtotal, taxRate, total });
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
          <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input type="tel" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center">
          <h4 className="font-medium text-sm">Line Items *</h4>
          <button type="button" onClick={addItem} className="text-sm flex items-center text-primary hover:text-blue-600 font-medium">
            <Plus className="h-4 w-4 mr-1"/> Add Item
          </button>
        </div>
        <div className="p-4 space-y-3">
          {formData.items.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No items added.</p>}
          {formData.items.map((item, idx) => {
            const prod = mockProducts.find(p => p.id === Number(item.product_id));
            const isLowStock = prod && item.qty > prod.stockQty;
            
            return (
              <div key={idx} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Product</label>
                  <select value={item.product_id} onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select...</option>
                    {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stockQty} in stock)</option>)}
                  </select>
                </div>
                <div className="w-24 relative">
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} className={`w-full border rounded text-sm px-2 py-1.5 focus:outline-none ${isLowStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`} />
                  {isLowStock && <AlertCircle className="absolute -right-2 -top-2 h-4 w-4 text-red-500 bg-white dark:bg-gray-800 rounded-full" title="Exceeds stock" />}
                </div>
                <div className="w-28">
                  <label className="block text-xs text-gray-500 mb-1">Unit Price ($)</label>
                  <input type="number" step="0.01" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm px-2 py-1.5 focus:outline-none" />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                  <div className="px-2 py-1.5 text-sm font-medium border border-transparent whitespace-nowrap">${(item.qty * item.price).toFixed(2)}</div>
                </div>
                <button type="button" onClick={() => removeItem(idx)} className="p-2 mb-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-start pt-4">
        <div className="w-48">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flat Discount ($)</label>
           <input type="number" step="0.01" min="0" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm" />
        </div>
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><p>Subtotal</p><p>${subtotal.toFixed(2)}</p></div>
          <div className="flex justify-between text-sm text-gray-500"><p>Tax (8%)</p><p>${(subtotal * taxRate).toFixed(2)}</p></div>
          {discountVal > 0 && <div className="flex justify-between text-sm text-red-500"><p>Discount</p><p>-${discountVal.toFixed(2)}</p></div>}
          <div className="flex justify-between text-xl font-bold dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700 mt-2"><p>Total</p><p>${total.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-md font-medium text-sm transition-colors">{loading ? 'Processing...' : 'Complete Sale'}</button>
      </div>
    </form>
  );
}
