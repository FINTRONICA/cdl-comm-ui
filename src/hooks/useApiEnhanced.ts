import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  buildFilterParams,
} from '@/constants'

// Pagination and filter types
export interface PaginationParams {
  page: number
  size: number
  sort?: string
}

export interface FilterParams {
  field: string
  operator: keyof typeof import('@/constants').FILTER_OPERATORS
  value: string | number | boolean
}

// GET hook using React Query
export function useGetEnhanced<T = unknown>(
  endpoint: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  const queryKey = [endpoint, params]
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const url = buildApiUrl(endpoint)
      return apiClient.get<T>(url, { params })
    },
    retry: 3, // Banking: retry on failure
    ...options,
  })
}

// GET with pagination and filters
export function useGetWithPagination<T = unknown>(
  endpoint: string,
  pagination: PaginationParams,
  filters?: FilterParams[],
  options?: UseQueryOptions<T, Error>
) {
  const params = buildPaginationParams(
    pagination.page,
    pagination.size,
    pagination.sort
  )
  if (filters) {
    filters.forEach((filter) => {
      const filterParam = buildFilterParams(
        filter.field,
        filter.operator,
        filter.value
      )
      const [key, value] = filterParam.split('=')
      if (key && value) params[key] = value
    })
  }
  return useGetEnhanced<T>(endpoint, params, options)
}

// POST hook using React Query
export function usePostEnhanced<T = unknown, V = unknown>(
  endpoint: string,
  options?: UseMutationOptions<T, Error, V>
) {
  const queryClient = useQueryClient()
  return useMutation<T, Error, V>({
    mutationFn: async (data: V) => {
      const url = buildApiUrl(endpoint)
      return apiClient.post<T>(url, data)
    },
    retry: 2, // Banking: retry on failure
    onSuccess: () => {
      // Invalidate all queries for this endpoint (banking: keep data fresh)
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
    ...options,
  })
}

// PUT hook using React Query
export function usePutEnhanced<T = unknown, V = unknown>(
  endpoint: string,
  options?: UseMutationOptions<T, Error, V>
) {
  const queryClient = useQueryClient()
  return useMutation<T, Error, V>({
    mutationFn: async (data: V) => {
      const url = buildApiUrl(endpoint)
      return apiClient.put<T>(url, data)
    },
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
    ...options,
  })
}

// DELETE hook using React Query
export function useDeleteEnhanced<T = unknown>(
  endpoint: string,
  options?: UseMutationOptions<T, Error, void>
) {
  const queryClient = useQueryClient()
  return useMutation<T, Error, void>({
    mutationFn: async () => {
      const url = buildApiUrl(endpoint)
      return apiClient.delete<T>(url)
    },
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
    ...options,
  })
}

// Example: Auth API hooks
export function useAuthApi() {
  const login = usePostEnhanced<
    { token: string; user: unknown },
    { username: string; password: string }
  >('/auth/login')
  const logout = usePostEnhanced<void, void>('/auth/logout')
  return { login, logout }
}

// Example: User API hooks
export function useUserApi() {
  const createUser = usePostEnhanced('/application-user')
  return { createUser }
}

// Example: Bank API hooks
export function useBankApi() {
  const createBankAccount = usePostEnhanced('/bank-account')
  return { createBankAccount }
}
