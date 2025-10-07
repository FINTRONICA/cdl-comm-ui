import { User } from '../types/auth';

export class UserModel {
  static create(userData: Partial<User>): User {
    return {
      id: userData.id || '',
      username: userData.username || '',
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'maker',
      permissions: userData.permissions || [],
      isActive: userData.isActive ?? true,
      lastLogin: userData.lastLogin || new Date()
    };
  }

  static fromJWT(jwtPayload: any): User {
    return this.create({
      id: jwtPayload.userId,
      username: jwtPayload.username,
      email: jwtPayload.email,
      name: jwtPayload.name,
      role: jwtPayload.role,
      permissions: jwtPayload.permissions || []
    });
  }
}
