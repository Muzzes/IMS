import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Printer, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [status, setStatus] = useState('Pending');

  const handleReceive = () => {
    setStatus('Received');
    toast.success('PO received. Stock levels automatically updated.');
  };

  const handleCancel = () => {
    setStatus('Cancelled');
    toast.error('PO cancelled.');
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span>Purchase Order {id}</span>
          <Badge variant={status === 'Received' ? 'success' : (status === 'Pending' ? 'warning' : 'danger')}>{status}</Badge>
        </div>
      }
      actionButton={
        <div className="flex gap-2">
          {role !== 'manufacturer' && status === 'Pending' && (
            <>
              <button onClick={handleCancel} className="flex items-center bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900/50 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-medium transition-colors">
                <XCircle className="h-4 w-4 mr-2" /> Cancel
              </button>
              <button onClick={handleReceive} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm font-medium transition-colors border border-transparent">
                <CheckCircle className="h-4 w-4 mr-2" /> Mark Received
              </button>
            </>
          )}
          <button className="flex items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between">
               <h3 className="font-medium text-gray-900 dark:text-white">Line Items</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Soy Wax 5kg<br/><span className="text-xs text-gray-500 font-normal">WAX-SY-05</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">50</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">$10.00</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium text-right">$500.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Supplier Info</h3>
            <p className="font-medium text-lg text-gray-900 dark:text-white">Global Plastics Corp</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">contact@globalplastics.com</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">123 Industrial Pkwy, CA 90210</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400"><p>Subtotal</p><p>$500.00</p></div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400"><p>Tax (0%)</p><p>$0.00</p></div>
              <div className="flex justify-between text-gray-900 dark:text-white font-medium pt-2 border-t border-gray-200 dark:border-gray-700"><p>Total</p><p>$500.00</p></div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
