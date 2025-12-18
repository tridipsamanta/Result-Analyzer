export interface SubjectComponent {
  key: string;      // header name, e.g. "BCACC-103(TH)_ESE"
  label: string;    // short label: e.g. "TH ESE", "PR CIA", "TH SubTotal"
}

export interface Subject {
  id: string;
  code: string;
  fullName: string;
  totalColumn: string;
  orderIndex: number;
  components: SubjectComponent[];
}

export interface MarkComponent {
  key: string;
  label: string;
  value: number | string | null;
}

export interface Mark {
  subjectId: string;
  subjectCode: string;
  totalMarks: number | null;
  letterGrade: string | null;
  creditPoint: number | null;
  components: MarkComponent[];
  // Legacy fields for backwards compatibility
  ese?: number | null;
  cia?: number | null;
}

export interface Student {
  id: string;
  abcId: string;
  rollNo: string;
  name: string;
  grandTotal: number;
  totalCredit: number;
  totalCreditPoint: number;
  sgpa: number;
  remarks: string;
  marks: Mark[];
}

export interface Dataset {
  id: string;
  name: string;
  createdAt: Date;
  totalStudents: number;
  totalSubjects: number;
  subjects: Subject[];
  students: Student[];
  rawText?: string;
}

export interface ParseResult {
  success: boolean;
  dataset?: Dataset;
  errors?: string[];
  rowsParsed: number;
  rowsSkipped: number;
}

export interface SubjectStats {
  subjectCode: string;
  subjectName: string;
  highest: number;
  lowest: number;
  average: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
}

export interface DatasetAnalytics {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  highestSgpa: { student: Student; sgpa: number };
  lowestSgpa: { student: Student; sgpa: number };
  averageSgpa: number;
  subjectStats: SubjectStats[];
  sgpaDistribution: { range: string; count: number }[];
}

export interface ComparisonResult {
  student1: Student;
  student2: Student;
  subjectComparisons: {
    subjectCode: string;
    subjectName: string;
    student1Marks: number | null;
    student2Marks: number | null;
    difference: number | null;
    winner: 'student1' | 'student2' | 'tie' | null;
  }[];
  overallComparison: {
    grandTotal: { student1: number; student2: number; winner: string };
    sgpa: { student1: number; student2: number; winner: string };
  };
}
