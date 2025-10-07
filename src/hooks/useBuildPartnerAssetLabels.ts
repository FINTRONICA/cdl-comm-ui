import { useQuery } from '@tanstack/react-query'
import { BuildPartnerAssetLabelsService } from '@/services/api/buildPartnerAssetLabelsService'
import { useIsAuthenticated } from './useAuthQuery'

// Hook that uses the proper BuildPartnerAssetLabelsService
export function useBuildPartnerAssetLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['buildPartnerAssetLabels'],
    queryFn: async () => {
      const rawLabels = await BuildPartnerAssetLabelsService.fetchLabels()
      return BuildPartnerAssetLabelsService.processLabels(rawLabels)
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useBuildPartnerAssetLabelsWithUtils() {
  const query = useBuildPartnerAssetLabels()
  
  return {
    ...query,
    // Utility methods
    hasLabels: () => BuildPartnerAssetLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) => 
      BuildPartnerAssetLabelsService.getLabel(query.data || {}, configId, language, fallback),
    getAvailableLanguages: () => 
      BuildPartnerAssetLabelsService.getAvailableLanguages(query.data || {}),
  }
}
