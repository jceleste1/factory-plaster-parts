// T064: Create useDashboardRefresh hook for manual refresh
import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate the cache and refetch
      await queryClient.invalidateQueries({
        queryKey: ['dashboard', 'production-status'],
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return {
    refresh,
    isRefreshing,
  };
};
