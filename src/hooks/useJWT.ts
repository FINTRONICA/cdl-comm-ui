import { useMemo } from 'react';
import { JWTParser } from '@/utils/jwtParser';
// import { JWTPayload } from '@/types/auth';

/**
 * Hook to decode and work with JWT tokens
 */
export function useJWT() {
  const token = useMemo(() => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }, []);

  const decodedToken = useMemo(() => {
    if (!token) return null;
    return JWTParser.parseToken(token);
  }, [token]);

  const verifiedToken = useMemo(() => {
    if (!token) return null;
    return JWTParser.parseToken(token); // Note: JWTParser doesn't verify, just parses
  }, [token]);

  const isExpired = useMemo(() => {
    if (!token) return true;
    return JWTParser.isExpired(token);
  }, [token]);

  const isExpiringSoon = useMemo(() => {
    if (!token) return true;
    return JWTParser.isExpiringSoon(token, 5); // 5 minutes
  }, [token]);

  const expirationTime = useMemo(() => {
    if (!token) return null;
    return JWTParser.getExpirationTime(token);
  }, [token]);

  const userInfo = useMemo(() => {
    if (!decodedToken) return null;
    
    return {
      userId: decodedToken.payload.userId,
      email: decodedToken.payload.email,
      role: decodedToken.payload.role,
      permissions: decodedToken.payload.permissions
    };
  }, [decodedToken]);

  return {
    token,
    decodedToken,
    verifiedToken,
    isExpired,
    isExpiringSoon,
    expirationTime,
    userInfo,
    // Utility functions
    decodeJWT: JWTParser.parseToken,
    decodeAndVerifyJWT: JWTParser.parseToken, // Note: JWTParser doesn't verify, just parses
    isTokenExpired: JWTParser.isExpired,
    isTokenExpiringSoon: JWTParser.isExpiringSoon,
    getTokenExpiration: JWTParser.getExpirationTime
  };
}

/**
 * Hook to get current user information from JWT
 */
export function useCurrentUserFromJWT() {
  const { userInfo, isExpired, isExpiringSoon } = useJWT();
  
  return {
    user: userInfo,
    isAuthenticated: !!userInfo && !isExpired,
    isExpired,
    isExpiringSoon,
    hasValidToken: !!userInfo && !isExpired
  };
}
