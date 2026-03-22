import React, { useState } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { mockManufacturers } from '../../utils/mockData';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Furniture', 'Apparel', 'Food & Bev', 'Tools', 'Materials', 'Packaging', 'Other'];

export default function ProductForm({ initialData, onSubmit, onCancel }) {
  const { activeWorkspace } = useWorkspace();
  const [formData, setFormData] = useState(initialData || {
    name: '', category: CATEGORIES[0], sku: '', price: '', stockQty: '', manufacturer_id: '', description: '', attributes: []
  });
  const [loading, setLoading] = useState(false);

  const availableManufacturers = mockManufacturers.filter(m => !activeWorkspace || m.workspace_id === activeWorkspace.id);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...(formData.attributes || [])];
    newAttrs[index][field] = value;
    setFormData({ ...formData, attributes: newAttrs });
  };

  const addAttribute = () => setFormData({ ...formData, attributes: [...(formData.attributes || []), { key: '', value: '' }] });
  const removeAttribute = (index) => setFormData({ ...formData, attributes: formData.attributes.filter((_, i) => i !== index) });

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, sku: `${prefix}-${rand}` });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.price) < 0) return toast.error('Price cannot be negative');
    if (Number(formData.stockQty) < 0) return toast.error('Stock cannot be negative');
    
    setLoading(true);
    setTimeout(() => { // Mock save
      setLoading(false);
      toast.success(`Product ${initialData ? 'updated' : 'added'} successfully`);
      onSubmit({ ...formData, id: initialData?.id || Date.now() });
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
          <div className="flex space-x-2">
            <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 uppercase" />
            <button type="button" onClick={generateSKU} className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors" title="Auto-generate SKU">
              <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) *</label>
          <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Stock Qty *</label>
          <input required type="number" min="0" name="stockQty" value={formData.stockQty} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
          <select name="manufacturer_id" value={formData.manufacturer_id} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2">
            <option value="">-- Select Manufacturer --</option>
            {availableManufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2"></textarea>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dynamic Attributes</h4>
          <button type="button" onClick={addAttribute} className="text-sm flex items-center text-primary hover:text-blue-600">
            <Plus className="h-4 w-4 mr-1"/> Add Attribute
          </button>
        </div>
        <div className="space-y-2">
          {(formData.attributes || []).map((attr, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input type="text" placeholder="Key (e.g. Color)" value={attr.key} onChange={(e) => handleAttributeChange(index, 'key', e.target.value)} className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-1.5 text-sm" />
              <input type="text" placeholder="Value (e.g. Red)" value={attr.value} onChange={(e) => handleAttributeChange(index, 'value', e.target.value)} className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-1.5 text-sm" />
              <button type="button" onClick={() => removeAttribute(index)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium text-sm transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-md font-medium text-sm transition-colors flex items-center">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
