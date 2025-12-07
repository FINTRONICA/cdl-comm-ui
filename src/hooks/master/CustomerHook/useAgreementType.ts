import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import React from 'react'
import {
  agreementTypeService,
  type AgreementTypeFilters,
  type CreateAgreementTypeRequest,
  type UpdateAgreementTypeRequest,
} from '@/services/api/masterApi/Customer/agreementTypeService'

export const AGREEMENT_TYPES_QUERY_KEY = 'agreementTypes'

export function useAgreementTypes(
  page = 0,
  size = 20,
  filters?: AgreementTypeFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENT_TYPES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: async () => {
      try {
        const result = await agreementTypeService.getAgreementTypes(
          pagination.page,
          pagination.size,
          filters
        )
        return result
      } catch (error) {
        console.error('Error fetching agreement types:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
    retry: 3,
  })

  // Update pagination state when data changes
  React.useEffect(() => {
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
  }, [query.data?.page, apiPagination.totalElements, apiPagination.totalPages])

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

export function useAgreementType(id: string | null) {
  return useQuery({
    queryKey: [AGREEMENT_TYPES_QUERY_KEY, id],
    queryFn: () => agreementTypeService.getAgreementType(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteAgreementType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementTypeService.deleteAgreementType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_TYPES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveAgreementType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      agreementTypeId,
    }: {
      data: CreateAgreementTypeRequest | UpdateAgreementTypeRequest
      isEditing: boolean
      agreementTypeId?: string
    }) => {
      if (isEditing && agreementTypeId) {
        return agreementTypeService.updateAgreementType(agreementTypeId, data as UpdateAgreementTypeRequest)
      } else {
        return agreementTypeService.createAgreementType(data as CreateAgreementTypeRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_TYPES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshAgreementTypes() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENT_TYPES_QUERY_KEY] })
  }, [queryClient])
}

export function useAllAgreementTypes() {
  return useQuery({
    queryKey: [AGREEMENT_TYPES_QUERY_KEY, 'all'],
    queryFn: async () => {
      try {
        const result = await agreementTypeService.getAllAgreementTypes()
        if (process.env.NODE_ENV === 'development') {
          console.log('useAllAgreementTypes result:', result)
        }
        return result
      } catch (error) {
        console.error('Error in useAllAgreementTypes:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts
    retry: 3,
  })
}

