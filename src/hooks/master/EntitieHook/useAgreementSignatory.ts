import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  agreementSignatoryService,
  type AgreementSignatoryFilters,
  type CreateAgreementSignatoryRequest,
  type UpdateAgreementSignatoryRequest,
  type AgreementSignatoryDetailsData,
  type AgreementSignatoryReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Entitie/agreementSignatoryService'
import { AgreementSignatoryLabelsService } from '@/services/api/masterApi/Entitie/agreementSignatoryLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const AGREEMENT_SIGNATORIES_QUERY_KEY = 'agreementSignatories'

// Enhanced hook to fetch all agreement signatories with pagination and filters
export function useAgreementSignatories(
  page = 0,
  size = 20,
  filters?: AgreementSignatoryFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENT_SIGNATORIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementSignatoryService.getAgreementSignatories(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Reduce retries to prevent 500 error storms
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

export function useAgreementSignatory(id: string) {
  return useQuery({
    queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY, id],
    queryFn: () => agreementSignatoryService.getAgreementSignatory(id),
    enabled: !!id && id.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Reduce retries to prevent 500 error storms
  })
}

// Hook to fetch agreement signatory documents
export function useAgreementSignatoryDocuments(
  agreementSignatoryId: string,
  module: string = 'AGREEMENT_SIGNATORY',
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: [
      AGREEMENT_SIGNATORIES_QUERY_KEY,
      'documents',
      agreementSignatoryId,
      module,
      page,
      size,
    ],
    queryFn: () =>
      agreementSignatoryService.getAgreementSignatoryDocuments(
        agreementSignatoryId,
        module,
        page,
        size
      ),
    enabled: !!agreementSignatoryId && agreementSignatoryId.trim() !== '',
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 500 errors to prevent error storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      return failureCount < 1
    },
  })
}

export function useCreateAgreementSignatory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementSignatoryRequest) =>
      agreementSignatoryService.createAgreementSignatory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY] })
    },
    retry: 1,
  })
}

export function useUpdateAgreementSignatory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateAgreementSignatoryRequest
    }) => agreementSignatoryService.updateAgreementSignatory(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY, id],
      })
    },
    retry: 1,
  })
}

export function useDeleteAgreementSignatory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementSignatoryService.deleteAgreementSignatory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useAgreementSignatoryLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['agreementSignatoryLabels'],
    queryFn: async () => {
      const rawLabels = await agreementSignatoryService.getAgreementSignatoryLabels()
      // Process the raw API response into the expected format
      return rawLabels.reduce(
        (
          processed: Record<string, Record<string, string>>,
          {
            key,
            value,
            language,
          }: { key: string; value: string; language: string }
        ) => {
          if (!processed[key]) {
            processed[key] = {}
          }
          processed[key][language] = value
          return processed
        },
        {} as Record<string, Record<string, string>>
      )
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  })
}

export function useRefreshAgreementSignatories() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY] })
  }
}

export function useAgreementSignatoryLabelsWithUtils() {
  const query = useAgreementSignatoryLabels()

  return {
    ...query,
    hasLabels: () => AgreementSignatoryLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      AgreementSignatoryLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      AgreementSignatoryLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveAgreementSignatoryDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      agreementSignatoryId,
    }: {
      data: AgreementSignatoryDetailsData
      isEditing?: boolean
      agreementSignatoryId?: string | undefined
    }) =>
      agreementSignatoryService.saveAgreementSignatoryDetails(
        data,
        isEditing,
        agreementSignatoryId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY] })
      if (variables.agreementSignatoryId) {
        queryClient.invalidateQueries({
          queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY, variables.agreementSignatoryId],
        })
        queryClient.invalidateQueries({
          queryKey: [
            AGREEMENT_SIGNATORIES_QUERY_KEY,
            'stepStatus',
            variables.agreementSignatoryId,
          ],
        })
      }
    },
    retry: 1,
  })
}

export function useSaveAgreementSignatoryReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AgreementSignatoryReviewData) =>
      agreementSignatoryService.saveAgreementSignatoryReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY] })
    },
    retry: 1,
  })
}

export function useAgreementSignatoryStepData(step: number) {
  return useQuery({
    queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY, 'step', step],
    queryFn: () => agreementSignatoryService.getStepData(step),
    enabled: step > 0 && step <= 3,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useValidateAgreementSignatoryStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      agreementSignatoryService.validateStep(step, data),
    retry: 1,
  })
}

export function useAgreementSignatoryStepStatus(agreementSignatoryId: string) {
  // Use the existing hook to avoid duplicate API calls
  const agreementSignatoryQuery = useAgreementSignatory(agreementSignatoryId)

  return useQuery({
    queryKey: [
      AGREEMENT_SIGNATORIES_QUERY_KEY,
      'stepStatus',
      agreementSignatoryId,
    ],
    queryFn: async () => {
      // Only fetch if agreementSignatoryId is valid
      if (!agreementSignatoryId || agreementSignatoryId.trim() === '') {
        return {
          step1: false,
          lastCompletedStep: 0,
          stepData: {
            step1: null,
          },
          errors: {
            step1: null,
          },
        }
      }

      // Use the cached data from useAgreementSignatory if available
      // This prevents duplicate API calls
      if (agreementSignatoryQuery.data) {
        return {
          step1: true,
          lastCompletedStep: 1,
          stepData: {
            step1: agreementSignatoryQuery.data,
          },
          errors: {
            step1: null,
          },
        }
      }

      // If data is loading, wait for it instead of making another call
      if (agreementSignatoryQuery.isLoading) {
        // Return a pending state - the query will refetch when data is available
        return {
          step1: false,
          lastCompletedStep: 0,
          stepData: {
            step1: null,
          },
          errors: {
            step1: null,
          },
        }
      }

      // Fallback: only fetch if not in cache and not loading (should rarely happen)
      const [step1Result] = await Promise.allSettled([
        agreementSignatoryService.getAgreementSignatory(agreementSignatoryId),
      ])

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step1) stepStatus.lastCompletedStep = 1

      return stepStatus
    },
    enabled:
      !!agreementSignatoryId &&
      agreementSignatoryId.trim() !== '' &&
      !agreementSignatoryQuery.isLoading, // Don't run if main query is loading
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (was 0, causing constant refetches)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Reduce retries to prevent 500 error storms
  })
}

// Unified step management hook
export function useAgreementSignatoryStepManager() {
  const saveDetails = useSaveAgreementSignatoryDetails()
  const saveReview = useSaveAgreementSignatoryReview()
  const validateStep = useValidateAgreementSignatoryStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      agreementSignatoryId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as AgreementSignatoryDetailsData,
            isEditing,
            agreementSignatoryId: agreementSignatoryId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as AgreementSignatoryReviewData)
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveDetails, saveReview]
  )

  return {
    saveStep,
    validateStep,
    isLoading: saveDetails.isPending || saveReview.isPending,
    error: saveDetails.error || saveReview.error,
  }
}


