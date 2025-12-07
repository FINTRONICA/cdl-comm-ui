import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants'
import { LoginCredentials, User } from '@/types/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { JWTParser } from '@/utils/jwtParser'
import { getAuthCookies, clearAuthCookies, setAuthCookies } from '@/utils/cookieUtils'
import { useState, useMemo } from 'react'
import { serviceNavigation } from '@/utils/navigation'

// Query keys for authentication (only for mutations now)
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<{
        success: boolean
        message: string
        access_token?: string
        token?: string
        jwt?: string
        jwt_token?: string
        accessToken?: string
        refresh_token?: string
        refreshToken?: string
        expires_in?: number
        user: User
      }>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)

      return response
    },
    onSuccess: (data) => {
      const token = data.token || data.access_token 
      const refreshToken = data.refresh_token || data.refreshToken
      
      if (token) {
        const userInfo = JWTParser.extractUserInfo(token)
        
        if (userInfo) {
          const userData: User = {
            name: userInfo.name,
            email: userInfo.email,
            role: userInfo.role,
            permissions: [] 
          }
          
          setAuth(userData, token, userInfo.userId, refreshToken)
          
          queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
          queryClient.setQueryData(authQueryKeys.user(), userData)
          
    
                   
       
        } else {
          throw new Error('Failed to parse user info from token')
        }
      } else {
        throw new Error('No token found in response data')
      }
      
      toast.success('Login successful!')
    },
    onError: (error: unknown) => {
      const errorData = error as { response?: { data?: { message?: string } } }
      const message = errorData?.response?.data?.message || 'Login failed'
      toast.error(message)
    },
  })
}

// Enhanced login hook with validation and error handling
export function useLoginWithValidation() {
  const loginMutation = useLogin()
  
  const login = async (credentials: LoginCredentials) => {
    // Validate input
    if (!credentials.username || !credentials.password) {
      throw new Error('Please fill in all fields')
    }

    if (credentials.username.length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    try {
      const result = await loginMutation.mutateAsync(credentials)
      return result
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please try again.'
      
      // Handle different error types
      const errorData = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (errorData?.response?.status === 401) {
        errorMessage = 'Invalid username or password'
      } else if (errorData?.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (errorData?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (errorData?.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.'
      } else if (errorData?.response?.data?.message) {
        errorMessage = errorData.response?.data?.message || errorData.message || 'Unknown error'
      }

      throw new Error(errorMessage)
    }
  }

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error
  }
}

export function useLoginWithLoader() {
  const queryClient = useQueryClient()
  const { setAuth } = useAuthStore()
  // These state variables are kept for API compatibility with login page
  // Labels are now loaded by ComplianceProvider to avoid duplicate API calls
  const [isLoadingApis] = useState(false)
  const [apiProgress] = useState({ completed: 0, total: 0 })
  const [loadingStatus] = useState<string>('idle')
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)
  const [userFacingError, setUserFacingError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
     
      if (!credentials.username || !credentials.password) {
        throw new Error('Please fill in all fields')
      }

      if (credentials.username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      const response = await apiClient.post<{
        success: boolean
        message: string
        access_token?: string
        token?: string
        jwt?: string
        jwt_token?: string
        accessToken?: string
        refresh_token?: string
        refreshToken?: string
        expires_in?: number
        user: User
      }>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)

      return response
    },
    onSuccess: async (data) => {
      setUserFacingError(null)
      const token = data.token || data.access_token 
      const refreshToken = data.refresh_token || data.refreshToken
      
      if (token) {
        const userInfo = JWTParser.extractUserInfo(token)
        
        if (userInfo) {
          const userData: User = {
            name: userInfo.name,
            email: userInfo.email,
            role: userInfo.role,
            permissions: [] 
          }
          
          setAuth(userData, token, userInfo.userId, refreshToken)
          
          queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
          queryClient.setQueryData(authQueryKeys.user(), userData)
          
          // Labels will be loaded by ComplianceProvider when authentication state changes
          // No need to load them here to avoid duplicate API calls
          
          // Handle redirect if needed
          if (pendingRedirect) {
            serviceNavigation.navigateTo(pendingRedirect)
            setPendingRedirect(null)
          }
          
       
        } else {
          
          throw new Error('Failed to parse user information')
        }
      } else {
        
        throw new Error('No authentication token received')
      }
      
      toast.success('Login successful!')
    },
    onError: (error: unknown) => {
      const errorData = error as { response?: { data?: { message?: string } }; message?: string }
      const message = errorData?.response?.data?.message || errorData?.message || 'Login failed'
      setUserFacingError(message)
    
      toast.error(message)
    },
  })

  const login = async (credentials: LoginCredentials, redirectTo?: string) => {
    try {
    
      if (redirectTo) {
        setPendingRedirect(redirectTo)
      }
      
      const result = await loginMutation.mutateAsync(credentials)
      return result
    } catch (error: unknown) {
      setPendingRedirect(null)
      
     
      const errorData = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const errorMessage =
        errorData?.response?.data?.message ||
        errorData?.message ||
        'Login failed. Please try again.'

      setUserFacingError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    login,
    isLoading: loginMutation.isPending || isLoadingApis,
    isLoginLoading: loginMutation.isPending,
    isApiLoading: isLoadingApis,
    apiProgress,
    loadingStatus,
    error: loginMutation.error,
    errorMessage: userFacingError
  }
}


