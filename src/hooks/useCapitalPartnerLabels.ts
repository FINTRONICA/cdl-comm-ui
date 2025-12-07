import { useMemo } from 'react'
import { CapitalPartnerLabelsService } from '@/services/api/capitalPartnerLabelsService'
import { useAppStore } from '@/store'

/**
 * Hook that reads from Zustand store (labels are pre-loaded by ComplianceProvider)
 * No API calls are made here to avoid duplicate requests
 */
export function useCapitalPartnerLabels() {
  // Read labels from Zustand store (already loaded by ComplianceProvider)
  const capitalPartnerLabels = useAppStore((state) => state.capitalPartnerLabels)
  const capitalPartnerLabelsLoading = useAppStore((state) => state.capitalPartnerLabelsLoading)
  const capitalPartnerLabelsError = useAppStore((state) => state.capitalPartnerLabelsError)

  // Return React Query-compatible interface for backwards compatibility
  return useMemo(
    () => ({
      data: capitalPartnerLabels,
      isLoading: capitalPartnerLabelsLoading,
      error: capitalPartnerLabelsError ? new Error(capitalPartnerLabelsError) : null,
      isError: !!capitalPartnerLabelsError,
      isSuccess: !capitalPartnerLabelsLoading && !!capitalPartnerLabels,
    }),
    [capitalPartnerLabels, capitalPartnerLabelsLoading, capitalPartnerLabelsError]
  )
}

/**
 * Hook with utility methods for capital partner labels
 */
export function useCapitalPartnerLabelsWithUtils() {
  const query = useCapitalPartnerLabels()
  
  return {
    ...query,
    // Utility methods
    hasLabels: () => CapitalPartnerLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) => 
      CapitalPartnerLabelsService.getLabel(query.data || {}, configId, language, fallback),
    getAvailableLanguages: () => 
      CapitalPartnerLabelsService.getAvailableLanguages(query.data || {}),
  }
}
