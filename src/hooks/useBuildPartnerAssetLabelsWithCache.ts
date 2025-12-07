import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { BuildPartnerAssetLabelsService } from '@/services/api/buildPartnerAssetLabelsService'

export function useBuildPartnerAssetLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { buildPartnerAssetLabels } = useLabels()
  const { buildPartnerAssetLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (buildPartnerAssetLabels) {
        return BuildPartnerAssetLabelsService.getLabel(buildPartnerAssetLabels, configId, language, fallback)
      }
      return fallback
    },
    [buildPartnerAssetLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return BuildPartnerAssetLabelsService.hasLabels(buildPartnerAssetLabels || {})
  }, [buildPartnerAssetLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return BuildPartnerAssetLabelsService.getAvailableLanguages(buildPartnerAssetLabels || {})
  }, [buildPartnerAssetLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: buildPartnerAssetLabels,
    isLoading: buildPartnerAssetLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: buildPartnerAssetLabelsLoading,
    isSuccess: !!buildPartnerAssetLabels,
    refetch: () => {
    
      return Promise.resolve({ data: buildPartnerAssetLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!buildPartnerAssetLabels, // Now represents Zustand store state
    cacheStatus: buildPartnerAssetLabels ? 'cached' : buildPartnerAssetLabelsLoading ? 'Loading...' : 'fresh',
  }
}
