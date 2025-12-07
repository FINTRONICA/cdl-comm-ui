import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  currencyService,
  type CurrencyFilters,
  type CreateCurrencyRequest,
  type UpdateCurrencyRequest,
} from '@/services/api/masterApi/Customer/currencyService'

export const CURRENCIES_QUERY_KEY = 'currencies'

export function useCurrencies(
  page = 0,
  size = 20,
  filters?: CurrencyFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      CURRENCIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
        currencyService.getCurrencies(
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

export function useCurrency(id: string | null) {
  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, id],
    queryFn: () => currencyService.getCurrency(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteCurrency() {
  const queryClient = useQueryClient()

  return useMutation({
              mutationFn: (id: string) => currencyService.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY] })
    },
    retry: 0,
  })
}

        export function useSaveCurrency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      currencyId,
    }: {
      data: CreateCurrencyRequest | UpdateCurrencyRequest
      isEditing: boolean
      currencyId?: string
    }) => {
      if (isEditing && currencyId) {
          return currencyService.updateCurrency(currencyId, data as UpdateCurrencyRequest)
      } else {
        return currencyService.createCurrency(data as CreateCurrencyRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshCurrencies() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY] })
  }, [queryClient])
}

export function useAllCurrencies() {
  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, 'all'],
    queryFn: () => currencyService.getAllCurrencies(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

