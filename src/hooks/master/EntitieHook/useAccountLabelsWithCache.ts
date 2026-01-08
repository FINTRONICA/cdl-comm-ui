import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AccountLabelsService } from '@/services/api/masterApi/Entitie/accountLabelsService'

export function useAccountLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { accountLabels } = useLabels()
  const { accountLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (accountLabels) {
        return AccountLabelsService.getLabel(accountLabels, configId, language, fallback)
      }
      return fallback
    },
    [accountLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AccountLabelsService.hasLabels(accountLabels || {})
  }, [accountLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AccountLabelsService.getAvailableLanguages(accountLabels || {})
  }, [accountLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: accountLabels,
    isLoading: accountLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: accountLabelsLoading,
    isSuccess: !!accountLabels,
    refetch: () => {

      return Promise.resolve({ data: accountLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
        hasCache: !!accountLabels, // Now represents Zustand store state
    cacheStatus: accountLabels ? 'cached' : accountLabelsLoading ? 'Loading...' : 'fresh',
  }
}
