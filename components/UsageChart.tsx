import React from 'react';
import { Bill } from '../types';

interface UsageChartProps {
  data: Bill[];
}

const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  // Access Recharts from the window object inside the component render function
  // to prevent a crash if the script hasn't loaded yet.
  const Recharts = (window as any).Recharts;

  if (!Recharts) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading chart library...</div>;
  }
  
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

  const chartData = data.map(bill => ({
    name: bill.period.split(' ')[0], // e.g., "August"
    consumption: bill.consumption,
  }));

  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No usage data available.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <BarChart
                data={chartData}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} 
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value} m³`, "Consumption"]}
                />
                <Legend />
                <Bar dataKey="consumption" fill="#00b4d8" name="Water Consumption (m³)" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;