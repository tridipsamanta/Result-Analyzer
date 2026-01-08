import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ComparisonResult } from '@/types/dataset';

interface CompareChartProps {
  comparison: ComparisonResult;
}

export function CompareChart({ comparison }: CompareChartProps) {
  const [viewport, setViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const containerHeight = viewport < 640 ? 300 : viewport < 768 ? 340 : 380;

  const data = comparison.subjectComparisons.map(comp => ({
    subject: comp.subjectCode,
    [comparison.student1.name]: comp.student1Marks || 0,
    [comparison.student2.name]: comp.student2Marks || 0,
  }));
  
  if (data.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
        No comparison data available.
      </div>
    );
  }
  
  return (
    <div className="w-full" style={{ minHeight: containerHeight }}>
      <ResponsiveContainer width="100%" height={containerHeight}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
          <XAxis 
            dataKey="subject" 
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
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(215, 20%, 55%)' }}
          />
          <Bar 
            dataKey={comparison.student1.name} 
            fill="hsl(187, 85%, 53%)" 
            radius={[4, 4, 0, 0]} 
            barSize={viewport < 640 ? 20 : 24}
          />
          <Bar 
            dataKey={comparison.student2.name} 
            fill="hsl(262, 83%, 58%)" 
            radius={[4, 4, 0, 0]} 
            barSize={viewport < 640 ? 20 : 24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
