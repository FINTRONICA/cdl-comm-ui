import { NextRequest, NextResponse } from 'next/server';
import { EncryptionService } from './encryption';
import { AuditLogger, AuditEventType, AuditSeverity } from './auditLogger';

export interface Session {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  permissions: string[];
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  metadata: Record<string, unknown>;
}

export interface SessionConfig {
  maxSessionsPerUser: number;
  sessionTimeoutMinutes: number;
  idleTimeoutMinutes: number;
  secureCookies: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  private static readonly DEFAULT_CONFIG: SessionConfig = {
    maxSessionsPerUser: 5,
    sessionTimeoutMinutes: 480, // 8 hours
    idleTimeoutMinutes: 30,
    secureCookies: true,
    httpOnly: true,
    sameSite: 'strict'
  };

  private constructor() {
    // Start session cleanup interval
    setInterval(() => {
      SessionManager.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Create new session
  static createSession(
    userId: string,
    userEmail: string,
    userRole: string,
    permissions: string[],
    ipAddress: string,
    userAgent: string,
    metadata: Record<string, unknown> = {}
  ): { sessionId: string; session: Session } {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.DEFAULT_CONFIG.sessionTimeoutMinutes * 60 * 1000);

    const session: Session = {
      id: sessionId,
      userId,
      userEmail,
      userRole,
      permissions,
      ipAddress,
      userAgent,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      isActive: true,
      metadata
    };

    // Store session
    this.getInstance().sessions.set(sessionId, session);

    // Track user sessions
    if (!this.getInstance().userSessions.has(userId)) {
      this.getInstance().userSessions.set(userId, new Set());
    }
    this.getInstance().userSessions.get(userId)!.add(sessionId);

    // Enforce max sessions per user
    this.enforceMaxSessionsPerUser(userId);

    // Log session creation
    AuditLogger.log({
      eventType: AuditEventType.LOGIN_SUCCESS,
      severity: AuditSeverity.LOW,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      sessionId,
      action: 'session_created',
      details: { sessionId, permissions },
      outcome: 'success'
    });

    return { sessionId, session };
  }

  // Get session by ID
  static getSession(sessionId: string): Session | null {
    const session = this.getInstance().sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      this.destroySession(sessionId);
      return null;
    }

    // Check idle timeout
    const idleTimeout = this.DEFAULT_CONFIG.idleTimeoutMinutes * 60 * 1000;
    const lastActivity = session.lastActivity.getTime();
    const now = new Date().getTime();

    if (now - lastActivity > idleTimeout) {
      this.destroySession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    this.getInstance().sessions.set(sessionId, session);

    return session;
  }

  // Validate session from request
  static validateSessionFromRequest(request: NextRequest): Session | null {
    const sessionId = this.extractSessionId(request);
    
    if (!sessionId) {
      return null;
    }

    return this.getSession(sessionId);
  }

  // Destroy session
  static destroySession(sessionId: string): boolean {
    const session = this.getInstance().sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    // Remove from sessions map
    this.getInstance().sessions.delete(sessionId);

    // Remove from user sessions
    const userSessions = this.getInstance().userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.getInstance().userSessions.delete(session.userId);
      }
    }

    // Log session destruction
    AuditLogger.log({
      eventType: AuditEventType.LOGOUT,
      severity: AuditSeverity.LOW,
      userId: session.userId,
      userEmail: session.userEmail,
      userRole: session.userRole,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      sessionId,
      action: 'session_destroyed',
      details: { sessionId },
      outcome: 'success'
    });

    return true;
  }

  // Destroy all sessions for a user
  static destroyAllUserSessions(userId: string): number {
    const userSessions = this.getInstance().userSessions.get(userId);
    
    if (!userSessions) {
      return 0;
    }

    let destroyedCount = 0;
    
    for (const sessionId of userSessions) {
      if (this.destroySession(sessionId)) {
        destroyedCount++;
      }
    }

    return destroyedCount;
  }

