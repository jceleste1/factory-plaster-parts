// T095: MyWorkPage Component
// Shows worker's assigned batches and allows logging stage completions
import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Batch,  QualityResult } from '../types/production.types';
import { useMyWork } from '../hooks/productionHooks';
import { useStageTransition } from '../hooks/useStageTransition';
import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus';
import { QualityCheckAlert } from '../components/QualityCheckAlert';
import { StageCompletionForm } from '../components/StageCompletionForm';


export const MyWorkPage: React.FC = () => {
  const { batches, isLoading, error, refetch } = useMyWork();
  const { isOnline } = useConnectionStatus();
  const { mutate: completeStage, isLoading: isTransitioning } =
    useStageTransition();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error';
    batchId?: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowCompletionForm(true);
  };

  const handleCompletionSuccess = (batch: Batch) => {
    setShowCompletionForm(false);
    setSelectedBatch(null);
    setToastMessage({
      message: `✓ Batch ${batch.batch_id} completed ${formatStageName(
        batch.current_stage || ''
      )} stage`,
      type: 'success',
      batchId: batch.batch_id,
    });
    refetch();
  };

  const handleCompletionError = (error: Error) => {
    setToastMessage({
      message: `Error: ${error.message}`,
      type: 'error',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                My Current Work
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Batches assigned to you • Tap to log completion
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh batches"
            >
              <RefreshCw
                className={`w-5 h-5 text-slate-600 ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          {/* Connection status */}
          {!isOnline && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                You're offline. Completions will be queued and synced when online.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error state */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-sm font-semibold text-red-900">
              Failed to load your work
            </p>
            <p className="text-sm text-red-800 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600">Loading your assigned batches...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && batches.length === 0 && (
          <div className="rounded-lg bg-blue-50 border-2 border-dashed border-blue-300 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900">No assigned batches</h3>
            <p className="text-sm text-blue-800 mt-2">
              You don't have any batches assigned right now. Check back soon!
            </p>
          </div>
        )}

        {/* Batch cards */}
        {!isLoading && batches.length > 0 && (
          <div className="space-y-4">
            {batches.map((batch) => (
              <BatchCard
                key={batch.batch_id}
                batch={batch}
                onSelectBatch={handleSelectBatch}
                isTransitioning={isTransitioning}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 p-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-green-100 text-green-900 border border-green-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-4 text-lg leading-none hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stage completion form modal */}
      {selectedBatch && (
        <StageCompletionForm
          batch={selectedBatch}
          isOpen={showCompletionForm}
          onClose={() => {
            setShowCompletionForm(false);
            setSelectedBatch(null);
          }}
          onSuccess={handleCompletionSuccess}
          onError={handleCompletionError}
          isLoading={isTransitioning}
        />
      )}
    </div>
  );
};

/**
 * Individual batch card component
 */
interface BatchCardProps {
  batch: Batch;
  onSelectBatch: (batch: Batch) => void;
  isTransitioning: boolean;
}

const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  onSelectBatch,
  isTransitioning,
}) => {
  const stage = batch.current_stage || 'UNKNOWN';
  const qualityStatus = batch.quality_status;

  // Check if quality check is required and failed
  const qualityBlocksTransition =
    ['PACKAGING', 'SHIPPING'].includes(stage) &&
    qualityStatus !== QualityResult.PASS;

  const getTimeInStage = (): string => {
    if (!batch.stage_entered_at) return 'Unknown';
    const startTime = new Date(batch.stage_entered_at).getTime();
    const now = Date.now();
    const diffMs = now - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-teal-300 hover:shadow-md transition-all">
      {/* Quality alert if applicable */}
      {qualityBlocksTransition && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <QualityCheckAlert batch={batch} shouldBlockTransition={true} />
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                {batch.batch_id}
              </h3>
              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">
                {formatStageName(stage)}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Product: {batch.product_type || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Stage info grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Time in Stage
            </p>
            <p className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTimeInStage()}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Batch Size
            </p>
            <p className="text-base font-bold text-slate-900 mt-1">
              {batch.quantity || 'N/A'} units
            </p>
          </div>
        </div>

        {/* Quality status */}
        {stage === 'QUALITY' && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-600 uppercase">
              Awaiting Quality Inspection
            </p>
            <p className="text-sm text-amber-800 mt-1">
              This batch must pass quality control before moving to next stage.
            </p>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => onSelectBatch(batch)}
          disabled={isTransitioning || qualityBlocksTransition}
          className={`w-full h-12 px-4 py-3 font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            qualityBlocksTransition
              ? 'bg-slate-100 text-slate-500'
              : 'bg-teal-600 hover:bg-teal-700 text-white active:bg-teal-800'
          }`}
        >
          {isTransitioning ? (
            <>
              <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
              Processing...
            </>
          ) : qualityBlocksTransition ? (
            'Quality Check Required'
          ) : (
            <>
              <Zap className="w-4 h-4 inline mr-2" />
              Log Completion
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Helper: Format stage name
 */
function formatStageName(stage: string): string {
  return stage
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
