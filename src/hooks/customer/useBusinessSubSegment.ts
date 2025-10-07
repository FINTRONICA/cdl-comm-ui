import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessSubSegmentService } from '@/services/api/customerApi/businessSubSegmentService'

// Business Sub Segment Hooks
export const useBusinessSubSegment = () => {
  const queryClient = useQueryClient()

  // Get all business sub segments
  const useGetAllBusinessSubSegments = () => {
    return useQuery({
      queryKey: ['businessSubSegments'],
      queryFn: businessSubSegmentService.getAll,
    })
  }

  // Get business sub segment by ID
  const useGetBusinessSubSegmentById = (id: string) => {
    return useQuery({
      queryKey: ['businessSubSegment', id],
      queryFn: () => businessSubSegmentService.getById(id),
      enabled: !!id,
    })
  }

  // Create business sub segment
  const useCreateBusinessSubSegment = () => {
    return useMutation({
      mutationFn: businessSubSegmentService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegments'] })
      },
    })
  }

  // Update business sub segment
  const useUpdateBusinessSubSegment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        businessSubSegmentService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegments'] })
        queryClient.invalidateQueries({ queryKey: ['businessSubSegment', id] })
      },
    })
  }

  // Delete business sub segment
  const useDeleteBusinessSubSegment = () => {
    return useMutation({
      mutationFn: businessSubSegmentService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegments'] })
      },
    })
  }

  // Soft delete business sub segment
  const useSoftDeleteBusinessSubSegment = () => {
    return useMutation({
      mutationFn: businessSubSegmentService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegments'] })
      },
    })
  }

  // Find all business sub segments with filters
  const useFindAllBusinessSubSegments = (filters?: any) => {
    return useQuery({
      queryKey: ['businessSubSegments', 'findAll', filters],
      queryFn: () => businessSubSegmentService.findAll(filters),
    })
  }

  return {
    useGetAllBusinessSubSegments,
    useGetBusinessSubSegmentById,
    useCreateBusinessSubSegment,
    useUpdateBusinessSubSegment,
    useDeleteBusinessSubSegment,
    useSoftDeleteBusinessSubSegment,
    useFindAllBusinessSubSegments,
  }
}
