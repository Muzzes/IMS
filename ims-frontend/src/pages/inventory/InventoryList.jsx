import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import StockLevelBar from '../../components/inventory/StockLevelBar';
import Badge from '../../components/common/Badge';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../hooks/useAuth';
import { mockProducts } from '../../utils/mockData';
import { Archive, AlertTriangle, AlertOctagon, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryList() {
  const { activeWorkspace } = useWorkspace();
  const { role } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockProducts].map(p => ({ ...p, threshold: 20 })); // Mocking threshold
      if (activeWorkspace) {
        filtered = filtered.filter(p => p.workspace_id === activeWorkspace.id);
      }
      setInventory(filtered);
      setLoading(false);
    }, 400);
  }, [activeWorkspace]);

  const handleUpdateStock = (row) => {
    const newStock = window.prompt(`Update stock for ${row.name}`, row.stockQty);
    if (newStock !== null && !isNaN(newStock) && Number(newStock) >= 0) {
      setInventory(inventory.map(p => p.id === row.id ? { ...p, stockQty: Number(newStock) } : p));
      toast.success('Stock updated successfully');
    }
  };

  const totalSkus = inventory.length;
  const lowStock = inventory.filter(i => i.stockQty > 0 && i.stockQty <= i.threshold).length;
  const outOfStock = inventory.filter(i => i.stockQty === 0).length;

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { label: 'Product', key: 'name', render: (val) => <div className="font-medium text-gray-900 dark:text-white">{val}</div> },
    { label: 'SKU', key: 'sku' },
    { label: 'Category', key: 'category' },
    { label: 'In Stock', key: 'stockQty', render: (val) => <span className="font-bold text-gray-900 dark:text-white">{val}</span> },
    { label: 'Health', key: 'health', sortable: false, render: (_, row) => <StockLevelBar current={row.stockQty} threshold={row.threshold} /> },
    { 
      label: 'Status', 
      key: 'status',
      render: (_, row) => {
        if (row.stockQty === 0) return <Badge variant="danger">Out of Stock</Badge>;
        if (row.stockQty <= row.threshold) return <Badge variant="warning">Low</Badge>;
        return <Badge variant="success">Healthy</Badge>;
      }
    }
  ];

  return (
    <PageWrapper title="Inventory Control">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total SKUs" value={totalSkus} trend="neutral" icon={Archive} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" />
        <StatCard label="Low Stock Items" value={lowStock} trend="neutral" icon={AlertTriangle} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" />
        <StatCard label="Out of Stock" value={outOfStock} trend="neutral" icon={AlertOctagon} colorClass="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Bulk Update
        </button>
      </div>

      <DataTable 
        columns={columns}
        data={filteredInventory}
        loading={loading}
        onEdit={handleUpdateStock}
      />
    </PageWrapper>
  );
}
