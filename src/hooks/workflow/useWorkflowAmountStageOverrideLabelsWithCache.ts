import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { WorkflowAmountStageOverrideLabelsService } from '@/services/api/workflowApi/workflowAmountStageOverrideLabelsService'

export function useBuildWorkflowAmountStageOverrideLabelsWithCache() {
  const { workflowAmountStageOverrideLabels } = useLabels()
  const { workflowAmountStageOverrideLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (workflowAmountStageOverrideLabels) {
        return WorkflowAmountStageOverrideLabelsService.getLabel(workflowAmountStageOverrideLabels, configId, language, fallback)
      }
      return fallback
    },
    [workflowAmountStageOverrideLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowAmountStageOverrideLabelsService.hasLabels(workflowAmountStageOverrideLabels || {})
  }, [workflowAmountStageOverrideLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowAmountStageOverrideLabelsService.getAvailableLanguages(workflowAmountStageOverrideLabels || {})
  }, [workflowAmountStageOverrideLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: workflowAmountStageOverrideLabels,
    isLoading: workflowAmountStageOverrideLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: workflowAmountStageOverrideLabelsLoading,
    isSuccess: !!workflowAmountStageOverrideLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowAmountStageOverrideLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!workflowAmountStageOverrideLabels,
    cacheStatus: workflowAmountStageOverrideLabels ? 'cached' : workflowAmountStageOverrideLabelsLoading ? 'Loading...' : 'fresh',
  }
}
