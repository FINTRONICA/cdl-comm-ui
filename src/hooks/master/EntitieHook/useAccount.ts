import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  accountService,
  type AccountFilters,
  type CreateAccountRequest,
  type UpdateAccountRequest,
  type AccountDetailsData,
  type AccountReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Entitie/accountService'
import { useIsAuthenticated } from '@/hooks'
import { AccountLabelsService } from '@/services/api/masterApi/Entitie/accountLabelsService'

export const ACCOUNTS_QUERY_KEY = 'accounts'

// Enhanced hook to fetch all build partners with pagination and filters
export function useAccounts(
  page = 0,
  size = 20,
  filters?: AccountFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  // Stabilize filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)])

  const query = useQuery({
    queryKey: [
      ACCOUNTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters: stableFilters },
    ],
    queryFn: () =>
      accountService.getAccounts(
        pagination.page,
        pagination.size,
        stableFilters
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent double calls on tab navigation
    retry: (failureCount, error) => {
      // Prevent retry storms on 500 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1 // Only retry once for 500 errors
        }
      }
      return failureCount < 2 // Max 2 retries for other errors
    },
  })

  // FIXED: Move pagination state update to useEffect to prevent render-time updates
  useEffect(() => {
    if (query.data?.page) {
      const newApiPagination = {
        totalElements: query.data.page.totalElements,
        totalPages: query.data.page.totalPages,
      }
      setApiPagination((prev) => {
        if (
          prev.totalElements !== newApiPagination.totalElements ||
          prev.totalPages !== newApiPagination.totalPages
        ) {
          return newApiPagination
        }
        return prev
      })
    }
  }, [query.data?.page])

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newPage,
      size: newSize !== undefined ? newSize : prev.size,
    }))
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

export function useAccount(id: string) {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, id],
    queryFn: () => accountService.getAccount(id),
    enabled: !!id && id.trim() !== '',
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 2
    },
  })
}

    export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountRequest) =>
      accountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] })
    },
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 1
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateAccountRequest
    }) => accountService.updateAccount(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_QUERY_KEY, id],
      })
      queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_QUERY_KEY, 'stepStatus', id],
      })
    },
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 1
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] })
    },
    retry: 0, // Disable retry for delete operations
  })
}

export function useAccountLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['accountLabels'],
    queryFn: async () => {
      const rawLabels = await accountService.getAccountLabels()
      // Process the raw API response into the expected format
      // AccountLabel has: { id, key, value, language, category }
      return rawLabels.reduce(
        (
          processed: Record<string, Record<string, string>>,
          label: { id: string; key: string; value: string; language: string; category: string }
        ) => {
          const key = label.key || label.id || ''
          if (!key) return processed
          if (!processed[key]) {
            processed[key] = {}
          }
          const language = label.language || 'EN'
          processed[key][language] = label.value || ''
          return processed
        },
        {} as Record<string, Record<string, string>>
      )
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - labels rarely change
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 2
    },
  })
}

export function useRefreshAgreements() {
  const queryClient = useQueryClient()

  return () => {
        queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] })
  }
}

export function useAccountLabelsWithUtils() {
  const query = useAccountLabels()

  return {
    ...query,

    hasLabels: () => AccountLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      AccountLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      AccountLabelsService.getAvailableLanguages(query.data || {}),
  }
}

    export function useSaveAccountDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      accountId,
    }: {
      data: AccountDetailsData
      isEditing?: boolean
      accountId?: string | undefined
    }) =>
      accountService.saveAccountDetails(data, isEditing, accountId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] })
      if (variables.accountId) {
        queryClient.invalidateQueries({
          queryKey: [ACCOUNTS_QUERY_KEY, variables.accountId],
        })
        queryClient.invalidateQueries({
          queryKey: [ACCOUNTS_QUERY_KEY, 'stepStatus', variables.accountId],
        })
      }
    },
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 1 // Only retry once for mutations
    },
  })
}

