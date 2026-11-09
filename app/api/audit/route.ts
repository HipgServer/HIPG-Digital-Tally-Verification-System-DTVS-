import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, addAuditLog } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('recordId') || undefined;
    const referenceNo = searchParams.get('referenceNo') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const logs = await getAuditLogs({ recordId, referenceNo, userId });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await addAuditLog(body);
    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

