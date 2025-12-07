import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
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
      try {
        // toast.loading('Creating workflow action...', { id: 'create-action' })
        const result = await workflowActionService.createWorkflowAction(data)
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (newAction) => {
      try {
        // Update all workflow action queries (including those with parameters)
        queryClient.setQueriesData(
          { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
          (old: any) => {
            if (!old?.content) return old
            return {
              ...old,
              content: [newAction, ...old.content]
            }
          }
        )

        toast.success('Workflow action created successfully!', { id: 'create-action' })
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    onError: (error) => {
      try {

        toast.error(`${error}`, { id: 'create-action' })
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
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
      try {
        // toast.loading('Updating workflow action...', { id: 'update-action' })
        const result = await workflowActionService.updateWorkflowAction(
          id,
          updates
        )
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (updatedAction) => {
      try {
        // Update all workflow action queries (including those with parameters)
        queryClient.setQueriesData(
          { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
          (old: any) => {
            if (!old?.content) return old

            // Remove the old item and add updated one to top
            const filteredContent = old.content.filter(
              (item: any) => item.id !== updatedAction.id
            )
            return {
              ...old,
              content: [updatedAction, ...filteredContent]
            }
          }
        )

        toast.success('Workflow action updated successfully!')
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage = error?.response?.data?.message ||
          error?.message ||
          'Failed to update workflow action'
        toast.error(errorMessage, { id: 'update-action' })
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    retry: 2,
  })
}

export function useDeleteWorkflowAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // toast.loading('Deleting workflow action...', { id: 'delete-action' })
        const result = await workflowActionService.deleteWorkflowAction(id)
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
        toast.success('Workflow action deleted successfully!', { id: 'delete-action' })
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage = error?.response?.data?.message ||
          error?.message ||
          'Failed to delete workflow action'
        toast.error(errorMessage, { id: 'delete-action' })
      } catch (toastError) {
        toast.error(`${toastError} Failed to update local data`)
      }
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

// Advanced utility functions for list manipulation
export function useWorkflowActionListUtils() {
  const queryClient = useQueryClient()

  // Prepend item to top of list (most efficient)
  const prependToList = useCallback((newItem: any) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old
        return {
          ...old,
          content: [newItem, ...old.content]
        }
      }
    )
  }, [queryClient])

  // Append item to bottom of list
  const appendToList = useCallback((newItem: any) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old
        return {
          ...old,
          content: [...old.content, newItem]
        }
      }
    )
  }, [queryClient])

  // Move existing item to top (optimized)
  const moveToTop = useCallback((itemId: string | number, updatedItem: any) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old

        const filteredContent = old.content.filter(
          (item: any) => item.id !== itemId
        )
        return {
          ...old,
          content: [updatedItem, ...filteredContent]
        }
      }
    )
  }, [queryClient])

  // Move existing item to bottom
  const moveToBottom = useCallback((itemId: string | number, updatedItem: any) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old

        const filteredContent = old.content.filter(
          (item: any) => item.id !== itemId
        )
        return {
          ...old,
          content: [...filteredContent, updatedItem]
        }
      }
    )
  }, [queryClient])

  // Insert item at specific position
  const insertAtPosition = useCallback((newItem: any, position: number) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old

        const newContent = [...old.content]
        newContent.splice(position, 0, newItem)

        return {
          ...old,
          content: newContent
        }
      }
    )
  }, [queryClient])

  // Remove item by ID
  const removeById = useCallback((itemId: string | number) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old

        return {
          ...old,
          content: old.content.filter((item: any) => item.id !== itemId)
        }
      }
    )
  }, [queryClient])

  // Update item in place (without moving position)
  const updateInPlace = useCallback((itemId: string | number, updatedItem: any) => {
    queryClient.setQueriesData(
      { queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] },
      (old: any) => {
        if (!old?.content) return old

        return {
          ...old,
          content: old.content.map((item: any) =>
            item.id === itemId ? updatedItem : item
          )
        }
      }
    )
  }, [queryClient])

  return {
    prependToList,      // Add new item to top
    appendToList,       // Add new item to bottom
    moveToTop,          // Move existing item to top
    moveToBottom,       // Move existing item to bottom
    insertAtPosition,   // Insert at specific position
    removeById,         // Remove item by ID
    updateInPlace,      // Update without moving position
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
