import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementParameterLabelsService } from '@/services/api/masterApi/Entitie/agreementParameterLabelsService'

export function useAgreementLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { agreementParameterLabels } = useLabels()
  const { agreementParameterLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (agreementParameterLabels) {
        return AgreementParameterLabelsService.getLabel(agreementParameterLabels, configId, language, fallback)
      }
      return fallback
    },
    [agreementParameterLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementParameterLabelsService.hasLabels(agreementParameterLabels || {})
  }, [agreementParameterLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementParameterLabelsService.getAvailableLanguages(agreementParameterLabels || {})
  }, [agreementParameterLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: agreementParameterLabels,
    isLoading: agreementParameterLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: agreementParameterLabelsLoading,
    isSuccess: !!agreementParameterLabels,
    refetch: () => {

      return Promise.resolve({ data: agreementParameterLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!agreementParameterLabels, // Now represents Zustand store state
    cacheStatus: agreementParameterLabels ? 'cached' : agreementParameterLabelsLoading ? 'Loading...' : 'fresh',
  }
}
