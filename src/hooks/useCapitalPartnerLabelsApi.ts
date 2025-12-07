import { useCallback, useMemo } from 'react'
import { CapitalPartnerLabelsService, ProcessedCapitalPartnerLabels } from '@/services/api/capitalPartnerLabelsService'
import { useAppStore } from '@/store'

// Hook that reads from Zustand store (labels are pre-loaded by ComplianceProvider)
// No API calls are made here to avoid duplicate requests
export function useCapitalPartnerLabelsApi() {
  // Read labels from Zustand store (already loaded by ComplianceProvider)
  const capitalPartnerLabels = useAppStore((state) => state.capitalPartnerLabels)
  const capitalPartnerLabelsLoading = useAppStore((state) => state.capitalPartnerLabelsLoading)
  const capitalPartnerLabelsError = useAppStore((state) => state.capitalPartnerLabelsError)

  // Labels are already loaded by ComplianceProvider, no need to fetch
  const labels = capitalPartnerLabels as ProcessedCapitalPartnerLabels | null
  const isLoading = capitalPartnerLabelsLoading
  const error = capitalPartnerLabelsError

  const getLabel = useCallback(
    (configId: string, language: string = 'EN', fallback?: string): string => {
      if (!labels) {
        return fallback || configId
      }
      return CapitalPartnerLabelsService.getLabel(labels, configId, language, fallback || configId)
    },
    [labels]
  )

  const hasLabels = useCallback(() => {
    return CapitalPartnerLabelsService.hasLabels(labels || {})
  }, [labels])

  const getAvailableLanguages = useCallback(() => {
    return CapitalPartnerLabelsService.getAvailableLanguages(labels || {})
  }, [labels])

  return useMemo(
    () => ({
      labels,
      isLoading,
      error,
      isError: !!error,
      isSuccess: !!labels && !error,
      refetch: async () => {
        // Labels are managed by ComplianceProvider, refetch is a no-op
        // If refresh is needed, it should be done through ComplianceProvider
        return Promise.resolve({ data: labels })
      },
      getLabel,
      hasLabels,
      getAvailableLanguages,
    }),
    [labels, isLoading, error, getLabel, hasLabels, getAvailableLanguages]
  )
}
