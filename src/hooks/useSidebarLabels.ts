import { useMemo } from 'react'
import { SidebarLabelsService } from '@/services/api/sidebarLabelsService'
import { useAppStore } from '@/store'
import type { ProcessedLabels } from '@/types/sidebarLabels'

/**
 * Hook to access sidebar labels from Zustand store
 * Labels are pre-loaded by ComplianceProvider, so no API calls are made here
 */
export const useSidebarLabels = () => {
  // Read labels from Zustand store (already loaded by ComplianceProvider)
  const sidebarLabels = useAppStore((state) => state.sidebarLabels)
  const sidebarLabelsLoading = useAppStore(
    (state) => state.sidebarLabelsLoading
  )
  const sidebarLabelsError = useAppStore((state) => state.sidebarLabelsError)

  // Return React Query-compatible interface for backwards compatibility
  return useMemo(
    () => ({
      data: sidebarLabels as ProcessedLabels | undefined,
      isLoading: sidebarLabelsLoading,
      error: sidebarLabelsError ? new Error(sidebarLabelsError) : null,
      isError: !!sidebarLabelsError,
      isSuccess: !sidebarLabelsLoading && !!sidebarLabels,
    }),
    [sidebarLabels, sidebarLabelsLoading, sidebarLabelsError]
  )
}

export const useSidebarLabelsWithUtils = () => {
  const query = useSidebarLabels()

  return {
    ...query,
    hasLabels: () => SidebarLabelsService.hasLabels(query.data || {}),
    getLabel: (sidebarId: string, language: string, fallback: string) =>
      SidebarLabelsService.getLabelBySidebarId(
        query.data || {},
        sidebarId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      SidebarLabelsService.getAvailableLanguages(query.data || {}),
  }
}
