
import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  workflowAmountStageOverrideService,
  type WorkflowAmountStageOverride,
  type WorkflowAmountStageOverrideFilters,
  type CreateWorkflowAmountStageOverrideRequest,
  type UpdateWorkflowAmountStageOverrideRequest,
} from '@/services/api/workflowApi/workflowAmountStageOverrideService'
import type { PaginatedResponse } from '@/types'

const WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY = 'workflowAmountStageOverrides'

export function useWorkflowAmountStageOverrides(
  page = 0,
  size = 20,
  filters?: WorkflowAmountStageOverrideFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [
      WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY,
      'list',
      page,
      size,
      filtersKey,
    ],
    queryFn: async () => {
      const result =
        await workflowAmountStageOverrideService.getWorkflowAmountStageOverrides(
          page,
          size,
          filters
        )
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useWorkflowAmountStageOverridesUIData(
  page = 0,
  size = 20,
  filters?: WorkflowAmountStageOverrideFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [
      WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY,
      'uiData',
      page,
      size,
      filtersKey,
    ],
    queryFn: async () => {
      const result =
        await workflowAmountStageOverrideService.getWorkflowAmountStageOverridesUIData(
          page,
          size,
          filters
        )
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useWorkflowAmountStageOverride(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY, 'detail', id],
    queryFn: async () => {
      const result =
        await workflowAmountStageOverrideService.getWorkflowAmountStageOverride(
          id
        )
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateWorkflowAmountStageOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowAmountStageOverrideRequest) => {
      const result =
        await workflowAmountStageOverrideService.createWorkflowAmountStageOverride(
          data
        )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowAmountStageOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowAmountStageOverrideRequest
    }) => {
      const result =
        await workflowAmountStageOverrideService.updateWorkflowAmountStageOverride(
          id,
          updates
        )
      return result
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [
          WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY,
          'detail',
          variables.id,
        ],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowAmountStageOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result =
        await workflowAmountStageOverrideService.deleteWorkflowAmountStageOverride(
          id
        )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: false,
  })
}

export function useWorkflowAmountStageOverrideForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  return {
    isSubmitting,
    setSubmitting,
  }
}

export function useTransformToUIData() {
  return useCallback(
    (apiResponse: PaginatedResponse<WorkflowAmountStageOverride>) => {
      return workflowAmountStageOverrideService.transformToUIData(apiResponse)
    },
    []
  )
}

export function useWorkflowAmountStageOverrideCache() {
  const queryClient = useQueryClient()

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
    })
  }, [queryClient])

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY, 'list'],
    })
  }, [queryClient])

  const invalidateDetail = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY, 'detail', id],
      })
    },
    [queryClient]
  )

  const clearCache = useCallback(() => {
    queryClient.removeQueries({
      queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
    })
  }, [queryClient])

  const prefetchStageOverride = useCallback(
    async (id: string) => {
      await queryClient.prefetchQuery({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY, 'detail', id],
        queryFn: () =>
          workflowAmountStageOverrideService.getWorkflowAmountStageOverride(id),
        staleTime: 5 * 60 * 1000,
      })
    },
    [queryClient]
  )

  const prefetchList = useCallback(
    async (
      page = 0,
      size = 20,
      filters?: WorkflowAmountStageOverrideFilters
    ) => {
      await queryClient.prefetchQuery({
        queryKey: [
          WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY,
          'list',
          page,
          size,
          JSON.stringify(filters ?? {}),
        ],
        queryFn: () =>
          workflowAmountStageOverrideService.getWorkflowAmountStageOverrides(
            page,
            size,
            filters
          ),
        staleTime: 5 * 60 * 1000,
      })
    },
    [queryClient]
  )

  return {
    invalidateAll,
    invalidateList,
    invalidateDetail,
    clearCache,
    prefetchStageOverride,
    prefetchList,
  }
}

export function useBulkWorkflowAmountStageOverrideOperations() {
  const queryClient = useQueryClient()

  const bulkCreate = useMutation({
    mutationFn: async (
      dataArray: CreateWorkflowAmountStageOverrideRequest[]
    ) => {
      const results = await Promise.all(
        dataArray.map((data) =>
          workflowAmountStageOverrideService.createWorkflowAmountStageOverride(
            data
          )
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 1,
  })

  const bulkUpdate = useMutation({
    mutationFn: async (
      updatesArray: Array<{
        id: string
        updates: UpdateWorkflowAmountStageOverrideRequest
      }>
    ) => {
      const results = await Promise.all(
        updatesArray.map(({ id, updates }) =>
          workflowAmountStageOverrideService.updateWorkflowAmountStageOverride(
            id,
            updates
          )
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 1,
  })

  const bulkDelete = useMutation({
    mutationFn: async (idsArray: string[]) => {
      await Promise.all(
        idsArray.map((id) =>
          workflowAmountStageOverrideService.deleteWorkflowAmountStageOverride(
            id
          )
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 1,
  })

  return {
    bulkCreate,
    bulkUpdate,
    bulkDelete,
  }
}
