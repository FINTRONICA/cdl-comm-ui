import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { StandingInstructionLabelsService } from '@/services/api/masterApi/Entitie/standingInstructionLabelsService'

export function useStandingInstructionLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { standingInstructionLabels } = useLabels()
  const { standingInstructionLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
        if (standingInstructionLabels) {
        return StandingInstructionLabelsService.getLabel(standingInstructionLabels, configId, language, fallback)
      }
      return fallback
    },
    [standingInstructionLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return StandingInstructionLabelsService.hasLabels(standingInstructionLabels || {})
  }, [standingInstructionLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return StandingInstructionLabelsService.getAvailableLanguages(standingInstructionLabels || {})
  }, [standingInstructionLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: standingInstructionLabels,
    isLoading: standingInstructionLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: standingInstructionLabelsLoading,
    isSuccess: !!standingInstructionLabels,
    refetch: () => {

      return Promise.resolve({ data: standingInstructionLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
      hasCache: !!standingInstructionLabels, // Now represents Zustand store state
    cacheStatus: standingInstructionLabels ? 'cached' : standingInstructionLabelsLoading ? 'Loading...' : 'fresh',
  }
}
