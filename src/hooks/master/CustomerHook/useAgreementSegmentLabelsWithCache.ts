import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementSegmentLabelsService } from '@/services/api/masterApi/Customer/agreementSegmentLabelsService'

export function useAgreementSegmentLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { agreementSegmentLabels } = useLabels()
  const { agreementSegmentLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (agreementSegmentLabels) {
        return AgreementSegmentLabelsService.getLabel(agreementSegmentLabels, configId, language, fallback)
      }
      return fallback
    },
    [agreementSegmentLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      return AgreementSegmentLabelsService.hasLabels(agreementSegmentLabels || {})
  }, [agreementSegmentLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementSegmentLabelsService.getAvailableLanguages(agreementSegmentLabels || {})
  }, [agreementSegmentLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: agreementSegmentLabels,
    isLoading: agreementSegmentLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: agreementSegmentLabelsLoading,
    isSuccess: !!agreementSegmentLabels,
    refetch: () => {
     
          return Promise.resolve({ data: agreementSegmentLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!agreementSegmentLabels, // Now represents Zustand store state
    cacheStatus: agreementSegmentLabels ? 'cached' : agreementSegmentLabelsLoading ? 'Loading...' : 'fresh',
  }
}
