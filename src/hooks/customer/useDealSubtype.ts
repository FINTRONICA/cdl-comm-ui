import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealSubtypeService } from '@/services/api/customerApi/dealSubtypeService'

// Deal Subtype Hooks
export const useDealSubtype = () => {
  const queryClient = useQueryClient()

  // Get all deal subtypes
  const useGetAllDealSubtypes = () => {
    return useQuery({
      queryKey: ['dealSubtypes'],
      queryFn: dealSubtypeService.getAll,
    })
  }

  // Get deal subtype by ID
  const useGetDealSubtypeById = (id: string) => {
    return useQuery({
      queryKey: ['dealSubtype', id],
      queryFn: () => dealSubtypeService.getById(id),
      enabled: !!id,
    })
  }

  // Create deal subtype
  const useCreateDealSubtype = () => {
    return useMutation({
      mutationFn: dealSubtypeService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypes'] })
      },
    })
  }

  // Update deal subtype
  const useUpdateDealSubtype = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        dealSubtypeService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypes'] })
        queryClient.invalidateQueries({ queryKey: ['dealSubtype', id] })
      },
    })
  }

  // Delete deal subtype
  const useDeleteDealSubtype = () => {
    return useMutation({
      mutationFn: dealSubtypeService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypes'] })
      },
    })
  }

  // Soft delete deal subtype
  const useSoftDeleteDealSubtype = () => {
    return useMutation({
      mutationFn: dealSubtypeService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypes'] })
      },
    })
  }

  // Find all deal subtypes with filters
  const useFindAllDealSubtypes = (filters?: any) => {
    return useQuery({
      queryKey: ['dealSubtypes', 'findAll', filters],
      queryFn: () => dealSubtypeService.findAll(filters),
    })
  }

  return {
    useGetAllDealSubtypes,
    useGetDealSubtypeById,
    useCreateDealSubtype,
    useUpdateDealSubtype,
    useDeleteDealSubtype,
    useSoftDeleteDealSubtype,
    useFindAllDealSubtypes,
  }
}
