export const ROLES = {
  MAKER: 'maker',
  CHECKER: 'checker',
  ADMIN: 'admin'
} as const;

export const COOKIES = {
  AUTH_TOKEN: 'auth_token',
  USER_TYPE: 'user_type',
  USER_NAME: 'user_name',
  USER_ID: 'user_id'
} as const;

export interface User {
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface Auth {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionTimeout: number | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}
