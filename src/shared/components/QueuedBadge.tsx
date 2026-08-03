// T097: QueuedBadge Component
// Shows badge when a batch transition is pending sync
import React from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface QueuedBadgeProps {
  status: 'pending' | 'syncing' | 'failed';
  retryCount?: number;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * T097: Badge displayed on batch cards when offline sync is pending
 * Shows status and retry button if needed
 */
export const QueuedBadge: React.FC<QueuedBadgeProps> = ({
  status,
  retryCount = 0,
  onRetry,
  isRetrying = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'syncing':
        return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'failed':
        return `Failed (Retry ${retryCount})`;
      default:
        return '⚠️ Queued';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold ${getStatusColor()}`}
      role="status"
      aria-label={`This action is ${status}${
        status === 'failed' ? ` and will retry` : ''
      } and will sync when online`}
    >
      {getStatusIcon()}
      <span>{getStatusLabel()}</span>

      {status === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-1 p-1 hover:bg-white/30 rounded transition-colors disabled:opacity-50"
          title="Retry sync"
          aria-label="Retry sync"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

/**
 * QueuedIndicator: Larger indicator for showing queue status
 * Used in headers or dedicated sections
 */
interface QueuedIndicatorProps {
  pendingCount: number;
  failedCount?: number;
  onRetryAll?: () => void;
  isRetrying?: boolean;
}

export const QueuedIndicator: React.FC<QueuedIndicatorProps> = ({
  pendingCount,
  failedCount = 0,
  onRetryAll,
  isRetrying = false,
}) => {
  if (pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-amber-900">
          {pendingCount + failedCount} action{pendingCount + failedCount !== 1 ? 's' : ''} pending sync
        </p>
        <p className="text-sm text-amber-800 mt-0.5">
          {pendingCount > 0 && `${pendingCount} queued`}
          {pendingCount > 0 && failedCount > 0 && ' • '}
          {failedCount > 0 && `${failedCount} failed`}
        </p>
      </div>
      {failedCount > 0 && onRetryAll && (
        <button
          onClick={onRetryAll}
          disabled={isRetrying}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Retry All
            </>
          )}
        </button>
      )}
    </div>
  );
};
