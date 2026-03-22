import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function PartnerForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: '', type: 'Supplier', email: '', phone: '', address: '', contactPerson: '', status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`${formData.type} saved successfully`);
      onSubmit({ ...formData, id: initialData?.id || Date.now() });
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
            <option>Supplier</option>
            <option>Manufacturer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Contact</label>
          <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
          <textarea name="address" rows="2" value={formData.address} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-md font-medium text-sm transition-colors">{loading ? 'Saving...' : 'Save Partner'}</button>
      </div>
    </form>
  );
}
