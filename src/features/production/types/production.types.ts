// T060 & T075: Production and Batch Types
import { UserRole } from '../../auth/types/auth.types';

// Manufacturing stage enum
export enum ManufacturingStage {
  PLANNING = 'PLANNING',
  MIXING = 'MIXING',
  MOLDING = 'MOLDING',
  CURING = 'CURING',
  FINISHING = 'FINISHING',
  QUALITY = 'QUALITY',
  PACKAGING = 'PACKAGING',
  SHIPPING = 'SHIPPING',
}

// Batch status enum
export enum BatchStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
}

// Stage status indicators
export enum StageStatus {
  GREEN = 'GREEN',    // On schedule
  YELLOW = 'YELLOW',  // Attention needed
  RED = 'RED',        // Behind schedule
}

// Quality result enum
export enum QualityResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL = 'CONDITIONAL',
}

// Production Types for Dashboard
export interface Stage {
  stage_name: ManufacturingStage;
  batch_count: number;
  avg_duration_hours: number;
  status: StageStatus;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  current_batches?: Batch[];
}

export interface DashboardData {
  timestamp: string;
  production_velocity: number;
  stages: Stage[];
  bottleneck_stage?: ManufacturingStage;
  total_active_batches: number;
}

// Batch Types for Traceability
export interface Batch {
  batch_id: string;
  status: BatchStatus;
  current_stage: ManufacturingStage;
  created_at: string;
  completed_at?: string;
  material_batch_id: string;
  quality_status?: QualityResult;
  worker_notes?: string;
}

export interface StageTransition {
  transition_id: string;
  batch_id: string;
  from_stage: ManufacturingStage;
  to_stage: ManufacturingStage;
  transitioned_at: string;
  completed_at?: string;
  completed_by_user_id: string;
  completed_by_user_name: string;
  duration_in_stage_hours?: number;
  notes?: string;
}

export interface QualityInspection {
  inspection_id: string;
  batch_id: string;
  result: QualityResult;
  defect_count: number;
  defects: DefectRecord[];
  inspector_id: string;
  inspector_name: string;
  approval_timestamp: string;
}

export interface DefectRecord {
  defect_id: string;
  defect_type: DefectType;
  location: string;
  quantity: number;
  severity: number; // 1-5
  photo_url?: string;
  description?: string;
}

export enum DefectType {
  SURFACE_DEFECTS = 'SurfaceDefects',
  DIMENSIONAL_OOT = 'DimensionalOOT',
  STRUCTURAL_FAILURE = 'StructuralFailure',
  COLOR_ISSUE = 'ColorIssue',
  CONTAMINATION = 'Contamination',
  OTHER = 'Other',
}

export interface ShippingRecord {
  shipping_id: string;
  batch_id: string;
  destination: string;
  carrier: string;
  tracking_number: string;
  shipping_date: string;
  estimated_delivery: string;
}

export interface AuditLogEntry {
  entry_id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action_type: AuditActionType;
  affected_batch_id: string;
  before_value?: string;
  after_value?: string;
  reason?: string;
  source: string;
}

export enum AuditActionType {
  STAGE_TRANSITION = 'STAGE_TRANSITION',
  QUALITY_APPROVAL = 'QUALITY_APPROVAL',
  QUALITY_REJECTION = 'QUALITY_REJECTION',
  QUALITY_CONDITIONAL = 'QUALITY_CONDITIONAL',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  UNDO_ACTION = 'UNDO_ACTION',
}
