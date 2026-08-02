// T122: Quality Control Service
import apiClient from '@/shared/services/apiClient';
import { QualityInspection, QualityResult, DefectRecord } from '@/features/production/types/production.types';
import { qualityInspectionSchema } from '@/features/production/types/production.schema';
import { Batch, batchSchema } from '@/features/production/types/production.types';

interface QualityInspectionRequest {
  result: QualityResult;
  defects?: DefectRecord[];
  notes?: string;
  rework_steps?: string;
}

interface DefectCode {
  code: string;
  label: string;
  description: string;
}

class QualityService {
  // Get batches waiting for quality inspection
  async getBatchesInQualityQueue(): Promise<Batch[]> {
    try {
      const response = await apiClient.get<Batch[]>('/batches/quality-queue');
      return Array.isArray(response.data) ? response.data.map(b => batchSchema.parse(b)) : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch quality queue: ${error.message}`);
      }
      throw error;
    }
  }

  // Submit quality inspection result
  async submitQualityInspection(
    batch_id: string,
    inspection: QualityInspectionRequest
  ): Promise<QualityInspection> {
    try {
      const response = await apiClient.post<QualityInspection>(
        `/batches/${batch_id}/quality-inspection`,
        inspection
      );
      return qualityInspectionSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit quality inspection: ${error.message}`);
      }
      throw error;
    }
  }

  // Get defect codes reference data
  async getDefectCodes(): Promise<DefectCode[]> {
    try {
      const response = await apiClient.get<DefectCode[]>('/reference/defect-codes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch defect codes: ${error.message}`);
      }
      throw error;
    }
  }

  // Get rejection reason codes
  async getRejectionReasons(): Promise<DefectCode[]> {
    try {
      const response = await apiClient.get<DefectCode[]>('/reference/rejection-reasons');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch rejection reasons: ${error.message}`);
      }
      throw error;
    }
  }

  // Get quality inspection for batch
  async getQualityInspection(batch_id: string): Promise<QualityInspection | null> {
    try {
      const response = await apiClient.get<QualityInspection>(`/batches/${batch_id}/quality-inspection`);
      return qualityInspectionSchema.parse(response.data);
    } catch (error) {
      return null;
    }
  }
}

export default new QualityService();
