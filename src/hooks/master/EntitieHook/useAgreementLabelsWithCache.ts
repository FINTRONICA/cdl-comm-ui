import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementLabelsService } from '@/services/api/masterApi/Entitie/agreementLabelsService'

export function useAgreementLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { agreementLabels } = useLabels()
  const { agreementLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (agreementLabels) {
        return AgreementLabelsService.getLabel(agreementLabels, configId, language, fallback)
      }
      return fallback
    },
    [agreementLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementLabelsService.hasLabels(agreementLabels || {})
  }, [agreementLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementLabelsService.getAvailableLanguages(agreementLabels || {})
  }, [agreementLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: agreementLabels,
    isLoading: agreementLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: agreementLabelsLoading,
    isSuccess: !!agreementLabels,
    refetch: () => {

      return Promise.resolve({ data: agreementLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!agreementLabels, // Now represents Zustand store state
    cacheStatus: agreementLabels ? 'cached' : agreementLabelsLoading ? 'Loading...' : 'fresh',
  }
}
