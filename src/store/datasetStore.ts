import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Dataset, ParseResult } from '@/types/dataset';
import { parseResultText, parseSimplifiedFormat } from '@/lib/parser';

interface DatasetState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  parseAndAddDataset: (rawText: string, name?: string) => ParseResult;
  setCurrentDataset: (dataset: Dataset | null) => void;
  deleteDataset: (id: string) => void;
  clearAll: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set, get) => ({
      datasets: [],
      currentDataset: null,
      isLoading: false,
      error: null,
      
      parseAndAddDataset: (rawText: string, name?: string) => {
        set({ isLoading: true, error: null });
        
        // Try both parsers
        let result = parseResultText(rawText, name);
        
        if (!result.success || (result.rowsParsed === 0 && result.rowsSkipped > 0)) {
          result = parseSimplifiedFormat(rawText, name);
        }
        
        if (result.success && result.dataset) {
          set(state => ({
            datasets: [...state.datasets, result.dataset!],
            currentDataset: result.dataset,
            isLoading: false,
          }));
        } else {
          set({ isLoading: false, error: result.errors?.join(', ') || 'Parse failed' });
        }
        
        return result;
      },
      
      setCurrentDataset: (dataset) => {
        set({ currentDataset: dataset });
      },
      
      deleteDataset: (id: string) => {
        set(state => ({
          datasets: state.datasets.filter(d => d.id !== id),
          currentDataset: state.currentDataset?.id === id ? null : state.currentDataset,
        }));
      },
      
      clearAll: () => {
        set({ datasets: [], currentDataset: null, error: null });
      },
    }),
    {
      name: 'result-analyzer-storage',
      // Avoid storing large datasets in localStorage to prevent quota errors.
      // We keep persistence disabled for dataset payloads; only in-memory use.
      partialize: () => ({})
    }
  )
);
