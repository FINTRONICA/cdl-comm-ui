import { apiClient } from '@/lib/apiClient'
import type { User } from '@/types'
import { API_ENDPOINTS, buildApiUrl } from '@/constants'
import { EnhancedSessionService } from '@/services/enhancedSessionService'
import { clearAuthCookies, getAuthCookies, setAuthCookies } from '@/utils/cookieUtils'

// Authentication types
export interface LoginCredentials {
  username: string
  password: string
  twoFactorCode?: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  ssn?: string // For US residents
  taxId?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
  permissions: string[]
}

// External API refresh response format
export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number // seconds
  refresh_expires_in: number // seconds
  token_type: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

// Authentication Service
export class AuthService {
  private static instance: AuthService
  private tokenRefreshTimer?: NodeJS.Timeout

  private constructor() {
    this.setupTokenRefresh()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Login with enhanced security
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)
    
    // Store tokens securely
    this.storeTokens(response.token, response.refreshToken, response.user)
    
    // Setup automatic token refresh
    if (response.expiresAt) {
      this.setupTokenRefresh(response.expiresAt)
    }
    
    return response
  }

  // Register new user with KYC compliance
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData)
    
    this.storeTokens(response.token, response.refreshToken, response.user)
    this.setupTokenRefresh(response.expiresAt)
    
    return response
  }

  // Logout with server-side token invalidation
  async logout(): Promise<void> {
    try {
      await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT))
    } catch {
      console.warn('Logout request failed, but clearing local tokens')
    } finally {
      this.clearTokens()
      this.clearTokenRefresh()
    }
  }

  // Refresh access token
  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    // Call external refresh API endpoint
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    })

    // Store the new tokens
    this.storeTokens(response.access_token, response.refresh_token)
    
    // Setup next refresh 1 minute before token expires
    this.setupTokenRefreshFromSeconds(response.expires_in)
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiClient.post('/auth/password-reset', data)
  }

  // Confirm password reset
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', data)
  }

  // Setup two-factor authentication
  async setupTwoFactor(): Promise<TwoFactorSetup> {
    return apiClient.post<TwoFactorSetup>('/auth/2fa/setup')
  }

  // Verify two-factor authentication
  async verifyTwoFactor(code: string): Promise<void> {
    await apiClient.post('/auth/2fa/verify', { code })
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', updates)
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
  }

  // Validate session
  async validateSession(): Promise<boolean> {
    try {
      await apiClient.get('/auth/validate')
      return true
    } catch {
      return false
    }
  }

  // Private methods for token management
  private storeTokens(token: string, refreshToken: string, user?: User): void {
    if (typeof window === 'undefined') return

    const existing = getAuthCookies()
    const role = user?.role || existing.userType || 'user'
    const name = user?.name || existing.userName || user?.email || 'user'
    const identifier = user?.email || existing.userId || 'user'

    setAuthCookies(token, role, name, identifier, refreshToken)
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return
    clearAuthCookies()
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    const { refreshToken } = getAuthCookies()
    return refreshToken
  }

  private setupTokenRefresh(expiresAt?: string): void {
    this.clearTokenRefresh()
    
    if (!expiresAt) return

    const expiresTime = new Date(expiresAt).getTime()
    const now = Date.now()
    const timeUntilExpiry = expiresTime - now - 60000 // Refresh 1 minute before expiry

    if (timeUntilExpiry > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshToken().catch((error) => {
          // If refresh fails, log the error but don't redirect
          // Let the middleware handle authentication redirects
          console.warn('Token refresh failed:', error)
          this.clearTokens()
          // Don't redirect - let middleware handle it
        })
      }, timeUntilExpiry)
    }
  }

  private setupTokenRefreshFromSeconds(expiresInSeconds: number): void {
    this.clearTokenRefresh()
    
    // Refresh 1 minute (60 seconds) before token expires
    const refreshDelay = Math.max(0, (expiresInSeconds - 60) * 1000)

    if (refreshDelay > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        // Only refresh if user is active
        if (EnhancedSessionService.isUserActive()) {
          this.refreshToken().catch((error) => {
            // If refresh fails, log the error but don't redirect
            // Let the middleware handle authentication redirects
            console.warn('Token refresh failed:', error)
            this.clearTokens()
            // Don't redirect - let middleware handle it
          })
        } else {
        }
      }, refreshDelay)
    }
  }

  private clearTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer)
      this.tokenRefreshTimer = undefined as any
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance() 