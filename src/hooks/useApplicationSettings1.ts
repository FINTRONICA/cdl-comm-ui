import { useState, useEffect } from 'react'
import { applicationSettingService } from '@/services/api/applicationSettingService1'

export interface ApplicationSettingItem {
  id: number
  settingValue: string
  displayName: string
}

export interface UseApplicationSettingsReturn {
  data: ApplicationSettingItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}
export function useApplicationSettings(
  configKey: string
): UseApplicationSettingsReturn {
  const [data, setData] = useState<ApplicationSettingItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const settings =
        await applicationSettingService.getApplicationSettings(configKey)

      const mappedData: ApplicationSettingItem[] = settings.map((setting) => ({
        id: setting.id,
        settingValue: setting.settingValue,
        displayName:
          setting.languageTranslationId?.configValue || setting.settingValue,
      }))

      setData(mappedData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchData()
  }

  useEffect(() => {
    if (configKey) {
      fetchData()
    }
  }, [configKey])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

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

export function usePropertyIds() {
  return useApplicationSettings('PROPERTY_ID')
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
