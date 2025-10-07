import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountPurposeService } from '@/services/api/customerApi/accountPurposeService'

// Account Purpose Hooks
export const useAccountPurpose = () => {
  const queryClient = useQueryClient()

  // Get all account purposes
  const useGetAllAccountPurposes = () => {
    return useQuery({
      queryKey: ['accountPurposes'],
      queryFn: accountPurposeService.getAll,
    })
  }

  // Get account purpose by ID
  const useGetAccountPurposeById = (id: string) => {
    return useQuery({
      queryKey: ['accountPurpose', id],
      queryFn: () => accountPurposeService.getById(id),
      enabled: !!id,
    })
  }

  // Create account purpose
  const useCreateAccountPurpose = () => {
    return useMutation({
      mutationFn: accountPurposeService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposes'] })
      },
    })
  }

  // Update account purpose
  const useUpdateAccountPurpose = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        accountPurposeService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposes'] })
        queryClient.invalidateQueries({ queryKey: ['accountPurpose', id] })
      },
    })
  }

  // Delete account purpose
  const useDeleteAccountPurpose = () => {
    return useMutation({
      mutationFn: accountPurposeService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposes'] })
      },
    })
  }

  // Soft delete account purpose
  const useSoftDeleteAccountPurpose = () => {
    return useMutation({
      mutationFn: accountPurposeService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposes'] })
      },
    })
  }

  // Find all account purposes with filters
  const useFindAllAccountPurposes = (filters?: any) => {
    return useQuery({
      queryKey: ['accountPurposes', 'findAll', filters],
      queryFn: () => accountPurposeService.findAll(filters),
    })
  }

  return {
    useGetAllAccountPurposes,
    useGetAccountPurposeById,
    useCreateAccountPurpose,
    useUpdateAccountPurpose,
    useDeleteAccountPurpose,
    useSoftDeleteAccountPurpose,
    useFindAllAccountPurposes,
  }
}
