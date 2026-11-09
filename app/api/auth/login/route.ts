import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUsers, addAuditLog } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, role } = body;

    const users = await getUsers();
    let targetUser = null;

    if (username) {
      targetUser = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase().trim()
      );
    } else if (role) {
      targetUser = users.find((u) => u.role === role);
    }

    // If user not found, default to first user or security01
    if (!targetUser) {
      targetUser = users[0];
    }

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      user: targetUser,
      message: 'Login successful',
    });

    response.cookies.set('hipg_user', JSON.stringify(targetUser), {
      httpOnly: false, // Accessible to client context for role state
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Audit log
    await addAuditLog({
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      action: 'USER_LOGIN',
      details: `User ${targetUser.name} (${targetUser.role}) logged into DTVS terminal`,
      deviceId: 'HIPG-AUTH-SYS',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

