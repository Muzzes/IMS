import React from 'react';

export default function StockLevelBar({ current, threshold }) {
  if (threshold == null || threshold <= 0) threshold = current > 0 ? current : 10; 
  
  const thresholdValue = Number(threshold);
  const currentValue = Number(current);
  
  const percentage = Math.min(100, Math.max(0, (currentValue / thresholdValue) * 100));
  
  let colorClass = 'bg-red-500';
  if (percentage >= 50) colorClass = 'bg-green-500';
  else if (percentage >= 20) colorClass = 'bg-amber-500';

  return (
    <div className="w-full flex items-center gap-2">
      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap w-8 text-right">
        {currentValue} / {thresholdValue}
      </span>
    </div>
  );
}
