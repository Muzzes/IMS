import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StockByCategoryChart({ data }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.375rem'}}
            itemStyle={{color: '#fff'}}
            formatter={(value) => [`${value} items`, 'Stock']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '13px', paddingTop: '10px'}} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
