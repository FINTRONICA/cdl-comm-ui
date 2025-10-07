import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  pendingTransactionService,
  type PendingTransactionFilters,
  type CreatePendingTransactionRequest,
  type UpdatePendingTransactionRequest,
} from '@/services/api/pendingTransactionService'
import { useIsAuthenticated } from './useAuthQuery'

export const DISCARDED_TRANSACTIONS_QUERY_KEY = 'discardedTransactions'

// Hook to fetch all discarded transactions with pagination and filters
export function useDiscardedTransactions(
  page = 0,
  size = 20,
  filters?: PendingTransactionFilters
) {
  const { isAuthenticated } = useIsAuthenticated()

  // Set default filter for allocated transactions (discarded transactions are allocated)
  const discardedFilters = {
    ...filters,
    isAllocated: true, // Discarded transactions are allocated
  }

  return useQuery({
    queryKey: [
      DISCARDED_TRANSACTIONS_QUERY_KEY,
      { page, size, filters: discardedFilters },
    ],
    queryFn: () =>
      pendingTransactionService.getPendingTransactions(
        page,
        size,
        discardedFilters
      ),
    enabled: !!isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Banking: retry on failure
  })
}

// Hook to fetch a single discarded transaction by ID
export function useDiscardedTransaction(id: string) {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: [DISCARDED_TRANSACTIONS_QUERY_KEY, id],
    queryFn: () => pendingTransactionService.getPendingTransaction(id),
    enabled: !!id && !!isAuthenticated, // Only run if ID exists and user is authenticated
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Hook to create a new discarded transaction
export function useCreateDiscardedTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePendingTransactionRequest) =>
      pendingTransactionService.createPendingTransaction(data),
    onSuccess: () => {
      // Invalidate and refetch discarded transactions list
      queryClient.invalidateQueries({
        queryKey: [DISCARDED_TRANSACTIONS_QUERY_KEY],
      })
    },
    retry: 2, // Banking: retry on failure
  })
}

// Hook to update an existing discarded transaction
export function useUpdateDiscardedTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdatePendingTransactionRequest
    }) => pendingTransactionService.updatePendingTransaction(id, updates),
    onSuccess: (_, { id }) => {
      // Invalidate both the list and the specific discarded transaction
      queryClient.invalidateQueries({
        queryKey: [DISCARDED_TRANSACTIONS_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [DISCARDED_TRANSACTIONS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

// Hook to delete a discarded transaction
export function useDeleteDiscardedTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      pendingTransactionService.deletePendingTransaction(id),
    onSuccess: () => {
      // Invalidate discarded transactions list after deletion
      queryClient.invalidateQueries({
        queryKey: [DISCARDED_TRANSACTIONS_QUERY_KEY],
      })
    },
    retry: 2,
  })
}

// Hook to fetch discarded transaction labels from API
export function useDiscardedTransactionLabels() {
  // Use existing authentication hook to ensure user is authenticated
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['discardedTransactionLabels'], // Simple and clear - matches pattern
    queryFn: async () => {
      const rawLabels =
        await pendingTransactionService.getPendingTransactionLabels()
      // Process the raw API response into the expected format
      return rawLabels.reduce(
        (
          processed: Record<string, Record<string, string>>,
          {
            key,
            value,
            language,
          }: { key: string; value: string; language: string }
        ) => {
          if (!processed[key]) {
            processed[key] = {}
          }
          processed[key][language] = value
          return processed
        },
        {} as Record<string, Record<string, string>>
      )
    },
    enabled: !!isAuthenticated, // Only fetch when authenticated
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - labels don't change often
    refetchOnWindowFocus: false,
    retry: 3, // Banking: retry on failure
  })
}

// Hook to refetch all discarded transactions data (useful for manual refresh)
export function useRefreshDiscardedTransactions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: [DISCARDED_TRANSACTIONS_QUERY_KEY],
    })
  }
}

// UI-mapped list (uses transformToUIData inside service)
export function useDiscardedTransactionsUI(
  page = 0,
  size = 20,
  filters?: PendingTransactionFilters
) {
  const { isAuthenticated } = useIsAuthenticated()

  // Memoize the filters to prevent unnecessary re-renders
  const discardedFilters = useMemo(() => ({
    ...filters,
    isAllocated: true, // Discarded transactions are allocated
  }), [filters])

  return useQuery({
    queryKey: [
      DISCARDED_TRANSACTIONS_QUERY_KEY,
      'ui',
      { page, size, filters: discardedFilters },
    ],
    queryFn: () => {
      return pendingTransactionService.getPendingTransactionsUIData(
        page,
        size,
        discardedFilters
      )
    },
    enabled: !!isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Enable reconnect refetch
    refetchOnMount: true, // Enable mount refetch
    retry: 3, // Increased retry to match other hooks
  })
}
