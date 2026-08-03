// Phase 8: T120 - Quality Control Types
// Quality inspection and defect recording types

/**
 * Defect Types - Categorized defect reasons
 */
export enum DefectType {
  SURFACE_DEFECTS = 'SurfaceDefects',
  DIMENSIONAL_OOT = 'DimensionalOOT',
  STRUCTURAL_FAILURE = 'StructuralFailure',
  COLOR_ISSUE = 'ColorIssue',
  CONTAMINATION = 'Contamination',
  OTHER = 'Other',
}

/**
 * Quality Result - Inspection outcome
 */
export enum QualityResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL = 'CONDITIONAL',
}

/**
 * Defect Record - Individual defect documentation
 */
export interface DefectRecord {
  defect_id: string;
  batch_id: string;
  defect_type: DefectType;
  location: string; // Where on the batch the defect is located
  quantity: number; // How many defects of this type
  severity: number; // 1-5 severity level
  photo_url?: string; // Optional photo evidence
  created_at: string; // ISO timestamp
  created_by: string; // User ID who recorded
}

/**
 * Quality Inspection - Full quality inspection record
 */
export interface QualityInspection {
  inspection_id: string;
  batch_id: string;
  result: QualityResult;
  defect_count: number;
  defect_details: DefectRecord[]; // Array of defects if FAIL or CONDITIONAL
  approval_timestamp: string; // ISO timestamp of inspection completion
  inspector_id: string; // User ID of inspector
  inspector_name: string; // Full name for audit trail
  rejection_reason?: string; // Reason code if FAIL
  rework_notes?: string; // Rework instructions if CONDITIONAL
  created_at: string; // ISO timestamp
}

/**
 * Quality Queue Item - Batch waiting for inspection
 */
export interface QualityQueueItem {
  batch_id: string;
  material_type: string;
  batch_size: number;
  entered_quality_at: string; // ISO timestamp when batch entered quality stage
  time_in_quality_seconds: number; // Calculated elapsed time
  material_batch_code: string;
  stage: string;
}

/**
 * Defect Code Reference - For dropdown/selection
 */
export interface DefectCodeReference {
  code: DefectType;
  label: string;
  description: string;
}

/**
 * Rejection Reason - Why batch was rejected
 */
export interface RejectionReason {
  code: string;
  label: string;
  description: string;
  returnsToStage: string; // Which stage batch returns to
}

/**
 * Quality Approval Response - API response after submission
 */
export interface QualityApprovalResponse {
  inspection_id: string;
  batch_id: string;
  result: QualityResult;
  next_stage: string; // Where batch is routed after approval
  audit_log_id: string; // For tracking
  timestamp: string;
  message: string; // Success message
}
