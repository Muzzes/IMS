import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  const formatYAxis = (tickItem) => `$${tickItem.toLocaleString()}`;
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-sm rounded-md">
          <p className="text-sm font-medium dark:text-white mb-1">{label}</p>
          <p className="text-sm text-primary font-bold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{fill: '#6b7280', fontSize: 12}} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2}} activeDot={{r: 6}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
