// T076: Create batch Zod schemas
import { z } from 'zod';
import { ManufacturingStage } from '../../shared/types/domain.types';

export const batchStatusSchema = z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']);
export const qualityResultSchema = z.enum(['PASSED', 'FAILED', 'CONDITIONAL']);
export const defectSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const auditActionSchema = z.enum([
  'STAGE_TRANSITION',
  'QUALITY_APPROVED',
  'DATA_EXPORT',
  'SYSTEM_ALERT',
  'REWORK_INITIATED',
]);

export const defectRecordSchema = z.object({
  defect_id: z.string(),
  inspection_id: z.string(),
  defect_type: z.string(),
  severity: defectSeveritySchema,
  description: z.string(),
  location: z.string().optional(),
  rework_needed: z.boolean(),
  recorded_at: z.string().datetime(),
});

export const stageTransitionSchema = z.object({
  transition_id: z.string(),
  batch_id: z.string(),
  from_stage: z.nativeEnum(ManufacturingStage),
  to_stage: z.nativeEnum(ManufacturingStage),
  transitioned_at: z.string().datetime(),
  completed_by_user_id: z.string(),
  completed_by_user_name: z.string(),
  duration_in_stage: z.number().min(0),
  notes: z.string().optional(),
});

export const qualityInspectionSchema = z.object({
  inspection_id: z.string(),
  batch_id: z.string(),
  inspector_id: z.string(),
  inspector_name: z.string(),
  result: qualityResultSchema,
  defects: z.array(defectRecordSchema),
  notes: z.string().optional(),
  timestamp: z.string().datetime(),
  approved_at: z.string().datetime().optional(),
  approved_by: z.string().optional(),
});

export const shippingRecordSchema = z.object({
  shipping_id: z.string(),
  batch_id: z.string(),
  destination: z.string(),
  carrier: z.string(),
  tracking_number: z.string(),
  shipped_at: z.string().datetime(),
  expected_delivery: z.string().datetime().optional(),
  actual_delivery: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const auditLogEntrySchema = z.object({
  log_id: z.string(),
  batch_id: z.string(),
  timestamp: z.string().datetime(),
  action: auditActionSchema,
  user_id: z.string(),
  user_name: z.string(),
  before_value: z.record(z.any()).optional(),
  after_value: z.record(z.any()).optional(),
  reason: z.string().optional(),
  details: z.string().optional(),
});

export const batchSchema = z.object({
  batch_id: z.string(),
  status: batchStatusSchema,
  current_stage: z.nativeEnum(ManufacturingStage),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  material_batch_id: z.string(),
  quality_status: qualityResultSchema,
  notes: z.string().optional(),
});

export const batchDetailSchema = z.object({
  batch: batchSchema,
  stages: z.array(stageTransitionSchema),
  quality_inspection: qualityInspectionSchema.optional(),
  shipping_record: shippingRecordSchema.optional(),
  audit_trail: z.array(auditLogEntrySchema),
});

export const batchSearchResultSchema = z.object({
  batch_id: z.string(),
  current_stage: z.nativeEnum(ManufacturingStage),
  status: batchStatusSchema,
  created_at: z.string().datetime(),
  progress_percentage: z.number().min(0).max(100),
});

export type Batch = z.infer<typeof batchSchema>;
export type StageTransition = z.infer<typeof stageTransitionSchema>;
export type QualityInspection = z.infer<typeof qualityInspectionSchema>;
export type ShippingRecord = z.infer<typeof shippingRecordSchema>;
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
export type BatchDetail = z.infer<typeof batchDetailSchema>;
export type BatchSearchResult = z.infer<typeof batchSearchResultSchema>;
