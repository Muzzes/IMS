import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesVsPurchasesChart({ data }) {
  const formatYAxis = (tickItem) => `$${tickItem.toLocaleString()}`;
  
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{fill: '#6b7280', fontSize: 12}} width={80} />
          <Tooltip 
            cursor={{fill: 'rgba(156, 163, 175, 0.1)'}} 
            contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.375rem', padding: '12px'}}
            itemStyle={{paddingBottom: '4px'}}
            formatter={(value) => `$${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{paddingTop: '20px', fontSize: '13px', color: '#6b7280'}} iconType="circle" />
          <Bar dataKey="sales" name="Sales" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="purchases" name="Purchases" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
