import { Dataset, Student, Subject, Mark, ParseResult, SubjectComponent, MarkComponent } from '@/types/dataset';

const generateId = () => Math.random().toString(36).substring(2, 15);

interface ComponentColumn {
  key: string;      // Full header name
  label: string;    // Short label like "TH ESE", "PR CIA"
  headerIndex: number;
}

interface SubjectInfo {
  code: string;
  totHeader: string;
  gradeHeader: string;
  creditHeader: string;
  totIndex: number;
  gradeIndex: number;
  creditIndex: number;
  components: ComponentColumn[];
}

interface ParsedHeaderInfo {
  headers: string[];
  subjects: SubjectInfo[];
  subjectNameValues: Map<string, string>;
  subjectNameColumns: Map<string, number>; // prefix -> header index for _SUBJECT columns
  studentIdIndex: number;
  abcIdIndex: number;
  rollNoIndex: number;
  nameIndex: number;
  grandTotalIndex: number;
  totalCreditIndex: number;
  totalCreditPointIndex: number;
  sgpaIndex: number;
  remarksIndex: number;
}

// Map from prefixed code to simple code
// e.g., "BCACC-103" -> "CC103", "BCASEC-102" -> "SEC-102"
function normalizeSubjectCode(prefixedCode: string): string {
  // Remove common prefixes
  let code = prefixedCode
    .replace(/^BCA/i, '')
    .replace(/^BCA-?/i, '')
    .trim();
  
  // Handle cases like "CC-103" -> "CC103"
  code = code.replace(/^(CC|SEC|VAC|AEC|DSC|IDM|MDC|GE)-?(\d+)/i, '$1$2');
  
  return code.toUpperCase();
}

