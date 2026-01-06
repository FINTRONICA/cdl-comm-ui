import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  buildPartnerService,
  type BuildPartnerFilters,
  type CreateBuildPartnerRequest,
  type UpdateBuildPartnerRequest,
  type BuildPartnerDetailsData,
  type BuildPartnerContactData,
  type BuildPartnerFeesData,
  type BuildPartnerBeneficiaryData,
  type UpdateBuildPartnerBeneficiaryData,
  type BuildPartnerReviewData,
  type StepValidationResponse,
  type BuildPartnerIndividualFeeData,
  type FeeUIData,
} from '@/services/api/buildPartnerService'
import { BuildPartnerLabelsService } from '@/services/api/buildPartnerLabelsService'
import { useIsAuthenticated } from './useAuthQuery'

export const BUILD_PARTNERS_QUERY_KEY = 'buildPartners'

// Enhanced hook to fetch all build partners with pagination and filters
export function useBuildPartners(
  page = 0,
  size = 20,
  filters?: BuildPartnerFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      BUILD_PARTNERS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      buildPartnerService.getBuildPartners(
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

export function useBuildPartner(id: string) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, id],
    queryFn: () => buildPartnerService.getBuildPartner(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateBuildPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBuildPartnerRequest) =>
      buildPartnerService.createBuildPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useUpdateBuildPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateBuildPartnerRequest
    }) => buildPartnerService.updateBuildPartner(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteBuildPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => buildPartnerService.deleteBuildPartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useBuildPartnerLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['buildPartnerLabels'],
    queryFn: async () => {
      const rawLabels = await buildPartnerService.getBuildPartnerLabels()
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

export function useRefreshBuildPartners() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
  }
}

export function useBuildPartnerLabelsWithUtils() {
  const query = useBuildPartnerLabels()

  return {
    ...query,

    hasLabels: () => BuildPartnerLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      BuildPartnerLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      BuildPartnerLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveBuildPartnerDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
    }: {
      data: BuildPartnerDetailsData
      isEditing?: boolean
      developerId?: string | undefined
    }) =>
      buildPartnerService.saveBuildPartnerDetails(data, isEditing, developerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [BUILD_PARTNERS_QUERY_KEY, variables.developerId],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveBuildPartnerContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
    }: {
      data: BuildPartnerContactData
      isEditing?: boolean
      developerId?: string | undefined
    }) =>
      buildPartnerService.saveBuildPartnerContact(data, isEditing, developerId),
    onSuccess: (_, variables) => {
      // Only invalidate specific queries, not the entire BUILD_PARTNERS_QUERY_KEY
      // This prevents the step status from being refetched and resetting the form
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'contacts'],
      })
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [BUILD_PARTNERS_QUERY_KEY, variables.developerId],
        })
      }
    },
    retry: 2,
  })
}

export function useDeleteBuildPartnerContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string | number) =>
      buildPartnerService.deleteBuildPartnerContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'contacts'],
      })
    },
    retry: 1,
  })
}

export function useBuildPartnerContactById(contactId: string | number | null) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, 'contact', contactId],
    queryFn: () =>
      buildPartnerService.getBuildPartnerContactById(contactId!.toString()),
    enabled: !!contactId,
    staleTime: 0,
    retry: 2,
  })
}

export function useDeleteBuildPartnerFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feeId: string | number) =>
      buildPartnerService.deleteBuildPartnerFee(feeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'fees'],
      })
    },
    retry: 1,
  })
}

export function useBuildPartnerFeeById(feeId: string | number | null) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, 'fee', feeId],
    queryFn: () =>
      buildPartnerService.getBuildPartnerFeeById(feeId!.toString()),
    enabled: !!feeId,
    staleTime: 0, // Always fetch fresh data when editing
    retry: 2,
  })
}

export function useSaveBuildPartnerFees() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
    }: {
      data: BuildPartnerFeesData
      isEditing?: boolean
      developerId?: string | undefined
    }) =>
      buildPartnerService.saveBuildPartnerFees(data, isEditing, developerId),
    onSuccess: (_, variables) => {
      // Only invalidate specific queries, not the entire BUILD_PARTNERS_QUERY_KEY
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'fees'],
      })
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [BUILD_PARTNERS_QUERY_KEY, variables.developerId],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveBuildPartnerIndividualFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
    }: {
      data: BuildPartnerIndividualFeeData
      isEditing?: boolean
      developerId?: string | undefined
    }) =>
      buildPartnerService.saveBuildPartnerIndividualFee(
        data,
        isEditing,
        developerId
      ),
    onSuccess: (_, variables) => {
      // Only invalidate specific queries, not the entire BUILD_PARTNERS_QUERY_KEY
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'fees'],
      })
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [BUILD_PARTNERS_QUERY_KEY, variables.developerId],
        })
      }
    },
    retry: 2,
  })
}

export function useSaveBuildPartnerBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
      beneficiaryId,
    }: {
      data: BuildPartnerBeneficiaryData
      isEditing?: boolean
      developerId?: string | undefined
      beneficiaryId?: string | number | undefined
    }) =>
      buildPartnerService.saveBuildPartnerBeneficiary(
        data,
        isEditing,
        developerId,
        beneficiaryId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiaries'],
      })
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [BUILD_PARTNERS_QUERY_KEY, variables.developerId],
        })
      }
    },
    retry: 2,
  })
}

