import { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { User, Award, BookOpen, ArrowLeft, GitCompare, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { SubjectMarksTable } from '@/components/results/SubjectMarksTable';
import { MarksBarChart } from '@/components/charts/MarksBarChart';
import { useDatasetStore } from '@/store/datasetStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentDataset } = useDatasetStore();
  
  const student = useMemo(() => {
    if (!currentDataset || !id) return null;
    return currentDataset.students.find(s => s.id === id);
  }, [currentDataset, id]);
  
  const rank = useMemo(() => {
    if (!currentDataset || !student) return 0;
    const sorted = [...currentDataset.students].sort((a, b) => b.sgpa - a.sgpa);
    return sorted.findIndex(s => s.id === student.id) + 1;
  }, [currentDataset, student]);
  
  if (!currentDataset) {
    return <Navigate to="/" replace />;
  }
  
  if (!student) {
    return <Navigate to="/students" replace />;
  }
  
  const getRemarksColor = (remarks: string) => {
    if (remarks === 'Q') return 'bg-success/20 text-success border-success/30';
    if (remarks.includes('Q')) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-destructive/20 text-destructive border-destructive/30';
  };
  
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Back button */}
        <Link to="/students">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
        </Link>
        
        {/* Student Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span className="font-mono">{student.rollNo}</span>
                <span className="font-mono text-sm">{student.abcId}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium border',
                  getRemarksColor(student.remarks)
                )}>
                  {student.remarks === 'Q' ? 'Qualified' : student.remarks}
                </span>
                {rank <= 10 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                    Rank #{rank}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <Link to={`/compare?student1=${student.id}`}>
            <Button className="gradient-primary text-primary-foreground shadow-glow">
              <GitCompare className="w-4 h-4 mr-2" />
              Compare with Others
            </Button>
          </Link>
        </div>
        
        {/* Summary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="SGPA"
            value={student.sgpa.toFixed(2)}
            icon={<Award className="w-5 h-5" />}
            variant="primary"
          />
          <StatCard
            title="Grand Total"
            value={student.grandTotal}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Total Credits"
            value={student.totalCredit}
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatCard
            title="Credit Points"
            value={student.totalCreditPoint.toFixed(1)}
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>
        
        {/* Performance Chart */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Marks by Subject
          </h3>
          <MarksBarChart marks={student.marks} subjects={currentDataset.subjects} />
        </div>
        
        {/* Detailed Marks Table */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Detailed Results
          </h3>
          <SubjectMarksTable marks={student.marks} subjects={currentDataset.subjects} />
        </div>
      </div>
    </AppLayout>
  );
}
