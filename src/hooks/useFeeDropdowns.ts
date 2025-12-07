import { useQuery } from '@tanstack/react-query'
import { FeeDropdownService, type FeeDropdownOption } from '@/services/api/feeDropdownService'
import { getFeeCategoryLabel } from '@/constants/mappings/feeDropdownMapping'

// Constants for caching
const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const CACHE_TIME = 10 * 60 * 1000 // 10 minutes

/**
 * Hook to fetch fee categories from API
 */
export const useFeeCategories = () => {
  return useQuery({
    queryKey: ['feeCategories'],
    queryFn: async () => {
      const rawCategories = await FeeDropdownService.fetchFeeCategories()
      const processedCategories = FeeDropdownService.processFeeCategories(rawCategories)
      
      return processedCategories
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
 * Hook to fetch fee frequencies from API
 */
export const useFeeFrequencies = () => {
  return useQuery({
    queryKey: ['feeFrequencies'],
    queryFn: async () => {
      const rawFrequencies = await FeeDropdownService.fetchFeeFrequencies()
      return FeeDropdownService.processDropdownOptions(rawFrequencies)
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
 * Hook to fetch currencies from API
 */
export const useCurrencies = () => {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const rawCurrencies = await FeeDropdownService.fetchCurrencies()
      return FeeDropdownService.processDropdownOptions(rawCurrencies)
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
 * Hook to fetch country codes from API
 */
export const useCountryCodes = () => {
  return useQuery({
    queryKey: ['countryCodes'],
    queryFn: async () => {
      const rawCountryCodes = await FeeDropdownService.fetchCountries()
      return FeeDropdownService.processDropdownOptions(rawCountryCodes)
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
 * Hook to fetch debit accounts from API
 */
export const useDebitAccounts = () => {
  return useQuery({
    queryKey: ['debitAccounts'],
    queryFn: async () => {
      const rawDebitAccounts = await FeeDropdownService.fetchDebitAccountTypes()
      return FeeDropdownService.processDropdownOptions(rawDebitAccounts)
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
export const useFeeDropdownLabels = () => {
  const { data: feeCategories = [], isLoading: categoriesLoading, error: categoriesError } = useFeeCategories()
  const { data: feeFrequencies = [], isLoading: frequenciesLoading, error: frequenciesError } = useFeeFrequencies()
  const { data: currencies = [], isLoading: currenciesLoading, error: currenciesError } = useCurrencies()
  const { data: countryCodes = [], isLoading: countryCodesLoading, error: countryCodesError } = useCountryCodes()
  const { data: debitAccounts = [], isLoading: accountsLoading, error: accountsError } = useDebitAccounts()

  const getDisplayLabel = (option: FeeDropdownOption, fallbackValue?: string): string => {
    if (option && option.configValue) {
      return FeeDropdownService.getDisplayLabel(option, fallbackValue)
    }
    
    // Fallback to static mapping
    if (option && option.configId) {
      return getFeeCategoryLabel(option.configId)
    }
    
    return fallbackValue || 'Unknown'
  }

  const getOptionById = (options: FeeDropdownOption[], id: number) => {
    return FeeDropdownService.getOptionById(options, id)
  }

  const getOptionByConfigId = (options: FeeDropdownOption[], configId: string) => {
    return FeeDropdownService.getOptionByConfigId(options, configId)
  }

  return {
    // Data
    feeCategories,
    feeFrequencies,
    currencies,
    countryCodes,
    debitAccounts,
    
    // Loading states
    isLoading: categoriesLoading || frequenciesLoading || currenciesLoading || countryCodesLoading || accountsLoading,
    categoriesLoading,
    frequenciesLoading,
    currenciesLoading,
    countryCodesLoading,
    accountsLoading,
    
    // Error states
    error: categoriesError || frequenciesError || currenciesError || countryCodesError || accountsError,
    categoriesError,
    frequenciesError,
    currenciesError,
    countryCodesError,
    accountsError,
    
    // Utility functions
    getDisplayLabel,
    getOptionById,
    getOptionByConfigId,
  }
}
