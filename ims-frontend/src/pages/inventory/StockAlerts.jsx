import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useWorkspace } from '../../hooks/useWorkspace';
import { mockProducts } from '../../utils/mockData';
import LowStockPanel from '../../components/common/LowStockPanel';

export default function StockAlerts() {
  const { activeWorkspace } = useWorkspace();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let filtered = [...mockProducts].map(p => ({ ...p, threshold: 20 }));
    if (activeWorkspace) {
      filtered = filtered.filter(p => p.workspace_id === activeWorkspace.id);
    }
    setAlerts(filtered.filter(p => p.stockQty <= p.threshold));
  }, [activeWorkspace]);

  const critical = alerts.filter(a => a.stockQty <= 5);
  const low = alerts.filter(a => a.stockQty > 5);

  return (
    <PageWrapper title="Stock Alerts" subtitle="Items requiring immediate attention or reordering">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="flex flex-col h-full">
          <h3 className="text-red-600 dark:text-red-400 font-medium mb-4 text-lg">Critical Items (&lt;= 5 units)</h3>
          <LowStockPanel items={critical} />
        </div>
        <div className="flex flex-col h-full">
          <h3 className="text-amber-600 dark:text-amber-400 font-medium mb-4 text-lg">Low Stock (approaching minimum)</h3>
          <LowStockPanel items={low} />
        </div>
      </div>
    </PageWrapper>
  );
}
