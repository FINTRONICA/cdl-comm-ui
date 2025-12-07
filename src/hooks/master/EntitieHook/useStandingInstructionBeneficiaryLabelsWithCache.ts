import { useCallback } from 'react'
import { useStandingInstructionBeneficiaryLabels } from './useStandingInstructionBeneficiary'
import { StandingInstructionBeneficiaryLabelsService } from '@/services/api/masterApi/Entitie/standingInstructionBeneficiaryLabelsService'

export function useStandingInstructionBeneficiaryLabelsWithCache() {
  // Use React Query hook to fetch labels
  const query = useStandingInstructionBeneficiaryLabels()
  
  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (query.data) {
        return StandingInstructionBeneficiaryLabelsService.getLabel(query.data, configId, language, fallback)
      }
      return fallback
    },
    [query.data]
  )

  const hasLabels = useCallback(() => {
    return StandingInstructionBeneficiaryLabelsService.hasLabels(query.data || {})
  }, [query.data])

  const getAvailableLanguages = useCallback(() => {
    return StandingInstructionBeneficiaryLabelsService.getAvailableLanguages(query.data || {})
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


