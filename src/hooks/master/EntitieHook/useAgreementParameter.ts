import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  agreementParameterService,
  type AgreementParameterFilters,
  type CreateAgreementParameterRequest,
  type UpdateAgreementParameterRequest,
  type AgreementParameterDetailsData,
  type AgreementParameterReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Entitie/agreementParameterService'
import { AgreementParameterLabelsService } from '@/services/api/masterApi/Entitie/agreementParameterLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const AGREEMENT_PARAMETERS_QUERY_KEY = 'agreementParameters'

// Enhanced hook to fetch all agreement parameters with pagination and filters
export function useAgreementParameters(
  page = 0,
  size = 20,
  filters?: AgreementParameterFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENT_PARAMETERS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementParameterService.getAgreementParameters(
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

export function useAgreementParameter(id: string) {
  return useQuery({
    queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY, id],
    queryFn: () => agreementParameterService.getAgreementParameter(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateAgreementParameter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementParameterRequest) =>
      agreementParameterService.createAgreementParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdateAgreementParameter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateAgreementParameterRequest
    }) => agreementParameterService.updateAgreementParameter(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteAgreementParameter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementParameterService.deleteAgreementParameter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useAgreementParameterLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['agreementParameterLabels'],
    queryFn: async () => {
      const rawLabels = await agreementParameterService.getAgreementParameterLabels()
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

export function useRefreshAgreementParameters() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY] })
  }
}

export function useAgreementParameterLabelsWithUtils() {
  const query = useAgreementParameterLabels()

  return {
    ...query,

    hasLabels: () => AgreementParameterLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      AgreementParameterLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      AgreementParameterLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveAgreementParameterDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      agreementParameterId,
    }: {
      data: AgreementParameterDetailsData
      isEditing?: boolean
      agreementParameterId?: string | undefined
    }) =>
      agreementParameterService.saveAgreementParameterDetails(
        data,
        isEditing,
        agreementParameterId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY] })
      if (variables.agreementParameterId) {
        queryClient.invalidateQueries({
          queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY, variables.agreementParameterId],
        })
        queryClient.invalidateQueries({
          queryKey: [
            AGREEMENT_PARAMETERS_QUERY_KEY,
            'stepStatus',
            variables.agreementParameterId,
          ],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveAgreementParameterReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AgreementParameterReviewData) =>
      agreementParameterService.saveAgreementParameterReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useAgreementParameterStepData(step: number) {
  return useQuery({
    queryKey: [AGREEMENT_PARAMETERS_QUERY_KEY, 'step', step],
    queryFn: () => agreementParameterService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidateAgreementParameterStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      agreementParameterService.validateStep(step, data),
    retry: 1,
  })
}

export function useAgreementParameterStepStatus(agreementParameterId: string) {
  return useQuery({
    queryKey: [
      AGREEMENT_PARAMETERS_QUERY_KEY,
      'stepStatus',
      agreementParameterId,
    ],
    queryFn: async () => {
      // Only fetch if agreementParameterId is valid
      if (!agreementParameterId || agreementParameterId.trim() === '') {
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
        agreementParameterService.getAgreementParameter(agreementParameterId),
      ])

      const stepStatus = {
        step1:
          step1Result.status === 'fulfilled' && step1Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1:
            step1Result.status === 'fulfilled' ? step1Result.value : null,
        },
        errors: {
          step1:
            step1Result.status === 'rejected' ? step1Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step1) stepStatus.lastCompletedStep = 1

      return stepStatus
    },
    enabled: !!agreementParameterId && agreementParameterId.trim() !== '',
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useAgreementParameterStepManager() {
  const saveDetails = useSaveAgreementParameterDetails()
  const saveReview = useSaveAgreementParameterReview()
  const validateStep = useValidateAgreementParameterStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      agreementParameterId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as AgreementParameterDetailsData,
            isEditing,
            agreementParameterId: agreementParameterId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as AgreementParameterReviewData)
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


