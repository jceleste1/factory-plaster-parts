// T171-T173: Error Handling & Recovery Strategies
import React, { useState, useCallback } from 'react';
import { AlertCircle, RotateCcw, ExternalLink } from 'lucide-react';

/**
 * T171: Error Recovery Hook
 * Handles error states with retry logic and recovery actions
 */
interface ErrorRecoveryConfig {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number) => Promise<void>;
}

export const useErrorRecovery = (config: ErrorRecoveryConfig = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
  } = config;

  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setError(new Error('Maximum retry attempts exceeded'));
      return;
    }

    setIsRetrying(true);
    try {
      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, retryCount)
        : retryDelay;

      await new Promise((resolve) => setTimeout(resolve, delay));

      if (onRetry) {
        await onRetry(retryCount + 1);
      }

      setRetryCount(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Retry failed'));
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, retryDelay, exponentialBackoff, onRetry]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const canRetry = retryCount < maxRetries;

  return {
    error,
    retryCount,
    isRetrying,
    canRetry,
    handleRetry,
    clearError,
    setError,
  };
};

/**
 * T171: User-Friendly Error Messages
 */
export const ERROR_MESSAGES: Record<string, { title: string; message: string; recoverySteps: string[] }> = {
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Check your internet connection.',
    recoverySteps: [
      'Check your internet connection',
      'Try moving closer to your WiFi router',
      'Disable VPN if you\'re using one',
      'Refresh the page',
    ],
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    message: 'The server took too long to respond. Please try again.',
    recoverySteps: [
      'Wait a moment and try again',
      'Check if the server is down',
      'Try with a different browser',
    ],
  },
  UNAUTHORIZED_ERROR: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    recoverySteps: [
      'Click the "Sign In" button to log back in',
      'Make sure you\'re using the correct account',
    ],
  },
  FORBIDDEN_ERROR: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    recoverySteps: [
      'Contact your administrator for access',
      'Verify you\'re logged in to the correct account',
    ],
  },
  NOT_FOUND_ERROR: {
    title: 'Resource Not Found',
    message: 'The requested item doesn\'t exist or has been deleted.',
    recoverySteps: [
      'Go back to the previous page',
      'Check if the ID is correct',
      'Search for the item instead',
    ],
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'The server encountered an error. Please try again later.',
    recoverySteps: [
      'Refresh the page',
      'Try again in a few minutes',
      'Contact support if the problem persists',
    ],
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'The data you entered is invalid. Please check and try again.',
    recoverySteps: [
      'Review the error message below the fields',
      'Correct the invalid data',
      'Try submitting again',
    ],
  },
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    recoverySteps: [
      'Refresh the page',
      'Clear your browser cache',
      'Contact support if the problem continues',
    ],
  },
};

/**
 * T172: Error Display Component
 */
interface ErrorDisplayProps {
  error: Error | null;
  errorType?: keyof typeof ERROR_MESSAGES;
  onRetry?: () => void;
  isRetrying?: boolean;
  canRetry?: boolean;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorType = 'UNKNOWN_ERROR',
  onRetry,
  isRetrying = false,
  canRetry = true,
  onDismiss,
}) => {
  if (!error) return null;

  const errorConfig = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;

  return (
    <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 md:p-6" role="alert">
      {/* Header */}
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-bold text-red-900">{errorConfig.title}</h3>
          <p className="text-sm md:text-base text-red-800 mt-1">{errorConfig.message}</p>

          {/* Error Details */}
          <details className="mt-3 text-xs md:text-sm text-red-700">
            <summary className="cursor-pointer font-medium hover:underline">
              Error Details
            </summary>
            <p className="mt-2 font-mono bg-red-100 p-2 rounded break-words">
              {error.message}
            </p>
          </details>

          {/* Recovery Steps */}
          <div className="mt-4">
            <p className="text-sm font-medium text-red-900 mb-2">What you can try:</p>
            <ul className="space-y-1 text-xs md:text-sm text-red-800 list-disc list-inside">
              {errorConfig.recoverySteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {onRetry && canRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium text-sm rounded transition-colors"
                aria-label="Retry the failed operation"
              >
                <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 font-medium text-sm rounded transition-colors"
              >
                Dismiss
              </button>
            )}

            <a
              href="/support"
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 hover:bg-red-100 text-red-900 font-medium text-sm rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * T172: Retry Dialog Component
 * Confirmation dialog before retrying an operation
 */
interface RetryDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RetryDialog: React.FC<RetryDialogProps> = ({
  open,
  title = 'Retry Operation?',
  message = 'Would you like to try this operation again?',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-700 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * T173: Fallback Component
 * Show when a component fails to render
 */
interface FallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          We encountered an unexpected error. Please try refreshing the page.
        </p>

        {error && (
          <details className="text-left mb-6 bg-gray-100 p-4 rounded text-sm">
            <summary className="cursor-pointer font-medium text-gray-900 mb-2">
              Error Details
            </summary>
            <pre className="whitespace-pre-wrap break-words text-red-700">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Refresh Page
          </button>
          {resetError && (
            <button
              onClick={resetError}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-100 text-gray-900 font-medium rounded transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  useErrorRecovery,
  ERROR_MESSAGES,
  ErrorDisplay,
  RetryDialog,
  ErrorFallback,
};
