import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants'
import { LoginCredentials, User } from '@/types/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { JWTParser } from '@/utils/jwtParser'
import { getAuthCookies } from '@/utils/cookieUtils'
import { useMemo, useState } from 'react'
import { SidebarLabelsService } from '@/services/api/sidebarLabelsService'
import BuildPartnerLabelsService from '@/services/api/buildPartnerLabelsService'
import { BuildPartnerAssetLabelsService } from '@/services/api/buildPartnerAssetLabelsService'
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
        user: User
      }>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)

      return response
    },
    onSuccess: (data) => {
      const token = data.token || data.access_token 
      
      if (token) {
        const userInfo = JWTParser.extractUserInfo(token)
        
        if (userInfo) {
          const userData: User = {
            name: userInfo.name,
            email: userInfo.email,
            role: userInfo.role,
            permissions: [] 
          }
          
          setAuth(userData, token, userInfo.userId)
          
          queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
          queryClient.setQueryData(authQueryKeys.user(), userData)
          
          // 🏦 BANKING COMPLIANCE: Labels now loaded by ComplianceProvider
          // No localStorage prefetching needed - fresh data loaded on app startup
          console.log('✅ [COMPLIANCE] Login successful - labels will be loaded by ComplianceProvider')
                   
       
        } else {
          console.error('Failed to parse user info from token')
        }
      } else {
        console.error('No token found in response data')
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

// Utility function for parallel API execution
const executeApisInParallel = async (
  apiConfigs: Array<{
    name: string
    queryKey: unknown[]
    fetcher: () => Promise<unknown>
    storageKey: string
  }>,
  queryClient: unknown,
  onProgress: (completed: number, total: number) => void
) => {
  
  
  // Track timing for performance monitoring (commented out to avoid unused variable)
  // const startTime = performance.now()
  
  // Create all promises immediately - this ensures TRUE parallelism
  const apiPromises = apiConfigs.map((config, index) => {
    const apiStartTime = performance.now()
    
    return config.fetcher()
      .then(data => {
        const apiEndTime = performance.now()
        const apiDuration = apiEndTime - apiStartTime
        
        // Store in localStorage and React Query cache
        localStorage.setItem(config.storageKey, JSON.stringify(data))
        if (typeof (queryClient as any).setQueryData === 'function') {
          (queryClient as any).setQueryData(config.queryKey, data)
        }
        
        onProgress(index + 1, apiConfigs.length)
        
        return { 
          success: true, 
          name: config.name, 
          data, 
          duration: apiDuration 
        }
      })
      .catch(error => {
        const apiEndTime = performance.now()
        const apiDuration = apiEndTime - apiStartTime
        
        console.error(`❌ ${config.name}: Failed (${apiDuration.toFixed(2)}ms) -`, error)
        onProgress(index + 1, apiConfigs.length)
        
        return { 
          success: false, 
          name: config.name, 
          error, 
          duration: apiDuration 
        }
      })
  })

  // Wait for ALL APIs to complete in parallel
  const results = await Promise.all(apiPromises)
  
  // Performance tracking (commented out to avoid unused variables)
  // const totalTime = performance.now() - startTime
  // const successful = results.filter(r => r.success).length
  // const failed = results.filter(r => !r.success).length
  

  
  return results
}

// Enhanced login hook with parallel API fetching and loader
export function useLoginWithLoader() {
  const queryClient = useQueryClient()
  const { setAuth } = useAuthStore()
  const [isLoadingApis, setIsLoadingApis] = useState(false)
  const [apiProgress, setApiProgress] = useState({ completed: 0, total: 0 })
  const [loadingStatus, setLoadingStatus] = useState<string>('idle')

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Validate input
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
        user: User
      }>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)

      return response
    },
    onSuccess: async (data) => {
      const token = data.token || data.access_token 
      
      if (token) {
        const userInfo = JWTParser.extractUserInfo(token)
        
        if (userInfo) {
          const userData: User = {
            name: userInfo.name,
            email: userInfo.email,
            role: userInfo.role,
            permissions: [] 
          }
          
          setAuth(userData, token, userInfo.userId)
          
          queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
          queryClient.setQueryData(authQueryKeys.user(), userData)
          
          // 🔥 FETCH ALL APIS IN PARALLEL WITH LOADER
          setIsLoadingApis(true)
          setLoadingStatus('Fetching application data...')
          
          try {
            // Define all API configurations for parallel execution
            const apiConfigs = [
              {
                name: 'Sidebar Labels',
                queryKey: ['sidebarLabels'],
                fetcher: async () => {
                  const rawLabels = await SidebarLabelsService.fetchLabels()
                  return SidebarLabelsService.processLabels(rawLabels)
                },
                storageKey: 'sidebarLabels'
              },
              {
                name: 'Developer Labels', 
                queryKey: ['developerLabels'],
                fetcher: async () => {
                  const developerLabels = await BuildPartnerLabelsService.fetchLabels()
                  const processedLabels = BuildPartnerLabelsService.processLabels(developerLabels)
                  console.log('processedLabels', processedLabels)
                  return processedLabels
                },
                storageKey: 'developerLabels'
              },
              {
                name: 'Build Partner Asset Labels',
                queryKey: ['buildPartnerAssetLabels'],
                fetcher: async () => {
                  const assetLabels = await BuildPartnerAssetLabelsService.fetchLabels()
                  const processedLabels = BuildPartnerAssetLabelsService.processLabels(assetLabels)
                  console.log('buildPartnerAssetLabels processedLabels', processedLabels)
                  return processedLabels
                },
                storageKey: 'buildPartnerAssetLabels'
              }       
            ]

            setApiProgress({ completed: 0, total: apiConfigs.length })

            // Execute all APIs in parallel using utility function
            const results = await executeApisInParallel(
              apiConfigs,
              queryClient,
              (completed, total) => {
                setApiProgress({ completed, total })
                setLoadingStatus(`Loading data... ${completed}/${total}`)
              }
            )

            // Handle results
            const successful = results.filter(r => r.success).length
            const failed = results.filter(r => !r.success).length
            
            if (failed > 0) {
              console.warn('⚠️ Some APIs failed, but continuing with available data')
              setLoadingStatus(`${successful}/${successful + failed} APIs loaded successfully`)
            } else {
              setLoadingStatus('All data loaded successfully!')
            }
            
          } catch (error) {
            console.error('❌ Critical error during parallel API fetching:', error)
            setLoadingStatus('Error loading data')
          } finally {
            // Small delay to show completion message
            setTimeout(() => {
              setIsLoadingApis(false)
              setLoadingStatus('idle')
            }, 500)
          }
          
       
        } else {
          console.error('Failed to parse user info from token')
          throw new Error('Failed to parse user information')
        }
      } else {
        console.error('No token found in response data')
        throw new Error('No authentication token received')
      }
      
      toast.success('Login successful!')
    },
    onError: (error: unknown) => {
      setIsLoadingApis(false)
      const errorData = error as { response?: { data?: { message?: string } }; message?: string }
      const message = errorData?.response?.data?.message || errorData?.message || 'Login failed'
      toast.error(message)
    },
  })

  const login = async (credentials: LoginCredentials) => {
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
      } else if ((error as any)?.message) {
        errorMessage = (error as any).message
      }

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
    error: loginMutation.error
  }
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
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
      
      // 🏦 BANKING COMPLIANCE: Clear labels session (stored in Zustand, not localStorage)
      try {
        const { getLabelsLoader } = await import('@/services/complianceLabelsLoader')
        const loader = getLabelsLoader()
        loader.clearAllLabels()
        console.log('✅ [COMPLIANCE] Labels session cleared on logout')
      } catch (error) {
        console.warn('⚠️ [COMPLIANCE] Could not clear labels session:', error)
      }
 
      
      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()
      toast.success('Logged out successfully')
    },
    onError: (error: unknown) => {
      console.error('Logout error:', error)
      logout()
      queryClient.clear()
      localStorage.clear()
      sessionStorage.clear()
    },
  })
}

// Simple synchronous user hook - no React Query needed
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
    console.error('Error parsing token:', error)
    return { user: null, isAuthenticated: false }
  }
}

// Stable authentication check with memoization to prevent unnecessary re-renders
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
      console.error('Error parsing token:', error)
      return { 
        isAuthenticated: false, 
        user: null, 
        isLoading: false, 
        error: error as Error 
      }
    }
  }, []) // Empty dependency array - only run once per component mount
}

// Refresh token mutation
export function useRefreshToken() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No token to refresh')
      }

      const response = await apiClient.post<{ token: string }>(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.token
    },
    onSuccess: (newToken) => {
      // Update stored token
      localStorage.setItem('auth_token', newToken)
      sessionStorage.setItem('auth_token', newToken)
      
      // Invalidate user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() })
    },
    onError: (error: unknown) => {
      console.error('Token refresh failed:', error)
      // Redirect to login on refresh failure
      if ((error as any)?.response?.status === 401) {
        // Clear everything (store + cookies) in one call
        logout()
        
        // Clear local storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Use Next.js router instead of window.location.href
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
