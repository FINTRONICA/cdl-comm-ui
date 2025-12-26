import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  workflowActionService,
  type WorkflowActionFilters,
  type CreateWorkflowActionRequest,
  type UpdateWorkflowActionRequest,
} from '@/services/api/workflowApi/workflowActionService'

export const WORKFLOW_ACTIONS_QUERY_KEY = 'workflowActions'

export function useWorkflowActions(
  page = 0,
  size = 20,
  filters?: WorkflowActionFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      WORKFLOW_ACTIONS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      workflowActionService.getWorkflowActions(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
    retry: 3,
  })

  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (
      newApiPagination.totalElements !== apiPagination.totalElements ||
      newApiPagination.totalPages !== apiPagination.totalPages
    ) {
      setApiPagination(newApiPagination)
    }
  }

  const updatePagination = useCallback((newPage: number, newSize: number) => {
    setPagination({ page: newPage, size: newSize })
  }, [])

  return {
    ...query,
    updatePagination,
    apiPagination,
  } as typeof query & {
    updatePagination: typeof updatePagination
    apiPagination: typeof apiPagination
  }
}

export function useWorkflowAction(id: string | null) {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, id],
    queryFn: () => workflowActionService.getWorkflowAction(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteWorkflowAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workflowActionService.deleteWorkflowAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveWorkflowAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      workflowActionId,
    }: {
      data: CreateWorkflowActionRequest | UpdateWorkflowActionRequest
      isEditing: boolean
      workflowActionId?: string
    }) => {
      if (isEditing && workflowActionId) {
        if (!('id' in data) || !data.id) {
          // Ensure id is present for updates
          const updateData = {
            ...data,
            id: typeof workflowActionId === 'string' ? parseInt(workflowActionId, 10) : workflowActionId,
          } as UpdateWorkflowActionRequest
          return workflowActionService.updateWorkflowAction(workflowActionId, updateData)
        }
        return workflowActionService.updateWorkflowAction(workflowActionId, data as UpdateWorkflowActionRequest)
      } else {
        return workflowActionService.createWorkflowAction(data as CreateWorkflowActionRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
    },
    onError: (error) => {
      throw error
    },
    retry: 0,
  })
}

export function useRefreshWorkflowActions() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_ACTIONS_QUERY_KEY] })
  }, [queryClient])
}

export function useAllWorkflowActions() {
  return useQuery({
    queryKey: [WORKFLOW_ACTIONS_QUERY_KEY, 'all'],
    queryFn: () => workflowActionService.getAllWorkflowActions(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}
