import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function ProfileView() {
  const { user, role } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    role: role || 'admin'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  return (
    <PageWrapper title="My Profile" subtitle="Manage your personal account settings">
      <div className="max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Role</label>
              <input type="text" value={formData.role} disabled className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 outline-none px-3 py-2 text-sm capitalize cursor-not-allowed" />
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="hidden md:block"></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input type="password" placeholder="New Password" className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" placeholder="Confirm Password" className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md font-medium text-sm hover:bg-blue-600 transition-colors border border-transparent">
               Save Changes
             </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
