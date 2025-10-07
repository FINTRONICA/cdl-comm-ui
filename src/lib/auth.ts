import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CHECKER = 'checker',
  MAKER = 'maker'
}

export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Transaction Management
  CREATE_TRANSACTION = 'create_transaction',
  READ_TRANSACTION = 'read_transaction',
  UPDATE_TRANSACTION = 'update_transaction',
  DELETE_TRANSACTION = 'delete_transaction',
  APPROVE_TRANSACTION = 'approve_transaction',
  
  // Project Management
  CREATE_PROJECT = 'create_project',
  READ_PROJECT = 'read_project',
  UPDATE_PROJECT = 'update_project',
  DELETE_PROJECT = 'delete_project',
  
  // Financial Operations
  CREATE_PAYMENT = 'create_payment',
  READ_PAYMENT = 'read_payment',
  UPDATE_PAYMENT = 'update_payment',
  DELETE_PAYMENT = 'delete_payment',
  APPROVE_PAYMENT = 'approve_payment',
  
  // Reports
  READ_REPORTS = 'read_reports',
  EXPORT_REPORTS = 'export_reports',
  
  // System Administration
  SYSTEM_CONFIG = 'system_config',
  AUDIT_LOGS = 'audit_logs',
  SECURITY_SETTINGS = 'security_settings'
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  private static readonly JWT_EXPIRES_IN = '8h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  // Generate JWT token
  static generateToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'escrow-app',
      audience: 'escrow-users'
    });
  }

  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Check if user has permission
  static hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  // Check if user has any of the required permissions
  static hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  // Check if user has all required permissions
  static hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => user.permissions.includes(permission));
  }

  // Get role permissions
  static getRolePermissions(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      [UserRole.ADMIN]: Object.values(Permission),
      [UserRole.MANAGER]: [
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.CREATE_TRANSACTION,
        Permission.READ_TRANSACTION,
        Permission.UPDATE_TRANSACTION,
        Permission.APPROVE_TRANSACTION,
        Permission.CREATE_PROJECT,
        Permission.READ_PROJECT,
        Permission.UPDATE_PROJECT,
        Permission.CREATE_PAYMENT,
        Permission.READ_PAYMENT,
        Permission.UPDATE_PAYMENT,
        Permission.APPROVE_PAYMENT,
        Permission.READ_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.AUDIT_LOGS
      ],
      [UserRole.MAKER]: [
        Permission.READ_TRANSACTION,
        Permission.CREATE_TRANSACTION,
        Permission.UPDATE_TRANSACTION,
        Permission.READ_PROJECT,
        Permission.CREATE_PROJECT,
        Permission.UPDATE_PROJECT,
        Permission.READ_PAYMENT,
        Permission.CREATE_PAYMENT
      ],
      [UserRole.CHECKER]: [
        Permission.READ_TRANSACTION,
        Permission.READ_PROJECT,
        Permission.READ_PAYMENT,
        Permission.READ_REPORTS
      ]
    };

    return rolePermissions[role] || [];
  }

  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Extract token from request
  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
} 