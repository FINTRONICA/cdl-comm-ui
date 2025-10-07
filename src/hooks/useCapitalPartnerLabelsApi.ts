import { useState, useEffect, useCallback } from 'react'
import { CapitalPartnerLabelsService, ProcessedCapitalPartnerLabels } from '@/services/api/capitalPartnerLabelsService'

export function useCapitalPartnerLabelsApi() {
  const [labels, setLabels] = useState<ProcessedCapitalPartnerLabels | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const rawLabels = await CapitalPartnerLabelsService.fetchLabels()
      const processedLabels = CapitalPartnerLabelsService.processLabels(rawLabels)
      
      setLabels(processedLabels)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch labels')
     
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const getLabel = useCallback(
    (configId: string, language: string = 'EN', fallback?: string): string => {
      if (!labels) {
        return fallback || configId
      }
      return CapitalPartnerLabelsService.getLabel(labels, configId, language, fallback || configId)
    },
    [labels]
  )

  const hasLabels = useCallback(() => {
    return CapitalPartnerLabelsService.hasLabels(labels || {})
  }, [labels])

  const getAvailableLanguages = useCallback(() => {
    return CapitalPartnerLabelsService.getAvailableLanguages(labels || {})
  }, [labels])

  return {
    labels,
    isLoading,
    error,
    isError: !!error,
    isSuccess: !!labels && !error,
    refetch: fetchLabels,
    getLabel,
    hasLabels,
    getAvailableLanguages,
  }
}
