// Phase 8: T123 - useQualityInspection Hook
// Submit quality inspection results

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { QualityResult, DefectRecord, QualityApprovalResponse } from '../types/quality.types';
import qualityService from '../services/qualityService';
import { QualityInspectionFormData, qualityInspectionSchema } from '../types/quality.schema';

interface UseQualityInspectionReturn extends UseMutationResult<
  QualityApprovalResponse,
  Error,
  UseQualityInspectionParams,
  unknown
> {
  mutate: (params: UseQualityInspectionParams) => void;
  isLoading: boolean;
  error: Error | null;
  data: QualityApprovalResponse | undefined;
  reset: () => void;
}

interface UseQualityInspectionParams {
  batchId: string;
  result: QualityResult;
  defects?: DefectRecord[];
  rejectionReason?: string;
  reworkNotes?: string;
}

/**
 * Hook to submit quality inspection results
 * Handles form validation, optimistic updates, and error handling
 */
export function useQualityInspection(): UseQualityInspectionReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: UseQualityInspectionParams) => {
      // Validate form data
      const formData: QualityInspectionFormData = {
        batch_id: params.batchId,
        result: params.result,
        defect_count: params.defects?.length || 0,
        defect_details: params.defects,
        rejection_reason: params.rejectionReason,
        rework_notes: params.reworkNotes,
      };

      // Throws validation error if schema fails
      qualityInspectionSchema.parse(formData);

      // Submit inspection
      return qualityService.submitQualityInspection(params.batchId, {
        result: params.result,
        defects: params.defects,
        notes: params.rejectionReason,
        rework_steps: params.reworkNotes,
      });
    },
    onSuccess: (data, variables) => {
      // Remove batch from quality queue (optimistic)
      queryClient.setQueryData<any[]>(['quality-queue'], (old) =>
        old ? old.filter((batch) => batch.batch_id !== data.batch_id) : []
      );

      // Invalidate audit trail for this batch
      queryClient.invalidateQueries({
        queryKey: ['batch-audit-trail', variables.batchId],
      });

      // Invalidate production status dashboard
      queryClient.invalidateQueries({
        queryKey: ['dashboard-data'],
      });
    },
    onError: (error) => {
      console.error('Quality inspection submission failed:', error);
    },
  });

  return {
    ...mutation,
    mutate: (params) => mutation.mutate(params),
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export default useQualityInspection;
