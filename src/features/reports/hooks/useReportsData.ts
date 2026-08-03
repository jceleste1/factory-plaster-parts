/**
 * useReportsData Hook - T108
 * Fetches efficiency report data using TanStack Query
 * Provides cached, re-fetchable report data for UI components
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import reportService, { EfficiencyReport } from '../services/reportService';

interface DateRange {
  start_date: string;
  end_date: string;
}

/**
 * Fetch efficiency report with TanStack Query
 * @param dateRange - Object with start_date and end_date (YYYY-MM-DD format)
 * @returns Query result with data, loading, error states
 */
export function useReportsData(
  dateRange: DateRange
): UseQueryResult<EfficiencyReport, Error> {
  return useQuery({
    queryKey: ['reports', 'efficiency', dateRange.start_date, dateRange.end_date],
    queryFn: () => reportService.fetchEfficiencyReport(dateRange),
    staleTime: 60000, // 60 seconds - less critical than real-time
    gcTime: 5 * 60 * 1000, // 5 minutes - cache for reasonable time
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled: !!dateRange.start_date && !!dateRange.end_date, // Only fetch if dates provided
  });
}

/**
 * Hook for bottleneck stages
 */
export function useBottleneckStages(
  dateRange: DateRange
): UseQueryResult<ReturnType<typeof reportService.getBottleneckStages>, Error> {
  return useQuery({
    queryKey: ['reports', 'bottlenecks', dateRange.start_date, dateRange.end_date],
    queryFn: () => reportService.getBottleneckStages(dateRange),
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });
}

/**
 * Hook for scrap analysis
 */
export function useScrapAnalysis(
  dateRange: DateRange
): UseQueryResult<ReturnType<typeof reportService.getScrapAnalysis>, Error> {
  return useQuery({
    queryKey: ['reports', 'scrap', dateRange.start_date, dateRange.end_date],
    queryFn: () => reportService.getScrapAnalysis(dateRange),
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });
}

/**
 * Hook for trend analysis
 */
export function useTrendAnalysis(
  dateRange: DateRange
): UseQueryResult<ReturnType<typeof reportService.getTrendAnalysis>, Error> {
  return useQuery({
    queryKey: ['reports', 'trends', dateRange.start_date, dateRange.end_date],
    queryFn: () => reportService.getTrendAnalysis(dateRange),
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });
}
