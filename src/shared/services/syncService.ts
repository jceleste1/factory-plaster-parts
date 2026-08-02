import apiClient from './apiClient';
import { indexedDbService, PendingRequest } from './indexedDbService';

/**
 * Sync service for offline queue management
 * Processes pending requests when connection is restored
 */

export interface SyncServiceConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: SyncServiceConfig = {
  batchSize: 10,
  maxRetries: 3,
  retryDelay: 1000,
};

class SyncService {
  private config: SyncServiceConfig;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<SyncServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start periodic sync when online
   */
  startSync(): void {
    if (this.syncInterval) {
      return; // Already syncing
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncPendingRequests();
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop periodic sync
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending requests from offline queue
   */
  async syncPendingRequests(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failureCount = 0;

    try {
      const pendingRequests = await indexedDbService.getPendingRequests();

      if (pendingRequests.length === 0) {
        return { success: 0, failed: 0 };
      }

      // Process in batches
      const batches = this.createBatches(pendingRequests, this.config.batchSize);

      for (const batch of batches) {
        for (const request of batch) {
          try {
            await this.executeRequest(request);
            await indexedDbService.removeRequest(request.id!);
            successCount++;
          } catch (error) {
            failureCount++;

            // Update retry count
            if (request.retryCount < request.maxRetries) {
              request.retryCount++;
              // Could re-add to queue here if desired
            }

            console.error(`Sync failed for request to ${request.endpoint}:`, error);
          }
        }
      }

      // Show toast notification
      if (successCount > 0) {
        console.log(
          `Sync complete: ${successCount} successful, ${failureCount} failed`,
        );
      }
    } finally {
      this.isSyncing = false;
    }

    return { success: successCount, failed: failureCount };
  }

  /**
   * Execute a single pending request
   */
  private async executeRequest(request: PendingRequest): Promise<unknown> {
    const { endpoint, method, payload } = request;

    switch (method) {
      case 'GET':
        return apiClient.get(endpoint);
      case 'POST':
        return apiClient.post(endpoint, payload);
      case 'PUT':
        return apiClient.put(endpoint, payload);
      case 'PATCH':
        return apiClient.patch(endpoint, payload);
      case 'DELETE':
        return apiClient.delete(endpoint);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Split array into batches
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Queue a request for later sync
   */
  async queueRequest(request: Omit<PendingRequest, 'id'>): Promise<void> {
    try {
      await indexedDbService.addRequest(request);
      console.log(`Request queued for offline sync: ${request.endpoint}`);
    } catch (error) {
      console.error('Failed to queue request:', error);
    }
  }
}

export const syncService = new SyncService();
