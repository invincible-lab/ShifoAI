import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function GlucoseChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--hint-color)' }}>
        Grafik uchun ma'lumot yo'q. Iltimos, glyukoza ko'rsatkichini kiriting.
      </div>
    );
  }

  // Format data for recharts
  const chartData = [...data].reverse().map(item => {
    const date = new Date(item.reading_time);
    return {
      time: `${date.getDate()}/${date.getMonth()+1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
      value: item.value,
      context: item.meal_context
    };
  });

  return (
    <div style={{ width: '100%', height: 300, backgroundColor: 'var(--bg-color)', padding: '10px 0', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.2} />
          <XAxis dataKey="time" stroke="#ffffff" fontSize={12} tickMargin={10} angle={-45} textAnchor="end" />
          <YAxis stroke="#ffffff" fontSize={12} domain={[0, 'dataMax + 5']} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--tg-secondary-bg-color)', borderColor: '#ffffff', borderRadius: '8px', color: '#ffffff' }}
            labelStyle={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '5px' }}
          />
          {/* Normal range reference lines */}
          <ReferenceLine y={3.9} stroke="#ef4444" strokeDasharray="3 3" />
          <ReferenceLine y={10.0} stroke="#f59e0b" strokeDasharray="3 3" />
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ffffff" 
            strokeWidth={3}
            activeDot={{ r: 8 }} 
            dot={{ r: 4, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
