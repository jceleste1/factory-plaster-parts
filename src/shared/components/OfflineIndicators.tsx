// T159-T162: Offline Support & Queue Indicators
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle, Check, Clock } from 'lucide-react';
import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus';

/**
 * T159: Offline Indicator Banner
 * Shows connection status and sync information
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline } = useConnectionStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b-2 border-amber-300 px-4 py-3 md:py-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <WifiOff className="w-5 h-5 md:w-6 md:h-6 text-amber-700 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm md:text-base font-semibold text-amber-900">
            You're offline
          </p>
          <p className="text-xs md:text-sm text-amber-800">
            Your changes will be saved and synced when you're back online
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="animate-pulse">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-amber-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * T160: Sync Status Indicator
 * Shows pending sync requests and sync progress
 */
interface SyncStatus {
  syncing: boolean;
  pending: number;
  lastSyncTime?: Date;
  error?: string;
}

export const SyncStatusIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const { isOnline } = useConnectionStatus();

  if (!status.pending && !status.syncing) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600" role="status">
        <Check className="w-4 h-4" />
        <span>All synced</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-blue-600" role="status" aria-live="polite">
      <Clock className={`w-4 h-4 ${status.syncing ? 'animate-spin' : ''}`} />
      <span>
        {status.syncing ? 'Syncing...' : `${status.pending} pending`}
      </span>
      {status.error && (
        <span title={status.error} className="text-red-600">
          (Error)
        </span>
      )}
    </div>
  );
};

/**
 * T161: Queued Badge
 * Badge showing number of pending/queued items
 */
interface QueuedBadgeProps {
  count: number;
  type?: 'primary' | 'danger' | 'warning';
  label?: string;
}

export const QueuedBadge: React.FC<QueuedBadgeProps> = ({
  count,
  type = 'danger',
  label = 'pending',
}) => {
  if (count === 0) return null;

  const typeConfig = {
    primary: 'bg-blue-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-amber-600 text-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${typeConfig[type]}`}
      role="status"
      aria-label={`${count} ${label}`}
    >
      <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
      {count}
    </span>
  );
};

/**
 * T162: Pending Sync Banner
 * Shows items waiting to sync when offline
 */
interface PendingItem {
  id: string;
  type: 'batch_update' | 'quality_inspection' | 'stage_completion';
  description: string;
  timestamp: Date;
}

export const PendingSyncBanner: React.FC<{ items: PendingItem[] }> = ({ items }) => {
  const { isOnline } = useConnectionStatus();
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0 || isOnline) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 md:py-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          aria-label={`${items.length} items pending sync. Press to expand.`}
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <div>
              <p className="text-sm md:text-base font-semibold text-blue-900">
                {items.length} changes waiting to sync
              </p>
              <p className="text-xs text-blue-800">
                Will be sent automatically when connection restores
              </p>
            </div>
          </div>
          <span className="text-blue-700 font-bold ml-4 flex-shrink-0">
            {expanded ? '−' : '+'}
          </span>
        </button>

        {/* Expanded List */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-blue-200 space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 text-xs md:text-sm text-blue-900 bg-white bg-opacity-50 p-2 rounded"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-blue-700 text-xs">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * T163: Offline Mode Notice
 * Comprehensive offline state indicator with actions
 */
export const OfflineModeNotice: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const { isOnline } = useConnectionStatus();
  const [showDetails, setShowDetails] = useState(false);

  if (isOnline) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-4 md:py-5 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-3 md:gap-4">
          <WifiOff className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 mt-1" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-bold">Offline Mode Active</h3>
            <p className="text-sm text-gray-300 mt-1">
              You're working without internet. All changes are saved locally and will sync automatically.
            </p>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-sm text-blue-300 hover:text-blue-200 underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
              aria-expanded={showDetails}
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2 text-sm text-gray-300">
                <p>✓ Work is being saved locally</p>
                <p>✓ Changes will sync when you connect</p>
                <p>✓ Your data is safe</p>
              </div>
            )}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0"
              aria-label="Retry connection"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook: usePendingSyncItems
 * Get pending items from IndexedDB
 */
export const usePendingSyncItems = () => {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Query IndexedDB for pending items
    // const pending = await indexedDbService.getPendingRequests()
    // setItems(pending)
    setLoading(false);
  }, []);

  return { items, loading };
};

export default {
  OfflineBanner,
  SyncStatusIndicator,
  QueuedBadge,
  PendingSyncBanner,
  OfflineModeNotice,
  usePendingSyncItems,
};
