import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import WorkflowAmountStageOverrideLabelsService, {
  type ProcessedWorkflowAmountStageOverrideLabels,
} from '@/services/api/workflowApi/workflowAmountStageOverrideLabelsService'

export function useBuildWorkflowAmountStageOverrideLabelsWithCache() {
  const { workflowAmountStageOverrideLabels } = useLabels()
  const { workflowAmountStageOverrideLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (workflowAmountStageOverrideLabels) {
        return WorkflowAmountStageOverrideLabelsService.getLabel(
          workflowAmountStageOverrideLabels as ProcessedWorkflowAmountStageOverrideLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [workflowAmountStageOverrideLabels]
  )

  const hasLabels = useCallback(() => {
    return WorkflowAmountStageOverrideLabelsService.hasLabels(
      (workflowAmountStageOverrideLabels ||
        {}) as ProcessedWorkflowAmountStageOverrideLabels
    )
  }, [workflowAmountStageOverrideLabels])

  const getAvailableLanguages = useCallback(() => {
    return WorkflowAmountStageOverrideLabelsService.getAvailableLanguages(
      (workflowAmountStageOverrideLabels ||
        {}) as ProcessedWorkflowAmountStageOverrideLabels
    )
  }, [workflowAmountStageOverrideLabels])

  return {
    data: workflowAmountStageOverrideLabels,
    isLoading: workflowAmountStageOverrideLabelsLoading,
    error: null,
    isError: false,
    isFetching: workflowAmountStageOverrideLabelsLoading,
    isSuccess: !!workflowAmountStageOverrideLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowAmountStageOverrideLabels })
    },

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!workflowAmountStageOverrideLabels,
    cacheStatus: workflowAmountStageOverrideLabels
      ? 'cached'
      : workflowAmountStageOverrideLabelsLoading
        ? 'loading'
        : 'fresh',
  }
}
