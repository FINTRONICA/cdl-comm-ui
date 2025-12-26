import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { WorkflowActionLabelsService } from '@/services/api/workflowApi/workflowActionLabelsService'

export function useWorkflowActionLabelsWithCache() {
  const { workflowActionLabels } = useLabels()
  const { workflowActionLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (workflowActionLabels) {
        return WorkflowActionLabelsService.getLabel(workflowActionLabels, configId, language, fallback)
      }
      return fallback
    },
    [workflowActionLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowActionLabelsService.hasLabels(workflowActionLabels || {})
  }, [workflowActionLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowActionLabelsService.getAvailableLanguages(workflowActionLabels || {})
  }, [workflowActionLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: workflowActionLabels,
    isLoading: workflowActionLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: workflowActionLabelsLoading,
    isSuccess: !!workflowActionLabels,
    refetch: () => {

      return Promise.resolve({ data: workflowActionLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!workflowActionLabels,
    cacheStatus: workflowActionLabels ? 'cached' : workflowActionLabelsLoading ? 'Loading...' : 'fresh',
  }
}
