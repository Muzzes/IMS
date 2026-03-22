import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export default function LowStockPanel({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 border border-gray-200 dark:border-gray-700 h-full">
        <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
        <p>No low stock alerts</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
       <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
         <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
           <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
           Critical Low Stock
         </h3>
       </div>
       <div className="flex-1 overflow-y-auto">
         <ul className="divide-y divide-gray-100 dark:divide-gray-700">
           {items.map((item, i) => (
             <li key={i} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
               <div className="flex justify-between items-center">
                 <div>
                   <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                   <p className="text-xs text-gray-500">{item.sku}</p>
                 </div>
                 <div className="text-right">
                   <p className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : 'text-warning'}`}>
                     {item.stock} left
                   </p>
                   {item.threshold && <p className="text-xs text-gray-500">Thresh: {item.threshold}</p>}
                 </div>
               </div>
             </li>
           ))}
         </ul>
       </div>
    </div>
  );
}
