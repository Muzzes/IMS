import React from 'react';

export default function StatCard({ label, value, trend, trendValue, icon: Icon, colorClass }) {
  const isUp = trend === 'up';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
      <div className={`p-4 rounded-xl mr-4 ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {trendValue && (
          <p className={`text-sm mt-1 font-medium flex items-center ${isUp ? 'text-green-600 dark:text-green-400' : (trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500')}`}>
            {isUp ? '↑' : (trend === 'down' ? '↓' : '')} {trendValue}
          </p>
        )}
      </div>
    </div>
  );
}
