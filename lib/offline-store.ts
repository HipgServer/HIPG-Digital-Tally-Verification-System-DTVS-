import { VehicleTally, SyncQueueItem } from './types';

const DB_NAME = 'hipg_dtvs_offline_v1';
const TALLIES_STORE = 'offline_tallies';
const SYNC_QUEUE_STORE = 'sync_queue';
const SETTINGS_STORE = 'app_settings';

export class OfflineStorageManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return null as any;
    }
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(TALLIES_STORE)) {
          const tallyStore = db.createObjectStore(TALLIES_STORE, { keyPath: 'id' });
          tallyStore.createIndex('referenceNo', 'referenceNo', { unique: false });
          tallyStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          tallyStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const queueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event: any) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  // Get or initialize persistent Device ID
  public async getDeviceId(): Promise<string> {
    if (typeof window === 'undefined') return 'HIPG-SERVER';
    let id = localStorage.getItem('hipg_dtvs_device_id');
    if (!id) {
      id = `HIPG-DEV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      localStorage.setItem('hipg_dtvs_device_id', id);
    }
    return id;
  }

  // Save tally locally
  public async saveTallyLocally(tally: VehicleTally, addToQueue: boolean = true): Promise<void> {
    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction([TALLIES_STORE, SYNC_QUEUE_STORE], 'readwrite');
      const tallyStore = tx.objectStore(TALLIES_STORE);
      tallyStore.put(tally);

      if (addToQueue) {
        const queueStore = tx.objectStore(SYNC_QUEUE_STORE);
        const queueItem: SyncQueueItem = {
          id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          localId: tally.id,
          type: tally.status === 'Draft' ? 'TALLY_DRAFT' : 'TALLY_SUBMIT',
          payload: tally,
          createdAt: new Date().toISOString(),
          attempts: 0,
          status: 'pending',
        };
        queueStore.put(queueItem);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get all locally saved tallies
  public async getLocalTallies(): Promise<VehicleTally[]> {
    const db = await this.openDB();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction(TALLIES_STORE, 'readonly');
      const store = tx.objectStore(TALLIES_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // Get pending sync items
  public async getPendingQueue(): Promise<SyncQueueItem[]> {
    const db = await this.openDB();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SYNC_QUEUE_STORE, 'readonly');
      const store = tx.objectStore(SYNC_QUEUE_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items: SyncQueueItem[] = req.result || [];
        resolve(items.filter((i) => i.status === 'pending' || i.status === 'failed'));
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Mark queue item as synced or failed
  public async updateQueueItem(id: string, status: 'completed' | 'failed', error?: string): Promise<void> {
    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(SYNC_QUEUE_STORE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: SyncQueueItem = getReq.result;
        if (item) {
          if (status === 'completed') {
            store.delete(id); // Clean up upon successful sync
          } else {
            item.status = status;
            item.attempts += 1;
            item.lastAttempt = new Date().toISOString();
            item.error = error;
            store.put(item);
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Mark tally as synced
  public async markTallySynced(id: string, serverRefNo?: string): Promise<void> {
    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(TALLIES_STORE, 'readwrite');
      const store = tx.objectStore(TALLIES_STORE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const tally: VehicleTally = getReq.result;
        if (tally) {
          tally.syncStatus = 'synced';
          if (serverRefNo) tally.referenceNo = serverRefNo;
          store.put(tally);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const offlineStore = new OfflineStorageManager();

