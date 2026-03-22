import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import RevenueChart from '../../components/charts/RevenueChart';
import SalesVsPurchasesChart from '../../components/charts/SalesVsPurchasesChart';
import StockByCategoryChart from '../../components/charts/StockByCategoryChart';
import StatCard from '../../components/common/StatCard';
import { DollarSign, TrendingUp, ShoppingCart, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportDashboard() {
  const [dateRange, setDateRange] = useState('This Month');

  const handleExportCSV = () => {
    toast.success('Successfully exported report data to CSV');
  };

  const handleExportPDF = () => {
    toast.success('Generating PDF report. The download will start shortly...');
  };

  return (
    <PageWrapper
      title="Analytics & Reports"
      actionButton={
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center bg-primary text-white border border-transparent px-3 py-2 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </button>
        </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-2 font-medium">
          <Filter className="h-4 w-4" /> Filter by Date Range:
        </div>
        <select 
          value={dateRange} 
          onChange={e => setDateRange(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none px-3 py-1.5 text-sm w-48 focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard label="Total Revenue" value="$45,231.89" trend="good" icon={DollarSign} colorClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" />
        <StatCard label="Profit Margin" value="24.8%" trend="good" icon={TrendingUp} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" />
        <StatCard label="Total Orders" value="1,204" trend="good" icon={ShoppingCart} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          <div className="flex-1 min-h-0">
            <RevenueChart />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales vs Purchases</h3>
          <div className="flex-1 min-h-0">
            <SalesVsPurchasesChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stock by Category</h3>
          <div className="flex-1 min-h-0 -ml-4">
            <StockByCategoryChart />
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Selling Products</h3>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-white dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { name: 'Soy Wax 5kg', units: 450, rev: 22500 },
                  { name: 'GPU RTX 4080', units: 12, rev: 14400 },
                  { name: 'CPU Intel i9', units: 45, rev: 24750 },
                  { name: 'Glass Jars M', units: 1200, rev: 1800 }
                ].sort((a,b) => b.rev - a.rev).map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">{p.units}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium text-right">${p.rev.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
