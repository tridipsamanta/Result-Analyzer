import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Mark, Subject } from '@/types/dataset';

interface MarksBarChartProps {
  marks: Mark[];
  subjects: Subject[];
}

export function MarksBarChart({ marks, subjects }: MarksBarChartProps) {
  const [viewport, setViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const containerHeight = viewport < 640 ? 280 : viewport < 768 ? 320 : 360;

  const data = marks.map(mark => {
    const subject = subjects.find(s => s.code === mark.subjectCode);
    return {
      name: mark.subjectCode,
      fullName: subject?.fullName || mark.subjectCode,
      marks: mark.totalMarks || 0,
    };
  });
  
  if (data.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
        No marks data available.
      </div>
    );
  }
  
  const getBarColor = (marks: number) => {
    if (marks >= 80) return 'hsl(142, 76%, 36%)';
    if (marks >= 60) return 'hsl(187, 85%, 53%)';
    if (marks >= 40) return 'hsl(45, 93%, 47%)';
    return 'hsl(0, 72%, 51%)';
  };
  
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
            labelStyle={{ color: 'hsl(187, 85%, 53%)' }}
            formatter={(value: number, name: string, props: any) => [
              `${value} marks`,
              props.payload.fullName
            ]}
          />
          <Bar dataKey="marks" radius={[4, 4, 0, 0]} barSize={viewport < 640 ? 24 : 28}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.marks)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
