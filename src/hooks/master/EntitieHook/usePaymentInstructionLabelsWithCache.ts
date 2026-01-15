import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'  
import { PaymentInstructionLabelsService } from '@/services/api/masterApi/Payment/paymentInstructionLabelsService'

export function usePaymentInstructionLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  const { paymentInstructionLabels } = useLabels()
  const { paymentInstructionLabelsLoading } = useLabelsLoadingState()

  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (paymentInstructionLabels) {
        return PaymentInstructionLabelsService.getLabel(paymentInstructionLabels, configId, language, fallback)
      }
      return fallback
    },
    [paymentInstructionLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return PaymentInstructionLabelsService.hasLabels(paymentInstructionLabels || {})
  }, [paymentInstructionLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return PaymentInstructionLabelsService.getAvailableLanguages(paymentInstructionLabels || {})
  }, [paymentInstructionLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: paymentInstructionLabels,
    isLoading: paymentInstructionLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: paymentInstructionLabelsLoading,
    isSuccess: !!paymentInstructionLabels,
    refetch: () => {

      return Promise.resolve({ data: paymentInstructionLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!paymentInstructionLabels, // Now represents Zustand store state
    cacheStatus: paymentInstructionLabels ? 'cached' : paymentInstructionLabelsLoading ? 'Loading...' : 'fresh',
  }
}
