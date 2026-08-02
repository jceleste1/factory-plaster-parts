// T195: Monitoring Setup Component
// Initialize monitoring and logging on app load

import { useEffect } from 'react';
import { monitoring } from '../shared/services/monitoringService';
import { logger } from '../shared/services/loggingService';

/**
 * Monitoring Component
 * Initializes monitoring, logging, and performance tracking
 * Should be rendered near the top of the app
 */
export function Monitoring(): null {
  useEffect(() => {
    // Log app initialization
    logger.info('App initialized', {
      env: import.meta.env.VITE_MONITORING_ENV,
      version: import.meta.env.VITE_APP_VERSION,
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      const state = document.hidden ? 'hidden' : 'visible';
      logger.debug(`Page visibility changed to: ${state}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track performance
    const perfSummary = monitoring.getSummary();
    logger.info('Performance summary', perfSummary);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track navigation changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      const metrics = monitoring.exportMetrics();
      // Could send to server here if needed
      logger.info('Page unload - metrics exported', {
        metricsCount: monitoring.getMetrics().length,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // No UI to render
  return null;
}
