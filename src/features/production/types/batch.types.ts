// T075: Create batch types for traceability
import { ManufacturingStage } from '@/shared/types/domain.types';

export enum BatchStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum QualityResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL = 'CONDITIONAL', // Passed with defects that can be reworked
}

export interface Batch {
  batch_id: string;
  status: BatchStatus;
  current_stage: ManufacturingStage;
  created_at: string; // ISO timestamp
  completed_at?: string; // ISO timestamp
  material_batch_id: string;
  quality_status: QualityResult;
  notes?: string;
}

export interface StageTransition {
  transition_id: string;
  batch_id: string;
  from_stage: ManufacturingStage;
  to_stage: ManufacturingStage;
  transitioned_at: string; // ISO timestamp
  completed_by_user_id: string;
  completed_by_user_name: string;
  duration_in_stage: number; // seconds
  notes?: string;
}

export interface DefectRecord {
  defect_id: string;
  inspection_id: string;
  defect_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  location?: string;
  rework_needed: boolean;
  recorded_at: string;
}

export interface QualityInspection {
  inspection_id: string;
  batch_id: string;
  inspector_id: string;
  inspector_name: string;
  result: QualityResult;
  defects: DefectRecord[];
  notes?: string;
  timestamp: string; // ISO timestamp
  approved_at?: string;
  approved_by?: string;
}

export interface ShippingRecord {
  shipping_id: string;
  batch_id: string;
  destination: string;
  carrier: string;
  tracking_number: string;
  shipped_at: string; // ISO timestamp
  expected_delivery?: string;
  actual_delivery?: string;
  notes?: string;
}

export interface AuditLogEntry {
  log_id: string;
  batch_id: string;
  timestamp: string; // ISO timestamp
  action: 'STAGE_TRANSITION' | 'QUALITY_APPROVED' | 'DATA_EXPORT' | 'SYSTEM_ALERT' | 'REWORK_INITIATED';
  user_id: string;
  user_name: string;
  before_value?: Record<string, any>;
  after_value?: Record<string, any>;
  reason?: string;
  details?: string;
}

export interface BatchDetail {
  batch: Batch;
  stages: StageTransition[];
  quality_inspection?: QualityInspection;
  shipping_record?: ShippingRecord;
  audit_trail: AuditLogEntry[];
}

export interface BatchSearchResult {
  batch_id: string;
  current_stage: ManufacturingStage;
  status: BatchStatus;
  created_at: string;
  progress_percentage: number;
}
