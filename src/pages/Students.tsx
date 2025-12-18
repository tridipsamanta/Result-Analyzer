import { useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Filter, ArrowUpDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudentSearchBar } from '@/components/search/StudentSearchBar';
import { StudentCard } from '@/components/results/StudentCard';
import { useDatasetStore } from '@/store/datasetStore';
import { searchStudents } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'sgpa-desc' | 'sgpa-asc' | 'name-asc' | 'name-desc' | 'total-desc' | 'total-asc';

export default function Students() {
  const { currentDataset } = useDatasetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('sgpa-desc');
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const filteredAndSortedStudents = useMemo(() => {
    if (!currentDataset) return [];
    
    let students = searchQuery 
      ? searchStudents(currentDataset.students, searchQuery)
      : currentDataset.students;
    
    // Sort
    switch (sortBy) {
      case 'sgpa-desc':
        students = [...students].sort((a, b) => b.sgpa - a.sgpa);
        break;
      case 'sgpa-asc':
        students = [...students].sort((a, b) => a.sgpa - b.sgpa);
        break;
      case 'name-asc':
        students = [...students].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        students = [...students].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'total-desc':
        students = [...students].sort((a, b) => b.grandTotal - a.grandTotal);
        break;
      case 'total-asc':
        students = [...students].sort((a, b) => a.grandTotal - b.grandTotal);
        break;
    }
    
    return students;
  }, [currentDataset, searchQuery, sortBy]);
  
  if (!currentDataset) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentDataset.totalStudents} students in {currentDataset.name}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <StudentSearchBar 
            onSearch={handleSearch}
            className="flex-1"
          />
          
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px] bg-input border-border/50">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sgpa-desc">SGPA (High to Low)</SelectItem>
              <SelectItem value="sgpa-asc">SGPA (Low to High)</SelectItem>
              <SelectItem value="total-desc">Total (High to Low)</SelectItem>
              <SelectItem value="total-asc">Total (Low to High)</SelectItem>
              <SelectItem value="name-asc">Name (A to Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z to A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedStudents.length} of {currentDataset.totalStudents} students
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        
        {/* Student Grid */}
        {filteredAndSortedStudents.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedStudents.map((student, index) => (
              <StudentCard 
                key={student.id} 
                student={student}
                rank={sortBy === 'sgpa-desc' && !searchQuery ? index + 1 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No students found</h3>
            <p className="text-muted-foreground">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
