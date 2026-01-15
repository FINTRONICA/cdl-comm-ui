import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  escrowAccountService,
  type MasterEscrowAccountFilters,
  type MasterEscrowAccountData,
  type UpdateMasterEscrowAccountData,
  type EscrowAccountReviewData,
} from '@/services/api/masterApi/Customer/escrowAccountService'

export const ESCROW_ACCOUNTS_QUERY_KEY = 'masterEscrowAccounts'

// Enhanced hook to fetch all escrow accounts with pagination and filters
export function useEscrowAccounts(
  page = 0,
  size = 20,
  filters?: MasterEscrowAccountFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      ESCROW_ACCOUNTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      escrowAccountService.getEscrowAccounts(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })

  // Update API pagination when data changes
  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (JSON.stringify(newApiPagination) !== JSON.stringify(apiPagination)) {
      setApiPagination(newApiPagination)
    }
  }

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

export function useEscrowAccount(id: string) {
  return useQuery({
    queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, id],
    queryFn: () => escrowAccountService.getEscrowAccount(id),
    enabled: !!id && id.trim() !== '',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on 500 errors to prevent error storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      return failureCount < 1
    },
  })
}

export function useSaveEscrowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      escrowAccountId,
    }: {
      data: MasterEscrowAccountData
      isEditing?: boolean
      escrowAccountId?: string | number
    }) => escrowAccountService.saveEscrowAccount(data, isEditing, escrowAccountId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ESCROW_ACCOUNTS_QUERY_KEY] })
      if (variables.escrowAccountId) {
        queryClient.invalidateQueries({
          queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, variables.escrowAccountId],
        })
      }
    },
    retry: 2,
  })
}

export function useUpdateEscrowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateMasterEscrowAccountData
    }) => escrowAccountService.updateEscrowAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ESCROW_ACCOUNTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteEscrowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => escrowAccountService.deleteEscrowAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ESCROW_ACCOUNTS_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useRefreshEscrowAccounts() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [ESCROW_ACCOUNTS_QUERY_KEY] })
  }
}

export function useEscrowAccountById(escrowAccountId: string | number | null) {
  return useQuery({
    queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, 'escrowAccount', escrowAccountId],
    queryFn: () =>
      escrowAccountService.getEscrowAccountById(escrowAccountId as string),
    enabled: !!escrowAccountId && String(escrowAccountId).trim() !== '',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on 500 errors to prevent error storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      return failureCount < 1
    },
  })
}

export function useSaveEscrowAccountReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EscrowAccountReviewData) =>
      escrowAccountService.saveEscrowAccountReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ESCROW_ACCOUNTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useEscrowAccountStepData(step: number, escrowAccountId?: string) {
  return useQuery({
    queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, 'step', step, escrowAccountId],
    queryFn: () => escrowAccountService.getStepData(step, escrowAccountId),
    enabled: step > 0 && step <= 3 && !!escrowAccountId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useEscrowAccountStepStatus(escrowAccountId: string) {
  return useQuery({
    queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, 'stepStatus', escrowAccountId],
    queryFn: async () => {
      const promiseResults = await Promise.allSettled([
        escrowAccountService.getEscrowAccountById(escrowAccountId),
        escrowAccountService.getEscrowAccountDocuments(
          escrowAccountId,
          'ESCROW_ACCOUNT',
          0,
          20
        ),
      ])

      const step1Result = promiseResults[0]
      const step2Result = promiseResults[1]

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        step2: step2Result.status === 'fulfilled' && step2Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
          step2: step2Result.status === 'fulfilled' ? step2Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
          step2: step2Result.status === 'rejected' ? step2Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step2) stepStatus.lastCompletedStep = 2
      else if (stepStatus.step1) stepStatus.lastCompletedStep = 1
      return stepStatus
    },
    enabled: !!escrowAccountId,
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useEscrowAccountStepManager() {
  const saveEscrowAccount = useSaveEscrowAccount()
  const saveReview = useSaveEscrowAccountReview()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      escrowAccountId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveEscrowAccount.mutateAsync({
            data: data as MasterEscrowAccountData,
            isEditing,
            ...(escrowAccountId && { escrowAccountId }),
          })
        case 2:
          // Document upload is handled separately
          throw new Error('Document upload should use uploadEscrowAccountDocument')
        case 3:
          return await saveReview.mutateAsync(data as EscrowAccountReviewData)
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveEscrowAccount, saveReview]
  )

  return {
    saveStep,
    isLoading: saveEscrowAccount.isPending || saveReview.isPending,
    error: saveEscrowAccount.error || saveReview.error,
  }
}

// Hook for fetching escrow account documents with pagination
export function useEscrowAccountDocuments(
  escrowAccountId?: string,
  module: string = 'ESCROW_ACCOUNT',
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
      ESCROW_ACCOUNTS_QUERY_KEY,
      'documents',
      escrowAccountId,
      module,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: () =>
      escrowAccountService.getEscrowAccountDocuments(
        escrowAccountId!,
        module,
        pagination.page,
        pagination.size
      ),
    enabled: !!escrowAccountId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })

  // Update API pagination when data changes
  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (JSON.stringify(newApiPagination) !== JSON.stringify(apiPagination)) {
      setApiPagination(newApiPagination)
    }
  }

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

// Hook for uploading escrow account documents
export function useUploadEscrowAccountDocument() {
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
      escrowAccountService.uploadEscrowAccountDocument(
        file,
        entityId,
        module,
        documentType
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ESCROW_ACCOUNTS_QUERY_KEY, 'documents', variables.entityId],
      })
    },
    retry: 2,
  })
}
