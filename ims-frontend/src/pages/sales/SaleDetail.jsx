import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/common/Badge';
import InvoiceLayout from '../../components/sales/InvoiceLayout';
import { ArrowLeft, Printer } from 'lucide-react';

const mockSales = [
  { id: 'SL-2023001', customerName: 'Acme Corp', customerEmail: 'billing@acme.com', customerPhone: '555-0100', date: '2023-10-15', itemsCount: 2, subtotal: 800, taxRate: 0.08, discount: 0, total: 864.0, status: 'Completed', workspace_id: 1, items: [
    { name: 'Soy Wax 5kg', qty: 10, price: 50 },
    { name: 'Glass Jars M', qty: 200, price: 1.5 }
  ]},
  { id: 'SL-2023002', customerName: 'Jane Doe', customerEmail: 'jane@example.com', customerPhone: '555-0101', date: '2023-10-16', itemsCount: 1, subtotal: 1200, taxRate: 0.08, discount: 50, total: 1242.0, status: 'Completed', workspace_id: 2, items: [
    { name: 'GPU RTX 4080', qty: 1, price: 1200 }
  ]},
];

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const sale = mockSales.find(s => s.id === id) || { ...mockSales[0], id, customerName: 'Unknown Customer' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3 print:hidden">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span>Sale {sale.id}</span>
          <Badge variant={sale.status === 'Completed' ? 'success' : 'warning'}>{sale.status}</Badge>
        </div>
      }
      actionButton={
        <button onClick={handlePrint} className="flex items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </button>
      }
    >
      <div className="overflow-x-auto bg-gray-100 dark:bg-gray-900/60 p-4 rounded-lg print:p-0 print:bg-transparent flex justify-center py-8">
        <InvoiceLayout sale={sale} />
      </div>
    </PageWrapper>
  );
}
