import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import SaleForm from './SaleForm';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Plus, Search, Eye } from 'lucide-react';

const mockSales = [
  { id: 'SL-2023001', customerName: 'Acme Corp', customerEmail: 'billing@acme.com', customerPhone: '555-0100', date: '2023-10-15', itemsCount: 2, subtotal: 800, taxRate: 0.08, discount: 0, total: 864.0, status: 'Completed', workspace_id: 1, items: [
    { name: 'Soy Wax 5kg', qty: 10, price: 50 },
    { name: 'Glass Jars M', qty: 200, price: 1.5 }
  ]},
  { id: 'SL-2023002', customerName: 'Jane Doe', customerEmail: 'jane@example.com', customerPhone: '555-0101', date: '2023-10-16', itemsCount: 1, subtotal: 1200, taxRate: 0.08, discount: 50, total: 1242.0, status: 'Completed', workspace_id: 2, items: [
    { name: 'GPU RTX 4080', qty: 1, price: 1200 }
  ]},
];

export default function SalesList() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockSales];
      if (activeWorkspace) filtered = filtered.filter(s => s.workspace_id === activeWorkspace.id);
      setData(filtered);
      setLoading(false);
    }, 400);
  }, [activeWorkspace]);

  const handleFormSubmit = (saleData) => {
    setData([saleData, ...data]);
    setIsFormOpen(false);
  };

  const columns = [
    { label: 'Sale ID', key: 'id', render: (val) => <span className="font-medium text-blue-600 dark:text-blue-400">#{val}</span> },
    { label: 'Customer', key: 'customerName' },
    { label: 'Date', key: 'date' },
    { label: 'Total', key: 'total', render: (val) => `$${Number(val).toFixed(2)}` },
    { label: 'Status', key: 'status', render: (val) => {
        if (val === 'Completed') return <Badge variant="success">Completed</Badge>;
        if (val === 'Pending') return <Badge variant="warning">Pending</Badge>;
        return <Badge>{val}</Badge>;
    }},
    { label: '', sortable: false, key: 'actions', render: (_, row) => (
      <button onClick={() => navigate(`/sales/${row.id}`)} className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
        <Eye className="h-4 w-4" /> <span className="text-xs">View</span>
      </button>
    )}
  ];

  const filteredData = data.filter(s => 
    s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper
      title="Sales Orders"
      actionButton={
        <button onClick={() => setIsFormOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors border border-transparent">
          <Plus className="h-4 w-4 mr-2" /> New Sale
        </button>
      }
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="relative w-full md:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Search Sales or Customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={filteredData}
        loading={loading}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Record New Sale" size="xl">
        {isFormOpen && <SaleForm onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />}
      </Modal>
    </PageWrapper>
  );
}
