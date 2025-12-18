import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudentSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function StudentSearchBar({ onSearch, placeholder, className }: StudentSearchBarProps) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(query);
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [query, onSearch]);
  
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search by name, roll number, or ABC ID...'}
        className="pl-10 pr-10 bg-input border-border/50 focus:border-primary"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => setQuery('')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
