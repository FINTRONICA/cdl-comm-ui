import { SessionService } from '../services/sessionService';
import { AuthController } from './authController';

export class SessionController {
  static updateActivity(): void {
    SessionService.updateActivity();
  }

  static checkSessionTimeout(): boolean {
    return SessionService.checkSessionTimeout();
  }

  static shouldShowWarning(): boolean {
    return SessionService.shouldShowWarning();
  }

  static handleSessionTimeout(): void {
    if (this.checkSessionTimeout()) {
      AuthController.logout();
    }
  }

  static extendSession(): void {
    this.updateActivity();
  }

  static startSession(user: unknown, token: string): void {
    SessionService.startSession(user, token);
  }
}
