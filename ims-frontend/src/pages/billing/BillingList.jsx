import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { useWorkspace } from '../../hooks/useWorkspace';
import { DollarSign, Search, CheckCircle, CreditCard, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const mockInvoices = [
  { id: 'INV-2023001', sale_id: 'SL-2023001', customerName: 'Acme Corp', date: '2023-10-15', dueDate: '2023-11-14', amount: 864.0, status: 'Paid', workspace_id: 1 },
  { id: 'INV-2023002', sale_id: 'SL-2023002', customerName: 'Jane Doe', date: '2023-10-16', dueDate: '2023-10-31', amount: 1242.0, status: 'Unpaid', workspace_id: 2 },
  { id: 'INV-2023003', sale_id: 'SL-2023003', customerName: 'Tech Fixers', date: '2023-09-01', dueDate: '2023-10-01', amount: 450.0, status: 'Overdue', workspace_id: 1 },
];

export default function BillingList() {
  const { activeWorkspace } = useWorkspace();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockInvoices];
      if (activeWorkspace) filtered = filtered.filter(i => i.workspace_id === activeWorkspace.id);
      setData(filtered);
      setLoading(false);
    }, 400);
  }, [activeWorkspace]);

  const handleRecordPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentOpen(true);
  };

  const submitPayment = (e) => {
    e.preventDefault();
    setData(data.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv));
    setIsPaymentOpen(false);
    toast.success(`Payment recorded for ${selectedInvoice.id}`);
  };

  const totalOutstanding = data.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = data.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalCollected = data.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

  const columns = [
    { label: 'Invoice #', key: 'id', render: (val) => <span className="font-medium text-gray-900 dark:text-white">{val}</span> },
    { label: 'Customer', key: 'customerName' },
    { label: 'Date', key: 'date' },
    { label: 'Due Date', key: 'dueDate' },
    { label: 'Amount', key: 'amount', render: (val) => <span className="font-medium">${val.toFixed(2)}</span> },
    { label: 'Status', key: 'status', render: (val) => {
        if (val === 'Paid') return <Badge variant="success">Paid</Badge>;
        if (val === 'Unpaid') return <Badge variant="warning">Unpaid</Badge>;
        if (val === 'Overdue') return <Badge variant="danger">Overdue</Badge>;
        return <Badge>{val}</Badge>;
    }},
    { label: '', sortable: false, key: 'actions', render: (_, row) => (
      row.status !== 'Paid' && (
         <button onClick={() => handleRecordPayment(row)} className="text-primary hover:text-blue-700 transition-colors text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
           Receive Payment
         </button>
      )
    )}
  ];

  const filteredData = data.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper title="Billing & Invoicing">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Outstanding Balance" value={`$${totalOutstanding.toFixed(2)}`} trend="neutral" icon={Clock} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" />
        <StatCard label="Amount Overdue" value={`$${totalOverdue.toFixed(2)}`} trend="bad" icon={AlertTriangle} colorClass="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" />
        <StatCard label="Collected this Month" value={`$${totalCollected.toFixed(2)}`} trend="good" icon={CheckCircle} colorClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 w-full md:w-64">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search Invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} loading={loading} />

      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Record Payment" size="sm">
        {selectedInvoice && (
          <form onSubmit={submitPayment} className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-1">Amount Due</p>
              <p className="text-2xl font-bold dark:text-white">${selectedInvoice.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Invoice: {selectedInvoice.id}</p>
              <p className="text-sm text-gray-500">Customer: {selectedInvoice.customerName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-primary"
                >
                  <option>Credit Card</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Check</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-md font-medium text-sm transition-colors flex items-center">
                <DollarSign className="h-4 w-4 mr-1"/> Confirm Payment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
