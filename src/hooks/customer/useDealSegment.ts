import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealSegmentService } from '@/services/api/customerApi/dealSegmentService'

// Deal Segment Hooks
export const useDealSegment = () => {
  const queryClient = useQueryClient()

  // Get all deal segments
  const useGetAllDealSegments = () => {
    return useQuery({
      queryKey: ['dealSegments'],
      queryFn: dealSegmentService.getAll,
    })
  }

  // Get deal segment by ID
  const useGetDealSegmentById = (id: string) => {
    return useQuery({
      queryKey: ['dealSegment', id],
      queryFn: () => dealSegmentService.getById(id),
      enabled: !!id,
    })
  }

  // Create deal segment
  const useCreateDealSegment = () => {
    return useMutation({
      mutationFn: dealSegmentService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSegments'] })
      },
    })
  }

  // Update deal segment
  const useUpdateDealSegment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        dealSegmentService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['dealSegments'] })
        queryClient.invalidateQueries({ queryKey: ['dealSegment', id] })
      },
    })
  }

  // Delete deal segment
  const useDeleteDealSegment = () => {
    return useMutation({
      mutationFn: dealSegmentService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSegments'] })
      },
    })
  }

  // Soft delete deal segment
  const useSoftDeleteDealSegment = () => {
    return useMutation({
      mutationFn: dealSegmentService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSegments'] })
      },
    })
  }

  // Find all deal segments with filters
  const useFindAllDealSegments = (filters?: any) => {
    return useQuery({
      queryKey: ['dealSegments', 'findAll', filters],
      queryFn: () => dealSegmentService.findAll(filters),
    })
  }

  return {
    useGetAllDealSegments,
    useGetDealSegmentById,
    useCreateDealSegment,
    useUpdateDealSegment,
    useDeleteDealSegment,
    useSoftDeleteDealSegment,
    useFindAllDealSegments,
  }
}
