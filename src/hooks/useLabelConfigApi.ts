import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { labelConfigService } from '@/services/api/labelConfigService'
import { getProcessedTransactionLabel } from '@/constants/mappings/processedTransactionMapping'
import type {
  LabelConfig,
  ProcessedTransactionLabels,
  LabelConfigFilters,
} from '@/types/labelConfig'

/**
 * Hook for consuming label configuration API
 * Provides reactive access to label data with caching and error handling
 */
export function useLabelConfigApi() {
  const [labels, setLabels] = useState<ProcessedTransactionLabels | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const rawLabels = await labelConfigService.getProcessedTransactionLabelsWithCache()
      const processedLabels = labelConfigService.processLabels(rawLabels)
      
      setLabels(processedLabels)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch labels'
      setError(errorMessage)
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
      
      let matchingLabel = labels.labels.find(
        (label) =>
          label.configId === configId && 
          label.appLanguageCode.languageCode === language &&
          label.enabled &&
          !label.deleted
      )
      
      if (!matchingLabel && language !== language.toUpperCase()) {
        matchingLabel = labels.labels.find(
          (label) =>
            label.configId === configId && 
            label.appLanguageCode.languageCode === language.toUpperCase() &&
            label.enabled &&
            !label.deleted
        )
      }
      
      if (!matchingLabel && language !== language.toLowerCase()) {
        matchingLabel = labels.labels.find(
          (label) =>
            label.configId === configId && 
            label.appLanguageCode.languageCode === language.toLowerCase() &&
            label.enabled &&
            !label.deleted
        )
      }
      
      if (!matchingLabel) {
        matchingLabel = labels.labels.find(
          (label) =>
            label.configId === configId && 
            label.enabled &&
            !label.deleted
        )
      }
      
      return matchingLabel?.configValue || fallback || getProcessedTransactionLabel(configId)
    },
    [labels]
  )

  const getLabelsByFilters = useCallback(
    (filters: LabelConfigFilters): LabelConfig[] => {
      if (!labels) {
        return []
      }
      
      return labels.labels.filter((label) => {
        if (filters.configId && !label.configId.includes(filters.configId)) {
          return false
        }
        if (filters.languageCode && label.appLanguageCode.languageCode !== filters.languageCode) {
          return false
        }
        if (filters.moduleCode && label.applicationModuleDTO.moduleCode !== filters.moduleCode) {
          return false
        }
        if (filters.enabled !== undefined && label.enabled !== filters.enabled) {
          return false
        }
        if (filters.deleted !== undefined && label.deleted !== filters.deleted) {
          return false
        }
        return true
      })
    },
    [labels]
  )

  const getLabelsByModule = useCallback(
    (moduleCode: string, languageCode: string = 'EN'): LabelConfig[] => {
      return getLabelsByFilters({
        moduleCode,
        languageCode,
        enabled: true,
        deleted: false
      })
    },
    [getLabelsByFilters]
  )

  const getLabelsByLanguage = useCallback(
    (languageCode: string): LabelConfig[] => {
      return getLabelsByFilters({
        languageCode,
        enabled: true,
        deleted: false
      })
    },
    [getLabelsByFilters]
  )

  const hasLabels = useCallback(() => {
    return labelConfigService.hasLabels(labels)
  }, [labels])

  const getAvailableLanguages = useCallback(() => {
    if (!labels) {
      return []
    }
    return labelConfigService.getAvailableLanguages(labels.labels)
  }, [labels])

  const createLabelMap = useCallback(
    (languageCode: string = 'EN'): Map<string, string> => {
      if (!labels) {
        return new Map()
      }
      return labelConfigService.createLabelMap(labels.labels, languageCode)
    },
    [labels]
  )

  const clearCache = useCallback(() => {
    labelConfigService.clearCache()
    fetchLabels() // Refetch after clearing cache
  }, [fetchLabels])

  const getCacheStats = useCallback(() => {
    return labelConfigService.getCacheStats()
  }, [])

  return {
    // Data
    labels,
    isLoading,
    error,
    isError: !!error,
    isSuccess: !!labels && !error,
    
    // Actions
    refetch: fetchLabels,
    clearCache,
    
    // Label access methods
    getLabel,
    getLabelsByFilters,
    getLabelsByModule,
    getLabelsByLanguage,
    createLabelMap,
    
    // Utility methods
    hasLabels,
    getAvailableLanguages,
    getCacheStats,
  }
}

/**
 * Hook for React Query integration with label configuration API
 * Provides better caching, background updates, and error handling
 */
export function useLabelConfigQuery() {
  return useQuery({
    queryKey: ['labelConfig', 'processedTransactions'],
    queryFn: async () => {
      const rawLabels = await labelConfigService.getProcessedTransactionLabels()
      return labelConfigService.processLabels(rawLabels)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for getting a specific label with React Query
 * @param configId - The configuration ID to fetch
 * @param languageCode - The language code (default: 'EN')
 */
export function useLabelQuery(configId: string, languageCode: string = 'EN') {
  const { data: labels, ...queryResult } = useLabelConfigQuery()
  
  const label = labels?.labels.find(
    (label) =>
      label.configId === configId && 
      label.appLanguageCode.languageCode === languageCode &&
      label.enabled &&
      !label.deleted
  )

  return {
    ...queryResult,
    label: label?.configValue || configId,
    rawLabel: label,
  }
}

/**
 * Hook for getting labels by module with React Query
 * @param moduleCode - The module code to filter by
 * @param languageCode - The language code (default: 'EN')
 */
export function useLabelsByModuleQuery(moduleCode: string, languageCode: string = 'EN') {
  const { data: labels, ...queryResult } = useLabelConfigQuery()
  
  const filteredLabels = labels?.labels.filter(
    (label) =>
      label.applicationModuleDTO.moduleCode === moduleCode &&
      label.appLanguageCode.languageCode === languageCode &&
      label.enabled &&
      !label.deleted
  ) || []

  return {
    ...queryResult,
    labels: filteredLabels,
    labelMap: new Map(filteredLabels.map(label => [label.configId, label.configValue])),
  }
}

/**
 * Hook for getting labels by language with React Query
 * @param languageCode - The language code
 */
export function useLabelsByLanguageQuery(languageCode: string) {
  const { data: labels, ...queryResult } = useLabelConfigQuery()
  
  const filteredLabels = labels?.labels.filter(
    (label) =>
      label.appLanguageCode.languageCode === languageCode &&
      label.enabled &&
      !label.deleted
  ) || []

  return {
    ...queryResult,
    labels: filteredLabels,
    labelMap: new Map(filteredLabels.map(label => [label.configId, label.configValue])),
  }
}