// Hook for fetching account documents with pagination
export function useAccountDocuments(
  accountId?: string,
  module: string = 'ACCOUNT',
  page = 0,
  size = 20
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      ACCOUNTS_QUERY_KEY,
      'documents',
      accountId,
      module,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: async () => {
      try {
        return await accountService.getAccountDocuments(
          accountId!,
          module,
          pagination.page,
          pagination.size
        )
      } catch (error) {
        // For documents, return empty result instead of throwing
        // Documents are optional, so we don't want to block the UI
        if (error && typeof error === 'object' && 'response' in error) {
          const httpError = error as { response?: { status?: number } }
          if (httpError.response?.status === 500 || httpError.response?.status === 404) {
            // Return empty paginated response for 500/404 errors
            return {
              content: [],
              page: {
                size: pagination.size,
                number: pagination.page,
                totalElements: 0,
                totalPages: 0,
              },
            }
          }
        }
        // Re-throw other errors
        throw error
      }
    },
    enabled: !!accountId && accountId.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on 500/404 for documents - they're optional
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500 || httpError.response?.status === 404) {
          return false
        }
      }
      return failureCount < 1 // Only retry once for other errors
    },
  })

  // FIXED: Move pagination state update to useEffect
  useEffect(() => {
    if (query.data?.page) {
      const newApiPagination = {
        totalElements: query.data.page.totalElements,
        totalPages: query.data.page.totalPages,
      }
      setApiPagination((prev) => {
        if (
          prev.totalElements !== newApiPagination.totalElements ||
          prev.totalPages !== newApiPagination.totalPages
        ) {
          return newApiPagination
        }
        return prev
      })
    }
  }, [query.data?.page])

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newPage,
      size: newSize !== undefined ? newSize : prev.size,
    }))
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

// Hook for uploading account documents
export function useUploadAccountDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      entityId,
      module,
      documentType,
    }: {
      file: File
      entityId: string
      module: string
      documentType?: string
    }) =>
      accountService.uploadAccountDocument(
        file,
        entityId,
        module,
        documentType
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_QUERY_KEY, 'documents', variables.entityId],
      })
    },
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 1
    },
  })
}



export function useSaveAccountReview() {
  const queryClient = useQueryClient()

  return useMutation({
        mutationFn: (data: AccountReviewData) =>
      accountService.saveAccountReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] })
    },
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 1
    },
  })
}

export function useAccountStepData(step: number) {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, 'step', step],
    queryFn: () => accountService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 2
    },
  })
}

export function useValidateAccountStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      accountService.validateStep(step, data),
    retry: 0, // No retry for validation - fail fast
  })
}

export function useAccountStepStatus(accountId: string) {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, 'stepStatus', accountId],
    queryFn: async () => {
      // Only fetch if accountId is valid
      if (!accountId || accountId.trim() === '') {
        return {
          step1: false,
          lastCompletedStep: 0,
          stepData: {
            step1: null,
          },
          errors: {
            step1: null,
          },
        }
      }

      const [step1Result] =
        await Promise.allSettled([
          accountService.getAccount(accountId),
        ])

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step1) stepStatus.lastCompletedStep = 1
      
      return stepStatus
    },
    enabled: !!accountId && accountId.trim() !== '',
    staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and performance
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // Refetch when component mounts to get latest data
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return failureCount < 1
        }
      }
      return failureCount < 1 // Only retry once
    },
  })
}

// Unified step management hook
export function useAccountStepManager() {
  const saveDetails = useSaveAccountDetails()
 
  const saveReview = useSaveAccountReview()
  const validateStep = useValidateAccountStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      accountId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
                data: data as AccountDetailsData,
            isEditing,
            accountId: accountId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as AccountReviewData)
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveDetails, saveReview]
  )

  return {
    saveStep,
    validateStep,
    isLoading:
      saveDetails.isPending ||
     
      saveReview.isPending,
    error:
      saveDetails.error ||
     
      saveReview.error,
  }
}


