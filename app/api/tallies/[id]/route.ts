import { NextRequest, NextResponse } from 'next/server';
import { getTallyById, getTallyByReferenceNo, saveTally, deleteTally } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let tally = await getTallyById(id);
    if (!tally) {
      tally = await getTallyByReferenceNo(id);
    }

    if (!tally) {
      return NextResponse.json({ success: false, error: 'Tally record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tally });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const existing = await getTallyById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Tally record not found' }, { status: 404 });
    }

    if (existing.isLocked && existing.status === 'Approved') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify an approved and locked record' },
        { status: 403 }
      );
    }

    let user = body.user;
    if (!user) {
      const userCookie = req.cookies.get('hipg_user')?.value;
      if (userCookie) user = JSON.parse(userCookie);
      else user = existing.createdBy;
    }

    const updated = await saveTally({ ...existing, ...body, id }, user);
    return NextResponse.json({ success: true, tally: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userCookie = req.cookies.get('hipg_user')?.value;
    const user = userCookie ? JSON.parse(userCookie) : undefined;

    const result = await deleteTally(id, user);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

