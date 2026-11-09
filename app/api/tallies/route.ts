import { NextRequest, NextResponse } from 'next/server';
import { getTallies, saveTally } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const vesselId = searchParams.get('vesselId') || undefined;
    const search = searchParams.get('search') || undefined;

    const tallies = await getTallies({ status, vesselId, search });
    return NextResponse.json({ success: true, tallies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let user = body.user;

    if (!user) {
      const userCookie = req.cookies.get('hipg_user')?.value;
      if (userCookie) {
        user = JSON.parse(userCookie);
      } else {
        user = {
          id: 'user-sec-01',
          name: 'Security01',
          role: 'Security Officer',
          badgeNo: 'HIPG-SEC-104',
        };
      }
    }

    const saved = await saveTally(body, user);
    return NextResponse.json({ success: true, tally: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

