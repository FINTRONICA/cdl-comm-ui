import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  workflowActionService,
  type WorkflowActionFilters,
  type CreateWorkflowActionRequest,
  type UpdateWorkflowActionRequest,
  type WorkflowActionUIData,
  type WorkflowAction,
  mapWorkflowActionToUIData,
} from '@/services/api/workflowApi/workflowActionService'
import type { PaginatedResponse } from '@/types'
import WorkflowActionLabelsService from '@/services/api/workflowApi/workflowActionLabelsService'

export const WORKFLOW_ACTIONS_QUERY_KEY = 'workflowActions'

export function useWorkflowActions(
  page = 0,
  size = 20,
  filters?: WorkflowActionFilters
) {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {
      const result = await workflowActionService.getWorkflowActions(
        page,
        size,
        filters
      )
      return result
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowAction(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, id],
    queryFn: async () => {
      const result = await workflowActionService.getWorkflowAction(id)
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useSearchWorkflowActions(query: string, page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, 'search', { query, page, size }],
    queryFn: async () => {
      const result = await workflowActionService.searchWorkflowActions(
        query,
        page,
        size
      )
      return result
    },
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}



export function useWorkflowActionLabels() {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, 'labels'],
    queryFn: async () => {
      const result = await workflowActionService.getWorkflowActionLabels()
      return result
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    enabled: true,
  })
}

export function useWorkflowActionLabelsWithUtils() {
  const query = useWorkflowActionLabels()

  const processedLabels = query.data
    ? WorkflowActionLabelsService.processLabels(query.data)
    : {}

  return {
    ...query,
    hasLabels: () => WorkflowActionLabelsService.hasLabels(processedLabels),
    getLabel: (configId: string, language: string, fallback: string) =>
      WorkflowActionLabelsService.getLabel(
        processedLabels,
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      WorkflowActionLabelsService.getAvailableLanguages(processedLabels),
  }
}

export function useCreateWorkflowAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowActionRequest) => {
      const result = await workflowActionService.createWorkflowAction(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowActionRequest
    }) => {
      const result = await workflowActionService.updateWorkflowAction(
        id,
        updates
      )
      return result
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, id],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await workflowActionService.deleteWorkflowAction(id)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: false,
  })
}

export function useWorkflowActionsUIData(
  page = 0,
  size = 20,
  filters?: WorkflowActionFilters
) {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, 'ui-data', { page, size, filters }],
    queryFn: async () => {
      const result = await workflowActionService.getWorkflowActionsUIData(
        page,
        size,
        filters
      )
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowActionsWithMutations() {
  const queryClient = useQueryClient()

  const workflowActions = useWorkflowActions()
  const labels = useWorkflowActionLabelsWithUtils()

  const createMutation = useCreateWorkflowAction()
  const updateMutation = useUpdateWorkflowAction()
  const deleteMutation = useDeleteWorkflowAction()

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
  }, [queryClient])

  const refreshById = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, id],
      })
    },
    [queryClient]
  )

  const refreshSearch = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, 'search'],
    })
  }, [queryClient])

  const refreshLabels = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, 'labels'],
    })
  }, [queryClient])

  return {
    workflowActions,
    labels,

    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,

    refresh,
    refreshById,
    refreshSearch,
    refreshLabels,

    isLoading:
      workflowActions.isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    isError:
      workflowActions.isError ||
      createMutation.isError ||
      updateMutation.isError ||
      deleteMutation.isError,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isFetching: workflowActions.isFetching,
  }
}

export function useOptimisticWorkflowActions() {
  const queryClient = useQueryClient()

  const optimisticUpdate = useCallback(
    (id: string, updates: Partial<WorkflowActionUIData>) => {
      queryClient.setQueryData<WorkflowActionUIData>(
        [WORKFLOW_ACTIONS_QUERY_KEY, id],
        (old) => {
          if (!old) return old
          return { ...old, ...updates }
        }
      )

      queryClient.setQueriesData<{ content: WorkflowActionUIData[] }>(
        { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
        (old) => {
          if (!old?.content) return old
          return {
            ...old,
            content: old.content.map((item) =>
              item.id.toString() === id ? { ...item, ...updates } : item
            ),
          }
        }
      )
    },
    [queryClient]
  )

  const rollbackUpdate = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, id],
      })
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
    },
    [queryClient]
  )

  return {
    optimisticUpdate,
    rollbackUpdate,
  }
}

export function useWorkflowActionUtils() {
  const transformToUIData = useCallback(
    (apiResponse: PaginatedResponse<WorkflowAction>) => {
      return workflowActionService.transformToUIData(apiResponse)
    },
    []
  )

  const mapToUIData = useCallback((apiData: WorkflowAction) => {
    return mapWorkflowActionToUIData(apiData)
  }, [])

  return {
    transformToUIData,
    mapToUIData,
  }
}

export function useWorkflowActionService() {
  return {
    // All service methods
    getWorkflowActions: workflowActionService.getWorkflowActions.bind(
      workflowActionService
    ),
    searchWorkflowActions: workflowActionService.searchWorkflowActions.bind(
      workflowActionService
    ),
    getWorkflowAction: workflowActionService.getWorkflowAction.bind(
      workflowActionService
    ),
    createWorkflowAction: workflowActionService.createWorkflowAction.bind(
      workflowActionService
    ),
    updateWorkflowAction: workflowActionService.updateWorkflowAction.bind(
      workflowActionService
    ),
    deleteWorkflowAction: workflowActionService.deleteWorkflowAction.bind(
      workflowActionService
    ),
    getWorkflowActionsUIData:
      workflowActionService.getWorkflowActionsUIData.bind(
        workflowActionService
      ),
    transformToUIData: workflowActionService.transformToUIData.bind(
      workflowActionService
    ),
  }
}
