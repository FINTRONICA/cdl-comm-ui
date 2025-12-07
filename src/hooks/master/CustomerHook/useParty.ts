import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'


import { partyService, type PartyFilters, type CreatePartyRequest, type UpdatePartyRequest, type PartyDetailsData, type PartyAuthorizedSignatoryData, type PartyReviewData, type StepValidationResponse} from '@/services/api/masterApi/Customer/partyService'
import { PartyLabelsService } from '@/services/api/masterApi/Customer/partyLabelsService'
import { useIsAuthenticated } from '@/hooks/useAuthQuery'

export const PARTIES_QUERY_KEY = 'parties'

// Enhanced hook to fetch all parties with pagination and filters
export function useBuildPartners(
  page = 0,
  size = 20,
  filters?: PartyFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      PARTIES_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      partyService.getParties(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
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
    queryKey: [PARTIES_QUERY_KEY, id],
    queryFn: () => partyService.getParty(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useCreateBuildPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePartyRequest) =>
      partyService.createParty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTIES_QUERY_KEY] })
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
      updates: UpdatePartyRequest
    }) => partyService.updateParty(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PARTIES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PARTIES_QUERY_KEY, id],
      })
    },
    retry: 2,
  })
}

export function useDeleteBuildPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => partyService.deleteParty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTIES_QUERY_KEY] })
    },
    retry: 0, // Disable retry to prevent multiple calls
  })
}

export function useDeleteParty() {
  return useDeleteBuildPartner()
}

export function useParties(
  page = 0,
  size = 20,
  filters?: PartyFilters
) {
  return useBuildPartners(page, size, filters)
}

export function useBuildPartnerLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['buildPartnerLabels'],
    queryFn: async () => {
      const rawLabels = await partyService.getPartyLabels()
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
    queryClient.invalidateQueries({ queryKey: [PARTIES_QUERY_KEY] })
  }
}

export function useBuildPartnerLabelsWithUtils() {
  const query = useBuildPartnerLabels()

  return {
    ...query,

    hasLabels: () => PartyLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
        PartyLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
        PartyLabelsService.getAvailableLanguages(query.data || {}),
  }
}

export function useSaveBuildPartnerDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      pa,
    }: {
      data: PartyDetailsData
      isEditing?: boolean
      pa?: string | undefined
    }) =>
      partyService.savePartyDetails(data, isEditing, pa),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PARTIES_QUERY_KEY] })
      if (variables.pa) {
        queryClient.invalidateQueries({
          queryKey: [PARTIES_QUERY_KEY, variables.pa],
        })
      }
    },
    retry: 2,
  })
}

export function useSavePartyAuthorizedSignatoryDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      partyId,
      authorizedSignatoryId,
    }: {
      data: PartyAuthorizedSignatoryData
      isEditing?: boolean
      partyId?: string | undefined
      authorizedSignatoryId?: string | number | undefined
    }) =>
      partyService.savePartyAuthorizedSignatoryDetails(data, isEditing, partyId, authorizedSignatoryId),
    onSuccess: (_, variables) => {
      // Only invalidate specific queries, not the entire PARTIES_QUERY_KEY
      // This prevents the step status from being refetched and resetting the form
      queryClient.invalidateQueries({
        queryKey: [PARTIES_QUERY_KEY, 'contacts'],
      })
      if (variables.partyId) {
        queryClient.invalidateQueries({
          queryKey: [PARTIES_QUERY_KEY, 'stepStatus', variables.partyId],
        })
        queryClient.invalidateQueries({
          queryKey: [PARTIES_QUERY_KEY, 'authorizedSignatory', variables.partyId],
        })
      }
    },
    retry: 2,
  })
}

export function useDeletePartyAuthorizedSignatoryDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (partyAuthorizedSignatoryId: string | number) =>
      partyService.deletePartyAuthorizedSignatoryDetails(partyAuthorizedSignatoryId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PARTIES_QUERY_KEY, 'contacts'],
      })
    },
    retry: 1,
  })
}

