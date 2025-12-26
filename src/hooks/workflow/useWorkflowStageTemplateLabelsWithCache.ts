import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { WorkflowStageTemplateLabelsService } from '@/services/api/workflowApi/workflowStageTemplateLabelsService'

export function useBuildWorkflowStageTemplateLabelsWithCache() {
  const { workflowStageTemplateLabels } = useLabels()
  const { workflowStageTemplateLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (workflowStageTemplateLabels) {
        return WorkflowStageTemplateLabelsService.getLabel(workflowStageTemplateLabels, configId, language, fallback)
      }
      return fallback
    },
    [workflowStageTemplateLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowStageTemplateLabelsService.hasLabels(workflowStageTemplateLabels || {})
  }, [workflowStageTemplateLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowStageTemplateLabelsService.getAvailableLanguages(workflowStageTemplateLabels || {})
  }, [workflowStageTemplateLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: workflowStageTemplateLabels,
    isLoading: workflowStageTemplateLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: workflowStageTemplateLabelsLoading,
    isSuccess: !!workflowStageTemplateLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowStageTemplateLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!workflowStageTemplateLabels,
    cacheStatus: workflowStageTemplateLabels ? 'cached' : workflowStageTemplateLabelsLoading ? 'Loading...' : 'fresh',
  }
}
