import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PartnerForm from './PartnerForm';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Search, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

const mockPartners = [
  { id: 1, name: 'Global Plastics Corp', type: 'Supplier', email: 'orders@globalplastics.com', phone: '555-0100', address: '123 Industrial Pkwy', contactPerson: 'John Smith', status: 'Active', workspace_id: 1, relatedProducts: 12, openPOs: 2 },
  { id: 2, name: 'Aroma Extracts Ltd', type: 'Manufacturer', email: 'sales@aroma.co', phone: '555-0101', address: '45 Scent Ave', contactPerson: 'Emily Chen', status: 'Active', workspace_id: 1, relatedProducts: 4, openPOs: 1 },
  { id: 3, name: 'Intel', type: 'Manufacturer', email: 'b2b@intel.mock', phone: '555-0199', address: 'Silicon Valley', contactPerson: 'Robert', status: 'Active', workspace_id: 2, relatedProducts: 2, openPOs: 0 },
  { id: 4, name: 'Tech Wholesalers', type: 'Supplier', email: 'distrib@techws.com', phone: '555-0200', address: 'NY Central 5', contactPerson: 'Dave', status: 'Inactive', workspace_id: 2, relatedProducts: 8, openPOs: 0 },
];

export default function PartnerList() {
  const { activeWorkspace } = useWorkspace();
  const { role } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, partner: null });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockPartners];
      if (activeWorkspace) filtered = filtered.filter(p => p.workspace_id === activeWorkspace.id);
      setData(filtered);
      setLoading(false);
    }, 400);
  }, [activeWorkspace]);

  const handleAdd = () => {
    setEditingPartner(null);
    setIsFormOpen(true);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const handleDelete = (partner) => {
    setDeleteDialog({ isOpen: true, partner });
  };

  const handleFormSubmit = (partnerData) => {
    if (editingPartner) {
      setData(data.map(p => p.id === partnerData.id ? partnerData : p));
    } else {
      setData([{ ...partnerData, relatedProducts: 0, openPOs: 0, workspace_id: activeWorkspace?.id || 1 }, ...data]);
    }
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    setData(data.filter(p => p.id !== deleteDialog.partner.id));
  };

  const columns = [
    { label: 'Name', key: 'name', render: (val, row) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{val}</div>
        <div className="text-xs text-gray-500 mt-0.5">{row.contactPerson}</div>
      </div>
    )},
    { label: 'Type', key: 'type', render: (val) => (
      <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full border border-transparent ${val === 'Supplier' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'}`}>
        {val}
      </span>
    )},
    { label: 'Contact Details', key: 'contact', render: (_, row) => (
      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {row.email}</div>
        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {row.phone}</div>
      </div>
    )},
    { label: 'Status', key: 'status', render: (val) => (
      <Badge variant={val === 'Active' ? 'success' : 'default'}>{val}</Badge>
    )},
    { label: 'Metrics', key: 'metrics', sortable: false, render: (_, row) => (
      <div className="text-xs text-gray-500 flex flex-col gap-1">
        <span>{row.relatedProducts} Products</span>
        {row.openPOs > 0 ? <span className="text-amber-600 font-medium">{row.openPOs} Open POs</span> : <span>0 Open POs</span>}
      </div>
    )}
  ];

  const filteredData = data.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper 
      title="Partners & Suppliers" 
      actionButton={
        role === 'admin' && (
          <button onClick={handleAdd} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors border border-transparent">
            <Plus className="h-4 w-4 mr-2" /> Add Partner
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
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredData} 
        loading={loading}
        onEdit={role === 'admin' ? handleEdit : null}
        onDelete={role === 'admin' ? handleDelete : null}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingPartner ? "Edit Partner" : "Add Partner"} size="md">
        {isFormOpen && <PartnerForm initialData={editingPartner} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />}
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onClose={() => setDeleteDialog({ isOpen: false, partner: null })}
        onConfirm={confirmDelete}
        title="Delete Partner"
        message={`Are you sure you want to delete ${deleteDialog.partner?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </PageWrapper>
  );
}
