import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';
import ProductStockChart from '../../components/charts/ProductStockChart';
import { Package, AlertTriangle, Box, Truck } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';

const mockTopProducts = [
  { name: 'Soy Wax 5kg', stock: 120 },
  { name: 'Glass Jars M', stock: 500 },
  { name: 'Wicks 100pk', stock: 300 },
];

export default function ManufacturerDashboard() {
  const { activeWorkspace } = useWorkspace();

  return (
    <PageWrapper 
      title="Manufacturer Dashboard" 
      subtitle={activeWorkspace ? `Workspace: ${activeWorkspace.name}` : ''}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard label="My Products" value="15" trend="neutral" icon={Package} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" />
        <StatCard label="Low Stock" value="2" trend="down" trendValue="Requires attention" icon={AlertTriangle} colorClass="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" />
        <StatCard label="Pending POs" value="4" trend="up" icon={Box} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" />
        <StatCard label="Supply Value" value="$12,450" trend="neutral" icon={Truck} colorClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">My Products Stock Levels</h3>
          <ProductStockChart data={mockTopProducts} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
             <h3 className="font-semibold text-gray-900 dark:text-white">Recent Purchase Orders (For my products)</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-900/50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO ID</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Issued</th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {[
                   { id: 'PO-089', status: 'Pending', date: 'Oct 12, 2023' },
                   { id: 'PO-088', status: 'Shipped', date: 'Oct 10, 2023' },
                   { id: 'PO-085', status: 'Received', date: 'Sep 28, 2023' },
                 ].map((item, index) => (
                   <tr key={index}>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">#{item.id}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Received' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : (item.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300')}`}>
                         {item.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.date}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
             <a href="/purchases/me" className="text-sm font-medium text-primary hover:text-blue-600 transition-colors">View all orders &rarr;</a>
           </div>
        </div>
      </div>
    </PageWrapper>
  );
}
