import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessionManager';
import { AuditLogger, AuditEventType } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (sessionId) {
      // Get session details before destroying
      const session = SessionManager.getSession(sessionId);
      
      // Destroy session
      SessionManager.destroySession(sessionId);
      
      // Log logout event
      if (session) {
        AuditLogger.logAuthEvent(
          AuditEventType.LOGOUT,
          session.userId,
          session.userEmail,
          session.userRole,
          getClientIP(request),
          request.headers.get('user-agent') || '',
          sessionId
        );
      }
    }

    // Create response with cleared cookie
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear session cookie
    response.cookies.delete('session_id');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
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