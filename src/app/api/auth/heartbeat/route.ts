import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = SessionManager.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Update session activity
    SessionManager.updateSessionMetadata(sessionId, {
      lastHeartbeat: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      sessionActive: true,
      expiresAt: session.expiresAt,
      lastActivity: session.lastActivity
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
