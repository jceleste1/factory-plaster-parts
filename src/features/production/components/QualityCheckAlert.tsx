// T094: QualityCheckAlert Component
// Blocks stage completion if quality check hasn't passed
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Batch, QualityResult } from '../types/production.types';

interface QualityCheckAlertProps {
  batch: Batch;
  shouldBlockTransition?: boolean;
}

export const QualityCheckAlert: React.FC<QualityCheckAlertProps> = ({
  batch,
  shouldBlockTransition = true,
}) => {
  // Check if this batch needs quality control
  const isInQualityStage = batch.current_stage === 'QUALITY';
  const qualityStatus = batch.quality_status;

  // Don't show alert if batch isn't in quality stage or hasn't been inspected
  if (!isInQualityStage && qualityStatus === null) {
    return null;
  }

  // Check if moving past quality but quality not passed
  const pastQualityStage = [
    'PACKAGING',
    'SHIPPING',
  ].includes(batch.current_stage || '');

  if (pastQualityStage && qualityStatus !== QualityResult.PASS) {
    return (
      <div
        className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 mb-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">
              Cannot Move to Next Stage
            </h3>
            <p className="text-sm text-red-800 mt-1">
              Quality check failed. Contact your supervisor for guidance.
            </p>
            {batch.quality_inspection && (
              <div className="mt-3 bg-white rounded p-3 text-sm">
                <p className="font-semibold text-slate-900">Quality Result:</p>
                <p className="text-slate-700 mt-1">
                  {batch.quality_inspection.result === QualityResult.FAIL
                    ? '❌ FAILED'
                    : '⚠️ CONDITIONAL (Review Required)'}
                </p>
                {batch.quality_inspection.notes && (
                  <p className="text-slate-600 mt-2 italic">
                    "{batch.quality_inspection.notes}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show status if in quality stage
  if (isInQualityStage) {
    if (qualityStatus === QualityResult.PASS) {
      return (
        <div
          className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 mb-4"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">
                Quality Check Passed ✓
              </h3>
              <p className="text-sm text-green-800 mt-1">
                This batch is approved to move to the next stage.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (qualityStatus === QualityResult.FAIL) {
      return (
        <div
          className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 mb-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                Quality Check Failed
              </h3>
              <p className="text-sm text-red-800 mt-1">
                This batch does not meet quality standards. Contact your supervisor.
              </p>
              {batch.quality_inspection && batch.quality_inspection.defects && (
                <details className="mt-3">
                  <summary className="font-semibold text-red-800 cursor-pointer hover:underline">
                    View Defects ({batch.quality_inspection.defects.length})
                  </summary>
                  <div className="mt-2 space-y-2 bg-white rounded p-3">
                    {batch.quality_inspection.defects.map((defect, idx) => (
                      <div key={idx} className="text-sm text-slate-700">
                        <span className="font-semibold">
                          {defect.defect_type}
                        </span>
                        {' '}
                        <span className="text-slate-600">
                          at {defect.location} (Qty: {defect.quantity}, Severity: {defect.severity}/5)
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Quality status is CONDITIONAL or null (pending)
    return (
      <div
        className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 mb-4"
        role="status"
      >
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">
              Quality Check Pending
            </h3>
            <p className="text-sm text-amber-800 mt-1">
              This batch is awaiting quality inspection. Please wait for review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
