import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementSignatoryLabelsService } from '@/services/api/masterApi/Entitie/agreementSignatoryLabelsService'

export function useAgreementSignatoryLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { agreementSignatoryLabels } = useLabels()
  const { agreementSignatoryLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (agreementSignatoryLabels) {
        return AgreementSignatoryLabelsService.getLabel(
          agreementSignatoryLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [agreementSignatoryLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementSignatoryLabelsService.hasLabels(agreementSignatoryLabels || {})
  }, [agreementSignatoryLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementSignatoryLabelsService.getAvailableLanguages(
      agreementSignatoryLabels || {}
    )
  }, [agreementSignatoryLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: agreementSignatoryLabels,
    isLoading: agreementSignatoryLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: agreementSignatoryLabelsLoading,
    isSuccess: !!agreementSignatoryLabels,
    refetch: () => {
      return Promise.resolve({ data: agreementSignatoryLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!agreementSignatoryLabels, // Now represents Zustand store state
    cacheStatus: agreementSignatoryLabels
      ? 'cached'
      : agreementSignatoryLabelsLoading
        ? 'Loading...'
        : 'fresh',
  }
}


