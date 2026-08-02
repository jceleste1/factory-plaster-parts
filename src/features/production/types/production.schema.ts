// T061 & T076: Production and Batch Zod Schemas
import { z } from 'zod';
import { ManufacturingStage, StageStatus, QualityResult, BatchStatus } from './production.types';

// Dashboard Schema
export const stageSchema = z.object({
  stage_name: z.enum([
    ManufacturingStage.PLANNING,
    ManufacturingStage.MIXING,
    ManufacturingStage.MOLDING,
    ManufacturingStage.CURING,
    ManufacturingStage.FINISHING,
    ManufacturingStage.QUALITY,
    ManufacturingStage.PACKAGING,
    ManufacturingStage.SHIPPING,
  ]),
  batch_count: z.number().min(0),
  avg_duration_hours: z.number().min(0),
  status: z.enum([StageStatus.GREEN, StageStatus.YELLOW, StageStatus.RED]),
  trend: z.enum(['UP', 'DOWN', 'STABLE']).optional(),
  current_batches: z.array(z.unknown()).optional(),
});

export const dashboardSchema = z.object({
  timestamp: z.string().datetime(),
  production_velocity: z.number(),
  stages: z.array(stageSchema),
  bottleneck_stage: z.enum([
    ManufacturingStage.PLANNING,
    ManufacturingStage.MIXING,
    ManufacturingStage.MOLDING,
    ManufacturingStage.CURING,
    ManufacturingStage.FINISHING,
    ManufacturingStage.QUALITY,
    ManufacturingStage.PACKAGING,
    ManufacturingStage.SHIPPING,
  ]).optional(),
  total_active_batches: z.number().min(0),
});

// Batch Schema
export const batchSchema = z.object({
  batch_id: z.string().min(1),
  status: z.enum([
    BatchStatus.PLANNING,
    BatchStatus.IN_PROGRESS,
    BatchStatus.COMPLETED,
    BatchStatus.REJECTED,
    BatchStatus.ON_HOLD,
  ]),
  current_stage: z.enum([
    ManufacturingStage.PLANNING,
    ManufacturingStage.MIXING,
    ManufacturingStage.MOLDING,
    ManufacturingStage.CURING,
    ManufacturingStage.FINISHING,
    ManufacturingStage.QUALITY,
    ManufacturingStage.PACKAGING,
    ManufacturingStage.SHIPPING,
  ]),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  material_batch_id: z.string().min(1),
  quality_status: z.enum([QualityResult.PASS, QualityResult.FAIL, QualityResult.CONDITIONAL]).optional(),
  worker_notes: z.string().optional(),
});

// Stage Transition Schema
export const stageTransitionSchema = z.object({
  transition_id: z.string().min(1),
  batch_id: z.string().min(1),
  from_stage: z.enum([
    ManufacturingStage.PLANNING,
    ManufacturingStage.MIXING,
    ManufacturingStage.MOLDING,
    ManufacturingStage.CURING,
    ManufacturingStage.FINISHING,
    ManufacturingStage.QUALITY,
    ManufacturingStage.PACKAGING,
    ManufacturingStage.SHIPPING,
  ]),
  to_stage: z.enum([
    ManufacturingStage.PLANNING,
    ManufacturingStage.MIXING,
    ManufacturingStage.MOLDING,
    ManufacturingStage.CURING,
    ManufacturingStage.FINISHING,
    ManufacturingStage.QUALITY,
    ManufacturingStage.PACKAGING,
    ManufacturingStage.SHIPPING,
  ]),
  transitioned_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  completed_by_user_id: z.string().min(1),
  completed_by_user_name: z.string().min(1),
  duration_in_stage_hours: z.number().optional(),
  notes: z.string().optional(),
});

// Quality Inspection Schema
export const defectRecordSchema = z.object({
  defect_id: z.string().min(1),
  defect_type: z.string().min(1),
  location: z.string().min(1),
  quantity: z.number().min(1),
  severity: z.number().min(1).max(5),
  photo_url: z.string().url().optional(),
  description: z.string().optional(),
});

export const qualityInspectionSchema = z.object({
  inspection_id: z.string().min(1),
  batch_id: z.string().min(1),
  result: z.enum([QualityResult.PASS, QualityResult.FAIL, QualityResult.CONDITIONAL]),
  defect_count: z.number().min(0),
  defects: z.array(defectRecordSchema),
  inspector_id: z.string().min(1),
  inspector_name: z.string().min(1),
  approval_timestamp: z.string().datetime(),
});

// Shipping Schema
export const shippingRecordSchema = z.object({
  shipping_id: z.string().min(1),
  batch_id: z.string().min(1),
  destination: z.string().min(1),
  carrier: z.string().min(1),
  tracking_number: z.string().min(1),
  shipping_date: z.string().datetime(),
  estimated_delivery: z.string().datetime(),
});

// Audit Trail Schema
export const auditLogEntrySchema = z.object({
  entry_id: z.string().min(1),
  timestamp: z.string().datetime(),
  user_id: z.string().min(1),
  user_name: z.string().min(1),
  action_type: z.string().min(1),
  affected_batch_id: z.string().min(1),
  before_value: z.string().optional(),
  after_value: z.string().optional(),
  reason: z.string().optional(),
  source: z.string().min(1),
});

export type DashboardData = z.infer<typeof dashboardSchema>;
export type Batch = z.infer<typeof batchSchema>;
export type StageTransition = z.infer<typeof stageTransitionSchema>;
export type QualityInspection = z.infer<typeof qualityInspectionSchema>;
export type ShippingRecord = z.infer<typeof shippingRecordSchema>;
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
