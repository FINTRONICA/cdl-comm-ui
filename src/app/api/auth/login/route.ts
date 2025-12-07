import { NextRequest, NextResponse } from 'next/server';
import { ValidationHelper } from '@/lib/validation/utils/validationHelper';
import { UserSchemas } from '@/lib/validation/userSchemas';
import { AuditLogger, AuditEventType } from '@/lib/auditLogger';
import { SessionManager } from '@/lib/sessionManager';
import { AuthService, UserRole, Permission } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const validation = await ValidationHelper.validateAndSanitize(
      UserSchemas.login,
      body
    );

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;


    const user = await authenticateUser(username, password);
    
    if (!user) {

      AuditLogger.logAuthEvent(
        AuditEventType.LOGIN_FAILURE,
        'unknown',
        username,
        'unknown',
        getClientIP(request),
        request.headers.get('user-agent') || '',
        'session_unknown',
        { reason: 'invalid_credentials' },
        'Invalid credentials'
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }


    const { sessionId } = SessionManager.createSession(
      user.id,
      user.username,
      user.role,
      user.permissions,
      getClientIP(request),
      request.headers.get('user-agent') || ''
    );


    AuditLogger.logAuthEvent(
      AuditEventType.LOGIN_SUCCESS,
      user.id,
      user.username,
      user.role,
      getClientIP(request),
      request.headers.get('user-agent') || '',
      sessionId
    );

  
    const userForToken = {
      ...user,
      role: user.role as UserRole,
      permissions: user.permissions as Permission[],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const jwtToken = AuthService.generateToken(userForToken);

 
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      token: jwtToken, 
      refreshToken: `refresh_${sessionId}`, 
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), 
      permissions: user.permissions
    });

    return SessionManager.setSessionCookie(response, sessionId);
  } catch (error) {
    throw error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

async function authenticateUser(username: string, password: string) {

  if (username === 'admin' && password === 'SecurePass123!') {
    return {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['read_user', 'write_user', 'read_transaction', 'write_transaction']
    };
  }
  return null;
} 