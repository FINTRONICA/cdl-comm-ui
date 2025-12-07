import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  paymentInstructionService,
  type PaymentInstructionFilters,
  type CreatePaymentInstructionRequest,
  type UpdatePaymentInstructionRequest,
  type PaymentInstructionDetailsData,
  type PaymentInstructionReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Payment/paymentInstructionService'
import { PaymentInstructionLabelsService } from '@/services/api/masterApi/Payment/paymentInstructionLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const PAYMENT_INSTRUCTIONS_QUERY_KEY = 'paymentInstructions'

// Enhanced hook to fetch all payment instructions with pagination and filters
export function usePaymentInstructions(
  page = 0,
  size = 20,
  filters?: PaymentInstructionFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      PAYMENT_INSTRUCTIONS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      paymentInstructionService.getPaymentInstructions(
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

export function usePaymentInstruction(id: string) {
  return useQuery({
    queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY, id],
    queryFn: () => paymentInstructionService.getPaymentInstruction(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreatePaymentInstruction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentInstructionRequest) =>
      paymentInstructionService.createPaymentInstruction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdatePaymentInstruction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdatePaymentInstructionRequest
    }) => paymentInstructionService.updatePaymentInstruction(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeletePaymentInstruction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => paymentInstructionService.deletePaymentInstruction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function usePaymentInstructionLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['paymentInstructionLabels'],
    queryFn: async () => {
      const rawLabels = await PaymentInstructionLabelsService.fetchLabels()
      return PaymentInstructionLabelsService.processLabels(rawLabels)
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useRefreshPaymentInstructions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY] })
  }
}

export function usePaymentInstructionLabelsWithUtils() {
  const query = usePaymentInstructionLabels()

  return {
    ...query,
    hasLabels: () => PaymentInstructionLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      PaymentInstructionLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      PaymentInstructionLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSavePaymentInstructionDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      paymentInstructionId,
    }: {
      data: PaymentInstructionDetailsData
      isEditing?: boolean
      paymentInstructionId?: string | undefined
    }) =>
      paymentInstructionService.savePaymentInstructionDetails(data, isEditing, paymentInstructionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY] })
      if (variables.paymentInstructionId) {
        queryClient.invalidateQueries({
          queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY, variables.paymentInstructionId],
        })
        queryClient.invalidateQueries({
          queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY, 'stepStatus', variables.paymentInstructionId],
        })
      }
    },
    retry: 2,
  })
}

export function useSavePaymentInstructionReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentInstructionReviewData) =>
      paymentInstructionService.savePaymentInstructionReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function usePaymentInstructionStepData(step: number) {
  return useQuery({
    queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY, 'step', step],
    queryFn: () => paymentInstructionService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidatePaymentInstructionStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      paymentInstructionService.validateStep(step, data),
    retry: 1,
  })
}

export function usePaymentInstructionStepStatus(paymentInstructionId: string) {
  return useQuery({
    queryKey: [PAYMENT_INSTRUCTIONS_QUERY_KEY, 'stepStatus', paymentInstructionId],
    queryFn: async () => {
      if (!paymentInstructionId || paymentInstructionId.trim() === '') {
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
          paymentInstructionService.getPaymentInstruction(paymentInstructionId),
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
    enabled: !!paymentInstructionId && paymentInstructionId.trim() !== '',
    staleTime: 0,
    retry: 1,
  })
}

// Unified step management hook
export function usePaymentInstructionStepManager() {
  const saveDetails = useSavePaymentInstructionDetails()
  const saveReview = useSavePaymentInstructionReview()
  const validateStep = useValidatePaymentInstructionStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      paymentInstructionId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as PaymentInstructionDetailsData,
            isEditing,
            paymentInstructionId: paymentInstructionId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as PaymentInstructionReviewData)
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
