import { ComparisonResult } from '@/types/dataset';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompareTableProps {
  comparison: ComparisonResult;
}

export function CompareTable({ comparison }: CompareTableProps) {
  const { student1, student2, subjectComparisons, overallComparison } = comparison;
  
  const getWinnerIcon = (winner: 'student1' | 'student2' | 'tie' | null) => {
    if (winner === 'student1') return <TrendingUp className="w-4 h-4 text-success" />;
    if (winner === 'student2') return <TrendingDown className="w-4 h-4 text-destructive" />;
    if (winner === 'tie') return <Minus className="w-4 h-4 text-muted-foreground" />;
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Subject comparison */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="text-center font-semibold text-primary">
                {student1.name}
              </TableHead>
              <TableHead className="text-center font-semibold text-purple-400">
                {student2.name}
              </TableHead>
              <TableHead className="text-center font-semibold">Diff</TableHead>
              <TableHead className="text-center font-semibold">Winner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjectComparisons.map((comp) => (
              <TableRow key={comp.subjectCode} className="hover:bg-muted/10">
                <TableCell>
                  <div>
                    <span className="font-medium">{comp.subjectName}</span>
                    <span className="text-xs text-muted-foreground ml-2">({comp.subjectCode})</span>
                  </div>
                </TableCell>
                <TableCell className={cn(
                  'text-center font-bold',
                  comp.winner === 'student1' && 'text-success'
                )}>
                  {comp.student1Marks ?? '-'}
                </TableCell>
                <TableCell className={cn(
                  'text-center font-bold',
                  comp.winner === 'student2' && 'text-success'
                )}>
                  {comp.student2Marks ?? '-'}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {comp.difference !== null ? (
                    <span className={cn(
                      comp.difference > 0 ? 'text-success' : 
                      comp.difference < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {comp.difference > 0 ? '+' : ''}{comp.difference}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {getWinnerIcon(comp.winner)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Overall comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-card">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Grand Total</h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{overallComparison.grandTotal.student1}</p>
              <p className="text-xs text-muted-foreground">{student1.name}</p>
            </div>
            <div className="text-sm font-medium text-muted-foreground">vs</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{overallComparison.grandTotal.student2}</p>
              <p className="text-xs text-muted-foreground">{student2.name}</p>
            </div>
          </div>
          <p className="text-center text-sm mt-3 text-success font-medium">
            Winner: {overallComparison.grandTotal.winner}
          </p>
        </div>
        
        <div className="rounded-xl border border-border/50 p-4 bg-card">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">SGPA</h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{overallComparison.sgpa.student1.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{student1.name}</p>
            </div>
            <div className="text-sm font-medium text-muted-foreground">vs</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{overallComparison.sgpa.student2.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{student2.name}</p>
            </div>
          </div>
          <p className="text-center text-sm mt-3 text-success font-medium">
            Winner: {overallComparison.sgpa.winner}
          </p>
        </div>
      </div>
    </div>
  );
}
