import { useQuery } from '@tanstack/react-query'
import { BeneficiaryDropdownService, type BeneficiaryDropdownOption } from '@/services/api/beneficiaryDropdownService'

// Constants for caching
const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const CACHE_TIME = 10 * 60 * 1000 // 10 minutes

/**
 * Hook to fetch bank names from API
 */
export const useBankNames = () => {
  return useQuery({
    queryKey: ['beneficiaryBankNames'],
    queryFn: async () => {
      const rawBankNames = await BeneficiaryDropdownService.fetchBankNames()
      const processedBankNames = BeneficiaryDropdownService.processDropdownOptions(rawBankNames)
      
      return processedBankNames
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
 * Hook to fetch transfer types from API
 */
export const useTransferTypes = () => {
  return useQuery({
    queryKey: ['transferTypes'],
    queryFn: async () => {
      const rawTransferTypes = await BeneficiaryDropdownService.fetchTransferTypes()
      const processedTransferTypes = BeneficiaryDropdownService.processDropdownOptions(rawTransferTypes)
      
      return processedTransferTypes
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
export const useBeneficiaryDropdownLabels = () => {
  const { data: bankNames = [], isLoading: bankNamesLoading, error: bankNamesError } = useBankNames()
  const { data: transferTypes = [], isLoading: transferTypesLoading, error: transferTypesError } = useTransferTypes()

  const getDisplayLabel = (option: BeneficiaryDropdownOption, fallbackValue?: string): string => {
    if (option && option.configValue) {
      return BeneficiaryDropdownService.getDisplayLabel(option, fallbackValue)
    }
    
    return fallbackValue || 'Unknown'
  }

  const getOptionById = (options: BeneficiaryDropdownOption[], id: number) => {
    return BeneficiaryDropdownService.getOptionById(options, id)
  }

  const getOptionByConfigId = (options: BeneficiaryDropdownOption[], configId: string) => {
    return BeneficiaryDropdownService.getOptionByConfigId(options, configId)
  }

  return {
    // Data
    bankNames,
    transferTypes,
    
    // Loading states
    isLoading: bankNamesLoading || transferTypesLoading,
    bankNamesLoading,
    transferTypesLoading,
    
    // Error states
    error: bankNamesError || transferTypesError,
    bankNamesError,
    transferTypesError,
    
    // Utility functions
    getDisplayLabel,
    getOptionById,
    getOptionByConfigId,
  }
}

/**
 * Combined hook for all beneficiary dropdowns
 */
export const useBeneficiaryDropdowns = () => {
  const { data: bankNames = [], isLoading: bankNamesLoading, error: bankNamesError } = useBankNames()
  // Note: beneficiaryTypes is not available in API, using transferTypes instead
  const { data: transferTypes = [], isLoading: transferTypesLoading, error: transferTypesError } = useTransferTypes()

  return {
    // Data
    bankNames,
    beneficiaryTypes: transferTypes, // Use transferTypes as beneficiaryTypes
    transferTypes,
    
    // Loading states
    isLoading: bankNamesLoading || transferTypesLoading,
    bankNamesLoading,
    transferTypesLoading,
    
    // Error states
    error: bankNamesError || transferTypesError,
    bankNamesError,
    transferTypesError,
    
    // Utility functions
    getDisplayLabel: (option: BeneficiaryDropdownOption, fallbackValue?: string) => 
      BeneficiaryDropdownService.getDisplayLabel(option, fallbackValue),
    getOptionById: (options: BeneficiaryDropdownOption[], id: number) => 
      BeneficiaryDropdownService.getOptionById(options, id),
    getOptionByConfigId: (options: BeneficiaryDropdownOption[], configId: string) => 
      BeneficiaryDropdownService.getOptionByConfigId(options, configId),
  }
}
