import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import PurchaseForm from './PurchaseForm';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Plus, Search, Eye } from 'lucide-react';

const mockPOs = [
  { id: 'PO-089', supplier_id: 1, date: '2023-10-12', itemsCount: 3, total: 1200.0, status: 'Pending', workspace_id: 1 },
  { id: 'PO-088', supplier_id: 2, date: '2023-10-10', itemsCount: 1, total: 450.0, status: 'Received', workspace_id: 1 },
  { id: 'PO-087', supplier_id: 1, date: '2023-10-05', itemsCount: 5, total: 3200.0, status: 'Partial', workspace_id: 2 },
  { id: 'PO-086', supplier_id: 3, date: '2023-10-01', itemsCount: 2, total: 150.0, status: 'Cancelled', workspace_id: 1 },
];

export default function PurchaseList() {
  const { role } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockPOs];
      if (activeWorkspace) filtered = filtered.filter(po => po.workspace_id === activeWorkspace.id);
      setData(filtered);
      setLoading(false);
    }, 400);
  }, [activeWorkspace]);

  const handleFormSubmit = (poData) => {
    setData([poData, ...data]);
    setIsFormOpen(false);
  };

  const columns = [
    { label: 'PO Number', key: 'id', render: (val) => <span className="font-medium text-blue-600 dark:text-blue-400">#{val}</span> },
    { label: 'Supplier', key: 'supplier_id', render: (val) => val === 1 ? 'Global Plastics Corp' : (val === 2 ? 'Aroma Extracts Ltd' : 'Unknown Supplier') },
    { label: 'Date', key: 'date' },
    { label: 'Items', key: 'itemsCount' },
    { label: 'Total', key: 'total', render: (val) => `$${Number(val).toFixed(2)}` },
    { label: 'Status', key: 'status', render: (val) => {
        if (val === 'Received') return <Badge variant="success">Received</Badge>;
        if (val === 'Pending') return <Badge variant="warning">Pending</Badge>;
        if (val === 'Cancelled') return <Badge variant="danger">Cancelled</Badge>;
        if (val === 'Partial') return <Badge variant="primary">Partial</Badge>;
        return <Badge>{val}</Badge>;
    }},
    { label: '', sortable: false, key: 'actions', render: (_, row) => (
      <button onClick={() => navigate(`/purchases/${row.id}`)} className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
        <Eye className="h-4 w-4" /> <span className="text-xs">View</span>
      </button>
    )}
  ];

  const filteredData = data.filter(po => po.id?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <PageWrapper
      title="Purchase Orders"
      actionButton={
        role !== 'manufacturer' && (
          <button onClick={() => setIsFormOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors border border-transparent">
            <Plus className="h-4 w-4 mr-2" /> New Purchase
          </button>
        )
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
            placeholder="Search PO Number..."
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

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Create Purchase Order" size="lg">
        {isFormOpen && <PurchaseForm onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />}
      </Modal>
    </PageWrapper>
  );
}
