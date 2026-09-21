import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  const adminSecret = process.env.ADMIN_SECRET || 'misha-zhuk-admin-2026';

  if (secret !== adminSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  (await cookies()).set('admin_token', adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 днів
  });

  return NextResponse.json({ success: true });
}
