// Phase 8: T121 - Quality Control Zod Schemas
// Runtime validation for quality inspection data

import { z } from 'zod';
import { DefectType, QualityResult } from './quality.types';

/**
 * Defect Record Schema - Validates individual defect data
 */
export const defectRecordSchema = z.object({
  defect_id: z.string().optional(),
  batch_id: z.string(),
  defect_type: z.enum([
    DefectType.SURFACE_DEFECTS,
    DefectType.DIMENSIONAL_OOT,
    DefectType.STRUCTURAL_FAILURE,
    DefectType.COLOR_ISSUE,
    DefectType.CONTAMINATION,
    DefectType.OTHER,
  ]),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be under 200 characters'),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity must not exceed 999'),
  severity: z
    .number()
    .min(1, 'Severity must be 1-5')
    .max(5, 'Severity must be 1-5'),
  photo_url: z.string().url().optional(),
  created_at: z.string().datetime().optional(),
  created_by: z.string().optional(),
});

export type DefectRecordFormData = z.infer<typeof defectRecordSchema>;

/**
 * Quality Inspection Form Schema - Validates inspection form submission
 */
export const qualityInspectionSchema = z
  .object({
    batch_id: z.string().min(1, 'Batch ID is required'),
    result: z.enum([QualityResult.PASS, QualityResult.FAIL, QualityResult.CONDITIONAL]),
    defect_count: z.number().min(0).optional(),
    defect_details: z.array(defectRecordSchema).optional(),
    rejection_reason: z.string().optional(),
    rework_notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // If result is FAIL or CONDITIONAL, must have at least one defect
      if ((data.result === QualityResult.FAIL || data.result === QualityResult.CONDITIONAL) &&
          (!data.defect_details || data.defect_details.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Defects are required for FAIL or CONDITIONAL results',
      path: ['defect_details'],
    }
  )
  .refine(
    (data) => {
      // If result is FAIL, rejection reason is required
      if (data.result === QualityResult.FAIL && !data.rejection_reason) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting a batch',
      path: ['rejection_reason'],
    }
  );

export type QualityInspectionFormData = z.infer<typeof qualityInspectionSchema>;

/**
 * Quality Batch List Schema - API response for quality queue
 */
export const qualityBatchSchema = z.object({
  batch_id: z.string(),
  material_type: z.string(),
  batch_size: z.number(),
  entered_quality_at: z.string().datetime(),
  time_in_quality_seconds: z.number(),
  material_batch_code: z.string(),
  stage: z.string(),
});

export const qualityQueueResponseSchema = z.object({
  batches: z.array(qualityBatchSchema),
  total_count: z.number(),
  page: z.number().optional(),
});

/**
 * Defect Codes Reference Schema
 */
export const defectCodeReferenceSchema = z.object({
  code: z.string(),
  label: z.string(),
  description: z.string(),
});

export const defectCodesListSchema = z.array(defectCodeReferenceSchema);

/**
 * Rejection Reasons Schema
 */
export const rejectionReasonSchema = z.object({
  code: z.string(),
  label: z.string(),
  description: z.string(),
  returnsToStage: z.string(),
});

export const rejectionReasonsListSchema = z.array(rejectionReasonSchema);

/**
 * Quality Approval Response Schema
 */
export const qualityApprovalResponseSchema = z.object({
  inspection_id: z.string(),
  batch_id: z.string(),
  result: z.enum([QualityResult.PASS, QualityResult.FAIL, QualityResult.CONDITIONAL]),
  next_stage: z.string(),
  audit_log_id: z.string(),
  timestamp: z.string().datetime(),
  message: z.string(),
});
