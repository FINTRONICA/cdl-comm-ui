import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { BeneficiaryLabelsService } from '@/services/api/masterApi/Customer/beneficiaryLabelService'

export function useBeneficiaryLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { beneficiaryLabels } = useLabels()
  const { beneficiaryLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (beneficiaryLabels) {
        return BeneficiaryLabelsService.getLabel(beneficiaryLabels, configId, language, fallback)
      }
      return fallback
    },
    [beneficiaryLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return BeneficiaryLabelsService.hasLabels(beneficiaryLabels || {})
  }, [beneficiaryLabels])

  const getAvailableLanguages = useCallback(() => {
    return BeneficiaryLabelsService.getAvailableLanguages(beneficiaryLabels || {})
  }, [beneficiaryLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: beneficiaryLabels,
    isLoading: beneficiaryLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: beneficiaryLabelsLoading,
    isSuccess: !!beneficiaryLabels,
    refetch: () => {
     
      return Promise.resolve({ data: beneficiaryLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
        hasCache: !!beneficiaryLabels, // Now represents Zustand store state
    cacheStatus: beneficiaryLabels ? 'cached' : beneficiaryLabelsLoading ? 'Loading...' : 'fresh',
  }
}
