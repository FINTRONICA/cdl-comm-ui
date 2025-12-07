import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  businessSegmentService,
  type BusinessSegmentFilters,
  type CreateBusinessSegmentRequest,
  type UpdateBusinessSegmentRequest,
} from '@/services/api/masterApi/Customer/businessSegmentService'

export const BUSINESS_SEGMENTS_QUERY_KEY = 'businessSegments'

export function useBusinessSegments(
  page = 0,
  size = 20,
  filters?: BusinessSegmentFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      BUSINESS_SEGMENTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      businessSegmentService.getBusinessSegments(
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

export function useBusinessSegment(id: string | null) {
  return useQuery({
    queryKey: [BUSINESS_SEGMENTS_QUERY_KEY, id],
    queryFn: () => businessSegmentService.getBusinessSegment(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteBusinessSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => businessSegmentService.deleteBusinessSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUSINESS_SEGMENTS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveBusinessSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      businessSegmentId,
    }: {
      data: CreateBusinessSegmentRequest | UpdateBusinessSegmentRequest
      isEditing: boolean
      businessSegmentId?: string
    }) => {
      if (isEditing && businessSegmentId) {
        return businessSegmentService.updateBusinessSegment(businessSegmentId, data as UpdateBusinessSegmentRequest)
      } else {
        return businessSegmentService.createBusinessSegment(data as CreateBusinessSegmentRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUSINESS_SEGMENTS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshBusinessSegments() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [BUSINESS_SEGMENTS_QUERY_KEY] })
  }, [queryClient])
}

export function useAllBusinessSegments() {
  return useQuery({
    queryKey: [BUSINESS_SEGMENTS_QUERY_KEY, 'all'],
    queryFn: () => businessSegmentService.getAllBusinessSegments(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

