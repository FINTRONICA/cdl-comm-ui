import { NextRequest, NextResponse } from 'next/server';
import { AuthService, JWTPayload, Permission } from '../lib/auth';

export interface AuthContext {
  user: JWTPayload;
  isAuthenticated: boolean;
}

export class AuthMiddleware {
  // Protect routes that require authentication
  static async authenticate(request: NextRequest): Promise<NextResponse | AuthContext> {
    const token = AuthService.extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = AuthService.verifyToken(token);
    
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return {
      user: payload,
      isAuthenticated: true
    };
  }

  // Protect API routes
  static async authenticateAPI(request: NextRequest): Promise<NextResponse | AuthContext> {
    const token = AuthService.extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = AuthService.verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return {
      user: payload,
      isAuthenticated: true
    };
  }

  // Check if user has required permissions
  static hasPermission(user: JWTPayload, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  // Check if user has any of the required permissions
  static hasAnyPermission(user: JWTPayload, permissions: Permission[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  // Check if user has all required permissions
  static hasAllPermissions(user: JWTPayload, permissions: Permission[]): boolean {
    return permissions.every(permission => user.permissions.includes(permission));
  }

  // Protect routes with specific permissions
  static async requirePermission(
    request: NextRequest,
    permission: Permission
  ): Promise<NextResponse | AuthContext> {
    const authResult = await this.authenticate(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!this.hasPermission(authResult.user, permission)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return authResult;
  }

  // Protect API routes with specific permissions
  static async requirePermissionAPI(
    request: NextRequest,
    permission: Permission
  ): Promise<NextResponse | AuthContext> {
    const authResult = await this.authenticateAPI(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!this.hasPermission(authResult.user, permission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return authResult;
  }

  // Protect routes with multiple permissions (any)
  static async requireAnyPermission(
    request: NextRequest,
    permissions: Permission[]
  ): Promise<NextResponse | AuthContext> {
    const authResult = await this.authenticate(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!this.hasAnyPermission(authResult.user, permissions)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return authResult;
  }

  // Protect API routes with multiple permissions (any)
  static async requireAnyPermissionAPI(
    request: NextRequest,
    permissions: Permission[]
  ): Promise<NextResponse | AuthContext> {
    const authResult = await this.authenticateAPI(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!this.hasAnyPermission(authResult.user, permissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return authResult;
  }

  // Protect routes with multiple permissions (all)
  static async requireAllPermissions(
    request: NextRequest,
    permissions: Permission[]
  ): Promise<NextResponse | AuthContext> {
    const authResult = await this.authenticate(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!this.hasAllPermissions(authResult.user, permissions)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return authResult;
  }

  // Protect API routes with multiple permissions (all)
  static async requireAllPermissionsAPI(
    request: NextRequest,
    permissions: Permission[]
  ): Promise<NextResponse | AuthContext> {
    const authResult = await this.authenticateAPI(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!this.hasAllPermissions(authResult.user, permissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return authResult;
  }
} 