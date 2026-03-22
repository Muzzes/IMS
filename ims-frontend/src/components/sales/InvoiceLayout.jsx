import React from 'react';

export default function InvoiceLayout({ sale }) {
  if (!sale) return null;

  return (
    <div id={`invoice-${sale.id}`} className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-gray-900 border border-gray-200 print:border-none print:shadow-none shadow-lg">
      <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">StockFlow</h1>
          <p className="text-gray-500 text-sm mt-1">123 Business Rd, Suite 100</p>
          <p className="text-gray-500 text-sm">Tech City, TC 90210</p>
          <p className="text-gray-500 text-sm">contact@stockflow.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-medium text-gray-400 uppercase tracking-widest">Invoice</h2>
          <p className="text-gray-900 font-medium mt-1 font-mono">{sale.id}</p>
          <p className="text-sm text-gray-500 mt-1">Date: {sale.date}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Billed To</h3>
        <p className="text-gray-900 font-medium">{sale.customerName}</p>
        <p className="text-gray-600 text-sm">{sale.customerEmail}</p>
        <p className="text-gray-600 text-sm">{sale.customerPhone}</p>
      </div>

      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-y border-gray-200 bg-gray-50">
            <th className="py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
            <th className="py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Qty</th>
            <th className="py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Unit Price</th>
            <th className="py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sale.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-4 px-3 text-sm text-gray-900">{item.name}</td>
              <td className="py-4 px-3 text-sm text-gray-600 text-right">{item.qty}</td>
              <td className="py-4 px-3 text-sm text-gray-600 text-right">${item.price.toFixed(2)}</td>
              <td className="py-4 px-3 text-sm text-gray-900 text-right font-medium">${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end pt-4">
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${sale.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax ({(sale.taxRate * 100).toFixed(0)}%)</span>
            <span>${(sale.subtotal * sale.taxRate).toFixed(2)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Discount</span>
              <span>-${sale.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-200 mt-2">
            <span>Total</span>
            <span>${sale.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700">Thank you for your business.</p>
        <p className="mt-1">Payment is due within 30 days of the invoice date.</p>
      </div>
    </div>
  );
}
