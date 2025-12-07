import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  standingInstructionBeneficiaryService,
  type StandingInstructionBeneficiaryFilters,
  type CreateStandingInstructionBeneficiaryRequest,
  type UpdateStandingInstructionBeneficiaryRequest,
  type StandingInstructionBeneficiaryDetailsData,
  type StandingInstructionBeneficiaryReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Entitie/standingInstructionBeneficiaryService'
import { StandingInstructionBeneficiaryLabelsService } from '@/services/api/masterApi/Entitie/standingInstructionBeneficiaryLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY = 'standingInstructionBeneficiaries'

// Enhanced hook to fetch all standing instruction beneficiaries with pagination and filters
export function useStandingInstructionBeneficiaries(
  page = 0,
  size = 20,
  filters?: StandingInstructionBeneficiaryFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      standingInstructionBeneficiaryService.getStandingInstructionBeneficiaries(
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

export function useStandingInstructionBeneficiary(id: string) {
  return useQuery({
    queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY, id],
    queryFn: () => standingInstructionBeneficiaryService.getStandingInstructionBeneficiary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateStandingInstructionBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStandingInstructionBeneficiaryRequest) =>
      standingInstructionBeneficiaryService.createStandingInstructionBeneficiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdateStandingInstructionBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateStandingInstructionBeneficiaryRequest
    }) => standingInstructionBeneficiaryService.updateStandingInstructionBeneficiary(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteStandingInstructionBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => standingInstructionBeneficiaryService.deleteStandingInstructionBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useStandingInstructionBeneficiaryLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['standingInstructionBeneficiaryLabels'],
    queryFn: async () => {
      const rawLabels = await standingInstructionBeneficiaryService.getStandingInstructionBeneficiaryLabels()
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

export function useRefreshStandingInstructionBeneficiaries() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY] })
  }
}

export function useStandingInstructionBeneficiaryLabelsWithUtils() {
  const query = useStandingInstructionBeneficiaryLabels()

  return {
    ...query,
    hasLabels: () => StandingInstructionBeneficiaryLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      StandingInstructionBeneficiaryLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      StandingInstructionBeneficiaryLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveStandingInstructionBeneficiaryDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      beneficiaryId,
    }: {
      data: StandingInstructionBeneficiaryDetailsData
      isEditing?: boolean
      beneficiaryId?: string | undefined
    }) =>
      standingInstructionBeneficiaryService.saveStandingInstructionBeneficiaryDetails(data, isEditing, beneficiaryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY] })
      if (variables.beneficiaryId) {
        queryClient.invalidateQueries({
          queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY, variables.beneficiaryId],
        })
        queryClient.invalidateQueries({
          queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY, 'stepStatus', variables.beneficiaryId],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveStandingInstructionBeneficiaryReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StandingInstructionBeneficiaryReviewData) =>
      standingInstructionBeneficiaryService.saveStandingInstructionBeneficiaryReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useStandingInstructionBeneficiaryStepData(step: number) {
  return useQuery({
    queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY, 'step', step],
    queryFn: () => standingInstructionBeneficiaryService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidateStandingInstructionBeneficiaryStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      standingInstructionBeneficiaryService.validateStep(step, data),
    retry: 1,
  })
}

export function useStandingInstructionBeneficiaryStepStatus(beneficiaryId: string) {
  return useQuery({
    queryKey: [STANDING_INSTRUCTION_BENEFICIARIES_QUERY_KEY, 'stepStatus', beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId || beneficiaryId.trim() === '') {
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
          standingInstructionBeneficiaryService.getStandingInstructionBeneficiary(beneficiaryId),
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

      if (stepStatus.step1) stepStatus.lastCompletedStep = 1
      
      return stepStatus
    },
    enabled: !!beneficiaryId && beneficiaryId.trim() !== '',
    staleTime: 0,
    retry: 1,
  })
}

// Unified step management hook
export function useStandingInstructionBeneficiaryStepManager() {
  const saveDetails = useSaveStandingInstructionBeneficiaryDetails()
  const saveReview = useSaveStandingInstructionBeneficiaryReview()
  const validateStep = useValidateStandingInstructionBeneficiaryStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      beneficiaryId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as StandingInstructionBeneficiaryDetailsData,
            isEditing,
            beneficiaryId: beneficiaryId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as StandingInstructionBeneficiaryReviewData)
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
