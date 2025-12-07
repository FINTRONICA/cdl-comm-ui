import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementSubTypeLabelsService } from '@/services/api/masterApi/Customer/agreementSubTypeLabelsService'

export function useAgreementSubTypeLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { agreementSubTypeLabels } = useLabels()
  const { agreementSubTypeLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (agreementSubTypeLabels) {
        return AgreementSubTypeLabelsService.getLabel(agreementSubTypeLabels, configId, language, fallback)
      }
      return fallback
    },
    [agreementSubTypeLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementSubTypeLabelsService.hasLabels(agreementSubTypeLabels || {})
  }, [agreementSubTypeLabels])

  const getAvailableLanguages = useCallback(() => {
    return AgreementSubTypeLabelsService.getAvailableLanguages(agreementSubTypeLabels || {})
  }, [agreementSubTypeLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: agreementSubTypeLabels,
    isLoading: agreementSubTypeLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: agreementSubTypeLabelsLoading,
    isSuccess: !!agreementSubTypeLabels,
    refetch: () => {
     
      return Promise.resolve({ data: agreementSubTypeLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!agreementSubTypeLabels, // Now represents Zustand store state
    cacheStatus: agreementSubTypeLabels ? 'cached' : agreementSubTypeLabelsLoading ? 'Loading...' : 'fresh',
  }
}