export function usePartyAuthorizedSignatoryById(partyAuthorizedSignatoryId: string | number | null) {
  return useQuery({
    queryKey: [PARTIES_QUERY_KEY, 'contact', partyAuthorizedSignatoryId],
    queryFn: () =>
      partyService.getPartyAuthorizedSignatoryById(partyAuthorizedSignatoryId!.toString()),
    enabled: !!partyAuthorizedSignatoryId,
    staleTime: 0,
    retry: 2,
  })
}







export function useSaveBuildPartnerReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PartyReviewData) =>
      partyService.savePartyReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTIES_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSavePartyReview() {
  return useSaveBuildPartnerReview()
}

export function usePartyStepData(step: number, partyId?: string) {
  return useQuery({
    queryKey: [PARTIES_QUERY_KEY, 'step', step, partyId],
    queryFn: () => partyService.getStepData(step, partyId),
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
      partyService.validateStep(step, data),
    retry: 1,
  })
}

export function usePartyStepStatus(partyId: string) {
  // This is the correct implementation
  return useQuery({
    queryKey: [PARTIES_QUERY_KEY, 'stepStatus', partyId],
    queryFn: async () => {
      const [step1Result, step2Result] =
        await Promise.allSettled([
          partyService.getParty(partyId),
          partyService.getPartyAuthorizedSignatory(partyId),
        ])

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        step2: step2Result.status === 'fulfilled' && Array.isArray(step2Result.value) && step2Result.value.length > 0,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
          step2: step2Result.status === 'fulfilled' ? step2Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
          step2: step2Result.status === 'rejected' ? step2Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step2) stepStatus.lastCompletedStep = 2
      else if (stepStatus.step1) stepStatus.lastCompletedStep = 1
      return stepStatus
    },
    enabled: !!partyId,
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function usePartyStepManager() {
  // Alias for backward compatibility
  return useBuildPartnerStepManager()
}

function useBuildPartnerStepManager() {
  const saveDetails = useSaveBuildPartnerDetails()
  const saveContact = useSavePartyAuthorizedSignatoryDetails()
  const saveReview = useSavePartyReview()
  const validateStep = useValidateBuildPartnerStep()

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      partyId?: string,
      authorizedSignatoryId?: string | number
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as PartyDetailsData,
            isEditing,
            pa: partyId || undefined,
          })
        case 2:
          return await saveContact.mutateAsync({
            data: data as PartyAuthorizedSignatoryData,
            isEditing,
            partyId: partyId || undefined,
            authorizedSignatoryId: authorizedSignatoryId || undefined,
          })
        case 3:
          return await saveReview.mutateAsync(data as { reviewData: unknown; termsAccepted: boolean })
        default:
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [saveDetails, saveContact, saveReview]
  )

  return {
    saveStep,
    validateStep,
    isLoading:
      saveDetails.isPending ||
      saveContact.isPending ||

      saveReview.isPending,
    error:
      saveDetails.error ||
      saveContact.error ||
     
      saveReview.error,
  }
}

// Hook for fetching build partner contacts with pagination
export function usePartyAuthorizedSignatoryDetails(
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
      PARTIES_QUERY_KEY,
      'contacts',
      buildPartnerId,
      { page: pagination.page, size: pagination.size },
    ],
    queryFn: () =>
      partyService.getPartyAuthorizedSignatoryDetailsPaginated(
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

// Hook for fetching parties for dropdown (used in authorized signatory step)
export function usePartiesForDropdown() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: [PARTIES_QUERY_KEY, 'dropdown'],
    queryFn: async () => {
      const parties = await partyService.findAllParties()
      // Transform parties to dropdown format: { id, displayName, settingValue }
      return parties.map((party) => ({
        id: party.id,
        displayName: party.partyFullName || `Party ${party.id}`,
        settingValue: party.id.toString(),
      }))
    },
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}
