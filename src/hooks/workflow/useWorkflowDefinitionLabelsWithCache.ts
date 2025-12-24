import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { WorkflowDefinitionLabelsService } from '@/services/api/workflowApi/workflowDefinitionLabelsService'

export function useWorkflowDefinitionLabelsWithCache() {
  const { workflowDefinitionLabels } = useLabels()
  const { workflowDefinitionLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (workflowDefinitionLabels) {
        return WorkflowDefinitionLabelsService.getLabel(workflowDefinitionLabels, configId, language, fallback)
      }
      return fallback
    },
    [workflowDefinitionLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowDefinitionLabelsService.hasLabels(workflowDefinitionLabels || {})
  }, [workflowDefinitionLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowDefinitionLabelsService.getAvailableLanguages(workflowDefinitionLabels || {})
  }, [workflowDefinitionLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: workflowDefinitionLabels,
    isLoading: workflowDefinitionLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: workflowDefinitionLabelsLoading,
    isSuccess: !!workflowDefinitionLabels,
    refetch: () => {

      return Promise.resolve({ data: workflowDefinitionLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!workflowDefinitionLabels,
    cacheStatus: workflowDefinitionLabels ? 'cached' : workflowDefinitionLabelsLoading ? 'Loading...' : 'fresh',
  }
}
