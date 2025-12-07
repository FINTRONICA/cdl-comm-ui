import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  beneficiaryService,
  type MasterBeneficiaryFilters,
  type MasterBeneficiaryData,
  type UpdateMasterBeneficiaryData,
  type BeneficiaryReviewData,
} from '@/services/api/masterApi/Customer/beneficiaryService'

export const BENEFICIARIES_QUERY_KEY = 'masterBeneficiaries'

// Enhanced hook to fetch all beneficiaries with pagination and filters
export function useBeneficiaries(
  page = 0,
  size = 20,
  filters?: MasterBeneficiaryFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      BENEFICIARIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      beneficiaryService.getBeneficiaries(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
    retry: 3,
  })

  // Update API pagination when data changes
  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (JSON.stringify(newApiPagination) !== JSON.stringify(apiPagination)) {
      setApiPagination(newApiPagination)
    }
  }

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newPage,
      size: newSize !== undefined ? newSize : prev.size,
    }))
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

export function useBeneficiary(id: string) {
  return useQuery({
    queryKey: [BENEFICIARIES_QUERY_KEY, id],
    queryFn: () => beneficiaryService.getBeneficiary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useSaveBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      beneficiaryId,
    }: {
      data: MasterBeneficiaryData
      isEditing?: boolean
      beneficiaryId?: string | number
    }) => beneficiaryService.saveBeneficiary(data, isEditing, beneficiaryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BENEFICIARIES_QUERY_KEY] })
      if (variables.beneficiaryId) {
        queryClient.invalidateQueries({
          queryKey: [BENEFICIARIES_QUERY_KEY, variables.beneficiaryId],
        })
      }
    },
    retry: 2,
  })
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateMasterBeneficiaryData
    }) => beneficiaryService.updateBeneficiary(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [BENEFICIARIES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [BENEFICIARIES_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => beneficiaryService.deleteBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BENEFICIARIES_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useRefreshBeneficiaries() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [BENEFICIARIES_QUERY_KEY] })
  }
}

export function useBeneficiaryById(beneficiaryId: string | number | null) {
  return useQuery({
    queryKey: [BENEFICIARIES_QUERY_KEY, 'beneficiary', beneficiaryId],
    queryFn: () =>
      beneficiaryService.getBeneficiaryById(beneficiaryId as string),
    enabled: !!beneficiaryId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useSaveBeneficiaryReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BeneficiaryReviewData) =>
      beneficiaryService.saveBeneficiaryReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BENEFICIARIES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useBeneficiaryStepData(step: number, beneficiaryId?: string) {
  return useQuery({
    queryKey: [BENEFICIARIES_QUERY_KEY, 'step', step, beneficiaryId],
    queryFn: () => beneficiaryService.getStepData(step, beneficiaryId),
    enabled: step > 0 && step <= 3 && !!beneficiaryId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useBeneficiaryStepStatus(beneficiaryId: string) {
  return useQuery({
    queryKey: [BENEFICIARIES_QUERY_KEY, 'stepStatus', beneficiaryId],
    queryFn: async () => {
      const promiseResults = await Promise.allSettled([
        beneficiaryService.getBeneficiaryById(beneficiaryId),
        beneficiaryService.getBeneficiaryDocuments(
          beneficiaryId,
          'BENEFICIARY',
          0,
          20
        ),
      ])

      const step1Result = promiseResults[0]
      const step2Result = promiseResults[1]

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        step2: step2Result.status === 'fulfilled' && step2Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
          step2: step2Result.status === 'fulfilled' ? step2Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
          step2: step2Result.status === 'rejected' ? step2Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step2) stepStatus.lastCompletedStep = 2
      else if (stepStatus.step1) stepStatus.lastCompletedStep = 1
      return stepStatus
    },
    enabled: !!beneficiaryId,
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useBeneficiaryStepManager() {
  const saveBeneficiary = useSaveBeneficiary()
  const saveReview = useSaveBeneficiaryReview()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      beneficiaryId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveBeneficiary.mutateAsync({
            data: data as MasterBeneficiaryData,
            isEditing,
            ...(beneficiaryId && { beneficiaryId }),
          })
        case 2:
          // Document upload is handled separately
          throw new Error('Document upload should use uploadBeneficiaryDocument')
        case 3:
          return await saveReview.mutateAsync(data as BeneficiaryReviewData)
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveBeneficiary, saveReview]
  )

  return {
    saveStep,
    isLoading: saveBeneficiary.isPending || saveReview.isPending,
    error: saveBeneficiary.error || saveReview.error,
  }
}

// Hook for fetching beneficiary documents with pagination
export function useBeneficiaryDocuments(
  beneficiaryId?: string,
  module: string = 'BENEFICIARY',
  page = 0,
  size = 20
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      BENEFICIARIES_QUERY_KEY,
      'documents',
      beneficiaryId,
      module,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: () =>
      beneficiaryService.getBeneficiaryDocuments(
        beneficiaryId!,
        module,
        pagination.page,
        pagination.size
      ),
    enabled: !!beneficiaryId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })

  // Update API pagination when data changes
  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (JSON.stringify(newApiPagination) !== JSON.stringify(apiPagination)) {
      setApiPagination(newApiPagination)
    }
  }

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newPage,
      size: newSize !== undefined ? newSize : prev.size,
    }))
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

// Hook for uploading beneficiary documents
export function useUploadBeneficiaryDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      entityId,
      module,
      documentType,
    }: {
      file: File
      entityId: string
      module: string
      documentType?: string
    }) =>
      beneficiaryService.uploadBeneficiaryDocument(
        file,
        entityId,
        module,
        documentType
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BENEFICIARIES_QUERY_KEY, 'documents', variables.entityId],
      })
    },
    retry: 2,
  })
}
