import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ComparisonResult } from '@/types/dataset';

interface CompareChartProps {
  comparison: ComparisonResult;
}

export function CompareChart({ comparison }: CompareChartProps) {
  const data = comparison.subjectComparisons.map(comp => ({
    subject: comp.subjectCode,
    [comparison.student1.name]: comp.student1Marks || 0,
    [comparison.student2.name]: comp.student2Marks || 0,
  }));
  
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
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
          />
          <Bar 
            dataKey={comparison.student2.name} 
            fill="hsl(262, 83%, 58%)" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
