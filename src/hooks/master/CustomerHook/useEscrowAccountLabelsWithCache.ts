import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { EscrowAccountLabelsService } from '@/services/api/masterApi/Customer/escrowAccountLabelService'

export function useEscrowAccountLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  // Note: escrowAccountLabels may not be in store yet, so we handle gracefully
  const labelsData = useLabels()
  const loadingData = useLabelsLoadingState()
  const escrowAccountLabels = (labelsData as Record<string, unknown>)?.escrowAccountLabels || null
  const escrowAccountLabelsLoading = (loadingData as Record<string, unknown>)?.escrowAccountLabelsLoading || false

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (escrowAccountLabels) {
        return EscrowAccountLabelsService.getLabel(escrowAccountLabels, configId, language, fallback)
      }
      return fallback
    },
    [escrowAccountLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return EscrowAccountLabelsService.hasLabels(escrowAccountLabels || {})
  }, [escrowAccountLabels])

  const getAvailableLanguages = useCallback(() => {
    return EscrowAccountLabelsService.getAvailableLanguages(escrowAccountLabels || {})
  }, [escrowAccountLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: escrowAccountLabels,
    isLoading: escrowAccountLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: escrowAccountLabelsLoading,
    isSuccess: !!escrowAccountLabels,
    refetch: () => {
     
      return Promise.resolve({ data: escrowAccountLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
        hasCache: !!escrowAccountLabels, // Now represents Zustand store state
    cacheStatus: escrowAccountLabels ? 'cached' : escrowAccountLabelsLoading ? 'Loading...' : 'fresh',
  }
}
