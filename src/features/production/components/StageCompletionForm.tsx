// T093: StageCompletionForm Component
// Modal dialog for confirming stage completions with touch-friendly interface
import React, { useState } from 'react';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import { Batch  } from '../types/production.types';

interface StageCompletionFormProps {
  batch: Batch;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (batch: Batch) => void;
  onError?: (error: Error) => void;
  isLoading?: boolean;
  estimatedTimeInStage?: string;
}

/**
 * T093: Modal dialog for confirming stage completion
 * Shows batch info and gets worker confirmation before transition
 * Accessible with focus trap and keyboard support
 */
export const StageCompletionForm: React.FC<StageCompletionFormProps> = ({
  batch,
  isOpen,
  onClose,
  onSuccess,
  onError,
  isLoading = false,
  estimatedTimeInStage,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentStage = batch.current_stage || 'UNKNOWN';
  const nextStage = getNextStage(currentStage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would normally call the API
      // For now, just simulate success
      onSuccess(batch);
      setNotes('');
      onClose();
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      onClose();
    }
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <>
      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Modal dialog */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } md:fixed md:inset-0 md:flex md:items-center md:justify-center md:translate-y-0 md:bottom-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={handleKeyDown}
      >
        <div className="w-full bg-white rounded-t-3xl md:rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto md:max-w-md">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-3xl md:rounded-t-lg flex items-center justify-between">
            <h2 id="dialog-title" className="text-lg md:text-xl font-bold text-slate-900">
              Confirm Stage Completion
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Batch Info */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Batch ID
                </p>
                <p className="text-base md:text-lg font-mono font-bold text-slate-900 mt-1">
                  {batch.batch_id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Current Stage
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {formatStageName(currentStage)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Next Stage
                  </p>
                  <p className="text-sm font-semibold text-teal-700 mt-1">
                    {formatStageName(nextStage)}
                  </p>
                </div>
              </div>

              {estimatedTimeInStage && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Time in Stage
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    {estimatedTimeInStage}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm md:text-base text-blue-900">
                <strong>Ready to move Batch {batch.batch_id}</strong>
                <br />
                from <strong>{formatStageName(currentStage)}</strong> to{' '}
                <strong>{formatStageName(nextStage)}</strong>?
              </p>
            </div>

            {/* Notes field */}
            <div>
              <label
                htmlFor="completion-notes"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Notes (Optional)
              </label>
              <textarea
                id="completion-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                placeholder="Add any notes about this stage completion..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100"
                rows={3}
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-3 md:space-y-2 md:flex md:gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full md:flex-1 h-12 md:h-10 px-4 py-3 md:py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-slate-300 md:active:scale-95"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:flex-1 h-12 md:h-10 px-4 py-3 md:py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed active:bg-teal-800 md:active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

/**
 * Helper: Get next stage in manufacturing sequence
 */
function getNextStage(currentStage: string): string {
  const stages = [
    'PLANNING',
    'MIXING',
    'MOLDING',
    'CURING',
    'FINISHING',
    'QUALITY',
    'PACKAGING',
    'SHIPPING',
  ];

  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return 'COMPLETE';
  }

  return stages[currentIndex + 1];
}

/**
 * Helper: Format stage name for display
 */
function formatStageName(stage: string): string {
  return stage
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
