// Phase 8: T128 - useQualityQueue Hook
// Fetch and manage batches waiting in quality stage

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QualityQueueItem } from '../types/quality.types';
import qualityService from '../services/qualityService';

interface UseQualityQueueReturn extends UseQueryResult<QualityQueueItem[], Error> {
  batches: QualityQueueItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage batches in quality stage
 * Uses TanStack Query with 10 second stale time for real-time updates
 */
export function useQualityQueue(): UseQualityQueueReturn {
  const query = useQuery({
    queryKey: ['quality-queue'],
    queryFn: () => qualityService.getBatchesInQualityQueue(),
    staleTime: 10000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    batches: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch as () => void,
  };
}

export default useQualityQueue;
