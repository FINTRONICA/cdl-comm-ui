import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { ProductProgramLabelsService } from '@/services/api/masterApi/Customer/productProgramLabelsService'

export function useProductProgramLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { productProgramLabels } = useLabels()
  const { productProgramLabelsLoading } = useLabelsLoadingState()
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (productProgramLabels) {
        return ProductProgramLabelsService.getLabel(productProgramLabels, configId, language, fallback)
      }
      return fallback
    },
    [productProgramLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      return ProductProgramLabelsService.hasLabels(productProgramLabels || {})
  }, [productProgramLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return ProductProgramLabelsService.getAvailableLanguages(productProgramLabels || {})
  }, [productProgramLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: productProgramLabels,
    isLoading: productProgramLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: productProgramLabelsLoading,
    isSuccess: !!productProgramLabels,
    refetch: () => {
     
        return Promise.resolve({ data: productProgramLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
    hasCache: !!productProgramLabels, // Now represents Zustand store state
    cacheStatus: productProgramLabels ? 'cached' : productProgramLabelsLoading ? 'Loading...' : 'fresh',
  }
}
