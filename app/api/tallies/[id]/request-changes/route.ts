import { NextRequest, NextResponse } from 'next/server';
import { requestChangesTally, getTallyById } from '@/lib/storage';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { comments } = body;

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

    const updated = await requestChangesTally(id, supervisor, comments || 'Changes requested');
    return NextResponse.json({
      success: true,
      tally: updated,
      message: 'Correction request submitted to Security Officer',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

