import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  agreementSubTypeService,
  type AgreementSubTypeFilters,
  type CreateAgreementSubTypeRequest,
  type UpdateAgreementSubTypeRequest,
} from '@/services/api/masterApi/Customer/agreementSubTypeService'

export const AGREEMENT_SUB_TYPES_QUERY_KEY = 'agreementSubTypes'

export function useAgreementSubTypes(
  page = 0,
  size = 20,
  filters?: AgreementSubTypeFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENT_SUB_TYPES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementSubTypeService.getAgreementSubTypes(
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

export function useAgreementSubType(id: string | null) {
  return useQuery({
      queryKey: [AGREEMENT_SUB_TYPES_QUERY_KEY, id],
    queryFn: () => agreementSubTypeService.getAgreementSubType(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteAgreementSubType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementSubTypeService.deleteAgreementSubType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SUB_TYPES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveAgreementSubType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      agreementSubTypeId,
    }: {
      data: CreateAgreementSubTypeRequest | UpdateAgreementSubTypeRequest
      isEditing: boolean
      agreementSubTypeId?: string
    }) => {
      if (isEditing && agreementSubTypeId) {
        return agreementSubTypeService.updateAgreementSubType(agreementSubTypeId, data as UpdateAgreementSubTypeRequest)
      } else {
        return agreementSubTypeService.createAgreementSubType(data as CreateAgreementSubTypeRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SUB_TYPES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshAgreementSubTypes() {
  const queryClient = useQueryClient()
  return useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SUB_TYPES_QUERY_KEY] })
  }, [queryClient])
}

