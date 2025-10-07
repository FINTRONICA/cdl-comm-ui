import { NextResponse } from 'next/server';

export class CookieService {
  static setCookie(response: NextResponse, name: string, value: string, options: any = {}): NextResponse {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/',
      ...options
    };

    response.cookies.set(name, value, defaultOptions);
    return response;
  }

  static deleteCookie(response: NextResponse, name: string): NextResponse {
    response.cookies.delete(name);
    return response;
  }

  static getCookie(request: any, name: string): string | undefined {
    return request.cookies.get(name)?.value;
  }
}
