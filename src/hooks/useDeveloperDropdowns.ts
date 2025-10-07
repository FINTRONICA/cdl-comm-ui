import { useQuery } from '@tanstack/react-query'
import { DeveloperDropdownService, type DeveloperDropdownOption } from '@/services/api/developerDropdownService'
import { getDeveloperDropdownLabel } from '@/constants/mappings/developerDropdownMapping'

// Constants for caching
const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const CACHE_TIME = 10 * 60 * 1000 // 10 minutes

/**
 * Hook to fetch regulatory authorities from API
 */
export const useRegulatoryAuthorities = () => {
  return useQuery({
    queryKey: ['regulatoryAuthorities'],
    queryFn: async () => {
      const rawAuthorities = await DeveloperDropdownService.fetchRegulatoryAuthorities()
      const processedAuthorities = DeveloperDropdownService.processRegulatoryAuthorities(rawAuthorities)
      console.log('🔄 Processed Regulatory Authorities:', processedAuthorities)
      return processedAuthorities
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}


/**
 * Utility hook for getting display labels with fallback
 */
export const useDeveloperDropdownLabels = () => {
  const { data: regulatoryAuthorities = [], isLoading: authoritiesLoading, error: authoritiesError } = useRegulatoryAuthorities()

  const getDisplayLabel = (option: DeveloperDropdownOption, fallbackValue?: string): string => {
    if (option && option.configValue) {
      return DeveloperDropdownService.getDisplayLabel(option, fallbackValue)
    }
    
    // Fallback to static mapping
    if (option && option.configId) {
      return getDeveloperDropdownLabel(option.configId)
    }
    
    return fallbackValue || 'Unknown'
  }

  const getOptionById = (options: DeveloperDropdownOption[], id: number) => {
    return DeveloperDropdownService.getOptionById(options, id)
  }

  const getOptionByConfigId = (options: DeveloperDropdownOption[], configId: string) => {
    return DeveloperDropdownService.getOptionByConfigId(options, configId)
  }

  return {
    // Data
    regulatoryAuthorities,
    
    // Loading states
    isLoading: authoritiesLoading,
    authoritiesLoading,
    
    // Error states
    error: authoritiesError,
    authoritiesError,
    
    // Utility functions
    getDisplayLabel,
    getOptionById,
    getOptionByConfigId,
  }
}
