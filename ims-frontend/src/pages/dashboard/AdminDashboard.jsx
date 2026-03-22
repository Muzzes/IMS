import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import StockByCategoryChart from '../../components/charts/StockByCategoryChart';
import SalesVsPurchasesChart from '../../components/charts/SalesVsPurchasesChart';
import ProductStockChart from '../../components/charts/ProductStockChart';
import LowStockPanel from '../../components/common/LowStockPanel';
import { Package, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';

const mockRevenue = [
  { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 }, { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 }, { name: 'Aug', revenue: 4500 },
];

const mockStockCategory = [
  { name: 'Electronics', value: 400 }, { name: 'Furniture', value: 300 },
  { name: 'Apparel', value: 300 }, { name: 'Food/Bev', value: 200 },
];

const mockSalesPurchases = [
  { name: 'Mar', sales: 4000, purchases: 2400 },
  { name: 'Apr', sales: 3000, purchases: 1398 },
  { name: 'May', sales: 2000, purchases: 9800 },
  { name: 'Jun', sales: 2780, purchases: 3908 },
  { name: 'Jul', sales: 1890, purchases: 4800 },
  { name: 'Aug', sales: 2390, purchases: 3800 },
];

const mockTopProducts = [
  { name: 'Soy Wax 5kg', stock: 120 },
  { name: 'RTX 4080', stock: 15 },
  { name: 'Glass Jars', stock: 500 },
  { name: 'Intel i9', stock: 42 },
  { name: 'Wicks 100pk', stock: 300 },
];

const mockLowStock = [
  { name: 'Essential Oil - Lavender', sku: 'OIL-LAV-01', stock: 2, threshold: 10 },
  { name: 'Cardboard Boxes', sku: 'PKG-BX-M', stock: 0, threshold: 50 },
  { name: 'Switch Red', sku: 'SW-RD-100', stock: 15, threshold: 100 },
];

export default function AdminDashboard() {
  const { activeWorkspace } = useWorkspace();

  return (
    <PageWrapper title="Admin Dashboard" subtitle={activeWorkspace ? `Viewing data for ${activeWorkspace.name}` : 'Viewing Global Data across all workspaces'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Products" value="1,248" trend="up" trendValue="12% vs last month" icon={Package} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" />
        <StatCard label="Total Sales" value="$45,231" trend="up" trendValue="8.2% vs last month" icon={DollarSign} colorClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" />
        <StatCard label="Total Purchases" value="$12,305" trend="down" trendValue="3.1% vs last month" icon={ShoppingCart} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" />
        <StatCard label="Low Stock Alerts" value="24" trend="up" trendValue="5 new today" icon={AlertTriangle} colorClass="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trend (8 months)</h3>
          <RevenueChart data={mockRevenue} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stock by Category</h3>
          <StockByCategoryChart data={mockStockCategory} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales vs Purchases</h3>
          <SalesVsPurchasesChart data={mockSalesPurchases} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Products by Stock</h3>
          <ProductStockChart data={mockTopProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
             <h3 className="font-semibold text-gray-900 dark:text-white">Recent Sales</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-900/50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {['#SL-1029', '#SL-1028', '#SL-1027', '#SL-1026'].map((id, index) => (
                   <tr key={index}>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">{id}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Customer {index + 1}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Today</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">${(120 * (5 - index)).toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
        <div>
           <LowStockPanel items={mockLowStock} />
        </div>
      </div>
    </PageWrapper>
  );
}
