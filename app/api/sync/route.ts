import { NextRequest, NextResponse } from 'next/server';
import { saveTally, addAuditLog } from '@/lib/storage';
import { SyncQueueItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, deviceId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, processed: [], message: 'No items to sync' });
    }

    const processedResults = [];

    for (const item of items as SyncQueueItem[]) {
      try {
        if (item.type === 'TALLY_SUBMIT' || item.type === 'TALLY_DRAFT') {
          const tallyPayload = item.payload;
          const user = tallyPayload.createdBy || {
            id: 'user-sec-01',
            name: 'Security01',
            role: 'Security Officer',
            badgeNo: 'HIPG-SEC-104',
          };

          const savedTally = await saveTally(
            {
              ...tallyPayload,
              deviceId: deviceId || tallyPayload.deviceId,
              syncStatus: 'synced',
            },
            user
          );

          await addAuditLog({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: 'OFFLINE_SYNC_COMPLETED',
            recordId: savedTally.id,
            referenceNo: savedTally.referenceNo,
            details: `Synchronized offline record ${savedTally.referenceNo} for vehicle ${savedTally.vehicleNo} from device ${deviceId || 'PORT-DEVICE'}`,
            deviceId,
          });

          processedResults.push({
            queueId: item.id,
            localId: item.localId,
            referenceNo: savedTally.referenceNo,
            status: 'completed',
          });
        }
      } catch (err: any) {
        processedResults.push({
          queueId: item.id,
          localId: item.localId,
          status: 'failed',
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedResults,
      count: processedResults.filter((p) => p.status === 'completed').length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

