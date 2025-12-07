import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  accountPurposeService,
  type AccountPurposeFilters,
  type CreateAccountPurposeRequest,
  type UpdateAccountPurposeRequest,
} from '@/services/api/masterApi/Customer/accountPurposeService'

export const ACCOUNT_PURPOSES_QUERY_KEY = 'accountPurposes'

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

  const query = useQuery({
    queryKey: [
      ACCOUNT_PURPOSES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      accountPurposeService.getAccountPurposes(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
    retry: 3,
  })

  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (
      newApiPagination.totalElements !== apiPagination.totalElements ||
      newApiPagination.totalPages !== apiPagination.totalPages
    ) {
      setApiPagination(newApiPagination)
    }
  }

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

export function useAccountPurpose(id: string | null) {
  return useQuery({
    queryKey: [ACCOUNT_PURPOSES_QUERY_KEY, id],
    queryFn: () => accountPurposeService.getAccountPurpose(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

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
        return accountPurposeService.createAccountPurpose(data as CreateAccountPurposeRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_PURPOSES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshAccountPurposes() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNT_PURPOSES_QUERY_KEY] })
  }, [queryClient])
}

export function useAllAccountPurposes() {
  return useQuery({
    queryKey: [ACCOUNT_PURPOSES_QUERY_KEY, 'all'],
    queryFn: () => accountPurposeService.getAllAccountPurposes(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

