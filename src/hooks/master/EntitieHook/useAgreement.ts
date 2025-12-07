import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  agreementService,
  type AgreementFilters,
  type CreateAgreementRequest,
  type UpdateAgreementRequest,
  type AgreementDetailsData,

  type AgreementReviewData,
  type StepValidationResponse,
  
} from '@/services/api/masterApi/Entitie/agreementService'
import { AgreementLabelsService } from '@/services/api/masterApi/Entitie/agreementLabelsService'
import { useIsAuthenticated } from '@/hooks'

export const AGREEMENTS_QUERY_KEY = 'agreements'

// Enhanced hook to fetch all build partners with pagination and filters
export function useAgreements(
  page = 0,
  size = 20,
  filters?: AgreementFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      AGREEMENTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementService.getAgreements(
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

export function useAgreement(id: string) {
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, id],
    queryFn: () => agreementService.getAgreement(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateAgreement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementRequest) =>
      agreementService.createAgreement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdateAgreement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateAgreementRequest
    }) => agreementService.updateAgreement(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [AGREEMENTS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteAgreement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementService.deleteAgreement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useAgreementLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['agreementLabels'],
    queryFn: async () => {
      const rawLabels = await agreementService.getAgreementLabels()
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

export function useRefreshAgreements() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] })
  }
}

export function useAgreementLabelsWithUtils() {
  const query = useAgreementLabels()

  return {
    ...query,

    hasLabels: () => AgreementLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      AgreementLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      AgreementLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveAgreementDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
    }: {
      data: AgreementDetailsData
      isEditing?: boolean
      developerId?: string | undefined
    }) =>
      agreementService.saveAgreementDetails(data, isEditing, developerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] })
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [AGREEMENTS_QUERY_KEY, variables.developerId],
        })
        queryClient.invalidateQueries({
          queryKey: [AGREEMENTS_QUERY_KEY, 'stepStatus', variables.developerId],
        })
      }
    },
    retry: 2,
  })
}





export function useSaveAgreementReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AgreementReviewData) =>
      agreementService.saveAgreementReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useAgreementStepData(step: number) {
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, 'step', step],
    queryFn: () => agreementService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidateAgreementStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      agreementService.validateStep(step, data),
    retry: 1,
  })
}

export function useAgreementStepStatus(agreementId: string) {
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, 'stepStatus', agreementId],
    queryFn: async () => {
      // Only fetch if agreementId is valid
      if (!agreementId || agreementId.trim() === '') {
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
          agreementService.getAgreement(agreementId),
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
    enabled: !!agreementId && agreementId.trim() !== '',
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useAgreementStepManager() {
  const saveDetails = useSaveAgreementDetails()
 
  const saveReview = useSaveAgreementReview()
  const validateStep = useValidateAgreementStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      agreementId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as AgreementDetailsData,
            isEditing,
            developerId: agreementId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as AgreementReviewData)
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


