import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  workflowAmountRuleService,
  type WorkflowAmountRuleDTO,
  type WorkflowAmountRuleFilters,
  type CreateWorkflowAmountRuleRequest,
  type UpdateWorkflowAmountRuleRequest,
} from '@/services/api/workflowApi/workflowAmountRuleService'
import type { PaginatedResponse } from '@/types'

const WORKFLOW_AMOUNT_RULES_QUERY_KEY = 'workflowAmountRules'

export function useWorkflowAmountRules(
  page = 0,
  size = 20,
  filters?: WorkflowAmountRuleFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'list', page, size, filtersKey],
    queryFn: async () => {
      const result = await workflowAmountRuleService.getWorkflowAmountRules(
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

export function useWorkflowAmountRulesUIData(
  page = 0,
  size = 20,
  filters?: WorkflowAmountRuleFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [
      WORKFLOW_AMOUNT_RULES_QUERY_KEY,
      'uiData',
      page,
      size,
      filtersKey,
    ],
    queryFn: async () => {
      const result =
        await workflowAmountRuleService.getWorkflowAmountRulesUIData(
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

export function useWorkflowAmountRule(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'detail', id],
    queryFn: async () => {
      const result = await workflowAmountRuleService.getWorkflowAmountRule(id)
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateWorkflowAmountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowAmountRuleRequest) => {
      const result =
        await workflowAmountRuleService.createWorkflowAmountRule(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowAmountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowAmountRuleRequest
    }) => {
      const result = await workflowAmountRuleService.updateWorkflowAmountRule(
        id,
        updates
      )
      return result
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'detail', variables.id],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowAmountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result =
        await workflowAmountRuleService.deleteWorkflowAmountRule(id)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.log(error)
    },
    retry: false,
  })
}

export function useWorkflowAmountRuleForm() {
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
    (apiResponse: PaginatedResponse<WorkflowAmountRuleDTO>) => {
      return workflowAmountRuleService.transformToUIData(apiResponse)
    },
    []
  )
}

export function useWorkflowAmountRuleCache() {
  const queryClient = useQueryClient()

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
    })
  }, [queryClient])

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'list'],
    })
  }, [queryClient])

  const invalidateDetail = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'detail', id],
      })
    },
    [queryClient]
  )

  const clearCache = useCallback(() => {
    queryClient.removeQueries({
      queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
    })
  }, [queryClient])

  const prefetchRule = useCallback(
    async (id: string) => {
      await queryClient.prefetchQuery({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'detail', id],
        queryFn: () => workflowAmountRuleService.getWorkflowAmountRule(id),
        staleTime: 5 * 60 * 1000,
      })
    },
    [queryClient]
  )

  const prefetchList = useCallback(
    async (page = 0, size = 20, filters?: WorkflowAmountRuleFilters) => {
      await queryClient.prefetchQuery({
        queryKey: [
          WORKFLOW_AMOUNT_RULES_QUERY_KEY,
          'list',
          page,
          size,
          JSON.stringify(filters ?? {}),
        ],
        queryFn: () =>
          workflowAmountRuleService.getWorkflowAmountRules(page, size, filters),
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
    prefetchRule,
    prefetchList,
  }
}

export function useBulkWorkflowAmountRuleOperations() {
  const queryClient = useQueryClient()

  const bulkCreate = useMutation({
    mutationFn: async (dataArray: CreateWorkflowAmountRuleRequest[]) => {
      const results = await Promise.all(
        dataArray.map((data) =>
          workflowAmountRuleService.createWorkflowAmountRule(data)
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
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
        updates: UpdateWorkflowAmountRuleRequest
      }>
    ) => {
      const results = await Promise.all(
        updatesArray.map(({ id, updates }) =>
          workflowAmountRuleService.updateWorkflowAmountRule(id, updates)
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
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
          workflowAmountRuleService.deleteWorkflowAmountRule(id)
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
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
