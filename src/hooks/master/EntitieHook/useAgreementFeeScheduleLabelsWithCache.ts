import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementFeeScheduleLabelsService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleLabelsService'

export function useAgreementFeeScheduleLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { agreementFeeScheduleLabels } = useLabels()
  const { agreementFeeScheduleLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (agreementFeeScheduleLabels) {
        return AgreementFeeScheduleLabelsService.getLabel(agreementFeeScheduleLabels, configId, language, fallback)
      }
      return fallback
    },
    [agreementFeeScheduleLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementFeeScheduleLabelsService.hasLabels(agreementFeeScheduleLabels || {})
  }, [agreementFeeScheduleLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AgreementFeeScheduleLabelsService.getAvailableLanguages(agreementFeeScheduleLabels || {})
  }, [agreementFeeScheduleLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: agreementFeeScheduleLabels,
    isLoading: agreementFeeScheduleLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: agreementFeeScheduleLabelsLoading,
    isSuccess: !!agreementFeeScheduleLabels,
    refetch: () => {

      return Promise.resolve({ data: agreementFeeScheduleLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!agreementFeeScheduleLabels, // Now represents Zustand store state
    cacheStatus: agreementFeeScheduleLabels ? 'cached' : agreementFeeScheduleLabelsLoading ? 'Loading...' : 'fresh',
  }
}
