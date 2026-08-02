// T077: Create batch service with API calls
import apiClient from '@/shared/services/apiClient';
import {
  BatchDetail,
  BatchSearchResult,
  AuditLogEntry,
} from '../types/batch.types';
import {
  batchDetailSchema,
  auditLogEntrySchema,
} from '../types/batch.schema';

class BatchService {
  async fetchBatchDetail(batchId: string): Promise<BatchDetail> {
    try {
      const response = await apiClient.get(`/batches/${batchId}`);
      return batchDetailSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error(`Batch ${batchId} not found`);
        }
        throw new Error(`Failed to fetch batch details: ${error.message}`);
      }
      throw error;
    }
  }

  async searchBatches(query: string): Promise<BatchSearchResult[]> {
    try {
      const response = await apiClient.get('/batches/search', {
        params: { q: query },
      });
      
      // Validate each result
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Batch search failed: ${error.message}`);
      }
      throw error;
    }
  }

  async fetchAuditTrail(batchId: string, limit = 100, offset = 0): Promise<AuditLogEntry[]> {
    try {
      const response = await apiClient.get(`/batches/${batchId}/audit-trail`, {
        params: { limit, offset },
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid audit trail response');
      }

      return response.data.map((entry: any) => auditLogEntrySchema.parse(entry));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch audit trail: ${error.message}`);
      }
      throw error;
    }
  }

  async exportAuditTrail(
    batchId: string,
    format: 'pdf' | 'csv'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(`/batches/${batchId}/audit-trail/export`, {
        params: { format },
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to export audit trail: ${error.message}`);
      }
      throw error;
    }
  }

  async getRecentBatches(limit = 10): Promise<BatchSearchResult[]> {
    try {
      const response = await apiClient.get('/batches/recent', {
        params: { limit },
      });

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch recent batches: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new BatchService();
