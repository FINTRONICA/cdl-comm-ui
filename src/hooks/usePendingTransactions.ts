import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  pendingTransactionService,
  type PendingTransactionFilters,
  type CreatePendingTransactionRequest,
  type UpdatePendingTransactionRequest,
} from '@/services/api/pendingTransactionService'
import { useIsAuthenticated } from './useAuthQuery'

export const PENDING_TRANSACTIONS_QUERY_KEY = 'pendingTransactions'

// Hook to fetch all pending transactions with pagination and filters
export function usePendingTransactions(
  page = 0,
  size = 20,
  filters?: PendingTransactionFilters
) {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: [PENDING_TRANSACTIONS_QUERY_KEY, { page, size, filters }],
    queryFn: () =>
      pendingTransactionService.getPendingTransactions(page, size, filters),
    enabled: !!isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Banking: retry on failure
  })
}

// Hook to fetch a single pending transaction by ID
export function usePendingTransaction(id: string) {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: [PENDING_TRANSACTIONS_QUERY_KEY, id],
    queryFn: () => pendingTransactionService.getPendingTransaction(id),
    enabled: !!id && !!isAuthenticated, // Only run if ID exists and user is authenticated
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Hook to create a new pending transaction
export function useCreatePendingTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePendingTransactionRequest) =>
      pendingTransactionService.createPendingTransaction(data),
    onSuccess: () => {
      // Invalidate and refetch pending transactions list
      queryClient.invalidateQueries({
        queryKey: [PENDING_TRANSACTIONS_QUERY_KEY],
      })
    },
    retry: 2, // Banking: retry on failure
  })
}

// Hook to update an existing pending transaction
export function useUpdatePendingTransaction() {
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
      // Invalidate both the list and the specific pending transaction
      queryClient.invalidateQueries({
        queryKey: [PENDING_TRANSACTIONS_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [PENDING_TRANSACTIONS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

// Hook to delete a pending transaction
export function useDeletePendingTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      pendingTransactionService.deletePendingTransaction(id),
    onSuccess: () => {
      // Invalidate pending transactions list after deletion
      queryClient.invalidateQueries({
        queryKey: [PENDING_TRANSACTIONS_QUERY_KEY],
      })
    },
    retry: 2,
  })
}

// Hook to fetch pending transaction labels from PENDING_TRANSACTIONS API
export function usePendingTransactionLabels() {
  // Use existing authentication hook to ensure user is authenticated
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['pendingTransactionLabels'], // Simple and clear - matches buildPartnerLabels pattern
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

// Hook to refetch all pending transactions data (useful for manual refresh)
export function useRefreshPendingTransactions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: [PENDING_TRANSACTIONS_QUERY_KEY],
    })
  }
}

// UI-mapped list (uses transformToUIData inside service)
export function usePendingTransactionsUI(
  page = 0,
  size = 20,
  filters?: PendingTransactionFilters
) {
  const { isAuthenticated } = useIsAuthenticated()


  return useQuery({
    queryKey: [PENDING_TRANSACTIONS_QUERY_KEY, 'ui', { page, size, filters }],
    queryFn: () => {
      return pendingTransactionService.getPendingTransactionsUIData(
        page,
        size,
        filters
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
