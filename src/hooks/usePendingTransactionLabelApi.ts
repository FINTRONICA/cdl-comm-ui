import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pendingTransactionLabelService } from '@/services/api/pendingTransactionLabelService'
import { getPendingTransactionLabel } from '@/constants/mappings/pendingTransactionMapping'
import type {
  LabelConfig,
  ProcessedTransactionLabels,
  LabelConfigFilters,
} from '@/types/labelConfig'

/**
 * Hook for consuming pending transaction label configuration API
 * Provides reactive access to pending transaction label data with caching and error handling
 */
export function usePendingTransactionLabelApi() {
  const [labels, setLabels] = useState<ProcessedTransactionLabels | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const rawLabels = await pendingTransactionLabelService.getPendingTransactionLabelsWithCache()
      const processedLabels: ProcessedTransactionLabels = {
        labels: rawLabels || [],
        totalCount: rawLabels?.length || 0,
      }
      
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
        return fallback || getPendingTransactionLabel(configId)
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
      
      return matchingLabel?.configValue || fallback || getPendingTransactionLabel(configId)
    },
    [labels]
  )

  const getLabelsByFilters = useCallback(
    (filters: LabelConfigFilters): LabelConfig[] => {
      if (!labels) {
        return []
      }
      
      return labels.labels.filter((label) => {
        if (filters.configId && label.configId !== filters.configId) {
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
    (moduleCode: string, language: string = 'EN'): LabelConfig[] => {
      return getLabelsByFilters({
        moduleCode,
        languageCode: language,
        enabled: true,
        deleted: false,
      })
    },
    [getLabelsByFilters]
  )

  const getLabelsByLanguage = useCallback(
    (language: string): LabelConfig[] => {
      return getLabelsByFilters({
        languageCode: language,
        enabled: true,
        deleted: false,
      })
    },
    [getLabelsByFilters]
  )

  const getAvailableLanguages = useCallback((): string[] => {
    if (!labels) {
      return ['EN']
    }
    
    const languages = new Set<string>()
    labels.labels.forEach((label) => {
      if (label.enabled && !label.deleted) {
        languages.add(label.appLanguageCode.languageCode)
      }
    })
    
    return Array.from(languages)
  }, [labels])

  const getAvailableConfigIds = useCallback((): string[] => {
    if (!labels) {
      return []
    }
    
    const configIds = new Set<string>()
    labels.labels.forEach((label) => {
      if (label.enabled && !label.deleted) {
        configIds.add(label.configId)
      }
    })
    
    return Array.from(configIds)
  }, [labels])

  const hasConfigId = useCallback(
    (configId: string): boolean => {
      return getAvailableConfigIds().includes(configId)
    },
    [getAvailableConfigIds]
  )

  const refreshLabels = useCallback(() => {
    fetchLabels()
  }, [fetchLabels])

  const clearCache = useCallback(() => {
    pendingTransactionLabelService.clearCache()
    fetchLabels()
  }, [fetchLabels])

  return {
    labels,
    isLoading,
    error,
    getLabel,
    getLabelsByFilters,
    getLabelsByModule,
    getLabelsByLanguage,
    getAvailableLanguages,
    getAvailableConfigIds,
    hasConfigId,
    refreshLabels,
    clearCache,
  }
}

/**
 * React Query hook for pending transaction labels
 * Provides caching, background updates, and error handling
 */
export function usePendingTransactionLabelsQuery(language: string = 'EN') {
  return useQuery({
    queryKey: ['pending-transaction-labels', language],
    queryFn: () => pendingTransactionLabelService.getPendingTransactionLabelsWithCache(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * React Query hook for getting a specific pending transaction label
 */
export function usePendingTransactionLabelQuery(
  configId: string,
  language: string = 'EN'
) {
  return useQuery({
    queryKey: ['pending-transaction-label', configId, language],
    queryFn: () => pendingTransactionLabelService.getLabel(configId, language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}

/**
 * React Query hook for getting pending transaction labels by module
 */
export function usePendingTransactionLabelsByModuleQuery(
  moduleCode: string,
  language: string = 'EN'
) {
  return useQuery({
    queryKey: ['pending-transaction-labels-by-module', moduleCode, language],
    queryFn: () => pendingTransactionLabelService.getLabelsByModule(moduleCode, language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}

/**
 * React Query hook for getting pending transaction labels by language
 */
export function usePendingTransactionLabelsByLanguageQuery(language: string) {
  return useQuery({
    queryKey: ['pending-transaction-labels-by-language', language],
    queryFn: () => pendingTransactionLabelService.getLabelsByLanguage(language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}
