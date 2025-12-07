import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import {
  WorkflowActionLabelsService,
  type ProcessedWorkflowActionLabels,
} from '@/services/api/workflowApi/workflowActionLabelsService'

export function useWorkflowActionLabelsWithCache() {
  const { workflowActionLabels } = useLabels()
  const { workflowActionLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (workflowActionLabels) {
        const processedLabels =
          workflowActionLabels as ProcessedWorkflowActionLabels
        return WorkflowActionLabelsService.getLabel(
          processedLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [workflowActionLabels]
  )

  const hasLabels = useCallback(() => {
    if (workflowActionLabels) {
      const processedLabels =
        workflowActionLabels as ProcessedWorkflowActionLabels
      return WorkflowActionLabelsService.hasLabels(processedLabels)
    }
    return false
  }, [workflowActionLabels])

  const getAvailableLanguages = useCallback(() => {
    if (workflowActionLabels) {
      const processedLabels =
        workflowActionLabels as ProcessedWorkflowActionLabels
      return WorkflowActionLabelsService.getAvailableLanguages(processedLabels)
    }
    return []
  }, [workflowActionLabels])

  return {
    data: workflowActionLabels,
    isLoading: workflowActionLabelsLoading,
    error: null,
    isError: false,
    isFetching: workflowActionLabelsLoading,
    isSuccess: !!workflowActionLabels,
    refetch: useCallback(() => {
      return Promise.resolve({ data: workflowActionLabels })
    }, [workflowActionLabels]),

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!workflowActionLabels,
    cacheStatus: workflowActionLabels
      ? 'cached'
      : workflowActionLabelsLoading
        ? 'Loading...'
        : 'fresh',

    getLabelsForConfig: useCallback(
      (configId: string) => {
        if (workflowActionLabels) {
          const processedLabels =
            workflowActionLabels as ProcessedWorkflowActionLabels
          return processedLabels[configId] || {}
        }
        return {}
      },
      [workflowActionLabels]
    ),

    debug: {
      hasLabels: !!workflowActionLabels,
      isLoading: workflowActionLabelsLoading,
      labelCount: workflowActionLabels
        ? Object.keys(workflowActionLabels).length
        : 0,
    },
  }
}
