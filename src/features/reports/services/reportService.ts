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

// ============================================
// MOCK DATA - Usado durante desenvolvimento
// ============================================
const MOCK_DATA = {
  efficencyReport: {
    report_id: 'EFF-2024-001',
    date_range: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
    },
    stages: [
      {
        stage_name: 'Corte',
        avg_duration: 45,
        historical_avg: 50,
        trend: 'DOWN' as const,
        bottleneck_flag: false,
      },
      {
        stage_name: 'Moldagem',
        avg_duration: 120,
        historical_avg: 110,
        trend: 'UP' as const,
        bottleneck_flag: true,
      },
      {
        stage_name: 'Acabamento',
        avg_duration: 30,
        historical_avg: 35,
        trend: 'DOWN' as const,
        bottleneck_flag: false,
      },
      {
        stage_name: 'Embalagem',
        avg_duration: 15,
        historical_avg: 15,
        trend: 'STABLE' as const,
        bottleneck_flag: false,
      },
    ],
    scrap_data: [
      {
        stage: 'Corte',
        defect_count: 12,
        rework_rate: 0.05,
        cost_impact: 450,
      },
      {
        stage: 'Moldagem',
        defect_count: 28,
        rework_rate: 0.12,
        cost_impact: 1200,
      },
      {
        stage: 'Acabamento',
        defect_count: 5,
        rework_rate: 0.02,
        cost_impact: 150,
      },
    ],
    trends: {
      Corte: 'DOWN',
      Moldagem: 'UP',
      Acabamento: 'STABLE',
      Embalagem: 'STABLE',
    },
    timestamp: new Date().toISOString(),
  } as EfficiencyReport,

  bottleneckStages: [
    {
      stage_name: 'Moldagem',
      avg_duration: 120,
      historical_avg: 110,
      trend: 'UP' as const,
      bottleneck_flag: true,
    },
  ] as StageMetric[],

  scrapAnalysis: [
    {
      stage: 'Moldagem',
      defect_count: 28,
      rework_rate: 0.12,
      cost_impact: 1200,
    },
    {
      stage: 'Corte',
      defect_count: 12,
      rework_rate: 0.05,
      cost_impact: 450,
    },
  ] as ScrapData[],

  trends: {
    Corte: [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-08', value: 48 },
      { date: '2024-01-15', value: 46 },
      { date: '2024-01-22', value: 45 },
      { date: '2024-01-29', value: 45 },
    ],
    Moldagem: [
      { date: '2024-01-01', value: 110 },
      { date: '2024-01-08', value: 112 },
      { date: '2024-01-15', value: 115 },
      { date: '2024-01-22', value: 118 },
      { date: '2024-01-29', value: 120 },
    ],
  } as Record<string, Array<{ date: string; value: number }>>,
};

// ============================================
// CONFIGURAÇÃO - Alternar entre Mock e Real
// ============================================
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

class ReportService {
  // Fetch efficiency report
  async fetchEfficiencyReport(dateRange: DateRange): Promise<EfficiencyReport> {
    try {
      // Se estiver em modo mock, retorna dados mockados
      if (USE_MOCK_DATA) {
        console.log('📊 Usando dados MOCK para EfficiencyReport');
        // Simula delay de rede
        await new Promise((resolve) => setTimeout(resolve, 300));
        return MOCK_DATA.efficencyReport;
      }

      // Caso contrário, usa o backend real
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
      if (USE_MOCK_DATA) {
        console.log('📊 Usando dados MOCK para BottleneckStages');
        await new Promise((resolve) => setTimeout(resolve, 300));
        return MOCK_DATA.bottleneckStages;
      }

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
      if (USE_MOCK_DATA) {
        console.log('📊 Usando dados MOCK para ScrapAnalysis');
        await new Promise((resolve) => setTimeout(resolve, 300));
        return MOCK_DATA.scrapAnalysis;
      }

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
      if (USE_MOCK_DATA) {
        console.log('📊 Usando dados MOCK para TrendAnalysis');
        await new Promise((resolve) => setTimeout(resolve, 300));
        return MOCK_DATA.trends;
      }

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
