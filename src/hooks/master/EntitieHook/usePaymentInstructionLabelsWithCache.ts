import { useCallback } from 'react'
import { usePaymentInstructionLabels } from '../PaymentHook/usePaymentInstruction'
import { PaymentInstructionLabelsService } from '@/services/api/masterApi/Payment/paymentInstructionLabelsService'

export function usePaymentInstructionLabelsWithCache() {
  // Use React Query hook to fetch labels
  const query = usePaymentInstructionLabels()
  
  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (query.data) {
        return PaymentInstructionLabelsService.getLabel(query.data, configId, language, fallback)
      }
      return fallback
    },
    [query.data]
  )

  const hasLabels = useCallback(() => {
    return PaymentInstructionLabelsService.hasLabels(query.data || {})
  }, [query.data])

  const getAvailableLanguages = useCallback(() => {
    return PaymentInstructionLabelsService.getAvailableLanguages(query.data || {})
  }, [query.data])

  return {
    // React Query-like structure for compatibility
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    
    // Original hook API functions
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties
    hasCache: !!query.data,
    cacheStatus: query.data ? 'cached' : query.isLoading ? 'Loading...' : 'fresh',
  }
}
