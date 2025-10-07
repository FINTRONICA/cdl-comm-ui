import { useState, useEffect, useCallback } from 'react'
import {
  manualPaymentLabelsService,
  ManualPaymentLabel,
} from '@/services/api/manualPaymentLabelsService'

export interface UseManualPaymentLabelsWithCacheResult {
  data: ManualPaymentLabel[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getLabel: (
    configId: string,
    languageCode?: string,
    fallback?: string
  ) => string
}

export const useManualPaymentLabelsWithCache = (
  languageCode: string = 'EN'
): UseManualPaymentLabelsWithCacheResult => {
  const [data, setData] = useState<ManualPaymentLabel[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const labels =
        await manualPaymentLabelsService.getManualPaymentLabelsWithCache()
      setData(labels)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch manual payment labels'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [languageCode])

  const getLabel = useCallback(
    (
      configId: string,
      language: string = languageCode,
      fallback?: string
    ): string => {
      if (!data) {
        return fallback || configId
      }

      const matchingLabel = data.find(
        (label) =>
          label.configId === configId && label.appLanguageCode?.languageCode === language
      )

      const result = matchingLabel?.configValue || fallback || configId
      return result
    },
    [data, languageCode]
  )

  const refetch = useCallback(async () => {
    // Clear cache before refetching
    manualPaymentLabelsService.clearCache()
    await fetchLabels()
  }, [fetchLabels, languageCode])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  return {
    data,
    loading,
    error,
    refetch,
    getLabel,
  }
}
