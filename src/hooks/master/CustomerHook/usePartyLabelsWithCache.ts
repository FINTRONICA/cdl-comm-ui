import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { PartyLabelsService } from '@/services/api/masterApi/Customer/partyLabelsService'

export function usePartyLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { partyLabels } = useLabels()
  const { partyLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (partyLabels) {
        return PartyLabelsService.getLabel(partyLabels, configId, language, fallback)
      }
      return fallback
    },
    [partyLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return PartyLabelsService.hasLabels(partyLabels || {})
  }, [partyLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return PartyLabelsService.getAvailableLanguages(partyLabels || {})
  }, [partyLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: partyLabels,
    isLoading: partyLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: partyLabelsLoading,
    isSuccess: !!partyLabels,
    refetch: () => {
     
      return Promise.resolve({ data: partyLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!partyLabels, // Now represents Zustand store state
    cacheStatus: partyLabels ? 'cached' : partyLabelsLoading ? 'Loading...' : 'fresh',
  }
}
