import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  standingInstructionService,
  type StandingInstructionFilters,
  type CreateStandingInstructionRequest,
  type UpdateStandingInstructionRequest,
  type StandingInstructionDetailsData,
  type StandingInstructionReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Entitie/standingInstructionService'
import { StandingInstructionLabelsService } from '@/services/api/masterApi/Entitie/standingInstructionLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const STANDING_INSTRUCTIONS_QUERY_KEY = 'standingInstructions'

// Enhanced hook to fetch all standing instructions with pagination and filters
export function useStandingInstructions(
  page = 0,
  size = 20,
  filters?: StandingInstructionFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      STANDING_INSTRUCTIONS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      standingInstructionService.getStandingInstructions(
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

export function useStandingInstruction(id: string) {
  return useQuery({
    queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY, id],
    queryFn: () => standingInstructionService.getStandingInstruction(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateStandingInstruction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStandingInstructionRequest) =>
      standingInstructionService.createStandingInstruction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdateStandingInstruction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateStandingInstructionRequest
    }) => standingInstructionService.updateStandingInstruction(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteStandingInstruction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => standingInstructionService.deleteStandingInstruction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function useStandingInstructionLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['standingInstructionLabels'],
    queryFn: async () => {
      const rawLabels = await standingInstructionService.getStandingInstructionLabels()
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

export function useRefreshStandingInstructions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY] })
  }
}

export function useStandingInstructionLabelsWithUtils() {
  const query = useStandingInstructionLabels()

  return {
    ...query,
    hasLabels: () => StandingInstructionLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      StandingInstructionLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      StandingInstructionLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveStandingInstructionDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      standingInstructionId,
    }: {
      data: StandingInstructionDetailsData
      isEditing?: boolean
      standingInstructionId?: string | undefined
    }) =>
      standingInstructionService.saveStandingInstructionDetails(data, isEditing, standingInstructionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY] })
      if (variables.standingInstructionId) {
        queryClient.invalidateQueries({
          queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY, variables.standingInstructionId],
        })
        queryClient.invalidateQueries({
          queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY, 'stepStatus', variables.standingInstructionId],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveStandingInstructionReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StandingInstructionReviewData) =>
      standingInstructionService.saveStandingInstructionReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useStandingInstructionStepData(step: number) {
  return useQuery({
    queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY, 'step', step],
    queryFn: () => standingInstructionService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidateStandingInstructionStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      standingInstructionService.validateStep(step, data),
    retry: 1,
  })
}

export function useStandingInstructionStepStatus(standingInstructionId: string) {
  return useQuery({
    queryKey: [STANDING_INSTRUCTIONS_QUERY_KEY, 'stepStatus', standingInstructionId],
    queryFn: async () => {
      if (!standingInstructionId || standingInstructionId.trim() === '') {
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
          standingInstructionService.getStandingInstruction(standingInstructionId),
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
    enabled: !!standingInstructionId && standingInstructionId.trim() !== '',
    staleTime: 0,
    retry: 1,
  })
}

// Unified step management hook
export function useStandingInstructionStepManager() {
  const saveDetails = useSaveStandingInstructionDetails()
  const saveReview = useSaveStandingInstructionReview()
  const validateStep = useValidateStandingInstructionStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      standingInstructionId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as StandingInstructionDetailsData,
            isEditing,
            standingInstructionId: standingInstructionId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as StandingInstructionReviewData)
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
