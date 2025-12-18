import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useDatasetStore } from '@/store/datasetStore';
import { cn } from '@/lib/utils';

export function PasteAreaCard() {
  const [rawText, setRawText] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const { parseAndAddDataset } = useDatasetStore();
  const navigate = useNavigate();
  
  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setStatus('error');
      setMessage('Please paste the result data first.');
      return;
    }
    
    setStatus('parsing');
    setMessage('Analyzing your data...');
    
    // Simulate async parsing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = parseAndAddDataset(rawText, datasetName || undefined);
    
    if (result.success) {
      setStatus('success');
      setMessage(`Successfully parsed ${result.rowsParsed} student records!`);
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setStatus('error');
      setMessage(result.errors?.join(', ') || 'Failed to parse data.');
    }
  };
  
  const handleClear = () => {
    setRawText('');
    setDatasetName('');
    setStatus('idle');
    setMessage('');
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="space-y-2">
        <label htmlFor="datasetName" className="text-sm font-medium text-foreground">
          Dataset Name (optional)
        </label>
        <Input
          id="datasetName"
          placeholder="e.g., BCA Sem 2 - Section A Results"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
          className="bg-input border-border/50 focus:border-primary"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="rawText" className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Paste Result Table
        </label>
        <Textarea
          id="rawText"
          placeholder={`Paste your complete result table here...

Example format:
ABCId
RollNo
StudentName
BCACC-103(TH)_ESE
...
REMARKS
F.M.: 100
F.M.: 50
55 2024-1204 8622 9600 3553 2576 SUDIP DAS 39 10 49 C 15 22 ...`}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          className="min-h-[300px] bg-input border-border/50 focus:border-primary font-mono text-sm resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Paste the complete result data including headers and all student rows.
        </p>
      </div>
      
      {/* Status Message */}
      {message && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border animate-in',
            status === 'success' && 'bg-success/10 border-success/30 text-success',
            status === 'error' && 'bg-destructive/10 border-destructive/30 text-destructive',
            status === 'parsing' && 'bg-primary/10 border-primary/30 text-primary'
          )}
        >
          {status === 'parsing' && <Loader2 className="w-5 h-5 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-5 h-5" />}
          {status === 'error' && <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={!rawText.trim() || status === 'parsing'}
          className="flex-1 gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
        >
          {status === 'parsing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Result
            </>
          )}
        </Button>
        
        {rawText && (
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}


