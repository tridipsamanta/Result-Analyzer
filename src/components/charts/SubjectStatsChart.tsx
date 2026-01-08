import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SubjectStats } from '@/types/dataset';

interface SubjectStatsChartProps {
  stats: SubjectStats[];
}

export function SubjectStatsChart({ stats }: SubjectStatsChartProps) {
  const [viewport, setViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const containerHeight = viewport < 640 ? 300 : viewport < 768 ? 340 : 380;

  const data = stats.map(stat => ({
    name: stat.subjectCode,
    fullName: stat.subjectName,
    highest: stat.highest,
    average: Math.round(stat.average),
    lowest: stat.lowest,
  }));
  
  if (data.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
        No subject statistics available.
      </div>
    );
  }
  
  return (
    <div className="w-full" style={{ minHeight: containerHeight }}>
      <ResponsiveContainer width="100%" height={containerHeight}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 18%)',
              borderRadius: '8px',
              color: 'hsl(210, 40%, 98%)',
            }}
            formatter={(value: number, name: string) => [
              `${value}`,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
            labelFormatter={(label) => {
              const item = data.find(d => d.name === label);
              return item?.fullName || label;
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(215, 20%, 55%)' }}
            formatter={(value) => (
              <span style={{ color: 'hsl(215, 20%, 55%)' }}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            )}
          />
          <Bar dataKey="highest" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} barSize={viewport < 640 ? 18 : 22} />
          <Bar dataKey="average" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} barSize={viewport < 640 ? 18 : 22} />
          <Bar dataKey="lowest" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} barSize={viewport < 640 ? 18 : 22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
