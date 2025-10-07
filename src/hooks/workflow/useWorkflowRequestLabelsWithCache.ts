import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import {
  WorkflowRequestLabelsService,
  type ProcessedWorkflowRequestLabels,
} from '@/services/api/workflowApi/workflowRequestLabelsService'

export function useWorkflowRequestLabelsWithCache() {
  const { workflowRequestedLabels } = useLabels()
  const { workflowRequestedLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (workflowRequestedLabels) {
        const processedLabels =
          workflowRequestedLabels as ProcessedWorkflowRequestLabels
        return WorkflowRequestLabelsService.getLabel(
          processedLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [workflowRequestedLabels]
  )

  const hasLabels = useCallback(() => {
    if (workflowRequestedLabels) {
      const processedLabels =
        workflowRequestedLabels as ProcessedWorkflowRequestLabels
      return WorkflowRequestLabelsService.hasLabels(processedLabels)
    }
    return false
  }, [workflowRequestedLabels])

  const getAvailableLanguages = useCallback(() => {
    if (workflowRequestedLabels) {
      const processedLabels =
        workflowRequestedLabels as ProcessedWorkflowRequestLabels
      return WorkflowRequestLabelsService.getAvailableLanguages(processedLabels)
    }
    return []
  }, [workflowRequestedLabels])

  return {
    data: workflowRequestedLabels,
    isLoading: workflowRequestedLabelsLoading,
    error: null,
    isError: false,
    isFetching: workflowRequestedLabelsLoading,
    isSuccess: !!workflowRequestedLabels,
    refetch: useCallback(() => {
      return Promise.resolve({ data: workflowRequestedLabels })
    }, [workflowRequestedLabels]),

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!workflowRequestedLabels,
    cacheStatus: workflowRequestedLabels
      ? 'cached'
      : workflowRequestedLabelsLoading
        ? 'loading'
        : 'fresh',

    getLabelsForConfig: useCallback(
      (configId: string) => {
        if (workflowRequestedLabels) {
          const processedLabels =
            workflowRequestedLabels as ProcessedWorkflowRequestLabels
          return processedLabels[configId] || {}
        }
        return {}
      },
      [workflowRequestedLabels]
    ),

    debug: {
      hasLabels: !!workflowRequestedLabels,
      isLoading: workflowRequestedLabelsLoading,
      labelCount: workflowRequestedLabels
        ? Object.keys(workflowRequestedLabels).length
        : 0,
    },
  }
}
