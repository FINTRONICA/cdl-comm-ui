import { Session } from '../types/auth';

export class SessionModel {
  static create(sessionData: Partial<Session>): Session {
    return {
      id: sessionData.id || '',
      userId: sessionData.userId || '',
      token: sessionData.token || '',
      expiresAt: sessionData.expiresAt || new Date(),
      lastActivity: sessionData.lastActivity || new Date(),
      isActive: sessionData.isActive ?? true
    };
  }
}
