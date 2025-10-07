// App Initialization Hook
// Simple hook for loading labels and initializing auth on app start

import { useEffect, useCallback, useState } from 'react'
import { loadAllLabelsCompliance } from '@/services/complianceLabelsLoader'
import { useAuthStore } from '@/store/authStore'

/**
 * Options for app initialization
 */
export interface AppInitializationOptions {
  enableLabelLoading?: boolean
  enableRetryOnFailure?: boolean
  retryCount?: number
}

/**
 * App initialization state
 */
export interface AppInitializationState {
  isInitializing: boolean
  labelsLoaded: boolean
  labelsError: string | null
}

/**
 * Simple App Initialization Hook
 * 
 * This hook handles:
 * - Fresh label loading on app start
 * - Basic error handling with retries
 * - Simple loading states
 */
export function useAppInitialization(
  options: AppInitializationOptions = {}
): AppInitializationState & {
  retryLabelsLoading: () => Promise<void>
} {
  const {
    enableLabelLoading = true,
    enableRetryOnFailure = true,
    retryCount: maxRetryCount = 3,
  } = options

  // Simple state management
  const [state, setState] = useState<AppInitializationState>({
    isInitializing: false,
    labelsLoaded: false,
    labelsError: null,
  })


  /**
   * Load labels with retry logic
   */
  const loadLabels = useCallback(async (retryAttempt: number = 0): Promise<void> => {
    setState({
      isInitializing: true,
      labelsLoaded: false,
      labelsError: null,
    })

    try {
      const result = await loadAllLabelsCompliance()
      const criticalAPIsLoaded = result.successCount >= 2
      
      if (criticalAPIsLoaded) {
        setState({
          isInitializing: false,
          labelsLoaded: true,
          labelsError: null,
        })
      } else {
        const errorMessage = `Insufficient label APIs loaded (${result.successCount}/${result.results.length})`
        
        if (retryAttempt < maxRetryCount && enableRetryOnFailure) {
          // Retry after delay
          setTimeout(() => {
            loadLabels(retryAttempt + 1)
          }, 2000)
        } else {
          setState({
            isInitializing: false,
            labelsLoaded: false,
            labelsError: errorMessage,
          })
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
      if (retryAttempt < maxRetryCount && enableRetryOnFailure) {
        // Retry after delay
        setTimeout(() => {
          loadLabels(retryAttempt + 1)
        }, 2000)
      } else {
        setState({
          isInitializing: false,
          labelsLoaded: false,
          labelsError: errorMessage,
        })
      }
    }
  }, [enableRetryOnFailure, maxRetryCount])

  /**
   * Manual retry function
   */
  const retryLabelsLoading = useCallback(async (): Promise<void> => {
    if (state.isInitializing) {
      return
    }
    await loadLabels(0)
  }, [loadLabels, state.isInitializing])

  const { initializeFromCookies } = useAuthStore()

  useEffect(() => {
    // Initialize auth from cookies first
    initializeFromCookies()

    if (!enableLabelLoading) {
      return
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadLabels(0)
  }, [enableLabelLoading, initializeFromCookies])

  return {
    ...state,
    retryLabelsLoading,
  }
}

export function useSimpleLabelsInit(): {
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  retry: () => Promise<void>
} {
  const { isInitializing, labelsLoaded, labelsError, retryLabelsLoading } = useAppInitialization({
    enableLabelLoading: true,
  })
  

  return {
    isLoading: isInitializing,
    isLoaded: labelsLoaded,
    error: labelsError,
    retry: retryLabelsLoading,
  }
}
