// T062 & T077: Production and Batch Services
import apiClient from '@/shared/services/apiClient';
import { Batch, StageTransition, QualityInspection, ShippingRecord, AuditLogEntry, DashboardData, ManufacturingStage, QualityResult } from './production.types';
import { dashboardSchema, batchSchema, stageTransitionSchema, qualityInspectionSchema, auditLogEntrySchema } from './production.schema';

class ProductionService {
  // Dashboard API
  async fetchDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>('/batches/dashboard');
      return dashboardSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch dashboard data: ${error.message}`);
      }
      throw error;
    }
  }

  // Batch Search and Details
  async searchBatches(query: string): Promise<Batch[]> {
    try {
      const response = await apiClient.get<Batch[]>('/batches/search', {
        params: { query },
      });
      return Array.isArray(response.data) 
        ? response.data.map(b => batchSchema.parse(b))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search batches: ${error.message}`);
      }
      throw error;
    }
  }

  async fetchBatchDetail(batch_id: string): Promise<Batch> {
    try {
      const response = await apiClient.get<Batch>(`/batches/${batch_id}`);
      return batchSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch batch details: ${error.message}`);
      }
      throw error;
    }
  }

  async fetchBatchTimeline(batch_id: string): Promise<StageTransition[]> {
    try {
      const response = await apiClient.get<StageTransition[]>(`/batches/${batch_id}/timeline`);
      return Array.isArray(response.data)
        ? response.data.map(t => stageTransitionSchema.parse(t))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch batch timeline: ${error.message}`);
      }
      throw error;
    }
  }

  // Audit Trail
  async fetchAuditTrail(batch_id: string): Promise<AuditLogEntry[]> {
    try {
      const response = await apiClient.get<AuditLogEntry[]>(`/batches/${batch_id}/audit-trail`);
      return Array.isArray(response.data)
        ? response.data.map(e => auditLogEntrySchema.parse(e))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch audit trail: ${error.message}`);
      }
      throw error;
    }
  }

  async exportAuditTrail(
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
        throw new Error(`Failed to export audit trail: ${error.message}`);
      }
      throw error;
    }
  }

  // Stage Completion (Worker)
  async logStageCompletion(batch_id: string, notes?: string): Promise<Batch> {
    try {
      const response = await apiClient.post<Batch>(
        `/batches/${batch_id}/stage-completion`,
        { notes }
      );
      return batchSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to log stage completion: ${error.message}`);
      }
      throw error;
    }
  }

  async undoStageCompletion(batch_id: string): Promise<Batch> {
    try {
      const response = await apiClient.post<Batch>(
        `/batches/${batch_id}/undo`,
        {}
      );
      return batchSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to undo stage completion: ${error.message}`);
      }
      throw error;
    }
  }

  // Worker's Current Work
  async getMyCurrentWork(): Promise<Batch[]> {
    try {
      const response = await apiClient.get<Batch[]>('/batches/my-work');
      return Array.isArray(response.data)
        ? response.data.map(b => batchSchema.parse(b))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch my work: ${error.message}`);
      }
      throw error;
    }
  }

  // Quality Control
  async getBatchesInQuality(): Promise<Batch[]> {
    try {
      const response = await apiClient.get<Batch[]>('/batches/quality-queue');
      return Array.isArray(response.data)
        ? response.data.map(b => batchSchema.parse(b))
        : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch batches in quality: ${error.message}`);
      }
      throw error;
    }
  }

  async submitQualityInspection(
    batch_id: string,
    result: QualityResult,
    defects?: Array<{ defect_type: string; location: string; quantity: number; severity: number }>,
    notes?: string
  ): Promise<QualityInspection> {
    try {
      const response = await apiClient.post<QualityInspection>(
        `/batches/${batch_id}/quality-inspection`,
        { result, defects, notes }
      );
      return qualityInspectionSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit quality inspection: ${error.message}`);
      }
      throw error;
    }
  }

  async getQualityDefectCodes(): Promise<Array<{ code: string; label: string; description: string }>> {
    try {
      const response = await apiClient.get<Array<{ code: string; label: string; description: string }>>('/reference/defect-codes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch defect codes: ${error.message}`);
      }
      throw error;
    }
  }

  // Batch Quality Details
  async fetchQualityInspection(batch_id: string): Promise<QualityInspection | null> {
    try {
      const response = await apiClient.get<QualityInspection>(`/batches/${batch_id}/quality-inspection`);
      return qualityInspectionSchema.parse(response.data);
    } catch (error) {
      // If quality inspection doesn't exist (404), return null
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Failed to fetch quality inspection:', error);
      return null;
    }
  }

  // Shipping Details
  async fetchShippingRecord(batch_id: string): Promise<ShippingRecord | null> {
    try {
      const response = await apiClient.get<ShippingRecord>(`/batches/${batch_id}/shipping`);
      return response.data || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Failed to fetch shipping record:', error);
      return null;
    }
  }
}

export default new ProductionService();
