import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealTypeService } from '@/services/api/customerApi/dealTypeService'

// Deal Type Hooks
export const useDealType = () => {
  const queryClient = useQueryClient()

  // Get all deal types
  const useGetAllDealTypes = () => {
    return useQuery({
      queryKey: ['dealTypes'],
      queryFn: dealTypeService.getAll,
    })
  }

  // Get deal type by ID
  const useGetDealTypeById = (id: string) => {
    return useQuery({
      queryKey: ['dealType', id],
      queryFn: () => dealTypeService.getById(id),
      enabled: !!id,
    })
  }

  // Create deal type
  const useCreateDealType = () => {
    return useMutation({
      mutationFn: dealTypeService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealTypes'] })
      },
    })
  }

  // Update deal type
  const useUpdateDealType = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        dealTypeService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['dealTypes'] })
        queryClient.invalidateQueries({ queryKey: ['dealType', id] })
      },
    })
  }

  // Delete deal type
  const useDeleteDealType = () => {
    return useMutation({
      mutationFn: dealTypeService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealTypes'] })
      },
    })
  }

  // Soft delete deal type
  const useSoftDeleteDealType = () => {
    return useMutation({
      mutationFn: dealTypeService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealTypes'] })
      },
    })
  }

  // Find all deal types with filters
  const useFindAllDealTypes = (filters?: any) => {
    return useQuery({
      queryKey: ['dealTypes', 'findAll', filters],
      queryFn: () => dealTypeService.findAll(filters),
    })
  }

  return {
    useGetAllDealTypes,
    useGetDealTypeById,
    useCreateDealType,
    useUpdateDealType,
    useDeleteDealType,
    useSoftDeleteDealType,
    useFindAllDealTypes,
  }
}
