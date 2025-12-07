import { useCallback } from 'react'
import { useStandingInstructionLabels } from './usePaymentInstruction'
import { StandingInstructionLabelsService } from '@/services/api/masterApi/Entitie/standingInstructionLabelsService'

export function useStandingInstructionLabelsWithCache() {
  // Use React Query hook to fetch labels
  const query = useStandingInstructionLabels()
  
  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (query.data) {
        return StandingInstructionLabelsService.getLabel(query.data, configId, language, fallback)
      }
      return fallback
    },
    [query.data]
  )

  const hasLabels = useCallback(() => {
    return StandingInstructionLabelsService.hasLabels(query.data || {})
  }, [query.data])

  const getAvailableLanguages = useCallback(() => {
    return StandingInstructionLabelsService.getAvailableLanguages(query.data || {})
  }, [query.data])

  return {
    // React Query-like structure for compatibility
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    
    // Original hook API functions
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties
    hasCache: !!query.data,
    cacheStatus: query.data ? 'cached' : query.isLoading ? 'Loading...' : 'fresh',
  }
}
