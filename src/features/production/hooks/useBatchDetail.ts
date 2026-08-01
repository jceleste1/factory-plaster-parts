// T078: Create useBatchDetail hook
import { useQuery } from '@tanstack/react-query';
import batchService from '../services/batchService';
import { BatchDetail } from '../types/batch.types';

export const useBatchDetail = (batchId?: string) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<BatchDetail, Error>({
    queryKey: ['batch', 'detail', batchId],
    queryFn: () => {
      if (!batchId) {
        throw new Error('Batch ID is required');
      }
      return batchService.fetchBatchDetail(batchId);
    },
    enabled: !!batchId,
    staleTime: 10000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.pow(2, attemptIndex) * 1000,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
