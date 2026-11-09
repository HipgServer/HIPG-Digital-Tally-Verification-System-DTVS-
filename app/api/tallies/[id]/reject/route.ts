import { NextRequest, NextResponse } from 'next/server';
import { rejectTally, getTallyById } from '@/lib/storage';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { reason } = body;

    let supervisor = body.supervisor;
    if (!supervisor) {
      const userCookie = req.cookies.get('hipg_user')?.value;
      if (userCookie) {
        supervisor = JSON.parse(userCookie);
      } else {
        supervisor = {
          id: 'user-sup-01',
          name: 'Supervisor01',
          role: 'Supervisor',
          badgeNo: 'HIPG-SUP-012',
        };
      }
    }

    const tally = await getTallyById(id);
    if (!tally) {
      return NextResponse.json({ success: false, error: 'Tally record not found' }, { status: 404 });
    }

    const updated = await rejectTally(id, supervisor, reason || 'Physical inspection discrepancy');
    return NextResponse.json({ success: true, tally: updated, message: 'Record rejected' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

