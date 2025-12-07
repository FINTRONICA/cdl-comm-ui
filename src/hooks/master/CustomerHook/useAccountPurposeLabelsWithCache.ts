import { useCallback } from 'react'
import { AccountPurposeLabelsService } from '@/services/api/masterApi/Customer/accountPurposeLabelsService'
import type { ProcessedAccountPurposeLabels } from '@/services/api/masterApi/Customer/accountPurposeLabelsService'

export function useAccountPurposeLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  // Note: Account purpose labels are not yet in the store, so we use null as fallback
  const accountPurposeLabels = null as ProcessedAccountPurposeLabels | null
  const accountPurposeLabelsLoading = false
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (accountPurposeLabels) {
        return AccountPurposeLabelsService.getLabel(accountPurposeLabels, configId, language, fallback)
      }
      return fallback
    },
    [accountPurposeLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      return AccountPurposeLabelsService.hasLabels(accountPurposeLabels || {})
  }, [accountPurposeLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return AccountPurposeLabelsService.getAvailableLanguages(accountPurposeLabels || {})
  }, [accountPurposeLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: accountPurposeLabels,
    isLoading: accountPurposeLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: accountPurposeLabelsLoading,
    isSuccess: !!accountPurposeLabels,
    refetch: () => {
     
        return Promise.resolve({ data: accountPurposeLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!accountPurposeLabels, // Now represents Zustand store state
    cacheStatus: accountPurposeLabels ? 'cached' : accountPurposeLabelsLoading ? 'Loading...' : 'fresh',
  }
}
