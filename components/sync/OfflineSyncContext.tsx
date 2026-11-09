'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineStore } from '@/lib/offline-store';
import { VehicleTally } from '@/lib/types';

export type SyncState = 'Online' | 'Offline' | 'Sync Pending' | 'Syncing' | 'Sync Completed' | 'Sync Failed';

interface OfflineSyncContextType {
  isOnline: boolean;
  syncState: SyncState;
  pendingCount: number;
  triggerSync: () => Promise<void>;
  saveTallyWithSync: (tally: Partial<VehicleTally>, isDraft?: boolean) => Promise<VehicleTally>;
  deviceId: string;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncState, setSyncState] = useState<SyncState>('Online');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [deviceId, setDeviceId] = useState<string>('HIPG-TAB-RO-04');

  const checkPending = useCallback(async () => {
    try {
      const items = await offlineStore.getPendingQueue();
      setPendingCount(items.length);
      if (items.length > 0 && navigator.onLine) {
        setSyncState('Sync Pending');
      } else if (!navigator.onLine) {
        setSyncState('Offline');
      } else {
        setSyncState('Online');
      }
    } catch (e) {
      // offline store fallback
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncState('Offline');
      return;
    }

    try {
      setSyncState('Syncing');
      const queue = await offlineStore.getPendingQueue();
      if (queue.length === 0) {
        setSyncState('Online');
        setPendingCount(0);
        return;
      }

      const devId = await offlineStore.getDeviceId();
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: queue, deviceId: devId }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.processed)) {
        for (const item of data.processed) {
          if (item.status === 'completed') {
            await offlineStore.updateQueueItem(item.queueId, 'completed');
            await offlineStore.markTallySynced(item.localId, item.referenceNo);
          } else {
            await offlineStore.updateQueueItem(item.queueId, 'failed', item.error);
          }
        }
        setSyncState('Sync Completed');
        setTimeout(() => {
          checkPending();
        }, 2000);
      } else {
        setSyncState('Sync Failed');
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncState('Sync Failed');
    }
  }, [checkPending]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      offlineStore.getDeviceId().then(setDeviceId);

      const handleOnline = () => {
        setIsOnline(true);
        setSyncState('Online');
        // Auto sync when connection restored
        triggerSync();
      };

      const handleOffline = () => {
        setIsOnline(false);
        setSyncState('Offline');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      checkPending();
      const interval = setInterval(checkPending, 10000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, [checkPending, triggerSync]);

  const saveTallyWithSync = async (
    tallyData: Partial<VehicleTally>,
    isDraft: boolean = false
  ): Promise<VehicleTally> => {
    const devId = await offlineStore.getDeviceId();
    const tempId = tallyData.id || `local-${Date.now()}`;
    const fullTally: VehicleTally = {
      id: tempId,
      referenceNo: tallyData.referenceNo || `DTVS-PENDING-${Date.now().toString().slice(-4)}`,
      vesselId: tallyData.vesselId || 'vessel-gp-015',
      vesselName: tallyData.vesselName || 'Grand Pioneer',
      voyageNo: tallyData.voyageNo || 'GP-015',
      docNo: tallyData.docNo || '37538',
      vehicleNo: tallyData.vehicleNo || 'TEMP-VEHICLE',
      chassisNo: tallyData.chassisNo || 'TEMP-CHASSIS',
      tagNo: tallyData.tagNo,
      agentName: tallyData.agentName || 'MOL',
      yardLocation: tallyData.yardLocation || 'Berth 07 (RoRo)',
      brandModel: tallyData.brandModel || 'General Vehicle',
      cargoType: tallyData.cargoType || 'Vehicle (CBU)',
      driverName: tallyData.driverName,
      driverLicense: tallyData.driverLicense,
      checklist: tallyData.checklist || [],
      hasDamage: !!(tallyData.damages && tallyData.damages.length > 0),
      damages: tallyData.damages || [],
      photos: tallyData.photos || [],
      status: isDraft ? 'Draft' : 'Pending Approval',
      isLocked: false,
      createdBy: tallyData.createdBy || {
        id: 'user-sec-01',
        name: 'Security01',
        role: 'Security Officer',
        badgeNo: 'HIPG-SEC-104',
      },
      deviceId: devId,
      createdAt: tallyData.createdAt || new Date().toISOString(),
      submittedAt: !isDraft ? new Date().toISOString() : undefined,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
    };

    // If online, save to server directly
    if (navigator.onLine) {
      try {
        const res = await fetch('/api/tallies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullTally),
        });
        const result = await res.json();
        if (result.success && result.tally) {
          // Cache copy in indexedDB
          await offlineStore.saveTallyLocally(result.tally, false);
          return result.tally;
        }
      } catch (err) {
        console.warn('Direct server save failed, queueing for offline sync...', err);
      }
    }

    // Save locally and add to sync queue
    await offlineStore.saveTallyLocally(fullTally, true);
    await checkPending();
    return fullTally;
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        syncState,
        pendingCount,
        triggerSync,
        saveTallyWithSync,
        deviceId,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
}

