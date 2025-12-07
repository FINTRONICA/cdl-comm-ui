import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  workflowRequestService,
  type WorkflowRequestFilters,
  type WorkflowRequestUIData,
  type WorkflowRequest,
  type WorkflowBulkDecisionRequest,
  type CreateWorkflowRequest,
} from '@/services/api/workflowApi/workflowRequestService'
import type { PaginatedResponse } from '@/types'

export const WORKFLOW_REQUESTS_QUERY_KEY = 'workflowRequests'

export function useAwaitingActionsUIData(page = 0, size = 20, filters?: WorkflowRequestFilters) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'awaiting-actions-ui-data', page, size, filters?.moduleName, filters?.referenceType, filters?.actionKey],
    queryFn: async () => {
      const result = await workflowRequestService.getAwaitingActionsUIData(page, size, filters)
      return result
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

export function useEngagementsActionsUIData(page = 0, size = 20, filters?: WorkflowRequestFilters) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'engagements-actions-ui-data', page, size, filters?.moduleName, filters?.referenceType, filters?.actionKey],
    queryFn: async () => {
      const result = await workflowRequestService.getEngagementsActionsUIData(page, size, filters)
      return result
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
export function useWorkflowRequestsUIData(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'ui-data', { page, size }],
    queryFn: async () => {
      const result = await workflowRequestService.getWorkflowRequestsUIData(page, size)
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useAllWorkflowRequestsUIData(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'all-ui-data', { page, size }],
    queryFn: async () => {
      const result = await workflowRequestService.getAllWorkflowRequestsUIData(page, size)
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowRequestsWithMutations() {
  const queryClient = useQueryClient()

  const workflowRequests = useWorkflowRequests()
  const labels = useWorkflowRequestLabelsWithUtils()

  const createMutation = useCreateWorkflowRequest()
  const createDeveloperMutation = useCreateDeveloperWorkflowRequest()
  const updateMutation = useUpdateWorkflowRequest()
  const deleteMutation = useDeleteWorkflowRequest()

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
  }, [queryClient])

  const refreshById = useCallback((id: string) => {
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, id] })
  }, [queryClient])

  const refreshLabels = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'labels'] })
  }, [queryClient])

  return {
    workflowRequests,
    labels,

    create: createMutation,
    createDeveloper: createDeveloperMutation,
    update: updateMutation,
    delete: deleteMutation,

    refresh,
    refreshById,
    refreshLabels,

    isLoading: workflowRequests.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isError: workflowRequests.isError || createMutation.isError || updateMutation.isError || deleteMutation.isError,

    isCreating: createMutation.isPending,
    isCreatingDeveloper: createDeveloperMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isFetching: workflowRequests.isFetching,
  }
}

export function useOptimisticWorkflowRequests() {
  const queryClient = useQueryClient()

  const optimisticUpdate = useCallback((id: string, updates: Partial<WorkflowRequestUIData>) => {
    queryClient.setQueryData<WorkflowRequestUIData>([WORKFLOW_REQUESTS_QUERY_KEY, id], (old) => {
      if (!old) return old
      return { ...old, ...updates }
    })

    queryClient.setQueriesData<{ content: WorkflowRequestUIData[] }>(
      { queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] },
      (old) => {
        if (!old?.content) return old
        return {
          ...old,
          content: old.content.map(item =>
            item.id.toString() === id ? { ...item, ...updates } : item
          )
        }
      }
    )
  }, [queryClient])

  const rollbackUpdate = useCallback((id: string) => {
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, id] })
    queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
  }, [queryClient])

  return {
    optimisticUpdate,
    rollbackUpdate,
  }
}

export function useWorkflowRequestUtils() {
  const transformToUIData = useCallback((apiResponse: PaginatedResponse<WorkflowRequest>) => {
    return workflowRequestService.transformToUIData(apiResponse)
  }, [])

  const mapToUIData = useCallback((apiData: WorkflowRequest) => {
    return workflowRequestService.transformToUIData({ content: [apiData], page: { size: 1, number: 0, totalElements: 1, totalPages: 1 } }).content[0]
  }, [])

  return {
    transformToUIData,
    mapToUIData,
  }
}

export function useWorkflowRequestService() {
  return {

    getWorkflowRequests: workflowRequestService.getWorkflowRequests.bind(workflowRequestService),
    getAllWorkflowRequests: workflowRequestService.getAllWorkflowRequests.bind(workflowRequestService),
    getWorkflowRequestById: workflowRequestService.getWorkflowRequestById.bind(workflowRequestService),
    getAllWorkflowRequestsUIData: workflowRequestService.getAllWorkflowRequestsUIData.bind(workflowRequestService),
    transformToUIData: workflowRequestService.transformToUIData.bind(workflowRequestService),
  }
}


export function useCreatePendingTransaction() {
  return useCreateWorkflowRequest()
}

// New hooks for workflow queue functionality
export function useQueueRequestDetail(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'queue-detail', id],
    queryFn: async () => {
      const result = await workflowRequestService.getQueueRequestDetailById(id)
      return result
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

export function useQueueRequestStatus(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'queue-status', id],
    queryFn: async () => {
      const result = await workflowRequestService.getQueueRequestStatusById(id)
      return result
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

export function useQueueRequestLogs(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'queue-logs', id],
    queryFn: async () => {
      const result = await workflowRequestService.getQueueRequestLogsByWorkflowId(id)
      return result
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

export function useQueueSummary() {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'queue-summary'],
    queryFn: async () => {
      const result = await workflowRequestService.getQueueSummary()
      return result
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

export function useQueueBulkDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (decisions: WorkflowBulkDecisionRequest[]) => {
      const result = await workflowRequestService.submitQueueBulkDecision(decisions)
      return result
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful submission
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'awaiting-actions-ui-data'] })
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'engagements-actions-ui-data'] })
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'queue-summary'] })
    },
  })
}

// Missing hooks that are referenced in the existing code
export function useWorkflowRequests(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'requests', { page, size }],
    queryFn: async () => {
      const result = await workflowRequestService.getWorkflowRequests(page, size)
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useAllWorkflowRequests(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'all-requests', { page, size }],
    queryFn: async () => {
      const result = await workflowRequestService.getAllWorkflowRequests(page, size)
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowRequest(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'request', id],
    queryFn: async () => {
      const result = await workflowRequestService.getWorkflowRequestById(id)
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useCreateWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowRequest) => {
      const result = await workflowRequestService.createWorkflowRequest(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
    },
  })
}

export function useCreateDeveloperWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      referenceId: string
      payloadData: Record<string, unknown>
      referenceType?: string
      moduleName?: string
      actionKey?: string
    }) => {
      const result = await workflowRequestService.createDeveloperWorkflowRequest(
        params.referenceId,
        params.payloadData,
        params.referenceType,
        params.moduleName,
        params.actionKey
      )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
    },
  })
}

export function useUpdateWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // This should be implemented based on your API structure
      throw new Error('Update workflow request not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
    },
  })
}

export function useDeleteWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // This should be implemented based on your API structure
      throw new Error('Delete workflow request not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
    },
  })
}

export function useWorkflowRequestLabelsWithUtils() {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'labels'],
    queryFn: async () => {
      // This should be implemented based on your WorkflowRequestLabelsService structure
      return []
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export function useWorkflowRequestLabels() {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'labels'],
    queryFn: async () => {
      // This should be implemented based on your WorkflowRequestLabelsService structure
      return []
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
