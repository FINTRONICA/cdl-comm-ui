import {
  useGetWithPagination,
  useGetEnhanced,
  usePostEnhanced,
  usePutEnhanced,
  useDeleteEnhanced
} from '@/hooks/useApiEnhanced'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import type { PaginationParams, FilterParams } from '@/hooks/useApiEnhanced'

export function useBankAccounts(
  pagination: PaginationParams,
  filters?: FilterParams[],
  options?: UseQueryOptions<any, Error>
) {
  return useGetWithPagination('/bank-account/find-all', pagination, filters, options)
}

export function useBankAccount(
  id: string,
  options?: UseQueryOptions<any, Error>
) {
  return useGetEnhanced(`/bank-account/${id}`, undefined, options)
}

export function useCreateBankAccount(
  options?: UseMutationOptions<any, Error, any>
) {
  return usePostEnhanced('/bank-account', options)
}

export function useUpdateBankAccount(
  id: string,
  options?: UseMutationOptions<any, Error, any>
) {
  return usePutEnhanced(`/bank-account/${id}`, options)
}

export function useDeleteBankAccount(
  id: string,
  options?: UseMutationOptions<any, Error, void>
) {
  return useDeleteEnhanced(`/bank-account/${id}`, options)
} 