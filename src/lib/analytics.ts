import { Dataset, Student, SubjectStats, DatasetAnalytics, ComparisonResult } from '@/types/dataset';

export function calculateDatasetAnalytics(dataset: Dataset): DatasetAnalytics {
  const { students, subjects } = dataset;
  
  // Pass/fail analysis
  const passedStudents = students.filter(s => s.remarks === 'Q' || s.remarks.includes('Q'));
  const failedStudents = students.filter(s => s.remarks === 'NQ' || !s.remarks.includes('Q'));
  
  // SGPA analysis
  const sgpaValues = students.map(s => s.sgpa).filter(s => s > 0);
  const sortedBySgpa = [...students].sort((a, b) => b.sgpa - a.sgpa);
  
  const highestSgpaStudent = sortedBySgpa[0];
  const lowestSgpaStudent = sortedBySgpa[sortedBySgpa.length - 1];
  const averageSgpa = sgpaValues.length > 0 
    ? sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length 
    : 0;
  
  // Subject stats
  const subjectStats: SubjectStats[] = subjects.map(subject => {
    const marksForSubject = students
      .map(s => s.marks.find(m => m.subjectCode === subject.code))
      .filter(m => m && m.totalMarks !== null)
      .map(m => m!.totalMarks!);
    
    const grades = students
      .map(s => s.marks.find(m => m.subjectCode === subject.code))
      .filter(m => m && m.letterGrade)
      .map(m => m!.letterGrade!);
    
    const gradeDistribution: Record<string, number> = {};
    grades.forEach(g => {
      gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
    });
    
    const highest = Math.max(...marksForSubject, 0);
    const lowest = Math.min(...marksForSubject, 0);
    const average = marksForSubject.length > 0
      ? marksForSubject.reduce((a, b) => a + b, 0) / marksForSubject.length
      : 0;
    
    // Pass rate (assuming 40% is passing)
    const passingMarks = marksForSubject.filter(m => m >= 40);
    const passRate = marksForSubject.length > 0
      ? (passingMarks.length / marksForSubject.length) * 100
      : 0;
    
    return {
      subjectCode: subject.code,
      subjectName: subject.fullName,
      highest,
      lowest,
      average,
      passRate,
      gradeDistribution,
    };
  });
  
  // SGPA distribution
  const sgpaRanges = [
    { range: '9.0 - 10.0', min: 9.0, max: 10.0 },
    { range: '8.0 - 8.9', min: 8.0, max: 8.9 },
    { range: '7.0 - 7.9', min: 7.0, max: 7.9 },
    { range: '6.0 - 6.9', min: 6.0, max: 6.9 },
    { range: '5.0 - 5.9', min: 5.0, max: 5.9 },
    { range: '< 5.0', min: 0, max: 4.9 },
  ];
  
  const sgpaDistribution = sgpaRanges.map(({ range, min, max }) => ({
    range,
    count: students.filter(s => s.sgpa >= min && s.sgpa <= max).length,
  }));
  
  return {
    totalStudents: students.length,
    passedStudents: passedStudents.length,
    failedStudents: failedStudents.length,
    passRate: (passedStudents.length / students.length) * 100,
    highestSgpa: { student: highestSgpaStudent, sgpa: highestSgpaStudent?.sgpa || 0 },
    lowestSgpa: { student: lowestSgpaStudent, sgpa: lowestSgpaStudent?.sgpa || 0 },
    averageSgpa,
    subjectStats,
    sgpaDistribution,
  };
}

export function compareStudents(student1: Student, student2: Student, subjects: { code: string; fullName: string }[]): ComparisonResult {
  const subjectComparisons = subjects.map(subject => {
    const mark1 = student1.marks.find(m => m.subjectCode === subject.code);
    const mark2 = student2.marks.find(m => m.subjectCode === subject.code);
    
    const s1Marks = mark1?.totalMarks ?? null;
    const s2Marks = mark2?.totalMarks ?? null;
    
    let difference: number | null = null;
    let winner: 'student1' | 'student2' | 'tie' | null = null;
    
    if (s1Marks !== null && s2Marks !== null) {
      difference = s1Marks - s2Marks;
      winner = difference > 0 ? 'student1' : difference < 0 ? 'student2' : 'tie';
    }
    
    return {
      subjectCode: subject.code,
      subjectName: subject.fullName,
      student1Marks: s1Marks,
      student2Marks: s2Marks,
      difference,
      winner,
    };
  });
  
  return {
    student1,
    student2,
    subjectComparisons,
    overallComparison: {
      grandTotal: {
        student1: student1.grandTotal,
        student2: student2.grandTotal,
        winner: student1.grandTotal > student2.grandTotal ? student1.name : 
                student1.grandTotal < student2.grandTotal ? student2.name : 'Tie',
      },
      sgpa: {
        student1: student1.sgpa,
        student2: student2.sgpa,
        winner: student1.sgpa > student2.sgpa ? student1.name :
                student1.sgpa < student2.sgpa ? student2.name : 'Tie',
      },
    },
  };
}

export function searchStudents(students: Student[], query: string): Student[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return students;
  
  return students.filter(student =>
    student.name.toLowerCase().includes(lowerQuery) ||
    student.rollNo.toLowerCase().includes(lowerQuery) ||
    student.abcId.toLowerCase().includes(lowerQuery)
  );
}

export function getTopPerformers(students: Student[], count: number = 5): Student[] {
  return [...students].sort((a, b) => b.sgpa - a.sgpa).slice(0, count);
}

export function getSubjectToppers(students: Student[], subjectCode: string): Student[] {
  return [...students]
    .filter(s => s.marks.some(m => m.subjectCode === subjectCode && m.totalMarks !== null))
    .sort((a, b) => {
      const aMarks = a.marks.find(m => m.subjectCode === subjectCode)?.totalMarks || 0;
      const bMarks = b.marks.find(m => m.subjectCode === subjectCode)?.totalMarks || 0;
      return bMarks - aMarks;
    })
    .slice(0, 5);
}
