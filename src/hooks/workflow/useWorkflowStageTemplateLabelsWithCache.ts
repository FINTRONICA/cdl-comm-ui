import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import {
  ProcessedWorkflowStageTemplateLabels,
  WorkflowStageTemplateLabelsService,
} from '@/services/api/workflowApi/workflowStageTemplateLabelsService'

export function useBuildWorkflowStageTemplateLabelsWithCache() {
  const { workflowStageTemplateLabels } = useLabels()
  const { workflowStageTemplateLabelsLoading } = useLabelsLoadingState()
  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (workflowStageTemplateLabels) {
        const processedLabels =
          workflowStageTemplateLabels as ProcessedWorkflowStageTemplateLabels
        return WorkflowStageTemplateLabelsService.getLabel(
          processedLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [workflowStageTemplateLabels]
  )

  const hasLabels = useCallback(() => {
    if (workflowStageTemplateLabels) {
      const processedLabels =
        workflowStageTemplateLabels as ProcessedWorkflowStageTemplateLabels
      return WorkflowStageTemplateLabelsService.hasLabels(processedLabels)
    }
    return false
  }, [workflowStageTemplateLabels])

  const getAvailableLanguages = useCallback(() => {
    if (workflowStageTemplateLabels) {
      const processedLabels =
        workflowStageTemplateLabels as ProcessedWorkflowStageTemplateLabels
      return WorkflowStageTemplateLabelsService.getAvailableLanguages(
        processedLabels
      )
    }
    return ['EN']
  }, [workflowStageTemplateLabels])

  return {
    data: workflowStageTemplateLabels,
    isLoading: workflowStageTemplateLabelsLoading,
    error: null,
    isError: false,
    isFetching: workflowStageTemplateLabelsLoading,
    isSuccess: !!workflowStageTemplateLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowStageTemplateLabels })
    },

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!workflowStageTemplateLabels,
    cacheStatus: workflowStageTemplateLabels
      ? 'cached'
      : workflowStageTemplateLabelsLoading
        ? 'loading'
        : 'fresh',
  }
}
