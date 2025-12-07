
import { useEffect, useCallback, useState } from 'react'
import { loadAllLabelsCompliance } from '@/services/complianceLabelsLoader'
import { useAuthStore } from '@/store/authStore'


export interface AppInitializationOptions {
  enableLabelLoading?: boolean
  enableRetryOnFailure?: boolean
  retryCount?: number
}


export interface AppInitializationState {
  isInitializing: boolean
  labelsLoaded: boolean
  labelsError: string | null
}


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


  const [state, setState] = useState<AppInitializationState>({
    isInitializing: false,
    labelsLoaded: false,
    labelsError: null,
  })


  
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

 
  const retryLabelsLoading = useCallback(async (): Promise<void> => {
    if (state.isInitializing) {
      return
    }
    await loadLabels(0)
  }, [loadLabels, state.isInitializing])

  const { initializeFromCookies } = useAuthStore()

  useEffect(() => {
  
    initializeFromCookies()

    if (!enableLabelLoading) {
      return
    }
    
   
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
