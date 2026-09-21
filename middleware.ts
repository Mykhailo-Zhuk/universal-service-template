import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Захищаємо /api/admin/*
  if (req.nextUrl.pathname.startsWith('/api/admin')) {
    // Виключаємо login endpoint
    if (req.nextUrl.pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const token = req.cookies.get('admin_token')?.value;
    const adminSecret = process.env.ADMIN_SECRET || 'misha-zhuk-admin-2026';

    if (token !== adminSecret) {
      return NextResponse.json(
        { error: 'Forbidden — admin auth required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*'
};
