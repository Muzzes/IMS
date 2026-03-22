import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import LowStockPanel from '../../components/common/LowStockPanel';
import { BadgeDollarSign, ShoppingCart, AlertTriangle, FileWarning } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';

const mockRevenue = [
  { name: 'Mon', revenue: 400 }, { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 200 }, { name: 'Thu', revenue: 278 },
  { name: 'Fri', revenue: 189 }, { name: 'Sat', revenue: 239 },
  { name: 'Sun', revenue: 349 },
];

const mockLowStock = [
  { name: 'Labels Rolled', sku: 'LBL-RL-01', stock: 5, threshold: 20 },
  { name: 'Soy Wax 5kg', sku: 'WAX-SY-05', stock: 1, threshold: 10 },
];

export default function StaffDashboard() {
  const { activeWorkspace } = useWorkspace();

  return (
    <PageWrapper 
      title="Staff Dashboard" 
      subtitle={activeWorkspace ? `Workspace: ${activeWorkspace.name}` : ''}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard label="Today's Sales" value="$1,248" trend="up" trendValue="12% vs yesterday" icon={BadgeDollarSign} colorClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" />
        <StatCard label="Pending Purchases" value="8" trend="neutral" icon={ShoppingCart} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" />
        <StatCard label="Low Stock Alerts" value="12" trend="up" trendValue="2 new today" icon={AlertTriangle} colorClass="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" />
        <StatCard label="Unpaid Bills" value="$3,420" trend="down" trendValue="-5% vs last week" icon={FileWarning} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales Trend (7 Days)</h3>
             <RevenueChart data={mockRevenue} />
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
             <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
               <h3 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                 <thead className="bg-gray-50 dark:bg-gray-900/50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                   {[
                     { type: 'Sale', id: 'SL-2045', status: 'Completed', amount: '$450.00' },
                     { type: 'Purchase', id: 'PO-089', status: 'Pending', amount: '$1,200.00' },
                     { type: 'Sale', id: 'SL-2044', status: 'Completed', amount: '$85.50' },
                   ].map((item, index) => (
                     <tr key={index}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.type}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">#{item.id}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'}`}>
                           {item.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">{item.amount}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
        
        <div className="space-y-6">
           <LowStockPanel items={mockLowStock} />
        </div>
      </div>
    </PageWrapper>
  );
}
