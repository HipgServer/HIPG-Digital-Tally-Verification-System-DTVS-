import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/storage';

export async function GET() {
  try {
    const status = await getDatabaseStatus();
    return NextResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      ...status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'DOWN',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

