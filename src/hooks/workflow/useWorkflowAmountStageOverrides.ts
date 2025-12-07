import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
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
      try {
        const result =
          await workflowAmountStageOverrideService.createWorkflowAmountStageOverride(
            data
          )
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (newStageOverride) => {
      try {
        // Update all workflow amount stage override queries
        queryClient.setQueriesData(
          { queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY] },
          (old: any) => {
            if (!old?.content) return old
            return {
              ...old,
              content: [newStageOverride, ...old.content],
            }
          }
        )
        toast.success('Workflow amount stage override created successfully!')
      } catch (error) {
        toast.error(`${error}Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create workflow amount stage override'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError}Failed to show error message`)
      }
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
      try {
        const result =
          await workflowAmountStageOverrideService.updateWorkflowAmountStageOverride(
            id,
            updates
          )
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (updatedStageOverride) => {
      try {
        // Update all workflow amount stage override queries
        queryClient.setQueriesData(
          { queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY] },
          (old: any) => {
            if (!old?.content) return old

            // Remove the old item and add updated one to top
            const filteredContent = old.content.filter(
              (item: any) => item.id !== updatedStageOverride.id
            )
            return {
              ...old,
              content: [updatedStageOverride, ...filteredContent],
            }
          }
        )
        toast.success('Workflow amount stage override updated successfully!')
      } catch (error) {
        toast.error(`${error}Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update workflow amount stage override'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError}Failed to show error message`)
      }
    },
    retry: 2,
  })
}

export function useDeleteWorkflowAmountStageOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const result =
          await workflowAmountStageOverrideService.deleteWorkflowAmountStageOverride(
            id
          )
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
        })
        toast.success('Workflow amount stage override deleted successfully!')
      } catch (error) {
        toast.error(`${error}Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete workflow amount stage override'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError}Failed to show error message`)
      }
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
      try {
        const results = await Promise.all(
          dataArray.map((data) =>
            workflowAmountStageOverrideService.createWorkflowAmountStageOverride(
              data
            )
          )
        )
        return results
      } catch (error) {
        throw error
      }
    },
    onSuccess: (newStageOverrides) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
        })
        toast.success(
          `${newStageOverrides.length} workflow amount stage override(s) created successfully!`
        )
      } catch (error) {
        toast.error(`${error}Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create workflow amount stage overrides'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError}Failed to show error message`)
      }
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
      try {
        const results = await Promise.all(
          updatesArray.map(({ id, updates }) =>
            workflowAmountStageOverrideService.updateWorkflowAmountStageOverride(
              id,
              updates
            )
          )
        )
        return results
      } catch (error) {
        throw error
      }
    },
    onSuccess: (updatedStageOverrides) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
        })
        toast.success(
          `${updatedStageOverrides.length} workflow amount stage override(s) updated successfully!`
        )
      } catch (error) {
        toast.error(`${error}Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update workflow amount stage overrides'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError}Failed to show error message`)
      }
    },
    retry: 1,
  })

  const bulkDelete = useMutation({
    mutationFn: async (idsArray: string[]) => {
      try {
        await Promise.all(
          idsArray.map((id) =>
            workflowAmountStageOverrideService.deleteWorkflowAmountStageOverride(
              id
            )
          )
        )
      } catch (error) {
        throw error
      }
    },
    onSuccess: (_, deletedIds) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_STAGE_OVERRIDES_QUERY_KEY],
        })
        toast.success(
          `${deletedIds.length} workflow amount stage override(s) deleted successfully!`
        )
      } catch (error) {
        toast.error(`${error}Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete workflow amount stage overrides'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError}Failed to show error message`)
      }
    },
    retry: 1,
  })

  return {
    bulkCreate,
    bulkUpdate,
    bulkDelete,
  }
}
