// T062: Create dashboard service with API calls
import apiClient from '../../shared/services/apiClient';
import { DashboardResponse } from './dashboard.types';
import { dashboardSchema } from './dashboard.schema';

class DashboardService {
  async fetchDashboardData(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.get<DashboardResponse>('/batches/dashboard');

      // Validate response with Zod schema
      const validatedData = dashboardSchema.parse(response.data);

      return validatedData as DashboardResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch dashboard data: ${error.message}`);
      }
      throw error;
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

    throw lastError || new Error('Failed to fetch dashboard data after retries');
  }
}

export default new DashboardService();
