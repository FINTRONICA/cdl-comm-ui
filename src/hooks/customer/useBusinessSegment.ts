import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessSegmentService } from '@/services/api/customerApi/businessSegmentService'

// Business Segment Hooks
export const useBusinessSegment = () => {
  const queryClient = useQueryClient()

  // Get all business segments
  const useGetAllBusinessSegments = () => {
    return useQuery({
      queryKey: ['businessSegments'],
      queryFn: businessSegmentService.getAll,
    })
  }

  // Get business segment by ID
  const useGetBusinessSegmentById = (id: string) => {
    return useQuery({
      queryKey: ['businessSegment', id],
      queryFn: () => businessSegmentService.getById(id),
      enabled: !!id,
    })
  }

  // Create business segment
  const useCreateBusinessSegment = () => {
    return useMutation({
      mutationFn: businessSegmentService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSegments'] })
      },
    })
  }

  // Update business segment
  const useUpdateBusinessSegment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        businessSegmentService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['businessSegments'] })
        queryClient.invalidateQueries({ queryKey: ['businessSegment', id] })
      },
    })
  }

  // Delete business segment
  const useDeleteBusinessSegment = () => {
    return useMutation({
      mutationFn: businessSegmentService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSegments'] })
      },
    })
  }

  // Soft delete business segment
  const useSoftDeleteBusinessSegment = () => {
    return useMutation({
      mutationFn: businessSegmentService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSegments'] })
      },
    })
  }

  // Find all business segments with filters
  const useFindAllBusinessSegments = (filters?: any) => {
    return useQuery({
      queryKey: ['businessSegments', 'findAll', filters],
      queryFn: () => businessSegmentService.findAll(filters),
    })
  }

  return {
    useGetAllBusinessSegments,
    useGetBusinessSegmentById,
    useCreateBusinessSegment,
    useUpdateBusinessSegment,
    useDeleteBusinessSegment,
    useSoftDeleteBusinessSegment,
    useFindAllBusinessSegments,
  }
}
