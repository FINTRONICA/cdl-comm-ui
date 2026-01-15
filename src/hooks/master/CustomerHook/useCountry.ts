import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  countryService,
  type CountryFilters,
  type CreateCountryRequest,
  type UpdateCountryRequest,
} from '@/services/api/masterApi/Customer/countryService'

export const COUNTRIES_QUERY_KEY = 'countries'

export function useCountries(
  page = 0,
  size = 20,
  filters?: CountryFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      COUNTRIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      countryService.getCountries(
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

export function useCountry(id: string | null) {
  return useQuery({
    queryKey: [COUNTRIES_QUERY_KEY, id],
    queryFn: () => countryService.getCountry(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => countryService.deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUNTRIES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      countryId,
    }: {
      data: CreateCountryRequest | UpdateCountryRequest
      isEditing: boolean
      countryId?: string
    }) => {
      if (isEditing && countryId) {
        return countryService.updateCountry(countryId, data as UpdateCountryRequest)
      } else {
        return countryService.createCountry(data as CreateCountryRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUNTRIES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshCountries() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [COUNTRIES_QUERY_KEY] })
  }, [queryClient])
}

export function useAllCountries() {
  return useQuery({
    queryKey: [COUNTRIES_QUERY_KEY, 'all'],
    queryFn: () => countryService.getAllCountries(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}
