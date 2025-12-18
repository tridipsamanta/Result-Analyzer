import { Mark, Subject } from '@/types/dataset';
import { cn } from '@/lib/utils';
import { Fragment, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SubjectMarksTableProps {
  marks: Mark[];
  subjects: Subject[];
}

export function SubjectMarksTable({ marks, subjects }: SubjectMarksTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);
  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-muted-foreground';
    if (grade.startsWith('A')) return 'text-success';
    if (grade.startsWith('B')) return 'text-primary';
    if (grade.startsWith('C')) return 'text-foreground';
    if (grade.startsWith('D')) return 'text-warning';
    return 'text-destructive';
  };
  
  const getMarksColor = (marks: number | null) => {
    if (marks === null) return 'text-muted-foreground';
    if (marks >= 80) return 'text-success';
    if (marks >= 60) return 'text-primary';
    if (marks >= 40) return 'text-foreground';
    return 'text-destructive';
  };
  
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Subject</TableHead>
            <TableHead className="text-center font-semibold">Code</TableHead>
            <TableHead className="text-center font-semibold">Total</TableHead>
            <TableHead className="text-center font-semibold">Grade</TableHead>
            <TableHead className="text-center font-semibold">Credit Point</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marks.map((mark) => {
            const subject = subjects.find(s => s.code === mark.subjectCode);
            const isExpanded = expanded === mark.subjectId;
            return (
              <Fragment key={mark.subjectId}>
                <TableRow onClick={() => toggle(mark.subjectId)} className="hover:bg-muted/10 cursor-pointer">
                  <TableCell className="font-medium">
                    {subject?.fullName || mark.subjectCode}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-muted-foreground">
                    {mark.subjectCode}
                  </TableCell>
                  <TableCell className={cn('text-center font-bold', getMarksColor(mark.totalMarks))}>
                    {mark.totalMarks ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn('font-semibold', getGradeColor(mark.letterGrade))}>
                      {mark.letterGrade || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {mark.creditPoint?.toFixed(1) ?? '-'}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow className="bg-muted/10">
                    <TableCell colSpan={5}>
                      <div className="p-3 rounded-md bg-card/40">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {(mark.components || []).map(c => (
                            <div key={c.key} className="flex justify-between">
                              <span className="text-muted-foreground">{c.label}</span>
                              <span className="font-medium">{c.value ?? '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
