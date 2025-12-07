import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import {
  ProcessedWorkflowAmountRuleLabels,
  WorkflowAmountLabelsService,
} from '@/services/api/workflowApi'

export function useWorkflowAmountRuleLabelsWithCache() {
  const { workflowAmountRuleLabels } = useLabels()
  const { workflowAmountRuleLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (workflowAmountRuleLabels) {
        return WorkflowAmountLabelsService.getLabel(
          workflowAmountRuleLabels as ProcessedWorkflowAmountRuleLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [workflowAmountRuleLabels]
  )

  const hasLabels = useCallback(() => {
    return WorkflowAmountLabelsService.hasLabels(
      (workflowAmountRuleLabels || {}) as ProcessedWorkflowAmountRuleLabels
    )
  }, [workflowAmountRuleLabels])

  const getAvailableLanguages = useCallback(() => {
    return WorkflowAmountLabelsService.getAvailableLanguages(
      (workflowAmountRuleLabels || {}) as ProcessedWorkflowAmountRuleLabels
    )
  }, [workflowAmountRuleLabels])

  return {
    data: workflowAmountRuleLabels,
    isLoading: workflowAmountRuleLabelsLoading,
    error: null,
    isError: false,
    isFetching: workflowAmountRuleLabelsLoading,
    isSuccess: !!workflowAmountRuleLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowAmountRuleLabels })
    },

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!workflowAmountRuleLabels,
    cacheStatus: workflowAmountRuleLabels
      ? 'cached'
      : workflowAmountRuleLabelsLoading
        ? 'Loading...'
        : 'fresh',
  }
}
