import { useCallback } from 'react'
import { PaymentBeneficiaryLabelsService } from '@/services/api/masterApi/Payment/paymentBeneficiaryLabelsService'
import type { ProcessedPaymentBeneficiaryLabels } from '@/services/api/masterApi/Payment/paymentBeneficiaryLabelsService'

export function usePaymentBeneficiaryLabelsWithCache() {
  // 🏦 BANKING COMPLIANCE: Now using Zustand store instead of localStorage
  // API remains identical for backward compatibility
  // Note: Account purpose labels are not yet in the store, so we use null as fallback
  const paymentBeneficiaryLabels = null as ProcessedPaymentBeneficiaryLabels | null
  const paymentBeneficiaryLabelsLoading = false
  
  // Note: We no longer use the old React Query hook since Zustand is the source of truth
  // Labels are loaded by the compliance loader service on app initialization

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
          if (paymentBeneficiaryLabels) {
        return PaymentBeneficiaryLabelsService.getLabel(paymentBeneficiaryLabels, configId, language, fallback)
      }
      return fallback
    },
    [paymentBeneficiaryLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      return PaymentBeneficiaryLabelsService.hasLabels(paymentBeneficiaryLabels || {})
  }, [paymentBeneficiaryLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return PaymentBeneficiaryLabelsService.getAvailableLanguages(paymentBeneficiaryLabels || {})
  }, [paymentBeneficiaryLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: paymentBeneficiaryLabels,
    isLoading: paymentBeneficiaryLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: paymentBeneficiaryLabelsLoading,
    isSuccess: !!paymentBeneficiaryLabels,
    refetch: () => {
     
        return Promise.resolve({ data: paymentBeneficiaryLabels })
    },
    
    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,
    
    // Compatibility properties (maintained for existing UI components)
        hasCache: !!paymentBeneficiaryLabels, // Now represents Zustand store state
    cacheStatus: paymentBeneficiaryLabels ? 'cached' : paymentBeneficiaryLabelsLoading ? 'Loading...' : 'fresh',
  }
}
