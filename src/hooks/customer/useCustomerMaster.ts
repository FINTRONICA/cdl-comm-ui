import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerMasterService } from '@/services/api/customerApi/customerMasterService'

// Customer Master Hooks
export const useCustomerMaster = () => {
  const queryClient = useQueryClient()

  // Get all customer masters
  const useGetAllCustomerMasters = () => {
    return useQuery({
      queryKey: ['customerMasters'],
      queryFn: customerMasterService.getAll,
    })
  }

  // Get customer master by ID
  const useGetCustomerMasterById = (id: string) => {
    return useQuery({
      queryKey: ['customerMaster', id],
      queryFn: () => customerMasterService.getById(id),
      enabled: !!id,
    })
  }

  // Create customer master
  const useCreateCustomerMaster = () => {
    return useMutation({
      mutationFn: customerMasterService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customerMasters'] })
      },
    })
  }

  // Update customer master
  const useUpdateCustomerMaster = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        customerMasterService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['customerMasters'] })
        queryClient.invalidateQueries({ queryKey: ['customerMaster', id] })
      },
    })
  }

  // Delete customer master
  const useDeleteCustomerMaster = () => {
    return useMutation({
      mutationFn: customerMasterService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customerMasters'] })
      },
    })
  }

  // Soft delete customer master
  const useSoftDeleteCustomerMaster = () => {
    return useMutation({
      mutationFn: customerMasterService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customerMasters'] })
      },
    })
  }

  // Find all customer masters with filters
  const useFindAllCustomerMasters = (filters?: any) => {
    return useQuery({
      queryKey: ['customerMasters', 'findAll', filters],
      queryFn: () => customerMasterService.findAll(filters),
    })
  }

  return {
    useGetAllCustomerMasters,
    useGetCustomerMasterById,
    useCreateCustomerMaster,
    useUpdateCustomerMaster,
    useDeleteCustomerMaster,
    useSoftDeleteCustomerMaster,
    useFindAllCustomerMasters,
  }
}
