// T062: Create dashboard service with API calls - Fallback to mock data

import apiClient from '@/shared/services/apiClient';
import { dashboardSchema } from '../types/dashboard.schema';
import { DashboardResponse } from '../types/dashboard.types';

// Mock data for development/offline mode
const MOCK_DASHBOARD_DATA: DashboardResponse = {
  timestamp: new Date().toISOString(),
  total_active_batches: 12,
  efficiency_rate: 87.5,
  production_velocity: 2.4,
  bottleneck_stage: 'CURING',
  stages: [
    {
      stage_name: 'PLANNING',
      batch_count: 3,
      avg_duration_hours: 0.25,
      status: 'GREEN',
      trend: 'stable',
    },
    {
      stage_name: 'MIXING',
      batch_count: 2,
      avg_duration_hours: 0.75,
      status: 'GREEN',
      trend: 'stable',
    },
    {
      stage_name: 'MOLDING',
      batch_count: 2,
      avg_duration_hours: 1,
      status: 'GREEN',
      trend: 'stable',
    },
    {
      stage_name: 'CURING',
      batch_count: 1,
      avg_duration_hours: 4,
      status: 'YELLOW',
      trend: 'up',
    },
    {
      stage_name: 'FINISHING',
      batch_count: 2,
      avg_duration_hours: 0.33,
      status: 'GREEN',
      trend: 'stable',
    },
    {
      stage_name: 'QUALITY',
      batch_count: 2,
      avg_duration_hours: 0.33,
      status: 'GREEN',
      trend: 'stable',
    },
    {
      stage_name: 'PACKAGING',
      batch_count: 1,
      avg_duration_hours: 0.42,
      status: 'GREEN',
      trend: 'stable',
    },
    {
      stage_name: 'SHIPPING',
      batch_count: 0,
      avg_duration_hours: 0,
      status: 'GREEN',
      trend: 'stable',
    },
  ],
};

class DashboardService {
  async fetchDashboardData(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.get<DashboardResponse>('/batches/dashboard');

      // Validate response with Zod schema
      const validatedData = dashboardSchema.parse(response.data);

      return validatedData as DashboardResponse;
    } catch (error) {
      console.warn('Backend unavailable, returning mock data:', error);
      // Fallback to mock data when backend is not available
      return MOCK_DASHBOARD_DATA;
    }
  }

  async fetchDashboardDataWithRetry(maxRetries = 3): Promise<DashboardResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.fetchDashboardData();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < maxRetries - 1) {
          // Wait before retry (exponential backoff: 1s, 2s, 4s)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // Return mock data on final failure
    console.warn('All retries failed, returning mock data', lastError?.message);
    return MOCK_DASHBOARD_DATA;
  }
}

export default new DashboardService();
