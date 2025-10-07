import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  workflowRequestLogService,
  type CreateWorkflowRequestLog,
  type UpdateWorkflowRequestLog,
  type WorkflowRequestLogUIData,
  type WorkflowRequestLogContent,
  mapWorkflowRequestLogResponseToUIData,
} from '@/services/api/workflowApi/workflowRequestLogService'
import type { PaginatedResponse } from '@/types'

export const WORKFLOW_REQUEST_LOGS_QUERY_KEY = 'workflowRequestLogs'

export function useWorkflowRequestLogs(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, { page, size }],
    queryFn: async () => {
      try {
        const result = await workflowRequestLogService.getWorkflowRequestLogs(
          page,
          size
        )
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

export function useWorkflowRequestLog(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, id],
    queryFn: async () => {
      const result =
        await workflowRequestLogService.getWorkflowRequestLogById(id)
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useAllWorkflowRequestLogs(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, 'all', { page, size }],
    queryFn: async () => {
      try {
        const result =
          await workflowRequestLogService.getAllWorkflowRequestLogs(page, size)

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

export function useCreateWorkflowRequestLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowRequestLog) => {
      const result =
        await workflowRequestLogService.saveWorkflowRequestLog(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowRequestLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowRequestLog
    }) => {
      const result = await workflowRequestLogService.updateWorkflowRequestLog(
        id,
        updates
      )
      return result
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, id],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowRequestLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await workflowRequestLogService.deleteWorkflowRequestLog(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: false,
  })
}

export function useWorkflowRequestLogsUIData(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, 'ui-data', { page, size }],
    queryFn: async () => {
      const result =
        await workflowRequestLogService.getWorkflowRequestLogsUIData(page, size)
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useAllWorkflowRequestLogsUIData(page = 0, size = 20) {
  return useQuery({
    queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, 'all-ui-data', { page, size }],
    queryFn: async () => {
      const result =
        await workflowRequestLogService.getAllWorkflowRequestLogsUIData(
          page,
          size
        )
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  })
}

export function useWorkflowRequestLogsWithMutations() {
  const queryClient = useQueryClient()

  const workflowRequestLogs = useWorkflowRequestLogs()

  const createMutation = useCreateWorkflowRequestLog()
  const updateMutation = useUpdateWorkflowRequestLog()
  const deleteMutation = useDeleteWorkflowRequestLog()

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY],
    })
  }, [queryClient])

  const refreshById = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, id],
      })
    },
    [queryClient]
  )

  return {
    workflowRequestLogs,

    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,

    refresh,
    refreshById,

    isLoading:
      workflowRequestLogs.isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    isError:
      workflowRequestLogs.isError ||
      createMutation.isError ||
      updateMutation.isError ||
      deleteMutation.isError,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isFetching: workflowRequestLogs.isFetching,
  }
}

export function useOptimisticWorkflowRequestLogs() {
  const queryClient = useQueryClient()

  const optimisticUpdate = useCallback(
    (id: string, updates: Partial<WorkflowRequestLogUIData>) => {
      queryClient.setQueryData<WorkflowRequestLogUIData>(
        [WORKFLOW_REQUEST_LOGS_QUERY_KEY, id],
        (old) => {
          if (!old) return old
          return { ...old, ...updates }
        }
      )

      queryClient.setQueriesData<{ content: WorkflowRequestLogUIData[] }>(
        { queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY] },
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
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY, id],
      })
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_REQUEST_LOGS_QUERY_KEY],
      })
    },
    [queryClient]
  )

  return {
    optimisticUpdate,
    rollbackUpdate,
  }
}

export function useWorkflowRequestLogUtils() {
  const transformToUIData = useCallback(
    (apiResponse: PaginatedResponse<WorkflowRequestLogContent>) => {
      return workflowRequestLogService.transformToUIData(apiResponse)
    },
    []
  )

  const mapToUIData = useCallback((apiData: WorkflowRequestLogContent) => {
    return mapWorkflowRequestLogResponseToUIData(apiData)
  }, [])

  return {
    transformToUIData,
    mapToUIData,
  }
}

export function useWorkflowRequestLogService() {
  return {
    getWorkflowRequestLogs:
      workflowRequestLogService.getWorkflowRequestLogs.bind(
        workflowRequestLogService
      ),
    getAllWorkflowRequestLogs:
      workflowRequestLogService.getAllWorkflowRequestLogs.bind(
        workflowRequestLogService
      ),
    getWorkflowRequestLogById:
      workflowRequestLogService.getWorkflowRequestLogById.bind(
        workflowRequestLogService
      ),
    saveWorkflowRequestLog:
      workflowRequestLogService.saveWorkflowRequestLog.bind(
        workflowRequestLogService
      ),
    updateWorkflowRequestLog:
      workflowRequestLogService.updateWorkflowRequestLog.bind(
        workflowRequestLogService
      ),
    deleteWorkflowRequestLog:
      workflowRequestLogService.deleteWorkflowRequestLog.bind(
        workflowRequestLogService
      ),
    getWorkflowRequestLogsUIData:
      workflowRequestLogService.getWorkflowRequestLogsUIData.bind(
        workflowRequestLogService
      ),
    getAllWorkflowRequestLogsUIData:
      workflowRequestLogService.getAllWorkflowRequestLogsUIData.bind(
        workflowRequestLogService
      ),
    transformToUIData: workflowRequestLogService.transformToUIData.bind(
      workflowRequestLogService
    ),
  }
}

export function useCreatePendingLog() {
  console.log(
    'useCreatePendingLog is deprecated. Use useCreateWorkflowRequestLog instead.'
  )
  return useCreateWorkflowRequestLog()
}
