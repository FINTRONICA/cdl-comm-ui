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

export function useAgreementSignatory(id: string) {
  return useQuery({
    queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY, id],
    queryFn: () => agreementSignatoryService.getAgreementSignatory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
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
    retry: 2,
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
    retry: 2,
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
    refetchOnWindowFocus: false,
    retry: 3,
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
    retry: 2,
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
    retry: 2,
  })
}

export function useAgreementSignatoryStepData(step: number) {
  return useQuery({
    queryKey: [AGREEMENT_SIGNATORIES_QUERY_KEY, 'step', step],
    queryFn: () => agreementSignatoryService.getStepData(step),
    enabled: step > 0 && step <= 3,
    staleTime: 5 * 60 * 1000,
    retry: 3,
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
    enabled: !!agreementSignatoryId && agreementSignatoryId.trim() !== '',
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
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


