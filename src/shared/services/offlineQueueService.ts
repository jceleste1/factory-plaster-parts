// T091: Offline Queue Service
// Manages queued stage completions using IndexedDB with sync capabilities
import { indexedDbService } from './indexedDbService';
import { QueuedStageCompletion } from '../features/production/types/stageCompletion.types';

class OfflineQueueService {
  private readonly DB_NAME = 'manufacturing-tracking-db';
  private readonly STORE_NAME = 'stage_completion_queue';
  private syncListeners: Set<(queue: QueuedStageCompletion[]) => void> = new Set();

  /**
   * Initialize the offline queue store in IndexedDB
   */
  async initializeStore(): Promise<void> {
    try {
      // IndexedDB is initialized by indexedDbService, this is a fallback
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('batchId', 'batchId', { unique: false });
        }
      };

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to initialize offline queue store:', error);
    }
  }

  /**
   * Add a stage completion to the queue
   */
  async enqueue(completion: Omit<QueuedStageCompletion, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
    try {
      const id = `completion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const queuedItem: QueuedStageCompletion = {
        ...completion,
        id,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      };

      const db = await this.getDb();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.add(queuedItem);
        request.onsuccess = () => {
          this.notifyListeners();
          resolve(id);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to enqueue stage completion:', error);
      throw error;
    }
  }

  /**
   * Get all queued items
   */
  async getQueue(): Promise<QueuedStageCompletion[]> {
    try {
      const db = await this.getDb();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const items = (request.result as QueuedStageCompletion[])
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          resolve(items);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get queue:', error);
      return [];
    }
  }

  /**
   * Get pending items (not yet synced)
   */
  async getPending(): Promise<QueuedStageCompletion[]> {
    try {
      const queue = await this.getQueue();
      return queue.filter(item => item.status === 'pending' || item.status === 'failed');
    } catch (error) {
      console.error('Failed to get pending items:', error);
      return [];
    }
  }

  /**
   * Update queue item status
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'syncing' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const db = await this.getDb();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const getRequest = store.get(id);
      
      return new Promise((resolve, reject) => {
        getRequest.onsuccess = () => {
          const item = getRequest.result as QueuedStageCompletion;
          if (item) {
            item.status = status;
            if (error) {
              item.error = error;
              item.retryCount = (item.retryCount || 0) + 1;
            }
            item.lastRetry = new Date().toISOString();

            const updateRequest = store.put(item);
            updateRequest.onsuccess = () => {
              this.notifyListeners();
              resolve();
            };
            updateRequest.onerror = () => reject(updateRequest.error);
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error('Failed to update queue status:', error);
      throw error;
    }
  }

  /**
   * Remove item from queue (after successful sync)
   */
  async remove(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          this.notifyListeners();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to remove from queue:', error);
      throw error;
    }
  }

  /**
   * Clear all queued items
   */
  async clear(): Promise<void> {
    try {
      const db = await this.getDb();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
          this.notifyListeners();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear queue:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    syncing: number;
    synced: number;
    failed: number;
  }> {
    try {
      const queue = await this.getQueue();
      return {
        total: queue.length,
        pending: queue.filter(q => q.status === 'pending').length,
        syncing: queue.filter(q => q.status === 'syncing').length,
        synced: queue.filter(q => q.status === 'synced').length,
        failed: queue.filter(q => q.status === 'failed').length,
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return { total: 0, pending: 0, syncing: 0, synced: 0, failed: 0 };
    }
  }

  /**
   * Subscribe to queue changes
   */
  onQueueChange(callback: (queue: QueuedStageCompletion[]) => void): () => void {
    this.syncListeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of queue changes
   */
  private async notifyListeners(): Promise<void> {
    const queue = await this.getQueue();
    this.syncListeners.forEach(listener => {
      try {
        listener(queue);
      } catch (error) {
        console.error('Error in queue listener:', error);
      }
    });
  }

  /**
   * Get IndexedDB database connection
   */
  private getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineQueueService = new OfflineQueueService();
