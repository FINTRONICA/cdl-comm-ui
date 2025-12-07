import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessionManager';
import { AuthService, UserRole, Permission } from '@/lib/auth';
import { COOKIES } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Extract session ID from refresh token
    const sessionId = refreshToken.replace('refresh_', '');
    const session = SessionManager.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new JWT token
    const userForToken = {
      id: session.userId,
      username: session.userEmail, // Use email as username
      email: session.userEmail,
      role: session.userRole as UserRole,
      permissions: session.permissions as Permission[],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newJwtToken = AuthService.generateToken(userForToken);
    const newRefreshToken = `refresh_${sessionId}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Update session activity
    SessionManager.updateSessionMetadata(sessionId, {
      lastTokenRefresh: new Date().toISOString()
    });

    const response = NextResponse.json({
      token: newJwtToken,
      refreshToken: newRefreshToken,
      expiresAt,
      user: {
        id: session.userId,
        email: session.userEmail,
        role: session.userRole,
        permissions: session.permissions
      }
    });

    // Update auth cookie
    response.cookies.set(COOKIES.AUTH_TOKEN, newJwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60, // 30 minutes
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
