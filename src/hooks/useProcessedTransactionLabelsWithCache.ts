import { useState, useEffect, useCallback } from 'react'
import { processedTransactionLabelsService } from '@/services/api/processedTransactionLabelsService'
import { getProcessedTransactionLabel } from '@/constants/mappings/processedTransactionMapping'
import type { LabelConfig } from '@/types/labelConfig'

export interface UseProcessedTransactionLabelsWithCacheResult {
  data: LabelConfig[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getLabel: (
    configId: string,
    languageCode?: string,
    fallback?: string
  ) => string
}

export const useProcessedTransactionLabelsWithCache = (
  languageCode: string = 'EN'
): UseProcessedTransactionLabelsWithCacheResult => {
  const [data, setData] = useState<LabelConfig[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const labels =
        await processedTransactionLabelsService.getProcessedTransactionLabelsWithCache()

      setData(labels)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch labels'
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
        return fallback || getProcessedTransactionLabel(configId)
      }

      let matchingLabel = data.find(
        (label) =>
          label.configId === configId &&
          label.appLanguageCode?.languageCode === language &&
          label.enabled &&
          !label.deleted
      )

      if (!matchingLabel && language !== language.toUpperCase()) {
        matchingLabel = data.find(
          (label) =>
            label.configId === configId &&
            label.appLanguageCode?.languageCode === language.toUpperCase() &&
            label.enabled &&
            !label.deleted
        )
      }

      if (!matchingLabel && language !== language.toLowerCase()) {
        matchingLabel = data.find(
          (label) =>
            label.configId === configId &&
            label.appLanguageCode?.languageCode === language.toLowerCase() &&
            label.enabled &&
            !label.deleted
        )
      }

      if (!matchingLabel) {
        matchingLabel = data.find(
          (label) =>
            label.configId === configId &&
            label.enabled &&
            !label.deleted
        )
      }

      return matchingLabel?.configValue || fallback || getProcessedTransactionLabel(configId)
    },
    [data, languageCode]
  )

  const refetch = useCallback(async () => {
    processedTransactionLabelsService.clearCache()
    await fetchLabels()
  }, [fetchLabels])

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
