import { useEffect, useState } from 'react';

/**
 * Hook to detect online/offline status
 */
export function useConnectionStatus(): { isOnline: boolean; lastCheckedAt: Date } {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = (): void => {
      setIsOnline(true);
      setLastCheckedAt(new Date());
    };

    const handleOffline = (): void => {
      setIsOnline(false);
      setLastCheckedAt(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastCheckedAt };
}
