import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { GeneralLedgerAccountLabelsService } from '@/services/api/masterApi/Customer/generalLedgerAccountLabelsService'

  export function useGeneralLedgerAccountLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { generalLedgerAccountLabels } = useLabels()
  const { generalLedgerAccountLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (generalLedgerAccountLabels) {
        return GeneralLedgerAccountLabelsService.getLabel(generalLedgerAccountLabels, configId, language, fallback)
      }
      return fallback
    },
    [generalLedgerAccountLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      return GeneralLedgerAccountLabelsService.hasLabels(generalLedgerAccountLabels || {})
  }, [generalLedgerAccountLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return GeneralLedgerAccountLabelsService.getAvailableLanguages(generalLedgerAccountLabels || {})
  }, [generalLedgerAccountLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
      data: generalLedgerAccountLabels,
    isLoading: generalLedgerAccountLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: generalLedgerAccountLabelsLoading,
    isSuccess: !!generalLedgerAccountLabels,
    refetch: () => {
     
        return Promise.resolve({ data: generalLedgerAccountLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!generalLedgerAccountLabels, // Now represents Zustand store state
    cacheStatus: generalLedgerAccountLabels ? 'cached' : generalLedgerAccountLabelsLoading ? 'Loading...' : 'fresh',
  }
}
