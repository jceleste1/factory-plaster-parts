// T137: Audit Types
import { AuditActionType } from '@/features/production/types/production.types';

export interface AuditLogEntry {
  entry_id: string;
  timestamp: string;  // ISO 8601 UTC
  user_id: string;
  user_name: string;
  action_type: AuditActionType;
  affected_batch_id: string;
  before_value?: string;
  after_value?: string;
  reason?: string;
  source: string;  // API endpoint or system
}

export interface AuditQueryFilter {
  batch_id?: string;
  action_type?: AuditActionType;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  [AuditActionType.STAGE_TRANSITION]: 'Stage Transition',
  [AuditActionType.QUALITY_APPROVAL]: 'Quality Approved',
  [AuditActionType.QUALITY_REJECTION]: 'Quality Rejected',
  [AuditActionType.QUALITY_CONDITIONAL]: 'Quality Conditional',
  [AuditActionType.DATA_EXPORT]: 'Data Exported',
  [AuditActionType.DATA_MODIFICATION]: 'Data Modified',
  [AuditActionType.SYSTEM_ALERT]: 'System Alert',
  [AuditActionType.USER_LOGIN]: 'User Login',
  [AuditActionType.USER_LOGOUT]: 'User Logout',
  [AuditActionType.UNAUTHORIZED_ACCESS]: 'Unauthorized Access',
  [AuditActionType.UNDO_ACTION]: 'Action Undone',
};
