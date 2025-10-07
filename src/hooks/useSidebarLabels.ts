import { useQuery } from '@tanstack/react-query'
import { SidebarLabelsService } from '@/services/api/sidebarLabelsService'
import { useIsAuthenticated } from './useAuthQuery'
import { useAppStore } from '@/store'

// Constants
const STALE_TIME = 24 * 60 * 60 * 1000 // 24 hours
const CACHE_TIME = 24 * 60 * 60 * 1000 // 24 hours
const RETRY_ATTEMPTS = 1

export const useSidebarLabels = () => {
  // Use existing authentication hook
  const { isAuthenticated } = useIsAuthenticated()

  const query = useQuery({
    queryKey: ['sidebarLabels'],
    queryFn: async () => {
      const rawLabels = await SidebarLabelsService.fetchLabels()
      const processedLabels = SidebarLabelsService.processLabels(rawLabels)
      return processedLabels
    },
    enabled: !!isAuthenticated,
    staleTime: STALE_TIME, // Data considered fresh for 24 hours
    gcTime: CACHE_TIME, // Keep in cache for 24 hours
    retry: RETRY_ATTEMPTS, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Disable refetch on window focus to prevent loops
    refetchOnReconnect: false, // Disable refetch on reconnect to prevent loops
    refetchOnMount: false, // Disable refetch on mount to prevent loops
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false, // Disable background refetching
  })

  const storeLabels = useAppStore((state: unknown) => (state as { sidebarLabels?: unknown }).sidebarLabels)

  return query
}

export const useSidebarLabelsWithUtils = () => {
  const query = useSidebarLabels()
  
  return {
    ...query,
    hasLabels: () => SidebarLabelsService.hasLabels(query.data || {}),
    getLabel: (sidebarId: string, language: string, fallback: string) => 
      SidebarLabelsService.getLabelBySidebarId(query.data || {}, sidebarId, language, fallback),
    getAvailableLanguages: () => 
      SidebarLabelsService.getAvailableLanguages(query.data || {}),
  }
}
