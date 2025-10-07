import { useMemo } from 'react'
import { JWTParser } from '@/utils/jwtParser'

/**
 * React hook for JWT token parsing and analysis
 * Provides easy access to JWT parsing functionality
 */
export function useJWTParser(token?: string) {
  const tokenInfo = useMemo(() => {
    if (!token) return null
    return JWTParser.getTokenInfo(token)
  }, [token])

  const userInfo = useMemo(() => {
    if (!token) return null
    return JWTParser.extractUserInfo(token)
  }, [token])

  const isExpired = useMemo(() => {
    if (!token) return true
    return JWTParser.isExpired(token)
  }, [token])

  const isExpiringSoon = useMemo(() => {
    if (!token) return true
    return JWTParser.isExpiringSoon(token)
  }, [token])

  const isValid = useMemo(() => {
    if (!token) return false
    return JWTParser.isValidFormat(token) && !JWTParser.isExpired(token)
  }, [token])

  const timeUntilExpiry = useMemo(() => {
    if (!token) return -1
    return JWTParser.getTimeUntilExpiry(token)
  }, [token])

  const expirationTime = useMemo(() => {
    if (!token) return null
    return JWTParser.getExpirationTime(token)
  }, [token])

  const issueTime = useMemo(() => {
    if (!token) return null
    return JWTParser.getIssueTime(token)
  }, [token])

  const tokenAge = useMemo(() => {
    if (!token) return null
    return JWTParser.getTokenAge(token)
  }, [token])

  return {
    // Token information
    tokenInfo,
    userInfo,
    
    // Status checks
    isExpired,
    isExpiringSoon,
    isValid,
    
    // Timing information
    timeUntilExpiry,
    expirationTime,
    issueTime,
    tokenAge,
    
    // Utility functions
    parseToken: JWTParser.parseToken,
    extractUserInfo: JWTParser.extractUserInfo,
    isTokenExpired: JWTParser.isExpired,
    isTokenExpiringSoon: JWTParser.isExpiringSoon,
    getTokenExpiration: JWTParser.getExpirationTime,
    getTokenIssueTime: JWTParser.getIssueTime,
    getTimeUntilExpiry: JWTParser.getTimeUntilExpiry,
    isValidFormat: JWTParser.isValidFormat,
    getTokenAge: JWTParser.getTokenAge,
    getTokenInfo: JWTParser.getTokenInfo
  }
}

/**
 * Hook to get JWT information from stored token
 */
export function useStoredJWTParser() {
  const token = useMemo(() => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }, [])

  return useJWTParser(token || undefined)
}

/**
 * Hook to get current user from JWT token
 */
export function useCurrentUserFromJWT() {
  const { userInfo, isValid, isExpired } = useStoredJWTParser()
  
  return {
    user: userInfo,
    isAuthenticated: !!userInfo && isValid && !isExpired,
    isExpired,
    hasValidToken: isValid && !isExpired
  }
}
