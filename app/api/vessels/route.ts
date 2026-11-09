import { NextRequest, NextResponse } from 'next/server';
import { getVessels, saveVessel, addAuditLog } from '@/lib/storage';

export async function GET() {
  try {
    const vessels = await getVessels();
    return NextResponse.json({ success: true, vessels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await saveVessel(body);

    await addAuditLog({
      userId: 'admin',
      userName: 'Administrator',
      userRole: 'Administrator',
      action: 'VESSEL_CREATED',
      details: `Vessel updated/created: ${saved.name} (Voyage: ${saved.voyageNumber}, DOC: ${saved.docNumber})`,
      deviceId: 'HIPG-PORT-ADMIN',
    });

    return NextResponse.json({ success: true, vessel: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

