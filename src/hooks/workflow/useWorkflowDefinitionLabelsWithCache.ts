import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import WorkflowDefinitionLabelsService from '@/services/api/workflowApi/workflowDefinitionLabelsService'
import type { ProcessedWorkflowDefinitionLabels } from '@/services/api/workflowApi/workflowDefinitionLabelsService'

export function useWorkflowDefinitionLabelsWithCache() {
  const { workflowDefinitionLabels } = useLabels()
  const { workflowDefinitionLabelsLoading } = useLabelsLoadingState()
  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (workflowDefinitionLabels) {
        return WorkflowDefinitionLabelsService.getLabel(
          workflowDefinitionLabels as ProcessedWorkflowDefinitionLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [workflowDefinitionLabels]
  )
  const hasLabels = useCallback(() => {
    return WorkflowDefinitionLabelsService.hasLabels(
      (workflowDefinitionLabels || {}) as ProcessedWorkflowDefinitionLabels
    )
  }, [workflowDefinitionLabels])
  const getAvailableLanguages = useCallback(() => {
    return WorkflowDefinitionLabelsService.getAvailableLanguages(
      (workflowDefinitionLabels || {}) as ProcessedWorkflowDefinitionLabels
    )
  }, [workflowDefinitionLabels])
  return {
    data: workflowDefinitionLabels,
    isLoading: workflowDefinitionLabelsLoading,
    error: null,
    isError: false,
    isFetching: workflowDefinitionLabelsLoading,
    isSuccess: !!workflowDefinitionLabels,
    refetch: () => {
      return Promise.resolve({ data: workflowDefinitionLabels })
    },

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!workflowDefinitionLabels,
    cacheStatus: workflowDefinitionLabels
      ? 'cached'
      : workflowDefinitionLabelsLoading
        ? 'loading'
        : 'fresh',
  }
}
