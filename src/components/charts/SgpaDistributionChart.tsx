import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SgpaDistributionChartProps {
  distribution: { range: string; count: number }[];
}

const COLORS = [
  'hsl(142, 76%, 36%)',  // 9-10: Green
  'hsl(187, 85%, 53%)',  // 8-8.9: Cyan
  'hsl(262, 83%, 58%)',  // 7-7.9: Purple
  'hsl(45, 93%, 47%)',   // 6-6.9: Yellow
  'hsl(25, 95%, 53%)',   // 5-5.9: Orange
  'hsl(0, 72%, 51%)',    // <5: Red
];

export function SgpaDistributionChart({ distribution }: SgpaDistributionChartProps) {
  const [viewport, setViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const containerHeight = viewport < 640 ? 260 : viewport < 768 ? 300 : 320;
  const radius = viewport < 640 ? { inner: 50, outer: 90 } : { inner: 60, outer: 110 };

  const data = distribution.filter(d => d.count > 0);
  
  if (data.length === 0) {
    return (
      <div className="h-[260px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }
  
  return (
    <div className="w-full" style={{ minHeight: containerHeight }}>
      <ResponsiveContainer width="100%" height={containerHeight}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="range"
            cx="50%"
            cy="50%"
            outerRadius={radius.outer}
            innerRadius={radius.inner}
            paddingAngle={2}
            label={({ range, count, percent }) => 
              percent > 0.05 ? `${count}` : ''
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[distribution.indexOf(entry)]} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 18%)',
              borderRadius: '8px',
              color: 'hsl(210, 40%, 98%)',
            }}
            formatter={(value: number) => [`${value} students`, 'Count']}
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(215, 20%, 55%)' }}
            formatter={(value) => <span style={{ color: 'hsl(215, 20%, 55%)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
