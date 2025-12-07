import { User } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import { clearAuthCookies } from '@/utils/cookieUtils';

export class AuthController {
  static async getCurrentUser(): Promise<User | null> {
    // This would typically validate the token and fetch user data from the API
    // For now, return a mock user
    return {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['read_user', 'write_user', 'read_transaction', 'write_transaction']
    };
  }

  static async validateToken(): Promise<User | null> {
    try {
      // In a real app, you'd validate the token against your API
      return await this.getCurrentUser();
    } catch {
      return null;
    }
  }

  static logout(): void {
    // Clear auth state and cookies
    useAuthStore.getState().logout();
    clearAuthCookies();
  }
}
