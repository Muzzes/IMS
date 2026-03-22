import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    companyName: 'StockFlow Inc.',
    taxRate: 8,
    currency: 'USD',
    lowStockThreshold: 10,
    emailNotifications: true,
    autoReorder: false,
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  return (
    <PageWrapper title="System Settings" subtitle="Configure global application defaults">
      <div className="max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">General Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Name</label>
                  <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Currency</label>
                  <select name="currency" value={settings.currency} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Tax Rate (%)</label>
                  <input type="number" step="0.1" name="taxRate" value={settings.taxRate} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Inventory Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Low Stock Threshold</label>
                  <input type="number" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                  <p className="text-xs text-gray-500 mt-1">Alert triggered when stock falls below this quantity.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Automation & Alerts</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="emailNotifications" name="emailNotifications" type="checkbox" checked={settings.emailNotifications} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="emailNotifications" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Enable Email Notifications</label>
                    <p className="text-gray-500">Receive daily stock digests and order confirmations to admin emails.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="autoReorder" name="autoReorder" type="checkbox" checked={settings.autoReorder} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoReorder" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Auto-Reorder Critical Stock</label>
                    <p className="text-gray-500">Automatically generate Draft POs when items hit critical levels (0-5 units).</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md font-medium text-sm hover:bg-blue-600 transition-colors border border-transparent">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
