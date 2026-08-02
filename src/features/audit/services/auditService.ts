// T139: Audit Service
import apiClient from '@/shared/services/apiClient';
import { AuditLogEntry } from '@/features/audit/types/audit.types';
import { auditLogEntrySchema } from '@/features/production/types/production.schema';

interface AuditLogQuery {
  batch_id?: string;
  action_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

class AuditService {
  // Get audit log for batch
  async getAuditLog(batch_id: string): Promise<AuditLogEntry[]> {
    try {
      const response = await apiClient.get<AuditLogEntry[]>(`/batches/${batch_id}/audit-trail`);
      return Array.isArray(response.data)
        ? response.data.map(e => auditLogEntrySchema.parse(e))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch audit log: ${error.message}`);
      }
      throw error;
    }
  }

  // Query audit logs with filters
  async queryAuditLogs(query: AuditLogQuery): Promise<AuditLogEntry[]> {
    try {
      const response = await apiClient.get<AuditLogEntry[]>('/audit-log/query', {
        params: query,
      });
      return Array.isArray(response.data)
        ? response.data.map(e => auditLogEntrySchema.parse(e))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to query audit logs: ${error.message}`);
      }
      throw error;
    }
  }

  // Export audit log
  async exportAuditLog(
    batch_id: string,
    format: 'csv' | 'pdf'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/batches/${batch_id}/audit-trail/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return response.data as Blob;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to export audit log: ${error.message}`);
      }
      throw error;
    }
  }

  // Get audit log entry detail
  async getAuditLogEntry(entry_id: string): Promise<AuditLogEntry | null> {
    try {
      const response = await apiClient.get<AuditLogEntry>(`/audit-log/${entry_id}`);
      return auditLogEntrySchema.parse(response.data);
    } catch (error) {
      return null;
    }
  }

  // Create audit log entry (internal use)
  async logAction(action: Omit<AuditLogEntry, 'entry_id' | 'timestamp'>): Promise<AuditLogEntry> {
    try {
      const response = await apiClient.post<AuditLogEntry>('/audit-log', action);
      return auditLogEntrySchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create audit log entry: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new AuditService();
