import { NextRequest, NextResponse } from 'next/server';
import { getVesselById, saveVessel, deleteVessel } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vessel = await getVesselById(params.id);
    if (!vessel) {
      return NextResponse.json({ success: false, error: 'Vessel not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, vessel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const existing = await getVesselById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Vessel not found' }, { status: 404 });
    }

    const updated = await saveVessel({ ...existing, ...body, id: params.id });
    return NextResponse.json({ success: true, vessel: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ok = await deleteVessel(params.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Vessel not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Vessel deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

