import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { StandingInstructionBeneficiaryLabelsService } from '@/services/api/masterApi/Entitie/standingInstructionBeneficiaryLabelsService'

export function useStandingInstructionBeneficiaryLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { standingInstructionBeneficiaryLabels } = useLabels()
  const { standingInstructionBeneficiaryLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (standingInstructionBeneficiaryLabels) {
        return StandingInstructionBeneficiaryLabelsService.getLabel(standingInstructionBeneficiaryLabels, configId, language, fallback)
      }
      return fallback
    },
    [standingInstructionBeneficiaryLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return StandingInstructionBeneficiaryLabelsService.hasLabels(standingInstructionBeneficiaryLabels || {})
  }, [standingInstructionBeneficiaryLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return StandingInstructionBeneficiaryLabelsService.getAvailableLanguages(standingInstructionBeneficiaryLabels || {})
  }, [standingInstructionBeneficiaryLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: standingInstructionBeneficiaryLabels,
    isLoading: standingInstructionBeneficiaryLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: standingInstructionBeneficiaryLabelsLoading,
    isSuccess: !!standingInstructionBeneficiaryLabels,
    refetch: () => {

      return Promise.resolve({ data: standingInstructionBeneficiaryLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!standingInstructionBeneficiaryLabels, // Now represents Zustand store state
    cacheStatus: standingInstructionBeneficiaryLabels ? 'cached' : standingInstructionBeneficiaryLabelsLoading ? 'Loading...' : 'fresh',
  }
}