export function useBuildPartnerBeneficiaries(
  buildPartnerId?: string,
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
      BUILD_PARTNERS_QUERY_KEY,
      'beneficiaries',
      buildPartnerId,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: () =>
      buildPartnerService.getBuildPartnerBeneficiariesPaginated(
        buildPartnerId,
        pagination.page,
        pagination.size
      ),
    enabled: !!buildPartnerId,
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

export function useBuildPartnerBeneficiary(id: string) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiaries', id],
    queryFn: () => buildPartnerService.getBuildPartnerBeneficiary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useBuildPartnerBeneficiaryById(
  beneficiaryId: string | number | null
) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiary', beneficiaryId],
    queryFn: () =>
      buildPartnerService.getBuildPartnerBeneficiaryById(
        beneficiaryId as string
      ),
    enabled: !!beneficiaryId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useUpdateBuildPartnerBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateBuildPartnerBeneficiaryData
    }) => buildPartnerService.updateBuildPartnerBeneficiary(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiaries'],
      })
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiaries', id],
      })
    },
    retry: 2,
  })
}

export function useDeleteBuildPartnerBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      buildPartnerService.deleteBuildPartnerBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiaries'],
      })
    },
    retry: 2,
  })
}

export function useSoftDeleteBuildPartnerBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      buildPartnerService.softDeleteBuildPartnerBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BUILD_PARTNERS_QUERY_KEY, 'beneficiaries'],
      })
    },
    retry: 2,
  })
}

export function useSaveBuildPartnerReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BuildPartnerReviewData) =>
      buildPartnerService.saveBuildPartnerReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUILD_PARTNERS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useBuildPartnerStepData(step: number) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, 'step', step],
    queryFn: () => buildPartnerService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useValidateBuildPartnerStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number
      data: unknown
    }): Promise<StepValidationResponse> =>
      buildPartnerService.validateStep(step, data),
    retry: 1,
  })
}

export function useBuildPartnerStepStatus(developerId: string) {
  return useQuery({
    queryKey: [BUILD_PARTNERS_QUERY_KEY, 'stepStatus', developerId],
    queryFn: async () => {
      const [step1Result, step2Result, step3Result, step4Result] =
        await Promise.allSettled([
          buildPartnerService.getBuildPartner(developerId),
          buildPartnerService.getBuildPartnerContact(developerId),
          buildPartnerService.getBuildPartnerFees(developerId),
          buildPartnerService.getBuildPartnerBeneficiary(developerId),
        ])

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        step2: step2Result.status === 'fulfilled' && step2Result.value !== null,
        step3: step3Result.status === 'fulfilled' && step3Result.value !== null,
        step4: step4Result.status === 'fulfilled' && step4Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
          step2: step2Result.status === 'fulfilled' ? step2Result.value : null,
          step3: step3Result.status === 'fulfilled' ? step3Result.value : null,
          step4: step4Result.status === 'fulfilled' ? step4Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
          step2: step2Result.status === 'rejected' ? step2Result.reason : null,
          step3: step3Result.status === 'rejected' ? step3Result.reason : null,
          step4: step4Result.status === 'rejected' ? step4Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step4) stepStatus.lastCompletedStep = 4
      else if (stepStatus.step3) stepStatus.lastCompletedStep = 3
      else if (stepStatus.step2) stepStatus.lastCompletedStep = 2
      else if (stepStatus.step1) stepStatus.lastCompletedStep = 1
      return stepStatus
    },
    enabled: !!developerId,
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useBuildPartnerStepManager() {
  const saveDetails = useSaveBuildPartnerDetails()
  const saveContact = useSaveBuildPartnerContact()
  const saveFees = useSaveBuildPartnerFees()
  const saveBeneficiary = useSaveBuildPartnerBeneficiary()
  const saveReview = useSaveBuildPartnerReview()
  const validateStep = useValidateBuildPartnerStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      developerId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as any,
            isEditing,
            developerId: developerId || undefined,
          })
        case 2:
          return await saveContact.mutateAsync({
            data: data as any,
            isEditing,
            developerId: developerId || undefined,
          })
        case 3:
          return await saveFees.mutateAsync({
            data: data as any,
            isEditing,
            developerId: developerId || undefined,
          })
        case 4:
          return await saveBeneficiary.mutateAsync({
            data: data as any,
            isEditing,
            developerId: developerId || undefined,
          })
        case 5:
          return await saveReview.mutateAsync(data as any)
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveDetails, saveContact, saveFees, saveBeneficiary, saveReview]
  )

  return {
    saveStep,
    validateStep,
    isLoading:
      saveDetails.isPending ||
      saveContact.isPending ||
      saveFees.isPending ||
      saveBeneficiary.isPending ||
      saveReview.isPending,
    error:
      saveDetails.error ||
      saveContact.error ||
      saveFees.error ||
      saveBeneficiary.error ||
      saveReview.error,
  }
}

// Hook for fetching build partner contacts with pagination
export function useBuildPartnerContacts(
  buildPartnerId?: string,
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
      BUILD_PARTNERS_QUERY_KEY,
      'contacts',
      buildPartnerId,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: () =>
      buildPartnerService.getBuildPartnerContactsPaginated(
        buildPartnerId!,
        pagination.page,
        pagination.size
      ),
    enabled: !!buildPartnerId,
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

// Hook for fetching build partner fees with UI transformation and pagination
export function useBuildPartnerFees(
  buildPartnerId?: string,
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
      BUILD_PARTNERS_QUERY_KEY,
      'fees',
      buildPartnerId,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: () =>
      buildPartnerService.getBuildPartnerFeesPaginated(
        buildPartnerId!,
        pagination.page,
        pagination.size
      ),
    enabled: !!buildPartnerId,
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
