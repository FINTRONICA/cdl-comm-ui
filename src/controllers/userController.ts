
export class UserController {
  static async getCurrentUser() {
    // This would typically validate the token and fetch user data
    // For now, return a mock user
    return {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['read_user', 'write_user', 'read_transaction', 'write_transaction']
    };
  }

  static async validateUser() {
    // Validate user token and return user info
    try {
      // In a real app, you'd validate the token against your database
      return await this.getCurrentUser();
    } catch {
      return null;
    }
  }

  static async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.permissions.includes(permission) || false;
  }

  static async canAccessRoute(route: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const routePermissions = {
      '/admin': ['admin'],
      '/transactions': ['maker', 'checker', 'admin'],
      '/reports': ['checker', 'admin'],
      '/settings': ['admin'],
      '/dashboard': ['maker', 'checker', 'admin']
    };

    const requiredRoles = routePermissions[route as keyof typeof routePermissions];
    return requiredRoles?.includes(user.role) || false;
  }

  static async getUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.role || null;
  }

  static async isAdmin(): Promise<boolean> {
    return (await this.getUserRole()) === 'admin';
  }

  static async isChecker(): Promise<boolean> {
    return (await this.getUserRole()) === 'checker';
  }

  static async isMaker(): Promise<boolean> {
    return (await this.getUserRole()) === 'maker';
  }
}
