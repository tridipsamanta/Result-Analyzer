import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Users, Award, TrendingUp, TrendingDown, BookOpen, ArrowRight, BarChart3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { StudentCard } from '@/components/results/StudentCard';
import { SgpaDistributionChart } from '@/components/charts/SgpaDistributionChart';
import { SubjectStatsChart } from '@/components/charts/SubjectStatsChart';
import { useDatasetStore } from '@/store/datasetStore';
import { calculateDatasetAnalytics, getTopPerformers } from '@/lib/analytics';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { currentDataset } = useDatasetStore();
  
  const analytics = useMemo(() => {
    if (!currentDataset) return null;
    return calculateDatasetAnalytics(currentDataset);
  }, [currentDataset]);
  
  const topPerformers = useMemo(() => {
    if (!currentDataset) return [];
    return getTopPerformers(currentDataset.students, 5);
  }, [currentDataset]);
  
  if (!currentDataset) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{currentDataset.name}</h1>
            <p className="text-muted-foreground mt-1">
              {currentDataset.totalStudents} students • {currentDataset.totalSubjects} subjects
            </p>
          </div>
          <Link to="/analytics">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
              <BarChart3 className="w-4 h-4 mr-2" />
              Full Analytics
            </Button>
          </Link>
        </div>
        
        {/* Stats Grid */}
        {analytics && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={analytics.totalStudents}
              icon={<Users className="w-5 h-5" />}
              variant="primary"
            />
            <StatCard
              title="Pass Rate"
              value={`${analytics.passRate.toFixed(1)}%`}
              subtitle={`${analytics.passedStudents} passed`}
              icon={<Award className="w-5 h-5" />}
              variant="success"
            />
            <StatCard
              title="Highest SGPA"
              value={analytics.highestSgpa.sgpa.toFixed(2)}
              subtitle={analytics.highestSgpa.student?.name}
              icon={<TrendingUp className="w-5 h-5" />}
              variant="primary"
            />
            <StatCard
              title="Average SGPA"
              value={analytics.averageSgpa.toFixed(2)}
              icon={<BookOpen className="w-5 h-5" />}
            />
          </div>
        )}
        
        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* SGPA Distribution */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              SGPA Distribution
            </h3>
            {analytics && <SgpaDistributionChart distribution={analytics.sgpaDistribution} />}
          </div>
          
          {/* Subject Stats */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Subject Statistics
            </h3>
            {analytics && <SubjectStatsChart stats={analytics.subjectStats} />}
          </div>
        </div>
        
        {/* Top Performers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Top Performers
            </h3>
            <Link to="/students" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all students
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((student, index) => (
              <StudentCard key={student.id} student={student} rank={index + 1} />
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/students">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Browse Students
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Compare Students
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Detailed Analytics
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
