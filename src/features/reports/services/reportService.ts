// T107: Reports Service
import apiClient from '@/shared/services/apiClient';

export interface StageMetric {
  stage_name: string;
  avg_duration: number;
  historical_avg: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  bottleneck_flag: boolean;
}

export interface ScrapData {
  stage: string;
  defect_count: number;
  rework_rate: number;
  cost_impact: number;
}

export interface EfficiencyReport {
  report_id: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  stages: StageMetric[];
  scrap_data: ScrapData[];
  trends: Record<string, 'UP' | 'DOWN' | 'STABLE'>;
  timestamp: string;
}

interface DateRange {
  start_date: string;
  end_date: string;
}

class ReportService {
  // Fetch efficiency report
  async fetchEfficiencyReport(dateRange: DateRange): Promise<EfficiencyReport> {
    try {
      const response = await apiClient.get<EfficiencyReport>('/reports/efficiency', {
        params: dateRange,
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch efficiency report: ${error.message}`);
      }
      throw error;
    }
  }

  // Get bottleneck stages
  async getBottleneckStages(dateRange: DateRange): Promise<StageMetric[]> {
    try {
      const response = await apiClient.get<StageMetric[]>('/reports/bottlenecks', {
        params: dateRange,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch bottleneck stages: ${error.message}`);
      }
      throw error;
    }
  }

  // Get scrap analysis
  async getScrapAnalysis(dateRange: DateRange): Promise<ScrapData[]> {
    try {
      const response = await apiClient.get<ScrapData[]>('/reports/scrap', {
        params: dateRange,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch scrap analysis: ${error.message}`);
      }
      throw error;
    }
  }

  // Export efficiency report
  async exportEfficiencyReport(
    report_id: string,
    format: 'pdf' | 'csv'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/reports/${report_id}/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return response.data as Blob;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to export report: ${error.message}`);
      }
      throw error;
    }
  }

  // Get trend analysis
  async getTrendAnalysis(dateRange: DateRange): Promise<Record<string, Array<{ date: string; value: number }>>> {
    try {
      const response = await apiClient.get<Record<string, Array<{ date: string; value: number }>>>('/reports/trends', {
        params: dateRange,
      });
      return response.data || {};
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch trend analysis: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new ReportService();
