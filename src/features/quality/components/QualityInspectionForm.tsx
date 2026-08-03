// Phase 8: T124 - QualityInspectionForm Component
// Main form for recording quality inspection results

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Batch } from '@/features/production/types/production.types';
import { QualityResult, DefectRecord } from '@/features/quality/types/quality.types';
import { qualityInspectionSchema, QualityInspectionFormData } from '@/features/quality/types/quality.schema';
import { getRejectionReasonsForDropdown } from '@/shared/utils/qualityReasons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DefectRecorder } from './DefectRecorder';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { X } from 'lucide-react';

interface QualityInspectionFormProps {
  batch: Batch;
  onSuccess: (result: QualityResult, message: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Quality inspection form for recording inspection results
 * Handles PASS, FAIL, and CONDITIONAL results with defect recording
 */
export function QualityInspectionForm({
  batch,
  onSuccess,
  onCancel,
  isSubmitting = false,
}: QualityInspectionFormProps) {
  const { user } = useAuth();
  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [rejectionReasons] = useState(getRejectionReasonsForDropdown());

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
  } = useForm<QualityInspectionFormData>({
    resolver: zodResolver(qualityInspectionSchema),
    defaultValues: {
      batch_id: batch.batch_id,
      result: QualityResult.PASS,
      defect_details: [],
    },
  });

  const result = watch('result');

  const onSubmit = useCallback(
    async (data: QualityInspectionFormData) => {
      try {
        const message = `Batch ${batch.batch_id} ${result === QualityResult.PASS ? 'approved' : result === QualityResult.FAIL ? 'rejected' : 'approved with rework'}`;
        onSuccess(result, message);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
    [batch.batch_id, result, onSuccess]
  );

  const isLoading = isSubmitting || isFormSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-2xl w-full"
      noValidate
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Quality Inspection</h2>
          <p className="text-blue-100 text-sm">Batch {batch.batch_id}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-white hover:bg-white/20 rounded-lg p-1"
          aria-label="Close form"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Batch Information (Read-only) */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Batch Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Batch ID</p>
              <p className="text-gray-900">{batch.batch_id}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Material Type</p>
              <p className="text-gray-900">{batch.material_type || 'Gypsum Tile'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Batch Size</p>
              <p className="text-gray-900">{batch.batch_size || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Acceptance Criteria (Read-only) */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Acceptance Criteria</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>Dimensions within ±2mm tolerance</li>
            <li>No structural cracks or breaks</li>
            <li>Surface finish smooth and even</li>
            <li>Color uniform and consistent</li>
            <li>No contamination or foreign materials</li>
          </ul>
        </div>

        {/* Inspection Result Selection */}
        <div>
          <fieldset>
            <legend className="text-base font-semibold text-gray-900 mb-3">
              Inspection Result <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-3">
              {/* PASS Option */}
              <Controller
                name="result"
                control={control}
                render={({ field }) => (
                  <>
                    <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{
                      borderColor: result === QualityResult.PASS ? '#10b981' : '#e5e7eb',
                      backgroundColor: result === QualityResult.PASS ? '#f0fdf4' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        value={QualityResult.PASS}
                        checked={result === QualityResult.PASS}
                        onChange={() => field.onChange(QualityResult.PASS)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-green-900">✓ PASS</p>
                        <p className="text-sm text-green-700">Batch meets all acceptance criteria. Will move to Packaging.</p>
                      </div>
                    </label>

                    {/* CONDITIONAL Option */}
                    <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{
                      borderColor: result === QualityResult.CONDITIONAL ? '#f59e0b' : '#e5e7eb',
                      backgroundColor: result === QualityResult.CONDITIONAL ? '#fffbf0' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        value={QualityResult.CONDITIONAL}
                        checked={result === QualityResult.CONDITIONAL}
                        onChange={() => field.onChange(QualityResult.CONDITIONAL)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-amber-900">⚠ CONDITIONAL</p>
                        <p className="text-sm text-amber-700">Minor rework required. Will route to rework queue.</p>
                      </div>
                    </label>

                    {/* FAIL Option */}
                    <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{
                      borderColor: result === QualityResult.FAIL ? '#ef4444' : '#e5e7eb',
                      backgroundColor: result === QualityResult.FAIL ? '#fef2f2' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        value={QualityResult.FAIL}
                        checked={result === QualityResult.FAIL}
                        onChange={() => field.onChange(QualityResult.FAIL)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-red-900">✗ FAIL</p>
                        <p className="text-sm text-red-700">Batch does not meet criteria. Will return to Finishing.</p>
                      </div>
                    </label>
                  </>
                )}
              />
            </div>
            {errors.result && (
              <p className="mt-2 text-sm text-red-600">{errors.result.message}</p>
            )}
          </fieldset>
        </div>

        {/* Defects Recording (shown if FAIL or CONDITIONAL) */}
        {(result === QualityResult.FAIL || result === QualityResult.CONDITIONAL) && (
          <div className={`p-4 rounded-lg border-2 ${
            result === QualityResult.FAIL ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <DefectRecorder
              batchId={batch.batch_id}
              onDefectsChange={setDefects}
              initialDefects={defects}
            />
            {errors.defect_details && (
              <p className="mt-2 text-sm text-red-600">{errors.defect_details.message}</p>
            )}
          </div>
        )}

        {/* Rejection Reason (shown if FAIL) */}
        {result === QualityResult.FAIL && (
          <div>
            <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-900 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Controller
              name="rejection_reason"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="rejection-reason"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-red-500
                    ${errors.rejection_reason ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                  aria-describedby={errors.rejection_reason ? 'rejection-error' : undefined}
                >
                  <option value="">Select a reason...</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.rejection_reason && (
              <p id="rejection-error" className="mt-1 text-sm text-red-600">
                {errors.rejection_reason.message}
              </p>
            )}
          </div>
        )}

        {/* Rework Notes (shown if CONDITIONAL) */}
        {result === QualityResult.CONDITIONAL && (
          <div>
            <label htmlFor="rework-notes" className="block text-sm font-medium text-gray-900 mb-2">
              Rework Instructions
            </label>
            <Controller
              name="rework_notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="rework-notes"
                  placeholder="E.g., Light sanding on top surface, touch up color on edges..."
                  rows={3}
                  maxLength={500}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500
                    ${errors.rework_notes ? 'border-orange-300 bg-orange-50' : 'border-gray-300'}
                  `}
                  aria-describedby={errors.rework_notes ? 'rework-error' : undefined}
                />
              )}
            />
            <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
            {errors.rework_notes && (
              <p id="rework-error" className="mt-1 text-sm text-orange-600">
                {errors.rework_notes.message}
              </p>
            )}
          </div>
        )}

        {/* Inspector Info (Read-only) */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Inspector</p>
              <p className="text-gray-900">{user?.full_name || 'Current User'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Approval Time</p>
              <p className="text-gray-900">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white inline-flex items-center gap-2
            ${
              result === QualityResult.PASS
                ? 'bg-green-600 hover:bg-green-700'
                : result === QualityResult.FAIL
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {isLoading
            ? 'Submitting...'
            : result === QualityResult.PASS
              ? 'Approve'
              : result === QualityResult.FAIL
                ? 'Reject'
                : 'Approve with Rework'}
        </button>
      </div>
    </form>
  );
}

export default QualityInspectionForm;
