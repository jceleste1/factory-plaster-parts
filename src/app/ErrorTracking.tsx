// T194: Error Tracking Setup Component
// Initialize error tracking on app load

import { useEffect } from 'react';
import { errorTracker } from '../shared/services/errorTrackingService';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * ErrorTracking Component
 * Initializes error tracking and sets up global error handlers
 * Should be rendered near the top of the app
 */
export function ErrorTracking(): null {
  const { user } = useAuth();

  useEffect(() => {
    // Set user context if authenticated
    if (user) {
      errorTracker.setUserContext({
        userId: user.user_id,
        userEmail: user.google_email,
        userRole: user.role,
      });
    }
  }, [user]);

  // Handle global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      errorTracker.captureException(event.error || new Error(event.message), {
        tags: {
          type: 'uncaughtError',
          filename: event.filename,
          lineno: String(event.lineno),
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorTracker.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
        tags: { type: 'unhandledRejection' },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // No UI to render
  return null;
}
