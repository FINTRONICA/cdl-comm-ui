import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerAccountService } from '@/services/api/customerApi/ledgerAccountService'

// Ledger Account Hooks
export const useLedgerAccount = () => {
  const queryClient = useQueryClient()

  // Get all ledger accounts
  const useGetAllLedgerAccounts = () => {
    return useQuery({
      queryKey: ['ledgerAccounts'],
      queryFn: ledgerAccountService.getAll,
    })
  }

  // Get ledger account by ID
  const useGetLedgerAccountById = (id: string) => {
    return useQuery({
      queryKey: ['ledgerAccount', id],
      queryFn: () => ledgerAccountService.getById(id),
      enabled: !!id,
    })
  }

  // Create ledger account
  const useCreateLedgerAccount = () => {
    return useMutation({
      mutationFn: ledgerAccountService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] })
      },
    })
  }

  // Update ledger account
  const useUpdateLedgerAccount = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        ledgerAccountService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] })
        queryClient.invalidateQueries({ queryKey: ['ledgerAccount', id] })
      },
    })
  }

  // Delete ledger account
  const useDeleteLedgerAccount = () => {
    return useMutation({
      mutationFn: ledgerAccountService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] })
      },
    })
  }

  // Soft delete ledger account
  const useSoftDeleteLedgerAccount = () => {
    return useMutation({
      mutationFn: ledgerAccountService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] })
      },
    })
  }

  // Find all ledger accounts with filters
  const useFindAllLedgerAccounts = (filters?: any) => {
    return useQuery({
      queryKey: ['ledgerAccounts', 'findAll', filters],
      queryFn: () => ledgerAccountService.findAll(filters),
    })
  }

  return {
    useGetAllLedgerAccounts,
    useGetLedgerAccountById,
    useCreateLedgerAccount,
    useUpdateLedgerAccount,
    useDeleteLedgerAccount,
    useSoftDeleteLedgerAccount,
    useFindAllLedgerAccounts,
  }
}
