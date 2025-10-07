import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investmentMasterService } from '@/services/api/customerApi/investmentMasterService'

// Investment Master Hooks
export const useInvestmentMaster = () => {
  const queryClient = useQueryClient()

  // Get all investment masters
  const useGetAllInvestmentMasters = () => {
    return useQuery({
      queryKey: ['investmentMasters'],
      queryFn: investmentMasterService.getAll,
    })
  }

  // Get investment master by ID
  const useGetInvestmentMasterById = (id: string) => {
    return useQuery({
      queryKey: ['investmentMaster', id],
      queryFn: () => investmentMasterService.getById(id),
      enabled: !!id,
    })
  }

  // Create investment master
  const useCreateInvestmentMaster = () => {
    return useMutation({
      mutationFn: investmentMasterService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasters'] })
      },
    })
  }

  // Update investment master
  const useUpdateInvestmentMaster = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        investmentMasterService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasters'] })
        queryClient.invalidateQueries({ queryKey: ['investmentMaster', id] })
      },
    })
  }

  // Delete investment master
  const useDeleteInvestmentMaster = () => {
    return useMutation({
      mutationFn: investmentMasterService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasters'] })
      },
    })
  }

  // Soft delete investment master
  const useSoftDeleteInvestmentMaster = () => {
    return useMutation({
      mutationFn: investmentMasterService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasters'] })
      },
    })
  }

  // Find all investment masters with filters
  const useFindAllInvestmentMasters = (filters?: any) => {
    return useQuery({
      queryKey: ['investmentMasters', 'findAll', filters],
      queryFn: () => investmentMasterService.findAll(filters),
    })
  }

  return {
    useGetAllInvestmentMasters,
    useGetInvestmentMasterById,
    useCreateInvestmentMaster,
    useUpdateInvestmentMaster,
    useDeleteInvestmentMaster,
    useSoftDeleteInvestmentMaster,
    useFindAllInvestmentMasters,
  }
}
