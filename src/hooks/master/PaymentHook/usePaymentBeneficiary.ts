import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  paymentBeneficiaryService,
  type PaymentBeneficiaryFilters,
  type CreatePaymentBeneficiaryRequest,
  type UpdatePaymentBeneficiaryRequest,
  type PaymentBeneficiaryDetailsData,
  type PaymentBeneficiaryReviewData,
  type StepValidationResponse,
} from '@/services/api/masterApi/Payment/paymentBeneficiaryService'
import { PaymentBeneficiaryLabelsService } from '@/services/api/masterApi/Payment/paymentBeneficiaryLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const PAYMENT_BENEFICIARIES_QUERY_KEY = 'paymentBeneficiaries'

// Enhanced hook to fetch all payment beneficiaries with pagination and filters
export function usePaymentBeneficiaries(
  page = 0,
  size = 20,
  filters?: PaymentBeneficiaryFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      PAYMENT_BENEFICIARIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      paymentBeneficiaryService.getPaymentBeneficiaries(
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

export function usePaymentBeneficiary(id: string) {
  return useQuery({
    queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY, id],
    queryFn: () => paymentBeneficiaryService.getPaymentBeneficiary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreatePaymentBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentBeneficiaryRequest) =>
      paymentBeneficiaryService.createPaymentBeneficiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdatePaymentBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdatePaymentBeneficiaryRequest
    }) => paymentBeneficiaryService.updatePaymentBeneficiary(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeletePaymentBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => paymentBeneficiaryService.deletePaymentBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY] })
    },
    retry: 0,
  })
}

export function usePaymentBeneficiaryLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['paymentBeneficiaryLabels'],
    queryFn: async () => {
      const rawLabels = await paymentBeneficiaryService.getPaymentBeneficiaryLabels()
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
    queryClient.invalidateQueries({ queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY] })
  }
}

export function usePaymentBeneficiaryLabelsWithUtils() {
  const query = usePaymentBeneficiaryLabels()

  return {
    ...query,
    hasLabels: () => PaymentBeneficiaryLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      PaymentBeneficiaryLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      PaymentBeneficiaryLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSavePaymentBeneficiaryDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      beneficiaryId,
    }: {
      data: PaymentBeneficiaryDetailsData
      isEditing?: boolean
      beneficiaryId?: string | undefined
    }) =>
      paymentBeneficiaryService.savePaymentBeneficiaryDetails(data, isEditing, beneficiaryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY] })
      if (variables.beneficiaryId) {
        queryClient.invalidateQueries({
          queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY, variables.beneficiaryId],
        })
        queryClient.invalidateQueries({
          queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY, 'stepStatus', variables.beneficiaryId],
        })
      }
    },
    retry: 2,
  })
}

export function useSavePaymentBeneficiaryReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentBeneficiaryReviewData) =>
      paymentBeneficiaryService.savePaymentBeneficiaryReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function usePaymentBeneficiaryStepData(step: number) {
  return useQuery({
    queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY, 'step', step],
    queryFn: () => paymentBeneficiaryService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidatePaymentBeneficiaryStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      paymentBeneficiaryService.validateStep(step, data),
    retry: 1,
  })
}

export function usePaymentBeneficiaryStepStatus(beneficiaryId: string) {
  return useQuery({
    queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY, 'stepStatus', beneficiaryId],
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
          paymentBeneficiaryService.getPaymentBeneficiary(beneficiaryId),
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
export function usePaymentBeneficiaryStepManager() {
  const saveDetails = useSavePaymentBeneficiaryDetails()
  const saveReview = useSavePaymentBeneficiaryReview()
  const validateStep = useValidatePaymentBeneficiaryStep()

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
            data: data as PaymentBeneficiaryDetailsData,
            isEditing,
            beneficiaryId: beneficiaryId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as PaymentBeneficiaryReviewData)
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
