import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const userCookie = req.cookies.get('hipg_user')?.value;
    if (userCookie) {
      const user = JSON.parse(userCookie);
      return NextResponse.json({ success: true, user });
    }

    // Default to security01 if no cookie
    const users = await getUsers();
    const defaultUser = users.find((u) => u.username === 'security01') || users[0];
    return NextResponse.json({ success: true, user: defaultUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

