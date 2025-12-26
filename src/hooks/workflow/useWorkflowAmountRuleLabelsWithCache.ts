import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { WorkflowAmountRuleLabelsService } from '@/services/api/workflowApi/workflowAmountRuleLabelsService'

export function useWorkflowAmountRuleLabelsWithCache() {
  const { workflowAmountRuleLabels } = useLabels()
  const { workflowAmountRuleLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
      if (workflowAmountRuleLabels) {
        return WorkflowAmountRuleLabelsService.getLabel(workflowAmountRuleLabels, configId, language, fallback)
      }
      return fallback
    },
    [workflowAmountRuleLabels]
  )

  const hasLabels = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowAmountRuleLabelsService.hasLabels(workflowAmountRuleLabels || {})
    }, [workflowAmountRuleLabels])

  const getAvailableLanguages = useCallback(() => {
    // 🏦 COMPLIANCE: Using Zustand store data instead of localStorage
    return WorkflowAmountRuleLabelsService.getAvailableLanguages(workflowAmountRuleLabels || {})
  }, [workflowAmountRuleLabels])

  // 🏦 COMPLIANCE: Return identical API structure for backward compatibility
  return {
    // Simulated React Query-like structure for compatibility
    data: workflowAmountRuleLabels,
    isLoading: workflowAmountRuleLabelsLoading,
    error: null, // Error handling is managed by the compliance loader
    isError: false,
    isFetching: workflowAmountRuleLabelsLoading,
    isSuccess: !!workflowAmountRuleLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowAmountRuleLabels })
    },

    // Original hook API functions (unchanged signatures)
    getLabel,
    hasLabels,
    getAvailableLanguages,

    // Compatibility properties (maintained for existing UI components)
    hasCache: !!workflowAmountRuleLabels,
    cacheStatus: workflowAmountRuleLabels ? 'cached' : workflowAmountRuleLabelsLoading ? 'Loading...' : 'fresh',
  }
}