  // Update session metadata
  static updateSessionMetadata(sessionId: string, metadata: Record<string, unknown>): boolean {
    const session = this.getInstance().sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    session.metadata = { ...session.metadata, ...metadata };
    session.lastActivity = new Date();
    
    this.getInstance().sessions.set(sessionId, session);
    return true;
  }

  // Extend session
  static extendSession(sessionId: string, extensionMinutes: number = 60): boolean {
    const session = this.getInstance().sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    session.expiresAt = new Date(session.expiresAt.getTime() + extensionMinutes * 60 * 1000);
    session.lastActivity = new Date();
    
    this.getInstance().sessions.set(sessionId, session);
    return true;
  }

  // Get active sessions for user
  static getUserSessions(userId: string): Session[] {
    const userSessions = this.getInstance().userSessions.get(userId);
    
    if (!userSessions) {
      return [];
    }

    const sessions: Session[] = [];
    
    for (const sessionId of userSessions) {
      const session = this.getInstance().sessions.get(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  // Set session cookie
  static setSessionCookie(response: NextResponse, sessionId: string): NextResponse {
    const config = this.DEFAULT_CONFIG;
    
    response.cookies.set('sessionId', sessionId, {
      httpOnly: config.httpOnly,
      secure: config.secureCookies,
      sameSite: config.sameSite,
      maxAge: config.sessionTimeoutMinutes * 60,
      path: '/'
    });

    return response;
  }

  // Clear session cookie
  static clearSessionCookie(response: NextResponse): NextResponse {
    response.cookies.delete('sessionId');
    return response;
  }

  // Extract session ID from request
  private static extractSessionId(request: NextRequest): string | null {
    // Try to get from cookie first
    const sessionCookie = request.cookies.get('sessionId');
    if (sessionCookie?.value) {
      return sessionCookie.value;
    }

    // Try to get from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  // Generate secure session ID
  private static generateSessionId(): string {
    return `session_${Date.now()}_${EncryptionService.generateSecureRandom(16)}`;
  }

  // Enforce maximum sessions per user
  private static enforceMaxSessionsPerUser(userId: string): void {
    const userSessions = this.getInstance().userSessions.get(userId);
    
    if (!userSessions || userSessions.size <= this.DEFAULT_CONFIG.maxSessionsPerUser) {
      return;
    }

    // Get all sessions for this user, sorted by creation date
    const sessions = Array.from(userSessions)
      .map(sessionId => this.getInstance().sessions.get(sessionId))
      .filter(session => session !== undefined)
      .sort((a, b) => a!.createdAt.getTime() - b!.createdAt.getTime());

    // Remove oldest sessions
    const sessionsToRemove = sessions.slice(0, sessions.length - this.DEFAULT_CONFIG.maxSessionsPerUser);
    
    sessionsToRemove.forEach(session => {
      if (session) {
        this.destroySession(session.id);
      }
    });
  }

  // Cleanup expired sessions
  private static cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.getInstance().sessions) {
      if (now > session.expiresAt || !session.isActive) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.destroySession(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  // Get session statistics
  static getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    totalUsers: number;
    averageSessionsPerUser: number;
  } {
    const sessions = Array.from(this.getInstance().sessions.values());
    const activeSessions = sessions.filter(s => s.isActive && new Date() <= s.expiresAt);
    const totalUsers = this.getInstance().userSessions.size;
    const averageSessionsPerUser = totalUsers > 0 ? activeSessions.length / totalUsers : 0;

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalUsers,
      averageSessionsPerUser
    };
  }

  // Validate session security
  static validateSessionSecurity(session: Session, request: NextRequest): {
    valid: boolean;
    reason?: string;
  } {
    // Check IP address
    const clientIP = this.getClientIP(request);
    if (session.ipAddress !== clientIP) {
      return {
        valid: false,
        reason: 'IP address mismatch'
      };
    }

    // Check user agent
    const userAgent = request.headers.get('user-agent') || '';
    if (session.userAgent !== userAgent) {
      return {
        valid: false,
        reason: 'User agent mismatch'
      };
    }

    return { valid: true };
  }

  // Get client IP address
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    return forwarded?.split(',')[0] || 
           realIP || 
           cfConnectingIP || 
           'unknown';
  }
} 