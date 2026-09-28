import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const adminSecret = process.env.ADMIN_SECRET || 'misha-zhuk-admin-2026';
  const token = req.cookies.get('admin_token')?.value;
  const isAuthenticated = token === adminSecret;

  // Protect /api/admin/*
  if (pathname.startsWith('/api/admin')) {
    // Exclude auth endpoints
    if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Forbidden — admin auth required' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Protect /admin pages
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', req.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('from', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/admin', '/admin/:path*']
};
