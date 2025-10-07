import { useState, useEffect, useCallback } from 'react'
import {
  processedTransactionLabelsService,
  ProcessedTransactionLabel,
} from '@/services/api/processedTransactionLabelsService'

export interface UseProcessedTransactionLabelsWithCacheResult {
  data: ProcessedTransactionLabel[] | null
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
  languageCode: string = 'en'
): UseProcessedTransactionLabelsWithCacheResult => {
  const [data, setData] = useState<ProcessedTransactionLabel[] | null>(null)
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
      console.error('🔧 fetchLabels: Error fetching labels:', errorMessage)
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
      
      if (!matchingLabel) {
        
      } else {
       
      }
      
      return result
    },
    [data, languageCode]
  )

  const refetch = useCallback(async () => {
    // Clear cache before refetching
    processedTransactionLabelsService.clearCache()
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