// Extract subject code from a component header by removing the _ESE/_CIA/_SUBTOT suffix
// e.g., "DSC-401(TH)_ESE" -> "DSC-401(TH)"
// e.g., "BCACC-103(TH)_ESE" -> "BCACC-103(TH)" 
// e.g., "BCACC-104(PR)_CIA" -> "BCACC-104(PR)"
function extractComponentSubjectCode(header: string): string | null {
  const match = header.match(/^(.+?)_(ESE|CIA|SUBTOT)$/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}

// Check if two codes match, accounting for prefixes like BCA
// e.g., "BCACC-103(TH)" matches "CC103" (via normalization)
// e.g., "DSC-401(TH)" matches "DSC-401(TH)" exactly
function codesMatch(code1: string, code2: string): boolean {
  if (code1 === code2) return true;
  
  // Try normalizing both
  const norm1 = normalizeSubjectCode(code1.replace(/\((TH|PR\/TU|PR|TU)\)/gi, '')).replace(/-/g, '');
  const norm2 = normalizeSubjectCode(code2.replace(/\((TH|PR\/TU|PR|TU)\)/gi, '')).replace(/-/g, '');
  
  if (norm1 === norm2) return true;
  
  // Check if one contains the type suffix and matches
  const baseCode1 = code1.replace(/\((TH|PR\/TU|PR|TU)\)$/i, '');
  const baseCode2 = code2.replace(/\((TH|PR\/TU|PR|TU)\)$/i, '');
  
  const normBase1 = normalizeSubjectCode(baseCode1).replace(/-/g, '');
  const normBase2 = normalizeSubjectCode(baseCode2).replace(/-/g, '');
  
  return normBase1 === normBase2;
}

// Get short label from component header
// e.g., "BCACC-103(TH)_ESE" -> "TH ESE"
// e.g., "BCACC-104(PR)_CIA" -> "PR CIA"
// e.g., "BCACC-104(TH)_SUBTOT" -> "TH SubTotal"
// e.g., "DSC-401(TH)_ESE" -> "ESE" (no TH prefix needed since code already has it)
function getComponentLabel(header: string): string {
  const parts: string[] = [];
  
  // Extract suffix (ESE, CIA, SUBTOT)
  if (/_ESE$/i.test(header)) {
    parts.push('ESE');
  } else if (/_CIA$/i.test(header)) {
    parts.push('CIA');
  } else if (/_SUBTOT$/i.test(header)) {
    parts.push('SubTotal');
  }
  
  return parts.join(' ') || header;
}

// Extract subject code from _TOT header
function extractSubjectCodeFromTot(header: string): string | null {
  const match = header.match(/^(.+?)_TOT$/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}

// Get the prefix for _SUBJECT lookup
// e.g., "IDM4(TH)" -> "IDM", "VAC2(TH)" -> "VAC", "AEC4(TH)" -> "AEC"
function getSubjectPrefix(code: string): string {
  const prefixMatch = code.match(/^(IDM|MDC|VAC|AEC)[-]?\d*/i);
  if (prefixMatch) {
    return prefixMatch[1].toUpperCase();
  }
  return '';
}

// Extract the type suffix from code: (TH) -> "Theory", (PR/TU) -> "Practical", (TU) -> "Tutorial", (PR) -> "Practical"
function getTypeLabel(code: string): string | null {
  if (/\(TH\)$/i.test(code)) return 'Theory';
  if (/\(PR\/TU\)$/i.test(code)) return 'Practical';
  if (/\(PR\)$/i.test(code)) return 'Practical';
  if (/\(TU\)$/i.test(code)) return 'Tutorial';
  return null;
}

// Extract base code without type suffix: "DSC-401(TH)" -> "DSC-401"
function getBaseCode(code: string): string {
  return code.replace(/\((TH|PR\/TU|PR|TU)\)$/i, '').trim();
}

// Generate display name from code with proper Theory/Practical labels
function generateDisplayName(code: string, subjectNameFromColumn?: string): string {
  const typeLabel = getTypeLabel(code);
  const baseCode = getBaseCode(code);
  
  // If we have a subject name from _SUBJECT column, use it as prefix
  if (subjectNameFromColumn) {
    if (typeLabel) {
      return `${subjectNameFromColumn} – ${baseCode} (${typeLabel})`;
    }
    return `${subjectNameFromColumn} – ${baseCode}`;
  }
  
  // If code has (TH) or (PR/TU), generate "BaseCode (Theory)" or "BaseCode (Practical)"
  if (typeLabel) {
    return `${baseCode} (${typeLabel})`;
  }
  
  // Fallback: just return the code as-is
  return code;
}

// Check if header is a component column (ESE, CIA, SUBTOT)
function isComponentHeader(header: string): boolean {
  return /\((TH|PR|TU)\)_(ESE|CIA|SUBTOT)$/i.test(header);
}

function parseHeaders(lines: string[]): { headerInfo: ParsedHeaderInfo; dataStartIndex: number } {
  const headers: string[] = [];
  let dataStartIndex = 0;
  let foundFM = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    if (line.startsWith('F.M.:') || line.toUpperCase() === 'FULL MARKS') {
      foundFM = true;
      continue;
    }
    
    const tokens = line.split(/\s+/);
    if (foundFM && tokens.length > 10 && /^\d+$/.test(tokens[0])) {
      dataStartIndex = i;
      break;
    }
    
    if (!foundFM) {
      headers.push(line);
    }
  }
  
  // Find all _TOT columns first to identify subjects
  const subjectMap = new Map<string, SubjectInfo>();
  
  headers.forEach((header, index) => {
    const code = extractSubjectCodeFromTot(header);
    if (!code) return;
    
    // Skip summary columns
    if (['GRAND', 'FULL'].some(skip => header.toUpperCase().includes(skip))) return;
    
    const gradeHeader = `${code} LETTER GRADE`;
    const creditHeader = `${code} CREDIT POINT`;
    const gradeIndex = headers.findIndex(h => h.toUpperCase() === gradeHeader.toUpperCase());
    const creditIndex = headers.findIndex(h => h.toUpperCase() === creditHeader.toUpperCase());
    
    subjectMap.set(code, {
      code,
      totHeader: header,
      gradeHeader,
      creditHeader,
      totIndex: index,
      gradeIndex,
      creditIndex,
      components: [],
    });
  });
  
  // Now find component columns and associate with subjects
  headers.forEach((header, index) => {
    if (!isComponentHeader(header)) return;
    
    // Extract the subject code from component header (e.g., "DSC-401(TH)_ESE" -> "DSC-401(TH)")
    const componentCode = extractComponentSubjectCode(header);
    if (!componentCode) return;
    
    // Find the matching subject
    for (const [code, subj] of subjectMap) {
      if (codesMatch(componentCode, code)) {
        subj.components.push({
          key: header,
          label: getComponentLabel(header),
          headerIndex: index,
        });
        break;
      }
    }
  });
  
  // Sort components by header index for consistent ordering
  for (const subject of subjectMap.values()) {
    subject.components.sort((a, b) => a.headerIndex - b.headerIndex);
  }
  
  // Find _SUBJECT columns for display names
  const subjectNameColumns = new Map<string, number>();
  headers.forEach((header, index) => {
    const match = header.match(/^(IDM|MDC|VAC|AEC)[-_]?\d*_SUBJECT$/i);
    if (match) {
      subjectNameColumns.set(match[1].toUpperCase(), index);
    }
  });
  
  // Find key column indices
  const findIndex = (patterns: string[]) => 
    headers.findIndex(h => patterns.some(p => h.toUpperCase() === p.toUpperCase()));
  
  const subjects = Array.from(subjectMap.values());
  
  return {
    headerInfo: {
      headers,
      subjects,
      subjectNameValues: new Map(),
      subjectNameColumns,
      studentIdIndex: findIndex(['STUDENTID', 'STUDENT ID']),
      abcIdIndex: findIndex(['ABCID', 'ABC ID']),
      rollNoIndex: findIndex(['ROLLNO', 'ROLL NO']),
      nameIndex: headers.findIndex(h => h.toUpperCase().includes('STUDENTNAME') || h.toUpperCase() === 'STUDENT NAME'),
      grandTotalIndex: findIndex(['GRAND TOTAL']),
      totalCreditIndex: findIndex(['TOTAL CREDIT']),
      totalCreditPointIndex: findIndex(['TOTAL CREDIT POINT']),
      sgpaIndex: findIndex(['SGPA']),
      remarksIndex: findIndex(['REMARKS']),
    },
    dataStartIndex,
  };
}

function parseStudentRow(
  tokens: string[],
  headerInfo: ParsedHeaderInfo,
  subjects: Subject[],
  headerToTokenIndex: Map<number, number>
): Student | null {
  if (tokens.length < 15) return null;
  
  let currentIndex = 0;
  
  // Skip serial number
  currentIndex++;
  
  let rollNo = '';
  let abcId = '';
  
  // Check if second token looks like a roll number
  if (/^\d{4}-\d+$/.test(tokens[currentIndex])) {
    rollNo = tokens[currentIndex++];
    
    // ABC ID parts
    const abcIdParts: string[] = [];
    for (let i = 0; i < 4 && currentIndex < tokens.length; i++) {
      if (/^\d+$/.test(tokens[currentIndex]) && tokens[currentIndex].length <= 5) {
        abcIdParts.push(tokens[currentIndex++]);
      } else {
        break;
      }
    }
    abcId = abcIdParts.join(' ');
  } else {
    // Alternative format
    const studentId = tokens[currentIndex++];
    
    if (/^\d{10,}$/.test(tokens[currentIndex]) || /^\d{4}$/.test(tokens[currentIndex])) {
      const abcIdParts: string[] = [];
      for (let i = 0; i < 4 && currentIndex < tokens.length; i++) {
        if (/^\d+$/.test(tokens[currentIndex]) && tokens[currentIndex].length <= 5) {
          abcIdParts.push(tokens[currentIndex++]);
        } else {
          break;
        }
      }
      abcId = abcIdParts.join(' ') || studentId;
    }
    
    if (/^\d{4}-\d+$/.test(tokens[currentIndex])) {
      rollNo = tokens[currentIndex++];
    }
  }
  
  // Student name
  const nameParts: string[] = [];
  while (currentIndex < tokens.length) {
    const token = tokens[currentIndex];
    if (/^[\d.]+$/.test(token) || /^[A-F][+-]?$/.test(token) || token === 'AB' || token === '-') {
      break;
    }
    nameParts.push(token);
    currentIndex++;
  }
  const name = nameParts.join(' ');
  
  if (!name || nameParts.length === 0) return null;
  
  // Remaining tokens are marks data
  const marksData = tokens.slice(currentIndex);
  
  // Build marks for each subject
  const marks: Mark[] = [];
  
  for (const subject of subjects) {
    const subjectInfo = headerInfo.subjects.find(s => s.code === subject.code);
    if (!subjectInfo) continue;
    
    let totalMarks: number | null = null;
    let letterGrade: string | null = null;
    let creditPoint: number | null = null;
    const components: MarkComponent[] = [];
    
    // Get total marks
    const totTokenIdx = headerToTokenIndex.get(subjectInfo.totIndex);
    if (totTokenIdx !== undefined && totTokenIdx < marksData.length) {
      const val = marksData[totTokenIdx];
      totalMarks = val === '-' || val === 'AB' ? null : parseFloat(val) || null;
    }
    
    // Get grade
    if (subjectInfo.gradeIndex !== -1) {
      const gradeTokenIdx = headerToTokenIndex.get(subjectInfo.gradeIndex);
      if (gradeTokenIdx !== undefined && gradeTokenIdx < marksData.length) {
        const val = marksData[gradeTokenIdx];
        if (/^[A-F][+-]?$/.test(val) || val === 'AB') {
          letterGrade = val;
        }
      }
    }
    
    // Get credit point
    if (subjectInfo.creditIndex !== -1) {
      const creditTokenIdx = headerToTokenIndex.get(subjectInfo.creditIndex);
      if (creditTokenIdx !== undefined && creditTokenIdx < marksData.length) {
        const val = marksData[creditTokenIdx];
        creditPoint = val === '-' ? null : parseFloat(val) || null;
      }
    }
    
    // Get component values
    for (const comp of subjectInfo.components) {
      const compTokenIdx = headerToTokenIndex.get(comp.headerIndex);
      let value: number | string | null = null;
      
      if (compTokenIdx !== undefined && compTokenIdx < marksData.length) {
        const val = marksData[compTokenIdx];
        if (val === '-' || val === 'AB') {
          value = val;
        } else if (/^[\d.]+$/.test(val)) {
          value = parseFloat(val);
        } else {
          value = val;
        }
      }
      
      components.push({
        key: comp.key,
        label: comp.label,
        value,
      });
    }
    
    marks.push({
      subjectId: subject.id,
      subjectCode: subject.code,
      totalMarks,
      letterGrade,
      creditPoint,
      components,
    });
  }
  
  // Parse summary fields
  let grandTotal = 0;
  let totalCredit = 0;
  let totalCreditPoint = 0;
  let sgpa = 0;
  let remarks = '';
  
  const numericEnd: number[] = [];
  let remarksValue = '';
  
  for (let i = marksData.length - 1; i >= 0 && numericEnd.length < 5; i--) {
    const val = marksData[i];
    if (/^[\d.]+$/.test(val)) {
      numericEnd.unshift(parseFloat(val));
    } else if (!remarksValue && /^[#Q]+$|^Q$|^NQ$|^##?#?Q$/.test(val)) {
      remarksValue = val;
    }
  }
  
  if (numericEnd.length >= 4) {
    [grandTotal, totalCredit, totalCreditPoint, sgpa] = numericEnd.slice(-4);
  } else if (numericEnd.length >= 1) {
    sgpa = numericEnd[numericEnd.length - 1];
  }
  
  remarks = remarksValue || 'Q';
  
  return {
    id: generateId(),
    abcId,
    rollNo,
    name,
    grandTotal,
    totalCredit,
    totalCreditPoint,
    sgpa,
    remarks,
    marks,
  };
}

export function parseResultText(rawText: string, datasetName?: string): ParseResult {
  const lines = rawText.split('\n').filter(l => l.trim());
  
  if (lines.length < 10) {
    return {
      success: false,
      errors: ['Input text is too short. Please paste the complete result data.'],
      rowsParsed: 0,
      rowsSkipped: 0,
    };
  }
  
  try {
    const { headerInfo, dataStartIndex } = parseHeaders(lines);
    
    if (headerInfo.subjects.length === 0) {
      return {
        success: false,
        errors: ['Could not detect any subject columns. Make sure the data contains *_TOT columns.'],
        rowsParsed: 0,
        rowsSkipped: 0,
      };
    }
    
    // Build mapping from header index to token index in data rows
    // Skip student info columns AND _SUBJECT columns (which contain text values)
    const headerToTokenIndex = new Map<number, number>();
    const subjectColumnIndices = new Set(headerInfo.subjectNameColumns.values());
    let tokenIdx = 0;
    for (let i = 0; i < headerInfo.headers.length; i++) {
      const h = headerInfo.headers[i].toLowerCase();
      const isStudentInfoCol = ['studentid', 'abcid', 'rollno', 'studentname', 'student id', 'abc id', 'roll no', 'student name'].includes(h);
      const isSubjectNameCol = subjectColumnIndices.has(i);
      
      if (!isStudentInfoCol && !isSubjectNameCol) {
        headerToTokenIndex.set(i, tokenIdx++);
      }
    }
    
    // Extract _SUBJECT values from first data row
    const subjectNameValues = new Map<string, string>();
    if (dataStartIndex < lines.length && headerInfo.subjectNameColumns.size > 0) {
      const firstDataLine = lines[dataStartIndex].trim();
      const firstTokens = firstDataLine.split(/\s+/);
      
      // Skip leading tokens (serial, rollNo, abcId parts, name) to get to marks data
      // Find where marks data starts by looking for first pure number or grade after name
      let marksStartIdx = 0;
      let foundName = false;
      for (let i = 1; i < firstTokens.length; i++) {
        const token = firstTokens[i];
        // Skip numeric IDs and roll numbers
        if (/^\d{4}-\d+$/.test(token) || /^\d{4,5}$/.test(token)) continue;
        // Name tokens are non-numeric, non-grade
        if (!/^[\d.]+$/.test(token) && !/^[A-F][+-]?$/.test(token) && token !== '-' && token !== 'AB') {
          foundName = true;
          continue;
        }
        // First numeric/grade after name = start of marks
        if (foundName) {
          marksStartIdx = i;
          break;
        }
      }
      
      const marksTokens = firstTokens.slice(marksStartIdx);
      
      // For each _SUBJECT column, find its value
      for (const [prefix, headerIndex] of headerInfo.subjectNameColumns) {
        const tokenIndex = headerToTokenIndex.get(headerIndex);
        if (tokenIndex !== undefined && tokenIndex < marksTokens.length) {
          const value = marksTokens[tokenIndex];
          // _SUBJECT values are text (e.g., "PHILOSOPHY", "ENGLISH")
          if (value && !/^[\d.]+$/.test(value) && !/^[A-F][+-]?$/.test(value)) {
            subjectNameValues.set(prefix, value);
          }
        }
      }
    }
    
    // Create subjects with proper display names
    const subjects: Subject[] = headerInfo.subjects.map((subj, index) => {
      const prefix = getSubjectPrefix(subj.code);
      const subjectName = prefix ? subjectNameValues.get(prefix) : undefined;
      
      return {
        id: generateId(),
        code: subj.code,
        fullName: generateDisplayName(subj.code, subjectName),
        totalColumn: subj.totHeader,
        orderIndex: index,
        components: subj.components.map(c => ({
          key: c.key,
          label: c.label,
        })),
      };
    });
    
    // Parse student rows
    const students: Student[] = [];
    const errors: string[] = [];
    let rowsParsed = 0;
    let rowsSkipped = 0;
    
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const tokens = line.split(/\s+/);
      if (!/^\d+$/.test(tokens[0])) continue;
      
      const student = parseStudentRow(tokens, headerInfo, subjects, headerToTokenIndex);
      
      if (student && student.name) {
        students.push(student);
        rowsParsed++;
      } else {
        rowsSkipped++;
        if (rowsSkipped <= 5) {
          errors.push(`Could not parse row ${i + 1}`);
        }
      }
    }
    
    if (students.length === 0) {
      return {
        success: false,
        errors: ['No student records could be parsed. Please check the format.'],
        rowsParsed: 0,
        rowsSkipped: lines.length,
      };
    }
    
    const dataset: Dataset = {
      id: generateId(),
      name: datasetName || `Result - ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      totalStudents: students.length,
      totalSubjects: subjects.length,
      subjects,
      students,
      rawText,
    };
    
    return {
      success: true,
      dataset,
      errors: errors.length > 0 ? errors : undefined,
      rowsParsed,
      rowsSkipped,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      rowsParsed: 0,
      rowsSkipped: 0,
    };
  }
}

// Simplified parser
export function parseSimplifiedFormat(rawText: string, datasetName?: string): ParseResult {
  const lines = rawText.split('\n');
  const headers: string[] = [];
  let dataStartIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('F.M.:')) continue;
    
    if (/^\d+\s+(\d{4}-\d+|\d{10,})/.test(line)) {
      dataStartIndex = i;
      break;
    }
    
    headers.push(line);
  }
  
  // Find subjects from _TOT columns
  const subjectMap = new Map<string, SubjectInfo>();
  
  headers.forEach((header, index) => {
    const match = header.match(/^(.+?)_TOT$/i);
    if (!match) return;
    
    const code = match[1].toUpperCase();
    if (['GRAND', 'FULL'].some(skip => code.includes(skip))) return;
    
    const gradeIndex = headers.findIndex(h => h.toUpperCase() === `${code} LETTER GRADE`);
    const creditIndex = headers.findIndex(h => h.toUpperCase() === `${code} CREDIT POINT`);
    
    subjectMap.set(code, {
      code,
      totHeader: header,
      gradeHeader: `${code} LETTER GRADE`,
      creditHeader: `${code} CREDIT POINT`,
      totIndex: index,
      gradeIndex,
      creditIndex,
      components: [],
    });
  });
  
  // Find component columns
  headers.forEach((header, index) => {
    if (!isComponentHeader(header)) return;
    
    const componentCode = extractComponentSubjectCode(header);
    if (!componentCode) return;
    
    for (const [code, subj] of subjectMap) {
      if (codesMatch(componentCode, code)) {
        subj.components.push({
          key: header,
          label: getComponentLabel(header),
          headerIndex: index,
        });
        break;
      }
    }
  });
  
  // Sort components
  for (const subject of subjectMap.values()) {
    subject.components.sort((a, b) => a.headerIndex - b.headerIndex);
  }
  
  if (subjectMap.size === 0) {
    return {
      success: false,
      errors: ['No subject columns detected.'],
      rowsParsed: 0,
      rowsSkipped: 0,
    };
  }
  
  // Find _SUBJECT columns for display names
  const subjectNameColumns = new Map<string, number>();
  headers.forEach((header, index) => {
    const match = header.match(/^(IDM|MDC|VAC|AEC)[-_]?\d*_SUBJECT$/i);
    if (match) {
      subjectNameColumns.set(match[1].toUpperCase(), index);
    }
  });
  
  // Build header to token index mapping (skip student info columns AND _SUBJECT columns)
  const subjectColIndices = new Set(subjectNameColumns.values());
  const headerToTokenIndex = new Map<number, number>();
  let tokenIdx = 0;
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    const isStudentInfo = ['studentid', 'abcid', 'rollno', 'studentname', 'student id', 'abc id', 'roll no', 'student name'].includes(h);
    const isSubjectNameCol = subjectColIndices.has(i);
    
    if (!isStudentInfo && !isSubjectNameCol) {
      headerToTokenIndex.set(i, tokenIdx++);
    }
  }
  
  // Extract _SUBJECT values from first data row
  const subjectNameValues = new Map<string, string>();
  if (dataStartIndex < lines.length && subjectNameColumns.size > 0) {
    const firstDataLine = lines[dataStartIndex].trim();
    const firstTokens = firstDataLine.split(/\s+/);
    
    // Skip leading tokens to get to marks data
    let marksStartIdx = 0;
    let foundName = false;
    for (let i = 1; i < firstTokens.length; i++) {
      const token = firstTokens[i];
      if (/^\d{4}-\d+$/.test(token) || /^\d{4,5}$/.test(token)) continue;
      if (!/^[\d.]+$/.test(token) && !/^[A-F][+-]?$/.test(token) && token !== '-' && token !== 'AB') {
        foundName = true;
        continue;
      }
      if (foundName) {
        marksStartIdx = i;
        break;
      }
    }
    
    const marksTokens = firstTokens.slice(marksStartIdx);
    
    for (const [prefix, headerIndex] of subjectNameColumns) {
      const tIdx = headerToTokenIndex.get(headerIndex);
      if (tIdx !== undefined && tIdx < marksTokens.length) {
        const value = marksTokens[tIdx];
        if (value && !/^[\d.]+$/.test(value) && !/^[A-F][+-]?$/.test(value)) {
          subjectNameValues.set(prefix, value);
        }
      }
    }
  }
  
  const subjectInfos = Array.from(subjectMap.values());
  const subjects: Subject[] = subjectInfos.map((subj, index) => {
    const prefix = getSubjectPrefix(subj.code);
    const subjectName = prefix ? subjectNameValues.get(prefix) : undefined;
    
    return {
      id: generateId(),
      code: subj.code,
      fullName: generateDisplayName(subj.code, subjectName),
      totalColumn: subj.totHeader,
      orderIndex: index,
      components: subj.components.map(c => ({
        key: c.key,
        label: c.label,
      })),
    };
  });
  
  const students: Student[] = [];
  let rowsParsed = 0;
  let rowsSkipped = 0;
  const errors: string[] = [];
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !/^\d+\s/.test(line)) continue;
    
    const tokens = line.split(/\s+/);
    if (tokens.length < 20) {
      rowsSkipped++;
      continue;
    }
    
    try {
      let idx = 1;
      let rollNo = '';
      let abcId = '';
      
      if (/^\d{4}-\d+$/.test(tokens[idx])) {
        rollNo = tokens[idx++];
      } else {
        idx++;
      }
      
      const abcParts: string[] = [];
      for (let j = 0; j < 4 && idx < tokens.length; j++) {
        if (/^\d{4,5}$/.test(tokens[idx])) {
          abcParts.push(tokens[idx++]);
        } else {
          break;
        }
      }
      abcId = abcParts.join(' ');
      
      if (!rollNo && /^\d{4}-\d+$/.test(tokens[idx])) {
        rollNo = tokens[idx++];
      }
      
      const nameParts: string[] = [];
      while (idx < tokens.length) {
        if (/^[\d.]+$/.test(tokens[idx]) || /^[A-F][+-]?$/.test(tokens[idx]) || tokens[idx] === '-' || tokens[idx] === 'AB') {
          break;
        }
        nameParts.push(tokens[idx++]);
      }
      const name = nameParts.join(' ');
      
      if (!name) {
        rowsSkipped++;
        continue;
      }
      
      const marksTokens = tokens.slice(idx);
      const marks: Mark[] = [];
      
      for (let si = 0; si < subjectInfos.length; si++) {
        const subjectInfo = subjectInfos[si];
        const subject = subjects[si];
        const components: MarkComponent[] = [];
        
        // Parse component values using header mapping
        for (const comp of subjectInfo.components) {
          const compTokenIdx = headerToTokenIndex.get(comp.headerIndex);
          let value: number | string | null = null;
          
          if (compTokenIdx !== undefined && compTokenIdx < marksTokens.length) {
            const val = marksTokens[compTokenIdx];
            if (val === '-' || val === 'AB') {
              value = val;
            } else if (/^[\d.]+$/.test(val)) {
              value = parseFloat(val);
            }
          }
          
          components.push({
            key: comp.key,
            label: comp.label,
            value,
          });
        }
        
        // Total - use header mapping
        let totalMarks: number | null = null;
        const totTokenIdx = headerToTokenIndex.get(subjectInfo.totIndex);
        if (totTokenIdx !== undefined && totTokenIdx < marksTokens.length) {
          const totVal = marksTokens[totTokenIdx];
          totalMarks = (totVal === '-' || totVal === 'AB') ? null : parseFloat(totVal) || null;
        }
        
        // Grade
        let letterGrade: string | null = null;
        if (subjectInfo.gradeIndex !== -1) {
          const gradeTokenIdx = headerToTokenIndex.get(subjectInfo.gradeIndex);
          if (gradeTokenIdx !== undefined && gradeTokenIdx < marksTokens.length) {
            const gradeVal = marksTokens[gradeTokenIdx];
            if (/^[A-F][+-]?$/.test(gradeVal) || gradeVal === 'AB') {
              letterGrade = gradeVal;
            }
          }
        }
        
        // Credit
        let creditPoint: number | null = null;
        if (subjectInfo.creditIndex !== -1) {
          const creditTokenIdx = headerToTokenIndex.get(subjectInfo.creditIndex);
          if (creditTokenIdx !== undefined && creditTokenIdx < marksTokens.length) {
            const creditVal = marksTokens[creditTokenIdx];
            creditPoint = creditVal === '-' ? null : parseFloat(creditVal) || null;
          }
        }
        
        marks.push({
          subjectId: subject.id,
          subjectCode: subject.code,
          totalMarks,
          letterGrade,
          creditPoint,
          components,
        });
      }
      
      // Summary values
      const endTokens = marksTokens.slice(-6);
      let grandTotal = 0, totalCredit = 0, totalCreditPoint = 0, sgpa = 0;
      let remarks = 'Q';
      
      const numericEnd: number[] = [];
      for (const t of endTokens) {
        if (/^[\d.]+$/.test(t)) {
          numericEnd.push(parseFloat(t));
        } else if (/^[#Q]+$|^Q$|^NQ$/.test(t)) {
          remarks = t;
        }
      }
      
      if (numericEnd.length >= 4) {
        [grandTotal, totalCredit, totalCreditPoint, sgpa] = numericEnd.slice(-4);
      }
      
      students.push({
        id: generateId(),
        abcId,
        rollNo,
        name,
        grandTotal,
        totalCredit,
        totalCreditPoint,
        sgpa,
        remarks,
        marks,
      });
      
      rowsParsed++;
    } catch (e) {
      rowsSkipped++;
      errors.push(`Error parsing line ${i + 1}`);
    }
  }
  
  if (students.length === 0) {
    return {
      success: false,
      errors: ['No student records could be parsed.'],
      rowsParsed: 0,
      rowsSkipped,
    };
  }
  
  return {
    success: true,
    dataset: {
      id: generateId(),
      name: datasetName || `Result Analysis - ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      totalStudents: students.length,
      totalSubjects: subjects.length,
      subjects,
      students,
      rawText,
    },
    rowsParsed,
    rowsSkipped,
    errors: errors.length > 0 ? errors : undefined,
  };
}
