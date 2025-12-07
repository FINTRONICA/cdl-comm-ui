import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  workflowAmountRuleService,
  type WorkflowAmountRuleDTO,
  type WorkflowAmountRuleFilters,
  type CreateWorkflowAmountRuleRequest,
  type UpdateWorkflowAmountRuleRequest,
} from '@/services/api/workflowApi/workflowAmountRuleService'
import type { PaginatedResponse } from '@/types'

const WORKFLOW_AMOUNT_RULES_QUERY_KEY = 'workflowAmountRules'

const convertToUIData = (apiData: WorkflowAmountRuleDTO) => {
  return {
    id: apiData.id,
    currency: apiData.currency,
    minAmount: apiData.minAmount ?? 0,
    maxAmount: apiData.maxAmount ?? 0,
    priority: apiData.priority ?? 0,
    requiredMakers: apiData.requiredMakers ?? 0,
    requiredCheckers: apiData.requiredCheckers ?? 0,
    workflowDefinitionDTO: {
      id: apiData.workflowDefinitionDTO?.id || 0,
      name: apiData.workflowDefinitionDTO?.name || '',
    },
    workflowId: (apiData as any)?.workflowId || 0,
    amountRuleName: (apiData as any)?.amountRuleName || '',
    workflowAmountStageOverrideDTOS: (apiData as any)?.workflowAmountStageOverrideDTOS || [],
    active: (apiData as any)?.enabled ?? false,
    status: (apiData as any)?.enabled ? 'Active' : 'Inactive',
  }
}

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
      try {
        // toast.loading('Creating workflow amount rule')
        const result = await workflowAmountRuleService.createWorkflowAmountRule(data)
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (newData) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
        })
        
        const queries = queryClient.getQueriesData({
          queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'list'],
          exact: false
        })
        
        queries.forEach(([queryKey, oldData]) => {
          if (!oldData || !(oldData as any).content) return
          
          const uiData = convertToUIData(newData)
          
          const updatedData = {
            ...oldData,
            content: [uiData, ...(oldData as any).content],
            totalElements: (oldData as any).totalElements + 1,
          }
          
          queryClient.setQueryData(queryKey, updatedData)
        })

        toast.success('Workflow amount rule created successfully!' )
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    onError: (error: Error) => {
      try {
        const errorMessage = 
          (error as any)?.response?.data?.message ||
          (error as any)?.response?.data?.details ||
          (error as any)?.response?.data?.error ||
          error?.message ||
          'Failed to create workflow amount rule'
        toast.error(errorMessage, { id: 'create-amount-rule' })
      } catch (toastError) {
        toast.error(`${toastError} Failed to show error message`)
      }
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
      try {
        // toast.loading('Updating workflow amount rule')
        const result = await workflowAmountRuleService.updateWorkflowAmountRule(
          id,
          updates
        )
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (updatedData, variables) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
        })
        
        const queries = queryClient.getQueriesData({
          queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'list'],
          exact: false
        })
        
        queries.forEach(([queryKey, oldData]) => {
          if (!oldData || !(oldData as any).content) return
          
          const uiData = convertToUIData(updatedData)
          
          const filteredContent = (oldData as any).content.filter((item: any) => item.id.toString() !== variables.id)
          
          const updatedListData = {
            ...oldData,
            content: [uiData, ...filteredContent],
          }
          
          queryClient.setQueryData(queryKey, updatedListData)
        })

        toast.success('Workflow amount rule updated successfully')
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.details ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to update workflow amount rule'
        toast.error(errorMessage, { id: 'update-amount-rule' })
      } catch (toastError) {
        toast.error(`${toastError} Failed to show error message`)
      }
    },
    retry: 2,
  })
}

export function useDeleteWorkflowAmountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // toast.loading('Deleting workflow amount rule')
        const result = await workflowAmountRuleService.deleteWorkflowAmountRule(id)
        return result
      } catch (error) {
        throw error
      }
    },
    onSuccess: (_, deletedId) => {
      try {
        queryClient.invalidateQueries({
          queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY],
        })
        
        const queries = queryClient.getQueriesData({
          queryKey: [WORKFLOW_AMOUNT_RULES_QUERY_KEY, 'list'],
          exact: false
        })
        
        queries.forEach(([queryKey, oldData]) => {
          if (!oldData || !(oldData as any).content) return
          
          const updatedData = {
            ...oldData,
            content: (oldData as any).content.filter((item: any) => item.id.toString() !== deletedId),
            totalElements: Math.max(0, (oldData as any).totalElements - 1),
          }
          
          queryClient.setQueryData(queryKey, updatedData)
        })

        toast.success('Workflow amount rule deleted successfully!', { id: 'delete-amount-rule' })
      } catch (error) {
        toast.error(`${error} Failed to update local data`)
      }
    },
    onError: (error: any) => {
      try {
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.details ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to delete workflow amount rule'
        toast.error(errorMessage)
      } catch (toastError) {
        toast.error(`${toastError} Failed to show error message`)
      }
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
     toast.error(`${error}`)
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
     toast.error(`${error}`)
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
     toast.error(`${error}`)
    },
    retry: 1,
  })

  return {
    bulkCreate,
    bulkUpdate,
    bulkDelete,
  }
}
