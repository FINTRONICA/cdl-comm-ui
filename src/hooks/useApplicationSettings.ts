import { useQuery } from '@tanstack/react-query'
import { applicationSettingService } from '@/services/api/applicationSettingService'

// Generic interface for all application setting types
export interface ApplicationSettingItem {
  id: number
  settingValue: string
  displayName: string
}

// Hook return type
export interface UseApplicationSettingsReturn {
  data: ApplicationSettingItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Generic hook to fetch application settings by config key with React Query caching
 * @param configKey - The configuration key to fetch (e.g., 'PAYMENT_EXPENSE_TYPE', 'CURRENCY', etc.)
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useApplicationSettings(
  configKey: string
): UseApplicationSettingsReturn {
  const query = useQuery({
    queryKey: ['applicationSettings', configKey],
    queryFn: async () => {
     
      const settings =
        await applicationSettingService.getApplicationSettingsByKey(configKey)

      const mappedData: ApplicationSettingItem[] = settings.map((setting) => ({
        id: setting.id,
        settingValue: setting.settingValue,
        displayName:
          setting.languageTranslationId?.configValue || setting.settingValue,
      }))

     

      return mappedData
    },
    enabled: !!configKey,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (renamed from cacheTime in React Query v5)
    retry: 2,
    refetchOnWindowFocus: false,
  })

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  }
}

// Convenience hooks for specific config keys with better type safety
export function usePaymentExpenseTypes() {
  return useApplicationSettings('PAYMENT_EXPENSE_TYPE')
}

export function usePaymentExpenseSubTypes() {
  return useApplicationSettings('PAYMENT_EXPENSE_SUB_TYPE')
}

export function useCurrencies() {
  return useApplicationSettings('CURRENCY')
}

export function useDepositModes() {
  return useApplicationSettings('DEPOSIT_MODE')
}

export function useInvestorTypes() {
  return useApplicationSettings('INVESTOR_TYPE')
}

export function useInvestorIdTypes() {
  return useApplicationSettings('INVESTOR_ID_TYPE')
}

export function useCountries() {
  return useApplicationSettings('COUNTRY')
}

export function useUnitStatuses() {
  return useApplicationSettings('UNIT_STATUS')
}

export function usePaymentModes() {
  return useApplicationSettings('PAYMENT_MODE')
}

export function useTransferTypes() {
  return useApplicationSettings('TRANSFER_TYPE')
}

export function useBoolYnOptions() {
  return useApplicationSettings('BOOL_YN')
}

export function useBuildAssetAccountStatuses() {
  return useApplicationSettings('BUILD_ASSEST_ACCOUNT_STATUS')

}

