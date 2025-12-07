import { useMemo } from 'react'
import { BuildPartnerAssetLabelsService } from '@/services/api/buildPartnerAssetLabelsService'
import { useAppStore } from '@/store'

// Hook that reads from Zustand store (labels are pre-loaded by ComplianceProvider)
// No API calls are made here to avoid duplicate requests
export function useBuildPartnerAssetLabels() {
  // Read labels from Zustand store (already loaded by ComplianceProvider)
  const buildPartnerAssetLabels = useAppStore((state) => state.buildPartnerAssetLabels)
  const buildPartnerAssetLabelsLoading = useAppStore((state) => state.buildPartnerAssetLabelsLoading)
  const buildPartnerAssetLabelsError = useAppStore((state) => state.buildPartnerAssetLabelsError)

  // Return React Query-compatible interface for backwards compatibility
  return useMemo(
    () => ({
      data: buildPartnerAssetLabels,
      isLoading: buildPartnerAssetLabelsLoading,
      error: buildPartnerAssetLabelsError ? new Error(buildPartnerAssetLabelsError) : null,
      isError: !!buildPartnerAssetLabelsError,
      isSuccess: !buildPartnerAssetLabelsLoading && !!buildPartnerAssetLabels,
    }),
    [buildPartnerAssetLabels, buildPartnerAssetLabelsLoading, buildPartnerAssetLabelsError]
  )
}

export function useBuildPartnerAssetLabelsWithUtils() {
  const query = useBuildPartnerAssetLabels()
  
  return {
    ...query,
    // Utility methods
    hasLabels: () => BuildPartnerAssetLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) => 
      BuildPartnerAssetLabelsService.getLabel(query.data || {}, configId, language, fallback),
    getAvailableLanguages: () => 
      BuildPartnerAssetLabelsService.getAvailableLanguages(query.data || {}),
  }
}
