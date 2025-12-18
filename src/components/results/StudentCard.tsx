import { Link } from 'react-router-dom';
import { User, Award, BookOpen, ArrowRight } from 'lucide-react';
import { Student } from '@/types/dataset';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  rank?: number;
}

export function StudentCard({ student, rank }: StudentCardProps) {
  const getSgpaColor = (sgpa: number) => {
    if (sgpa >= 9) return 'text-success';
    if (sgpa >= 8) return 'text-primary';
    if (sgpa >= 7) return 'text-foreground';
    if (sgpa >= 6) return 'text-warning';
    return 'text-destructive';
  };
  
  const getRemarksColor = (remarks: string) => {
    if (remarks === 'Q') return 'bg-success/20 text-success';
    if (remarks.includes('Q')) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };
  
  return (
    <Link
      to={`/students/${student.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 hover-lift transition-all hover:border-primary/30">
        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div className={cn(
            'absolute -top-2 -right-2 w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold',
            rank === 1 && 'bg-warning text-warning-foreground',
            rank === 2 && 'bg-muted text-muted-foreground',
            rank === 3 && 'bg-orange-600 text-white'
          )}>
            #{rank}
          </div>
        )}
        
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {student.name}
            </h3>
            <p className="text-sm text-muted-foreground">{student.rollNo}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{student.abcId}</p>
          </div>
          
          {/* Stats */}
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 justify-end">
              <Award className="w-4 h-4 text-primary" />
              <span className={cn('text-xl font-bold', getSgpaColor(student.sgpa))}>
                {student.sgpa.toFixed(2)}
              </span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', getRemarksColor(student.remarks))}>
              {student.remarks}
            </span>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{student.grandTotal}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Credits: </span>
              <span className="font-semibold">{student.totalCredit}</span>
            </div>
          </div>
          
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
