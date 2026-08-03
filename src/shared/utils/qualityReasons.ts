// Phase 8: T130 - Quality Rejection Reason Codes
// Standardized rejection and rework reason codes

import { RejectionReason } from '../types/quality.types';

/**
 * Rejection reason codes for quality failures
 * When a batch is rejected, one of these reasons is recorded
 */
export const REJECTION_REASONS: RejectionReason[] = [
  {
    code: 'MATERIAL_DEFECT',
    label: 'Material Defect',
    description: 'Defects in raw material quality or composition',
    returnsToStage: 'Finishing',
  },
  {
    code: 'PROCESS_FAILURE',
    label: 'Process Failure',
    description: 'Manufacturing process issue during curing or molding',
    returnsToStage: 'Curing',
  },
  {
    code: 'DIMENSION_ISSUE',
    label: 'Dimension Out-of-Tolerance',
    description: 'Finished product dimensions exceed tolerance',
    returnsToStage: 'Finishing',
  },
  {
    code: 'COSMETIC_ISSUE',
    label: 'Cosmetic/Surface Issue',
    description: 'Surface finish problem, scratches, or discoloration',
    returnsToStage: 'Finishing',
  },
  {
    code: 'STRUCTURAL_ISSUE',
    label: 'Structural Failure',
    description: 'Cracks, breaks, or weakened structural integrity',
    returnsToStage: 'Curing',
  },
  {
    code: 'CONTAMINATION',
    label: 'Contamination',
    description: 'Foreign material or particles found in/on product',
    returnsToStage: 'Mixing',
  },
  {
    code: 'COLOR_MISMATCH',
    label: 'Color Mismatch',
    description: 'Color does not match specification or previous batches',
    returnsToStage: 'Finishing',
  },
  {
    code: 'OTHER',
    label: 'Other',
    description: 'Other reason for rejection (see notes)',
    returnsToStage: 'Finishing',
  },
];

/**
 * Rework instruction codes for conditional approvals
 * When result is CONDITIONAL, batch goes to rework with these instructions
 */
export const REWORK_CODES = [
  {
    code: 'MINOR_SURFACE_REFINISH',
    label: 'Minor Surface Refinish',
    description: 'Light sanding and repolish of surface',
    stage: 'Finishing',
  },
  {
    code: 'EDGE_WORK',
    label: 'Edge Work Required',
    description: 'Smooth or refine batch edges',
    stage: 'Finishing',
  },
  {
    code: 'COLOR_TOUCH_UP',
    label: 'Color Touch-Up',
    description: 'Apply touch-up color or sealant',
    stage: 'Finishing',
  },
  {
    code: 'DIMENSION_TRIM',
    label: 'Dimension Adjustment',
    description: 'Trim or adjust dimensions to specification',
    stage: 'Finishing',
  },
  {
    code: 'RECURE',
    label: 'Re-cure Required',
    description: 'Return to curing process for additional time',
    stage: 'Curing',
  },
  {
    code: 'RE_MIX_MATERIAL',
    label: 'Material Remixing',
    description: 'Return material to mixing for adjustment',
    stage: 'Mixing',
  },
];

/**
 * Get rejection reason by code
 */
export function getRejectionReason(code: string): RejectionReason | undefined {
  return REJECTION_REASONS.find((r) => r.code === code);
}

/**
 * Get rework instruction by code
 */
export function getReworkInstruction(code: string) {
  return REWORK_CODES.find((r) => r.code === code);
}

/**
 * Get rejection reasons for dropdown
 */
export function getRejectionReasonsForDropdown() {
  return REJECTION_REASONS.map((r) => ({
    value: r.code,
    label: r.label,
    description: r.description,
  }));
}

/**
 * Get rework reasons for dropdown
 */
export function getReworkReasonsForDropdown() {
  return REWORK_CODES.map((r) => ({
    value: r.code,
    label: r.label,
    description: r.description,
  }));
}
