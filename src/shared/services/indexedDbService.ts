/**
 * IndexedDB service for offline queue management
 * Stores pending API requests that failed due to offline status
 */

const DB_NAME = 'manufacturing_tracking';
const STORE_NAME = 'pending_requests';
const DB_VERSION = 1;

export interface PendingRequest {
  id?: number;
  timestamp: Date;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload?: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initialized: Promise<IDBDatabase>;

  constructor() {
    this.initialized = this.init();
  }

  private async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB initialization failed');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async addRequest(request: Omit<PendingRequest, 'id'>): Promise<number> {
    const db = await this.initialized;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const requestObj = store.add(request);

      requestObj.onsuccess = () => {
        resolve(requestObj.result as number);
      };

      requestObj.onerror = () => {
        reject(requestObj.error);
      };
    });
  }

  async getPendingRequests(): Promise<PendingRequest[]> {
    const db = await this.initialized;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const requestObj = store.getAll();

      requestObj.onsuccess = () => {
        resolve(requestObj.result);
      };

      requestObj.onerror = () => {
        reject(requestObj.error);
      };
    });
  }

  async removeRequest(id: number): Promise<void> {
    const db = await this.initialized;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const requestObj = store.delete(id);

      requestObj.onsuccess = () => {
        resolve();
      };

      requestObj.onerror = () => {
        reject(requestObj.error);
      };
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.initialized;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const requestObj = store.clear();

      requestObj.onsuccess = () => {
        resolve();
      };

      requestObj.onerror = () => {
        reject(requestObj.error);
      };
    });
  }
}

export const indexedDbService = new IndexedDBService();
