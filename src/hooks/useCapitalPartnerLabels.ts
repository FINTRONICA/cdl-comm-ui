import { useQuery } from '@tanstack/react-query'
import { CapitalPartnerLabelsService } from '@/services/api/capitalPartnerLabelsService'
import { useIsAuthenticated } from './useAuthQuery'

/**
 * Hook to fetch capital partner labels from API
 */
export function useCapitalPartnerLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['capitalPartnerLabels'],
    queryFn: async () => {
      const rawLabels = await CapitalPartnerLabelsService.fetchLabels()
      return CapitalPartnerLabelsService.processLabels(rawLabels)
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

/**
 * Hook with utility methods for capital partner labels
 */
export function useCapitalPartnerLabelsWithUtils() {
  const query = useCapitalPartnerLabels()
  
  return {
    ...query,
    // Utility methods
    hasLabels: () => CapitalPartnerLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) => 
      CapitalPartnerLabelsService.getLabel(query.data || {}, configId, language, fallback),
    getAvailableLanguages: () => 
      CapitalPartnerLabelsService.getAvailableLanguages(query.data || {}),
  }
}
