import { useQuery } from '@tanstack/react-query'
import { ProjectDropdownService } from '@/services/api/projectDropdownService'

export const PROJECT_DROPDOWNS_QUERY_KEY = 'projectDropdowns'

// Hook to fetch project types
export function useProjectTypes() {
  return useQuery({
    queryKey: [PROJECT_DROPDOWNS_QUERY_KEY, 'types'],
    queryFn: async () => {
      const rawData = await ProjectDropdownService.fetchProjectTypes()
      return ProjectDropdownService.processProjectTypes(rawData)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// Hook to fetch project statuses
export function useProjectStatuses() {
  return useQuery({
    queryKey: [PROJECT_DROPDOWNS_QUERY_KEY, 'statuses'],
    queryFn: async () => {
      const rawData = await ProjectDropdownService.fetchProjectStatuses()
      return ProjectDropdownService.processProjectStatuses(rawData)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// Hook to fetch project currencies using existing fee dropdown service
export function useProjectCurrencies() {
  return useQuery({
    queryKey: [PROJECT_DROPDOWNS_QUERY_KEY, 'currencies'],
    queryFn: async () => {
      return await ProjectDropdownService.processProjectCurrencies()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// Hook to fetch bank account statuses
export function useBankAccountStatuses() {
  return useQuery({
    queryKey: [PROJECT_DROPDOWNS_QUERY_KEY, 'bankAccountStatuses'],
    queryFn: async () => {
      const rawData = await ProjectDropdownService.fetchBankAccountStatuses()
      return ProjectDropdownService.processBankAccountStatuses(rawData)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// Hook to fetch blocked payment types
export function useBlockedPaymentTypes() {
  return useQuery({
    queryKey: [PROJECT_DROPDOWNS_QUERY_KEY, 'blockedPaymentTypes'],
    queryFn: async () => {
      const rawData = await ProjectDropdownService.fetchBlockedPaymentTypes()
      return ProjectDropdownService.processBlockedPaymentTypes(rawData)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}
