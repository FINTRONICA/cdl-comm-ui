import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTParser } from './utils/jwtParser';
import { COOKIES } from './types/auth';
import { stripBasePath } from './utils/basePath';

export function middleware(request: NextRequest) {
  // With Next `basePath`, NextRequest.nextUrl.pathname is already basePath-stripped.
  // We keep our own base-path stripping only to collapse accidental duplicates like:
  // `/commercial/commercial/login` -> `/login`
  const pathname = request.nextUrl.pathname
  const canonicalPathname = stripBasePath(pathname)

  // Canonicalize accidental double-basePath URLs.
  // IMPORTANT: Do not add basePath here — Next will do that automatically.
  if (canonicalPathname !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = canonicalPathname
    return NextResponse.redirect(url)
  }

  // Ignore Next internals + static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/next/') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Skip API routes entirely (never apply auth redirects to /api/**)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (
    request.nextUrl.protocol !== 'https:' &&
    process.env.NODE_ENV === 'production' &&
    process.env.FORCE_HTTPS === 'true'
  ) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  const token =
    request.cookies.get(COOKIES.AUTH_TOKEN)?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  const toSafePath = (value: string | null | undefined, fallback: string) => {
    if (!value) return fallback
    // Avoid open-redirects (keep redirects within this app only)
    if (value.startsWith('http://') || value.startsWith('https://')) return fallback
    return value.startsWith('/') ? value : `/${value}`
  }

  // FIRST LINE OF DEFENSE: token exists but is expired → redirect to login and clear auth cookies
  if (token && JWTParser.isExpired(token)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)

    const expiredResponse = NextResponse.redirect(url)
    expiredResponse.cookies.delete(COOKIES.AUTH_TOKEN)
    expiredResponse.cookies.delete(COOKIES.USER_TYPE)
    expiredResponse.cookies.delete(COOKIES.USER_NAME)
    expiredResponse.cookies.delete(COOKIES.USER_ID)
    return expiredResponse
  }

  // 1. If user is on /login but has token → redirect to intended page or dashboard
  if (pathname === '/login' && token) {
    const redirectTo = toSafePath(request.nextUrl.searchParams.get('redirect'), '/dashboard')
    const url = request.nextUrl.clone()
    url.pathname = stripBasePath(redirectTo)
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // 2. Protected route without token → redirect to login with return path
  if (!isPublicRoute && !token && pathname !== '/') {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // 3. Root path handling: authenticated users → dashboard, guests → login
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = token ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      // connect-src must be ORIGINS (scheme+host+port), not URLs with paths.
      // If NEXT_PUBLIC_API_URL includes `/api` or `/api/v1`, browsers may ignore it and block requests
      // which shows up in Axios as "Network Error".
      (() => {
        const raw = process.env.NEXT_PUBLIC_API_URL || ''
        let apiOrigin = ''
        try {
          if (raw.startsWith('http://') || raw.startsWith('https://')) {
            apiOrigin = new URL(raw).origin
          }
        } catch {
          apiOrigin = ''
        }
        // In development, allow common schemes (http/https/ws) so local backends + HMR don't get blocked.
        if (process.env.NODE_ENV !== 'production') {
          return `connect-src 'self' ${apiOrigin} http: https: ws: wss:`
        }
        return `connect-src 'self' ${apiOrigin}`.trim()
      })(),
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

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api')
  ) {
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
    '/:path*',
  ],
};