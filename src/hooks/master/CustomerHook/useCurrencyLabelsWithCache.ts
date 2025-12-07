import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { CurrencyLabelsService } from '@/services/api/masterApi/Customer/currencyLabelsService'

export function useCurrencyLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { currencyLabels } = useLabels()
  const { currencyLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (currencyLabels) {
        return CurrencyLabelsService.getLabel(currencyLabels, configId, language, fallback)
      }
      return fallback
    },
    [currencyLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      return CurrencyLabelsService.hasLabels(currencyLabels || {})
  }, [currencyLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return CurrencyLabelsService.getAvailableLanguages(currencyLabels || {})
  }, [currencyLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
            data: currencyLabels,
    isLoading: currencyLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: currencyLabelsLoading,
    isSuccess: !!currencyLabels,
    refetch: () => {
     
        return Promise.resolve({ data: currencyLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
                  hasCache: !!currencyLabels, // Now represents Zustand store state
    cacheStatus: currencyLabels ? 'cached' : currencyLabelsLoading ? 'Loading...' : 'fresh',
  }
}
