import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userManagementLabelService } from '@/services/api/userManagementLabelService'
import { getUserManagementLabel } from '@/constants/mappings/userManagementMapping'
import type {
  LabelConfig,
  ProcessedTransactionLabels,
  LabelConfigFilters,
} from '@/types/labelConfig'

/**
 * Hook for consuming user management label configuration API
 * Provides reactive access to label data with caching and error handling
 */
export function useUserManagementLabelApi() {
  const [labels, setLabels] = useState<ProcessedTransactionLabels | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const rawLabels = await userManagementLabelService.getUserManagementLabelsWithCache()
      const processedLabels: ProcessedTransactionLabels = {
        labels: rawLabels || [],
        totalCount: rawLabels?.length || 0,
      }
      setLabels(processedLabels)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user management labels'
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
        return fallback || getUserManagementLabel(configId)
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

      return matchingLabel?.configValue || fallback || getUserManagementLabel(configId)
    },
    [labels]
  )

  const getLabelsByFilters = useCallback(
    (filters: LabelConfigFilters): LabelConfig[] => {
      if (!labels) {
        return []
      }
      return labels.labels.filter((label: LabelConfig) => {
        if (filters.configId && label.configId !== filters.configId) {
          return false
        }
        if (
          filters.languageCode &&
          label.appLanguageCode.languageCode !== filters.languageCode
        ) {
          return false
        }
        if (
          filters.moduleCode &&
          label.applicationModuleDTO.moduleCode !== filters.moduleCode
        ) {
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
      return getLabelsByFilters({ moduleCode, languageCode: language })
    },
    [getLabelsByFilters]
  )

  const getLabelsByLanguage = useCallback(
    (language: string): LabelConfig[] => {
      return getLabelsByFilters({ languageCode: language })
    },
    [getLabelsByFilters]
  )

  const refreshLabels = useCallback(() => {
    userManagementLabelService.refreshCache()
    fetchLabels()
  }, [fetchLabels])

  const clearCache = useCallback(() => {
    userManagementLabelService.clearCache()
    setLabels(null)
  }, [])

  return {
    labels,
    isLoading,
    error,
    getLabel,
    getLabelsByFilters,
    getLabelsByModule,
    getLabelsByLanguage,
    refreshLabels,
    clearCache,
  }
}

/**
 * React Query hook for user management labels
 * Provides caching, background updates, and error handling
 */
export function useUserManagementLabelsQuery(language: string = 'EN') {
  return useQuery<LabelConfig[], Error>({
    queryKey: ['user-management-labels', language],
    queryFn: () => userManagementLabelService.getUserManagementLabelsWithCache(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * React Query hook for getting a specific user management label
 */
export function useUserManagementLabelQuery(
  configId: string,
  language: string = 'EN'
) {
  return useQuery<string, Error>({
    queryKey: ['user-management-label', configId, language],
    queryFn: () => userManagementLabelService.getLabel(configId, language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}

/**
 * React Query hook for getting user management labels by module
 */
export function useUserManagementLabelsByModuleQuery(
  moduleCode: string,
  language: string = 'EN'
) {
  return useQuery<LabelConfig[], Error>({
    queryKey: ['user-management-labels-by-module', moduleCode, language],
    queryFn: () => userManagementLabelService.getLabelsByModule(moduleCode, language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}

/**
 * React Query hook for getting user management labels by language
 */
export function useUserManagementLabelsByLanguageQuery(language: string) {
  return useQuery<LabelConfig[], Error>({
    queryKey: ['user-management-labels-by-language', language],
    queryFn: () => userManagementLabelService.getLabelsByLanguage(language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}
