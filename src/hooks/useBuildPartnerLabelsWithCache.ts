import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { BuildPartnerLabelsService } from '@/services/api/buildPartnerLabelsService'

export function useBuildPartnerLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { buildPartnerLabels } = useLabels()
  const { buildPartnerLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (buildPartnerLabels) {
        return BuildPartnerLabelsService.getLabel(buildPartnerLabels, configId, language, fallback)
      }
      return fallback
    },
    [buildPartnerLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return BuildPartnerLabelsService.hasLabels(buildPartnerLabels || {})
  }, [buildPartnerLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return BuildPartnerLabelsService.getAvailableLanguages(buildPartnerLabels || {})
  }, [buildPartnerLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: buildPartnerLabels,
    isLoading: buildPartnerLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: buildPartnerLabelsLoading,
    isSuccess: !!buildPartnerLabels,
    refetch: () => {
      // Note: In compliance mode, refetch is handled by app initialization
      console.log('🏦 [COMPLIANCE] Refetch requested - handled by compliance loader')
      return Promise.resolve({ data: buildPartnerLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!buildPartnerLabels, // Now represents Zustand store state
    cacheStatus: buildPartnerLabels ? 'cached' : buildPartnerLabelsLoading ? 'loading' : 'fresh',
  }
}
