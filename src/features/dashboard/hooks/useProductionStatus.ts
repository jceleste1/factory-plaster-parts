// T063: Create useProductionStatus hook for dashboard data fetching
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';
import { DashboardResponse } from '../types/dashboard.types';

export const useProductionStatus = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard', 'production-status'],
    queryFn: () => dashboardService.fetchDashboardData(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: attemptIndex => Math.pow(2, attemptIndex) * 1000, // exponential backoff
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isStale: data ? new Date().getTime() - new Date(data.timestamp).getTime() > 30000 : false,
  };
};
