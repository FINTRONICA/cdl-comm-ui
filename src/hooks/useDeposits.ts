import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { depositService } from '@/services/api/depositService'

export interface DepositData {
  id?: number
  depositRefNo: string
  dealNo: string
  clientName: string
  depositReceivableCategory: string
  depositReceivableAmount: string
  subDepositType: string
  transactionDate: string
  transactionReference: string
  escrowAccountNumber: string
  transactionDescription: string
  transactionAmount: string
  transactionDate2: string
  narration: string
}

export interface CreateDepositRequest {
  depositRefNo: string
  dealNo: string
  clientName: string
  depositReceivableCategory: string
  depositReceivableAmount: string
  subDepositType: string
  transactionDate: string
  transactionReference: string
  escrowAccountNumber: string
  transactionDescription: string
  transactionAmount: string
  transactionDate2: string
  narration: string
}

export interface UpdateDepositRequest {
  depositRefNo?: string
  dealNo?: string
  clientName?: string
  depositReceivableCategory?: string
  depositReceivableAmount?: string
  subDepositType?: string
  transactionDate?: string
  transactionReference?: string
  escrowAccountNumber?: string
  transactionDescription?: string
  transactionAmount?: string
  transactionDate2?: string
  narration?: string
}

export interface DepositFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

// Hook to get deposits with filters
export const useDeposits = (filters: DepositFilters = {}) => {
  return useQuery({
    queryKey: ['deposits', filters],
    queryFn: () => depositService.getDeposits(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get a single deposit by ID
export const useDeposit = (id: string) => {
  return useQuery({
    queryKey: ['deposit', id],
    queryFn: () => depositService.getDeposit(id),
    enabled: !!id,
  })
}

// Hook to create a new deposit
export const useCreateDeposit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDepositRequest) => depositService.createDeposit(data),
    onSuccess: () => {
      // Invalidate and refetch deposits list
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
    },
  })
}

// Hook to update an existing deposit
export const useUpdateDeposit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateDepositRequest }) =>
      depositService.updateDeposit(id, updates),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch deposits list and specific deposit
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      queryClient.invalidateQueries({ queryKey: ['deposit', id] })
    },
  })
}

// Hook to delete a deposit
export const useDeleteDeposit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => depositService.deleteDeposit(id),
    onSuccess: () => {
      // Invalidate and refetch deposits list
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
    },
  })
}

// Hook to get deposit dropdown options
export const useDepositDropdowns = () => {
  const depositCategories = useQuery({
    queryKey: ['deposit-categories'],
    queryFn: () => depositService.getDepositCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const subDepositTypes = useQuery({
    queryKey: ['sub-deposit-types'],
    queryFn: () => depositService.getSubDepositTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const dealOptions = useQuery({
    queryKey: ['deal-options'],
    queryFn: () => depositService.getDealOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const clientOptions = useQuery({
    queryKey: ['client-options'],
    queryFn: () => depositService.getClientOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const escrowAccountOptions = useQuery({
    queryKey: ['escrow-account-options'],
    queryFn: () => depositService.getEscrowAccountOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    depositCategories,
    subDepositTypes,
    dealOptions,
    clientOptions,
    escrowAccountOptions,
    isLoading: 
      depositCategories.isLoading ||
      subDepositTypes.isLoading ||
      dealOptions.isLoading ||
      clientOptions.isLoading ||
      escrowAccountOptions.isLoading,
    error:
      depositCategories.error ||
      subDepositTypes.error ||
      dealOptions.error ||
      clientOptions.error ||
      escrowAccountOptions.error,
  }
}
