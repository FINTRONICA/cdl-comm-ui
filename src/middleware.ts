import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTParser } from './utils/jwtParser';
import { COOKIES } from './types/auth';

export function middleware(request: NextRequest) {
  
  if (request.nextUrl.pathname.startsWith('/_next/') || 
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.startsWith('/next/') ||
      request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|ico)$/)) {
    return NextResponse.next();
  }
  
  const response = NextResponse.next();

  if (request.nextUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIES.AUTH_TOKEN)?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  const userType = request.cookies.get(COOKIES.USER_TYPE)?.value;
  
  if (token && JWTParser.isExpired(token)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIES.AUTH_TOKEN);
    response.cookies.delete(COOKIES.USER_TYPE);
    response.cookies.delete(COOKIES.USER_NAME);
    response.cookies.delete(COOKIES.USER_ID);
    return response;
  }
  
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (pathname === '/login' && token) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  
  if (!isPublicRoute && !token && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'https://103.181.200.143:8081'}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self'"
    ].join('; ')
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  response.headers.set(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ')
  );

  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.delete('Server');

  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next|next|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot|ico)$).*)',
  ],
};