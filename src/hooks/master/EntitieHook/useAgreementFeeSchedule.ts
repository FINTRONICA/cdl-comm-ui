import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  agreementFeeScheduleService,
  type AgreementFeeScheduleFilters,
  type CreateAgreementFeeScheduleRequest,
  type UpdateAgreementFeeScheduleRequest,
  type AgreementFeeScheduleDetailsData,
  type AgreementFeeScheduleReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Entitie/agreementFeeScheduleService'
import { AgreementFeeScheduleLabelsService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const AGREEMENT_FEE_SCHEDULES_QUERY_KEY = 'agreementFeeSchedules'

// Enhanced hook to fetch all agreement fee schedules with pagination and filters
export function useAgreementFeeSchedules(
  page = 0,
  size = 20,
  filters?: AgreementFeeScheduleFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENT_FEE_SCHEDULES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementFeeScheduleService.getAgreementFeeSchedules(
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

export function useAgreementFeeSchedule(id: string) {
  return useQuery({
    queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY, id],
    queryFn: () => agreementFeeScheduleService.getAgreementFeeSchedule(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateAgreementFeeSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementFeeScheduleRequest) =>
      agreementFeeScheduleService.createAgreementFeeSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdateAgreementFeeSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateAgreementFeeScheduleRequest
    }) => agreementFeeScheduleService.updateAgreementFeeSchedule(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteAgreementFeeSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementFeeScheduleService.deleteAgreementFeeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useAgreementFeeScheduleLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['agreementFeeScheduleLabels'],
    queryFn: async () => {
      const rawLabels = await agreementFeeScheduleService.getAgreementFeeScheduleLabels()
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

export function useRefreshAgreementFeeSchedules() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY] })
  }
}

export function useAgreementFeeScheduleLabelsWithUtils() {
  const query = useAgreementFeeScheduleLabels()

  return {
    ...query,

    hasLabels: () => AgreementFeeScheduleLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      AgreementFeeScheduleLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      AgreementFeeScheduleLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveAgreementFeeScheduleDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      agreementFeeScheduleId,
    }: {
      data: AgreementFeeScheduleDetailsData
      isEditing?: boolean
      agreementFeeScheduleId?: string | undefined
    }) =>
      agreementFeeScheduleService.saveAgreementFeeScheduleDetails(data, isEditing, agreementFeeScheduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY] })
      if (variables.agreementFeeScheduleId) {
        queryClient.invalidateQueries({
          queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY, variables.agreementFeeScheduleId],
        })
        queryClient.invalidateQueries({
          queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY, 'stepStatus', variables.agreementFeeScheduleId],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveAgreementFeeScheduleReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AgreementFeeScheduleReviewData) =>
      agreementFeeScheduleService.saveAgreementFeeScheduleReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useAgreementFeeScheduleStepData(step: number) {
  return useQuery({
    queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY, 'step', step],
    queryFn: () => agreementFeeScheduleService.getStepData(step),
    enabled: step > 0 && step <= 3,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidateAgreementFeeScheduleStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      agreementFeeScheduleService.validateStep(step, data),
    retry: 1,
  })
}

export function useAgreementFeeScheduleStepStatus(agreementFeeScheduleId: string) {
  return useQuery({
    queryKey: [AGREEMENT_FEE_SCHEDULES_QUERY_KEY, 'stepStatus', agreementFeeScheduleId],
    queryFn: async () => {
      // Only fetch if agreementFeeScheduleId is valid
      if (!agreementFeeScheduleId || agreementFeeScheduleId.trim() === '') {
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

      const [step1Result] =
        await Promise.allSettled([
          agreementFeeScheduleService.getAgreementFeeSchedule(agreementFeeScheduleId),
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
    enabled: !!agreementFeeScheduleId && agreementFeeScheduleId.trim() !== '',
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useAgreementFeeScheduleStepManager() {
  const saveDetails = useSaveAgreementFeeScheduleDetails()
  const saveReview = useSaveAgreementFeeScheduleReview()
  const validateStep = useValidateAgreementFeeScheduleStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      agreementFeeScheduleId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as AgreementFeeScheduleDetailsData,
            isEditing,
            agreementFeeScheduleId: agreementFeeScheduleId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as AgreementFeeScheduleReviewData)
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveDetails, saveReview]
  )

  return {
    saveStep,
    validateStep,
    isLoading:
      saveDetails.isPending ||
      saveReview.isPending,
    error:
      saveDetails.error ||
      saveReview.error,
  }
}


