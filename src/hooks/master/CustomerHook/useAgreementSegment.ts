import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect } from 'react'
import {
  agreementSegmentService,
  type AgreementSegmentFilters,
  type CreateAgreementSegmentRequest,
  type UpdateAgreementSegmentRequest,
} from '@/services/api/masterApi/Customer/agreementSegmentService'

export const AGREEMENT_SEGMENTS_QUERY_KEY = 'agreementSegments'

export function useAgreementSegments(
  page = 0,
  size = 20,
  filters?: AgreementSegmentFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENT_SEGMENTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementSegmentService.getAgreementSegments(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
  })

  // Update pagination state when query data changes
  useEffect(() => {
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
  }, [query.data, apiPagination.totalElements, apiPagination.totalPages])

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

export function useAgreementSegment(id: string | null) {
  return useQuery({
    queryKey: [AGREEMENT_SEGMENTS_QUERY_KEY, id],
    queryFn: () => agreementSegmentService.getAgreementSegment(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: 3,
  })
}

export function useDeleteAgreementSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementSegmentService.deleteAgreementSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SEGMENTS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveAgreementSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      agreementSegmentId,
    }: {
      data: CreateAgreementSegmentRequest | UpdateAgreementSegmentRequest
      isEditing: boolean
      agreementSegmentId?: string
    }) => {
      if (isEditing && agreementSegmentId) {
        return agreementSegmentService.updateAgreementSegment(
          agreementSegmentId,
          data as UpdateAgreementSegmentRequest
        )
      }
      return agreementSegmentService.createAgreementSegment(
        data as CreateAgreementSegmentRequest
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SEGMENTS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshAgreementSegments() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENT_SEGMENTS_QUERY_KEY] })
  }, [queryClient])
}

export function useAllAgreementSegments() {
  return useQuery({
    queryKey: [AGREEMENT_SEGMENTS_QUERY_KEY, 'all'],
    queryFn: () => agreementSegmentService.getAllAgreementSegments(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
  })
}