export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const { token } = getAuthCookies()
      if (token) {
        await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
    },
    onSuccess: async () => {
      logout()
      queryClient.clear()
      
    
      try {
        const { getLabelsLoader } = await import('@/services/complianceLabelsLoader')
        const loader = getLabelsLoader()
        loader.clearAllLabels()
        
      } catch (error) {
      throw error
      }
 
      

      if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      }
      toast.success('Logged out successfully')
    },
    onError: (_error: unknown) => {
      
      logout()
      queryClient.clear()
      if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      }
      // Clear cookies even on error to ensure clean logout
      clearAuthCookies()
    },
  })
}


export function useCurrentUser() {
  const { token } = getAuthCookies()
  
  if (!token) {
    return { user: null, isAuthenticated: false }
  }

  try {
    const userInfo = JWTParser.extractUserInfo(token)
    return {
      user: userInfo ? {
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        permissions: []
      } : null,
      isAuthenticated: !!userInfo
    }
  } catch (error) {

    return { user: null, isAuthenticated: false }
  }
}


export function useIsAuthenticated() {
  return useMemo(() => {
    const { token } = getAuthCookies()
    
    if (!token) {
      return { isAuthenticated: false, user: null, isLoading: false, error: null }
    }

    try {
      const userInfo = JWTParser.extractUserInfo(token)
      return {
        isAuthenticated: !!userInfo,
        user: userInfo ? {
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
          permissions: []
        } : null,
        isLoading: false,
        error: null
      }
    } catch (error) {
      
      return { 
        isAuthenticated: false, 
        user: null, 
        isLoading: false, 
        error: error as Error 
      }
    }
  }, []) 
}


export function useRefreshToken() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      // Get refresh token from storage
      if (typeof window === 'undefined') {
        throw new Error('No refresh token available')
      }
      const { refreshToken } = getAuthCookies()
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Call external refresh API endpoint
      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
        expires_in: number
        refresh_expires_in: number
        token_type: string
      }>(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
        refreshToken
      })

      return response
    },
    onSuccess: (response) => {
      const { userType, userName, userId } = getAuthCookies()
      setAuthCookies(
        response.access_token,
        userType || 'user',
        userName || userId || 'user',
        userId || userName || 'user',
        response.refresh_token
      )

      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
    },
    onError: (error: unknown) => {
      if ((error as any)?.response?.status === 401) {
       
        logout()
     
        if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        }
    
        serviceNavigation.goToLogin()
      }
    }
  })
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD), { email })
    },
    onSuccess: () => {
      toast.success('Password reset email sent successfully')
    },
    onError: (error: unknown) => {
      const errorData = error as { response?: { data?: { message?: string } } }
      const message = errorData?.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
    }
  })
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD), { token, newPassword })
    },
    onSuccess: () => {
      toast.success('Password reset successfully')
    },
    onError: (error: unknown) => {
      const errorData = error as { response?: { data?: { message?: string } } }
      const message = errorData?.response?.data?.message || 'Failed to reset password'
      toast.error(message)
    }
  })
}

// Change password mutation
export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { token } = getAuthCookies()
      if (!token) {
        throw new Error('Not authenticated')
      }

      await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD), 
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
    },
    onError: (error: unknown) => {
      const errorData = error as { response?: { data?: { message?: string } } }
      const message = errorData?.response?.data?.message || 'Failed to change password'
      toast.error(message)
    }
  })
}
