import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  accountPurposeService,
  type AccountPurposeFilters,
  type CreateAccountPurposeRequest,
  type UpdateAccountPurposeRequest,
} from '@/services/api/masterApi/Customer/accountPurposeService'

export const ACCOUNT_PURPOSES_QUERY_KEY = 'accountPurposes'

/**
 * Hook to fetch paginated account purposes with filters
 * FIXED: Prevents double API calls by:
 * - Using useEffect for pagination state updates instead of render-time updates
 * - Removing refetchOnMount to prevent unnecessary refetches
 * - Stabilizing query key dependencies
 */
export function useAccountPurposes(
  page = 0,
  size = 20,
  filters?: AccountPurposeFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  // Stabilize filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(() => filters, [filters])

  const query = useQuery({
    queryKey: [
      ACCOUNT_PURPOSES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters: stableFilters },
    ],
    queryFn: () =>
      accountPurposeService.getAccountPurposes(
        pagination.page,
        pagination.size,
        stableFilters
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // FIXED: Removed to prevent double calls on tab navigation
    retry: 3,
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

/**
 * Hook to fetch a single account purpose by ID
 */
export function useAccountPurpose(id: string | null) {
  return useQuery({
    queryKey: [ACCOUNT_PURPOSES_QUERY_KEY, id],
    queryFn: () => accountPurposeService.getAccountPurpose(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

/**
 * Hook to delete an account purpose (soft delete)
 */
export function useDeleteAccountPurpose() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => accountPurposeService.deleteAccountPurpose(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_PURPOSES_QUERY_KEY] })
    },
    retry: 0,
  })
}

/**
 * Hook to save (create or update) an account purpose
 */
export function useSaveAccountPurpose() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      accountPurposeId,
    }: {
      data: CreateAccountPurposeRequest | UpdateAccountPurposeRequest
      isEditing: boolean
      accountPurposeId?: string
    }) => {
      if (isEditing && accountPurposeId) {
        return accountPurposeService.updateAccountPurpose(
          accountPurposeId,
          data as UpdateAccountPurposeRequest
        )
      } else {
        return accountPurposeService.createAccountPurpose(
          data as CreateAccountPurposeRequest
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_PURPOSES_QUERY_KEY] })
    },
    retry: 0,
  })
}

/**
 * Hook to refresh account purposes list
 */
export function useRefreshAccountPurposes() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNT_PURPOSES_QUERY_KEY] })
  }, [queryClient])
}

/**
 * Hook to fetch all account purposes (non-paginated)
 */
export function useAllAccountPurposes() {
  return useQuery({
    queryKey: [ACCOUNT_PURPOSES_QUERY_KEY, 'all'],
    queryFn: () => accountPurposeService.getAllAccountPurposes(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}
