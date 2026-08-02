// T063-T064: Production Status and Dashboard Refresh Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query';
import productionService from '../services/productionService';
import { DashboardData } from '../types/production.types';
import { useState, useCallback } from 'react';

// T063: useProductionStatus hook - fetches dashboard data with 30s polling
export const useProductionStatus = () => {
  const { 
    data, 
    isLoading, 
    error, 
    isFetching, 
    refetch 
  } = useQuery({
    queryKey: ['production', 'dashboard'],
    queryFn: () => productionService.fetchDashboardData(),
    staleTime: 0, // Data is immediately stale
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    isLoading,
    error: error instanceof Error ? error : null,
    isFetching,
    refetch,
    isRefreshNeeded: !data && !isLoading,
  };
};

// T064: useDashboardRefresh hook - manual refresh with loading state
export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate and refetch dashboard data
      await queryClient.refetchQueries({ 
        queryKey: ['production', 'dashboard'] 
      });
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return { refresh, isRefreshing };
};

// T078: useBatchDetail hook - fetches single batch details
export const useBatchDetail = (batch_id: string) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['production', 'batch', batch_id],
    queryFn: () => productionService.fetchBatchDetail(batch_id),
    enabled: !!batch_id,
    staleTime: 10000, // 10 seconds
    retry: 2,
  });

  return {
    data,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

// T080: useBatchTimeline hook - fetches stage transitions for batch
export const useBatchTimeline = (batch_id: string) => {
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['production', 'batch', batch_id, 'timeline'],
    queryFn: () => productionService.fetchBatchTimeline(batch_id),
    enabled: !!batch_id,
    staleTime: 10000,
    retry: 2,
  });

  return {
    data: data || [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
};

// T081: useAuditTrail hook - fetches audit log for batch
export const useAuditTrail = (batch_id: string) => {
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['production', 'batch', batch_id, 'audit'],
    queryFn: () => productionService.fetchAuditTrail(batch_id),
    enabled: !!batch_id,
    staleTime: 30000,
    retry: 2,
  });

  return {
    data: data || [],
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

// T098: useMyWork hook - fetches worker's assigned batches
export const useMyWork = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['production', 'my-work'],
    queryFn: () => productionService.getMyCurrentWork(),
    staleTime: 10000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    batches: data || [],
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

// T128: useQualityQueue hook - fetches batches waiting in quality
export const useQualityQueue = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['production', 'quality-queue'],
    queryFn: () => productionService.getBatchesInQuality(),
    staleTime: 10000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    batches: data || [],
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
};
