import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, TrendingUp, TrendingDown, Users, Award, BookOpen, Target } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { SgpaDistributionChart } from '@/components/charts/SgpaDistributionChart';
import { SubjectStatsChart } from '@/components/charts/SubjectStatsChart';
import { useDatasetStore } from '@/store/datasetStore';
import { calculateDatasetAnalytics, getSubjectToppers } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Analytics() {
  const { currentDataset } = useDatasetStore();
  
  const analytics = useMemo(() => {
    if (!currentDataset) return null;
    return calculateDatasetAnalytics(currentDataset);
  }, [currentDataset]);
  
  if (!currentDataset) {
    return <Navigate to="/" replace />;
  }
  
  if (!analytics) return null;
  
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analysis of {currentDataset.name}
          </p>
        </div>
        
        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={analytics.totalStudents}
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
          <StatCard
            title="Passed"
            value={analytics.passedStudents}
            subtitle={`${analytics.passRate.toFixed(1)}% pass rate`}
            icon={<Award className="w-5 h-5" />}
            variant="success"
          />
          <StatCard
            title="Failed"
            value={analytics.failedStudents}
            icon={<TrendingDown className="w-5 h-5" />}
            variant="destructive"
          />
          <StatCard
            title="Average SGPA"
            value={analytics.averageSgpa.toFixed(2)}
            icon={<Target className="w-5 h-5" />}
          />
        </div>
        
        {/* Top/Bottom Performers */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-success/30 bg-success/5 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-success">
              <TrendingUp className="w-4 h-4" />
              Highest SGPA
            </h3>
            {analytics.highestSgpa.student && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{analytics.highestSgpa.student.name}</p>
                  <p className="text-muted-foreground">{analytics.highestSgpa.student.rollNo}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-3xl font-bold text-success">{analytics.highestSgpa.sgpa.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">SGPA</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
              <TrendingDown className="w-4 h-4" />
              Lowest SGPA
            </h3>
            {analytics.lowestSgpa.student && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{analytics.lowestSgpa.student.name}</p>
                  <p className="text-muted-foreground">{analytics.lowestSgpa.student.rollNo}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-3xl font-bold text-destructive">{analytics.lowestSgpa.sgpa.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">SGPA</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              SGPA Distribution
            </h3>
            <SgpaDistributionChart distribution={analytics.sgpaDistribution} />
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Subject Performance
            </h3>
            <SubjectStatsChart stats={analytics.subjectStats} />
          </div>
        </div>
        
        {/* Subject-wise Analysis */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Subject-wise Statistics
          </h3>
          
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="text-center font-semibold">Highest</TableHead>
                  <TableHead className="text-center font-semibold">Average</TableHead>
                  <TableHead className="text-center font-semibold">Lowest</TableHead>
                  <TableHead className="text-center font-semibold">Pass Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.subjectStats.map((stat) => (
                  <TableRow key={stat.subjectCode} className="hover:bg-muted/10">
                    <TableCell>
                      <div>
                        <span className="font-medium">{stat.subjectName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({stat.subjectCode})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-success">
                      {stat.highest}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {stat.average.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-destructive">
                      {stat.lowest}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        stat.passRate >= 80 ? 'bg-success/20 text-success' :
                        stat.passRate >= 60 ? 'bg-primary/20 text-primary' :
                        stat.passRate >= 40 ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      )}>
                        {stat.passRate.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Grade Distribution */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Grade Distribution by Subject
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {analytics.subjectStats.map((stat) => (
              <div key={stat.subjectCode} className="rounded-xl border border-border/50 bg-card p-4">
                <h4 className="font-medium text-sm mb-3">{stat.subjectCode}</h4>
                <div className="space-y-2">
                  {Object.entries(stat.gradeDistribution)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([grade, count]) => (
                      <div key={grade} className="flex items-center justify-between text-sm">
                        <span className={cn(
                          'font-mono font-medium',
                          grade.startsWith('A') && 'text-success',
                          grade.startsWith('B') && 'text-primary',
                          grade.startsWith('C') && 'text-foreground',
                          grade.startsWith('D') && 'text-warning',
                          grade.startsWith('F') && 'text-destructive'
                        )}>
                          {grade}
                        </span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
