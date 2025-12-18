import { useState } from 'react';
import { Check, ChevronsUpDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Student } from '@/types/dataset';

interface CompareSelectorProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelect: (student: Student) => void;
  label: string;
  excludeId?: string;
}

export function CompareSelector({ 
  students, 
  selectedStudent, 
  onSelect, 
  label,
  excludeId 
}: CompareSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const filteredStudents = excludeId 
    ? students.filter(s => s.id !== excludeId)
    : students;
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-input border-border/50"
          >
            {selectedStudent ? (
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-primary" />
                <span className="truncate">{selectedStudent.name}</span>
                <span className="text-muted-foreground text-xs">({selectedStudent.rollNo})</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select student...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search students..." />
            <CommandList>
              <CommandEmpty>No student found.</CommandEmpty>
              <CommandGroup>
                {filteredStudents.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={`${student.name} ${student.rollNo} ${student.abcId}`}
                    onSelect={() => {
                      onSelect(student);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedStudent?.id === student.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1 truncate">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {student.rollNo}
                      </span>
                    </div>
                    <span className="text-primary font-mono text-sm">
                      {student.sgpa.toFixed(2)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
