import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  businessSubSegmentService,
  type BusinessSubSegmentFilters,
  type CreateBusinessSubSegmentRequest,
  type UpdateBusinessSubSegmentRequest,
} from '@/services/api/masterApi/Customer/businessSubSegmentService'

export const BUSINESS_SUB_SEGMENTS_QUERY_KEY = 'businessSubSegments'

export function useBusinessSubSegments(
  page = 0,
  size = 20,
  filters?: BusinessSubSegmentFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      BUSINESS_SUB_SEGMENTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      businessSubSegmentService.getBusinessSubSegments(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
    retry: 3,
  })

  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (
      newApiPagination.totalElements !== apiPagination.totalElements ||
      newApiPagination.totalPages !== apiPagination.totalPages
    ) {
      setApiPagination(newApiPagination)
    }
  }

  const updatePagination = useCallback((newPage: number, newSize: number) => {
    setPagination({ page: newPage, size: newSize })
  }, [])

  return {
    ...query,
    updatePagination,
    apiPagination,
  } as typeof query & {
    updatePagination: typeof updatePagination
    apiPagination: typeof apiPagination
  }
}

export function useBusinessSubSegment(id: string | null) {
  return useQuery({
    queryKey: [BUSINESS_SUB_SEGMENTS_QUERY_KEY, id],
    queryFn: () => businessSubSegmentService.getBusinessSubSegment(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteBusinessSubSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => businessSubSegmentService.deleteBusinessSubSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUSINESS_SUB_SEGMENTS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveBusinessSubSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      businessSegmentId,
    }: {
      data: CreateBusinessSubSegmentRequest | UpdateBusinessSubSegmentRequest
      isEditing: boolean
      businessSegmentId?: string
    }) => {
      if (isEditing && businessSegmentId) {
        return businessSubSegmentService.updateBusinessSubSegment(businessSegmentId, data as UpdateBusinessSubSegmentRequest)
      } else {
        return businessSubSegmentService.createBusinessSubSegment(data as CreateBusinessSubSegmentRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUSINESS_SUB_SEGMENTS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshBusinessSegments() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [BUSINESS_SUB_SEGMENTS_QUERY_KEY] })
  }, [queryClient])
}

