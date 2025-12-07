import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { CapitalPartnerLabelsService } from '@/services/api/capitalPartnerLabelsService'

export function useCapitalPartnerLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { capitalPartnerLabels } = useLabels()
  const { capitalPartnerLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (capitalPartnerLabels) {
        return CapitalPartnerLabelsService.getLabel(capitalPartnerLabels, configId, language, fallback)
      }
      return fallback
    },
    [capitalPartnerLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return CapitalPartnerLabelsService.hasLabels(capitalPartnerLabels || {})
  }, [capitalPartnerLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return CapitalPartnerLabelsService.getAvailableLanguages(capitalPartnerLabels || {})
  }, [capitalPartnerLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: capitalPartnerLabels,
    isLoading: capitalPartnerLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: capitalPartnerLabelsLoading,
    isSuccess: !!capitalPartnerLabels,
    refetch: () => {
     
      return Promise.resolve({ data: capitalPartnerLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!capitalPartnerLabels, // Now represents Zustand store state
    cacheStatus: capitalPartnerLabels ? 'cached' : capitalPartnerLabelsLoading ? 'Loading...' : 'fresh',
  }
}
