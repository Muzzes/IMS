import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProductStockChart({ data }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.2} />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={120} />
          <Tooltip 
            cursor={{fill: 'rgba(156, 163, 175, 0.1)'}}
            contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.375rem'}}
            formatter={(value) => [value, 'Units in Stock']}
          />
          <Bar dataKey="stock" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
