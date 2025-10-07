import { serviceNavigation } from '@/utils/navigation'

export class SessionService {
  private static readonly TIMEOUT_MINUTES = 30;
  private static readonly WARNING_MINUTES = 5;
  private static readonly CHECK_INTERVAL = 60000;

  static startSession(): void {
    const now = Date.now();
    const timeoutMs = this.TIMEOUT_MINUTES * 60 * 1000;

    // Store session data
    localStorage.setItem('session_start', now.toString());
    localStorage.setItem('session_timeout', (now + timeoutMs).toString());
    localStorage.setItem('last_activity', now.toString());

    // Start session timer
    this.startSessionTimer();
  }

  static updateActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString());
  }

  static checkSessionTimeout(): boolean {
    const lastActivity = localStorage.getItem('last_activity');
    const sessionTimeout = localStorage.getItem('session_timeout');

    if (!lastActivity || !sessionTimeout) {
      return true;
    }

    const now = Date.now();
    const timeSinceActivity = now - parseInt(lastActivity);
    const timeoutMs = this.TIMEOUT_MINUTES * 60 * 1000;

    return timeSinceActivity > timeoutMs;
  }

  static shouldShowWarning(): boolean {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return false;

    const now = Date.now();
    const timeSinceActivity = now - parseInt(lastActivity);
    const warningTime = (this.TIMEOUT_MINUTES - this.WARNING_MINUTES) * 60 * 1000;

    return timeSinceActivity > warningTime;
  }

  private static startSessionTimer(): void {
    setInterval(() => {
      if (this.checkSessionTimeout()) {
        this.forceLogout();
      }
    }, this.CHECK_INTERVAL);
  }

  static forceLogout(): void {
    // Clear all data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      });
    }

    // Use Next.js router instead of window.location.href
    serviceNavigation.goToLogin();
  }
}
