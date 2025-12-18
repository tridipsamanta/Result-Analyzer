import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { GitCompare, BarChart3, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompareSelector } from '@/components/compare/CompareSelector';
import { CompareTable } from '@/components/compare/CompareTable';
import { CompareChart } from '@/components/charts/CompareChart';
import { useDatasetStore } from '@/store/datasetStore';
import { compareStudents } from '@/lib/analytics';
import { Student } from '@/types/dataset';

export default function Compare() {
  const { currentDataset } = useDatasetStore();
  const [searchParams] = useSearchParams();
  
  const [student1, setStudent1] = useState<Student | null>(null);
  const [student2, setStudent2] = useState<Student | null>(null);
  
  // Initialize from URL params
  useEffect(() => {
    if (!currentDataset) return;
    
    const s1Id = searchParams.get('student1');
    const s2Id = searchParams.get('student2');
    
    if (s1Id) {
      const found = currentDataset.students.find(s => s.id === s1Id);
      if (found) setStudent1(found);
    }
    
    if (s2Id) {
      const found = currentDataset.students.find(s => s.id === s2Id);
      if (found) setStudent2(found);
    }
  }, [currentDataset, searchParams]);
  
  const comparison = useMemo(() => {
    if (!student1 || !student2 || !currentDataset) return null;
    return compareStudents(student1, student2, currentDataset.subjects);
  }, [student1, student2, currentDataset]);
  
  if (!currentDataset) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <GitCompare className="w-6 h-6 text-primary" />
            Compare Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Select two students to compare their performance across all subjects.
          </p>
        </div>
        
        {/* Selectors */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <span className="font-semibold">First Student</span>
            </div>
            <CompareSelector
              students={currentDataset.students}
              selectedStudent={student1}
              onSelect={setStudent1}
              label="Select Student"
              excludeId={student2?.id}
            />
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <span className="font-semibold">Second Student</span>
            </div>
            <CompareSelector
              students={currentDataset.students}
              selectedStudent={student2}
              onSelect={setStudent2}
              label="Select Student"
              excludeId={student1?.id}
            />
          </div>
        </div>
        
        {/* Comparison Results */}
        {comparison ? (
          <div className="space-y-8">
            {/* Chart */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Visual Comparison
              </h3>
              <CompareChart comparison={comparison} />
            </div>
            
            {/* Table */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Detailed Comparison
              </h3>
              <CompareTable comparison={comparison} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-border/50 bg-card">
            <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Select Two Students</h3>
            <p className="text-muted-foreground">
              Choose two students above to see their performance comparison.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
