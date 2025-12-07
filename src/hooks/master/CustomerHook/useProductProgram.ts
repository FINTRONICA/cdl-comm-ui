import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  productProgramService,
  type ProductProgramFilters,
  type CreateProductProgramRequest,
  type UpdateProductProgramRequest,
} from '@/services/api/masterApi/Customer/productProgramService'

export const PRODUCT_PROGRAMS_QUERY_KEY = 'productPrograms'

export function useProductPrograms(
  page = 0,
  size = 20,
  filters?: ProductProgramFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      PRODUCT_PROGRAMS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      productProgramService.getProductPrograms(
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

export function useProductProgram(id: string | null) {
  return useQuery({
    queryKey: [PRODUCT_PROGRAMS_QUERY_KEY, id],
    queryFn: () => productProgramService.getProductProgram(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useDeleteProductProgram() {
  const queryClient = useQueryClient()

  return useMutation({
          mutationFn: (id: string) => productProgramService.deleteProductProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_PROGRAMS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useSaveProductProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      productProgramId,
    }: {
      data: CreateProductProgramRequest | UpdateProductProgramRequest
      isEditing: boolean
      productProgramId?: string
    }) => {
      if (isEditing && productProgramId) {
          return productProgramService.updateProductProgram(productProgramId, data as UpdateProductProgramRequest)
      } else {
        return productProgramService.createProductProgram(data as CreateProductProgramRequest)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_PROGRAMS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useRefreshProductPrograms() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [PRODUCT_PROGRAMS_QUERY_KEY] })
  }, [queryClient])
}

export function useAllProductPrograms() {
  return useQuery({
    queryKey: [PRODUCT_PROGRAMS_QUERY_KEY, 'all'],
    queryFn: () => productProgramService.getAllProductPrograms(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

