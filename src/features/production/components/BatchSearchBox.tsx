// T079: Create BatchSearchBox component
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import batchService from '../services/batchService';
import { BatchSearchResult } from '../types/batch.types';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface BatchSearchBoxProps {
  onSelectBatch: (batchId: string) => void;
  placeholder?: string;
}

export const BatchSearchBox: React.FC<BatchSearchBoxProps> = ({
  onSelectBatch,
  placeholder = 'Enter batch ID (e.g., BATCH-001234)',
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: results, isLoading, error } = useQuery<BatchSearchResult[], Error>({
    queryKey: ['batch', 'search', debouncedSearch],
    queryFn: () => batchService.searchBatches(debouncedSearch),
    enabled: debouncedSearch.length >= 6, // Batch ID minimum length
    staleTime: 30000,
    retry: 1,
  });

  const handleSelectBatch = useCallback(
    (batchId: string) => {
      onSelectBatch(batchId);
      setSearchInput('');
      setShowResults(false);
    },
    [onSelectBatch]
  );

  const handleClearSearch = () => {
    setSearchInput('');
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search for batch ID"
          aria-autocomplete="list"
          aria-expanded={showResults}
          minLength={6}
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && debouncedSearch.length >= 6 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Searching for batches...</span>
        </div>
      )}

      {/* Error message */}
      {error && showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Search failed</p>
            <p className="text-red-700">{error.message}</p>
          </div>
        </div>
      )}

      {/* Results dropdown */}
      {showResults && debouncedSearch.length >= 6 && results && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
          {results.map((result) => (
            <button
              key={result.batch_id}
              onClick={() => handleSelectBatch(result.batch_id)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              role="option"
              aria-selected="false"
            >
              <div className="font-medium text-gray-900">{result.batch_id}</div>
              <div className="text-sm text-gray-600">
                Stage: {result.current_stage} • Progress: {result.progress_percentage}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(result.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults &&
        debouncedSearch.length >= 6 &&
        !isLoading &&
        results?.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-gray-300 rounded-lg p-4 text-center text-gray-600">
            <p className="text-sm">No batches found matching "{debouncedSearch}"</p>
            <p className="text-xs text-gray-500 mt-1">Try a different batch ID</p>
          </div>
        )}

      {/* Minimum length prompt */}
      {showResults && searchInput.length > 0 && searchInput.length < 6 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-blue-50 border border-blue-300 rounded-lg p-3 text-sm text-blue-800">
          Enter at least 6 characters to search
        </div>
      )}
    </div>
  );
};
