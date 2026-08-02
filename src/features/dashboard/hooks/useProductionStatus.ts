// T063: Create useProductionStatus hook for dashboard data fetching - T071/T074: Polling + Performance
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';
import { DashboardResponse } from '../types/dashboard.types';

interface UseProductionStatusReturn {
  data: DashboardResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
  isRefreshNeeded: boolean;
}

export const useProductionStatus = (): UseProductionStatusReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard', 'production-status'],
    queryFn: () => dashboardService.fetchDashboardData(),
    staleTime: 30000, // 30 seconds - T071: Polling configured
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchInterval: 30000, // Refetch every 30 seconds - T071: Auto-refresh
    refetchIntervalInBackground: true, // Continue polling when tab not focused
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: attemptIndex => Math.pow(2, attemptIndex) * 1000, // exponential backoff
  });

  const now = new Date().getTime();
  const dataAge = data ? now - new Date(data.timestamp).getTime() : 0;
  const isStale = dataAge > 30000;
  const isRefreshNeeded = isStale && !isFetching;

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isStale,
    isRefreshNeeded,
  };
};
