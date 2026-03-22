import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { mockProducts } from '../../utils/mockData';
import toast from 'react-hot-toast';

export default function PurchaseForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: []
  });
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: '', qty: 1, unit_price: 0 }] });
  };

  const removeItem = (idx) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx][field] = value;
    
    // Auto-fill price if product changes
    if (field === 'product_id' && value) {
      const prod = mockProducts.find(p => p.id === Number(value));
      if (prod && !newItems[idx].unit_price) {
        newItems[idx].unit_price = (prod.price * 0.7).toFixed(2); // Mock wholesale price
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const total = formData.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.unit_price || 0)), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return toast.error('Please add at least one item');
    if (formData.items.some(i => !i.product_id || i.qty <= 0)) return toast.error('Check item details');
    
    setLoading(true);
    setTimeout(() => {
      toast.success('Purchase Order created');
      setLoading(false);
      onSubmit({ ...formData, id: `PO-10${Math.floor(Math.random() * 100)}`, status: 'Pending', total });
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier *</label>
          <select required value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm">
            <option value="">Select Supplier...</option>
            <option value="1">Global Plastics Corp</option>
            <option value="2">Aroma Extracts Ltd</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm" />
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
          {formData.items.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No items added. Click 'Add Item' to begin.</p>}
          {formData.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Product</label>
                <select value={item.product_id} onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Select...</option>
                  {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-500 mb-1">Qty</label>
                <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm px-2 py-1.5 focus:outline-none" />
              </div>
              <div className="w-28">
                <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                <input type="number" step="0.01" value={item.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm px-2 py-1.5 focus:outline-none" />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                <div className="px-2 py-1.5 text-sm font-medium border border-transparent">${(item.qty * item.unit_price).toFixed(2)}</div>
              </div>
              <button type="button" onClick={() => removeItem(idx)} className="p-2 mb-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <textarea placeholder="Order Notes..." rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-1/2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm" />
        <div className="text-right">
          <p className="text-sm text-gray-500">Order Total</p>
          <p className="text-2xl font-bold dark:text-white">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-md font-medium text-sm transition-colors">{loading ? 'Saving...' : 'Create PO'}</button>
      </div>
    </form>
  );
}
