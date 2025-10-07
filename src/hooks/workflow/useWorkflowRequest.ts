import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  workflowRequestService,
  type WorkflowRequestFilters,
  type CreateWorkflowRequest,
  type UpdateWorkflowRequestRequest,
  type WorkflowRequestUIData,
  type WorkflowRequest,
  mapWorkflowRequestToUIData
} from '@/services/api/workflowApi/workflowRequestService'
import type { PaginatedResponse } from '@/types'
import WorkflowRequestLabelsService from '@/services/api/workflowApi/workflowRequestLabelsService'


export const WORKFLOW_REQUESTS_QUERY_KEY = 'workflowRequests'

export function useWorkflowRequests(page = 0, size = 20, filters?: WorkflowRequestFilters) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {


      try {
        const result = await workflowRequestService.getWorkflowRequests(page, size, filters)

        return result
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowRequest(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, id],
    queryFn: async () => {
      const result = await workflowRequestService.getWorkflowRequestById(id)
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useAllWorkflowRequests(page = 0, size = 20, filters?: WorkflowRequestFilters) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'all', { page, size, filters }],
    queryFn: async () => {


      try {
        const result = await workflowRequestService.getAllWorkflowRequests(page, size, filters)

        return result
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowRequestLabels() {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'labels'],
    queryFn: async () => {
      const result = await WorkflowRequestLabelsService.fetchLabels()
      return result
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    enabled: true,
  })
}

export function useWorkflowRequestLabelsWithUtils() {
  const query = useWorkflowRequestLabels()

  const processedLabels = query.data ? WorkflowRequestLabelsService.processLabels(query.data) : {}

  return {
    ...query,
    hasLabels: () => WorkflowRequestLabelsService.hasLabels(processedLabels),
    getLabel: (configId: string, language: string, fallback: string) =>
      WorkflowRequestLabelsService.getLabel(processedLabels, configId, language, fallback),
    getAvailableLanguages: () =>
      WorkflowRequestLabelsService.getAvailableLanguages(processedLabels),
  }
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
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useCreateDeveloperWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      referenceId,
      payloadData,
      referenceType = 'BUILD_PARTNER',
      moduleName = 'BUILD_PARTNER',
      actionKey = 'CREATE'
    }: {
      referenceId: string
      payloadData: Record<string, unknown>
      referenceType?: string
      moduleName?: string
      actionKey?: string
    }) => {
      const result = await workflowRequestService.createDeveloperWorkflowRequest(
        referenceId,
        payloadData,
        referenceType,
        moduleName,
        actionKey
      )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateWorkflowRequestRequest }) => {
      const result = await workflowRequestService.updateWorkflowRequest(id, updates)
      return result
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, id] })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await workflowRequestService.deleteWorkflowRequest(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_REQUESTS_QUERY_KEY] })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: false,
  })
}

export function useWorkflowRequestsUIData(page = 0, size = 20, filters?: WorkflowRequestFilters) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'ui-data', { page, size, filters }],
    queryFn: async () => {
      const result = await workflowRequestService.getWorkflowRequestsUIData(page, size, filters)
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useAllWorkflowRequestsUIData(page = 0, size = 20, filters?: WorkflowRequestFilters) {
  return useQuery({
    queryKey: [WORKFLOW_REQUESTS_QUERY_KEY, 'all-ui-data', { page, size, filters }],
    queryFn: async () => {
      const result = await workflowRequestService.getAllWorkflowRequestsUIData(page, size, filters)
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
    return mapWorkflowRequestToUIData(apiData)
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
    createWorkflowRequest: workflowRequestService.createWorkflowRequest.bind(workflowRequestService),
    createDeveloperWorkflowRequest: workflowRequestService.createDeveloperWorkflowRequest.bind(workflowRequestService),
    updateWorkflowRequest: workflowRequestService.updateWorkflowRequest.bind(workflowRequestService),
    deleteWorkflowRequest: workflowRequestService.deleteWorkflowRequest.bind(workflowRequestService),
    getWorkflowRequestsUIData: workflowRequestService.getWorkflowRequestsUIData.bind(workflowRequestService),
    getAllWorkflowRequestsUIData: workflowRequestService.getAllWorkflowRequestsUIData.bind(workflowRequestService),
    transformToUIData: workflowRequestService.transformToUIData.bind(workflowRequestService),
  }
}


export function useCreatePendingTransaction() {
  console.log('useCreatePendingTransaction is deprecated. Use useCreateWorkflowRequest instead.')
  return useCreateWorkflowRequest()
}
