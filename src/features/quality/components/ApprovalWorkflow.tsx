// Phase 8: T126 - ApprovalWorkflow Component
// Displays workflow confirmation before approving/rejecting batches

import React from 'react';
import { QualityResult } from '@/features/quality/types/quality.types';
import { getRejectionReason, getReworkInstruction } from '@/shared/utils/qualityReasons';
import { Batch } from '@/features/production/types/production.types';
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ApprovalWorkflowProps {
  batch: Batch;
  result: QualityResult;
  rejectionReason?: string;
  reworkNotes?: string;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Workflow confirmation component that displays the routing decision
 * Shows what will happen to the batch based on the inspection result
 */
export function ApprovalWorkflow({
  batch,
  result,
  rejectionReason,
  reworkNotes,
  onSubmit,
  onCancel,
  isLoading = false,
}: ApprovalWorkflowProps) {
  const { user } = useAuth();

  const getIcon = () => {
    switch (result) {
      case QualityResult.PASS:
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case QualityResult.FAIL:
        return <XCircle className="w-12 h-12 text-red-600" />;
      case QualityResult.CONDITIONAL:
        return <AlertCircle className="w-12 h-12 text-amber-600" />;
    }
  };

  const getTitle = () => {
    switch (result) {
      case QualityResult.PASS:
        return 'Batch Approved ✓';
      case QualityResult.FAIL:
        return 'Batch Rejected ✗';
      case QualityResult.CONDITIONAL:
        return 'Approved with Rework ⚠';
    }
  };

  const getDescription = () => {
    switch (result) {
      case QualityResult.PASS:
        return 'This batch has been approved and will proceed to the Packaging stage.';
      case QualityResult.FAIL:
        return `This batch has been rejected and will return to the Finishing stage for rework.`;
      case QualityResult.CONDITIONAL:
        return 'This batch has been approved with conditional rework requirements.';
    }
  };

  const getHeaderStyles = () => {
    switch (result) {
      case QualityResult.PASS:
        return 'bg-green-50 border-green-200';
      case QualityResult.FAIL:
        return 'bg-red-50 border-red-200';
      case QualityResult.CONDITIONAL:
        return 'bg-amber-50 border-amber-200';
    }
  };

  const rejectionDetails = rejectionReason ? getRejectionReason(rejectionReason) : null;
  const reworkDetails = reworkNotes ? getReworkInstruction(reworkNotes) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-title"
      className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-2xl w-full"
    >
      {/* Header */}
      <div
        className={`border-b-2 px-6 py-4 ${getHeaderStyles()}`}
      >
        <div className="flex items-center gap-4">
          {getIcon()}
          <div>
            <h2 id="workflow-title" className="text-2xl font-bold text-gray-900">
              {getTitle()}
            </h2>
            <p className="text-gray-700 mt-1">{getDescription()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Batch Overview */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Batch Overview</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Batch ID</p>
              <p className="font-mono text-gray-900 font-medium">{batch.batch_id}</p>
            </div>
            <div>
              <p className="text-gray-600">Material Type</p>
              <p className="text-gray-900">{batch.material_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="text-gray-900">{result}</p>
            </div>
          </div>
        </div>

        {/* Routing Information */}
        <div className={`rounded-lg p-4 border-2 ${
          result === QualityResult.PASS
            ? 'bg-green-50 border-green-300'
            : result === QualityResult.FAIL
              ? 'bg-red-50 border-red-300'
              : 'bg-amber-50 border-amber-300'
        }`}>
          <h3 className="font-semibold mb-2">Next Steps</h3>
          
          {result === QualityResult.PASS && (
            <div className="space-y-2 text-sm text-green-800">
              <p className="font-medium">✓ Batch will move to <strong>Packaging</strong> stage</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Batch is approved and ready for packaging operations</li>
                <li>Final quality check complete</li>
                <li>Proceed to packaging immediately</li>
              </ul>
            </div>
          )}

          {result === QualityResult.FAIL && (
            <div className="space-y-3 text-sm text-red-800">
              <p className="font-medium">✗ Batch will return to <strong>Finishing</strong> stage</p>
              {rejectionDetails && (
                <div className="bg-red-100 rounded p-2 border border-red-300">
                  <p className="font-medium">{rejectionDetails.label}</p>
                  <p className="text-xs mt-1">{rejectionDetails.description}</p>
                </div>
              )}
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Batch must be reworked in the Finishing stage</li>
                <li>Quality inspection will be required again after rework</li>
                <li>Failed batch record will be logged for tracking</li>
              </ul>
            </div>
          )}

          {result === QualityResult.CONDITIONAL && (
            <div className="space-y-3 text-sm text-amber-800">
              <p className="font-medium">⚠ Batch will route to <strong>Rework Queue</strong></p>
              {reworkNotes && (
                <div className="bg-amber-100 rounded p-2 border border-amber-300">
                  <p className="font-medium">Rework Instructions</p>
                  <p className="text-xs mt-1">{reworkNotes}</p>
                </div>
              )}
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Batch requires minor rework before proceeding</li>
                <li>Follow specified rework instructions</li>
                <li>Batch will then move to Packaging upon completion</li>
              </ul>
            </div>
          )}
        </div>

        {/* Inspector Details */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Approval Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
            <div>
              <p className="text-blue-700">Inspector</p>
              <p className="font-medium">{user?.full_name || 'System User'}</p>
            </div>
            <div>
              <p className="text-blue-700">Approval Time</p>
              <p className="font-medium font-mono">{new Date().toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3 p-2 bg-blue-100 rounded">
            ℹ This approval will be recorded in the audit trail with timestamp and user attribution.
          </p>
        </div>

        {/* Confirmation Message */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900">Ready to proceed?</p>
              <p className="mt-1">Click "Confirm Approval" to submit this quality inspection. This action will be logged and cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
          aria-label="Cancel approval"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white
            ${
              result === QualityResult.PASS
                ? 'bg-green-600 hover:bg-green-700'
                : result === QualityResult.FAIL
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Confirm ${result.toLowerCase()} decision`}
        >
          {isLoading ? 'Submitting...' : 'Confirm Approval'}
        </button>
      </div>
    </div>
  );
}

export default ApprovalWorkflow;
