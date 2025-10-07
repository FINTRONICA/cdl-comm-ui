import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { beneficiaryService } from '@/services/api/customerApi/beneficiaryService'

// Beneficiary Hooks
export const useBeneficiary = () => {
  const queryClient = useQueryClient()

  // Get all beneficiaries
  const useGetAllBeneficiaries = () => {
    return useQuery({
      queryKey: ['beneficiaries'],
      queryFn: beneficiaryService.getAll,
    })
  }

  // Get beneficiary by ID
  const useGetBeneficiaryById = (id: string) => {
    return useQuery({
      queryKey: ['beneficiary', id],
      queryFn: () => beneficiaryService.getById(id),
      enabled: !!id,
    })
  }

  // Create beneficiary
  const useCreateBeneficiary = () => {
    return useMutation({
      mutationFn: beneficiaryService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      },
    })
  }

  // Update beneficiary
  const useUpdateBeneficiary = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        beneficiaryService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
        queryClient.invalidateQueries({ queryKey: ['beneficiary', id] })
      },
    })
  }

  // Delete beneficiary
  const useDeleteBeneficiary = () => {
    return useMutation({
      mutationFn: beneficiaryService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      },
    })
  }

  // Soft delete beneficiary
  const useSoftDeleteBeneficiary = () => {
    return useMutation({
      mutationFn: beneficiaryService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      },
    })
  }

  // Find all beneficiaries with filters
  const useFindAllBeneficiaries = (filters?: any) => {
    return useQuery({
      queryKey: ['beneficiaries', 'findAll', filters],
      queryFn: () => beneficiaryService.findAll(filters),
    })
  }

  return {
    useGetAllBeneficiaries,
    useGetBeneficiaryById,
    useCreateBeneficiary,
    useUpdateBeneficiary,
    useDeleteBeneficiary,
    useSoftDeleteBeneficiary,
    useFindAllBeneficiaries,
  }
}
