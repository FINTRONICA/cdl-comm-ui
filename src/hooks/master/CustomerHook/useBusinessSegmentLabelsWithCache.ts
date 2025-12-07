import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { BusinessSegmentLabelsService } from '@/services/api/masterApi/Customer/businessSegmentLabelsService'
export interface BusinessSegmentLabelsResponse {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: {
    id: number
    languageCode: string
    nameKey: string
    nameNativeValue: string
    enabled: boolean
    rtl: boolean
  }
  applicationModuleDTO: {
    id: number
    moduleName: string
    moduleDescription: string
    active: boolean
  }
  status: string | null
  enabled: boolean
}

export type ProcessedBusinessSegmentLabels = Record<string, Record<string, string>>

const DEFAULT_LANGUAGE = 'EN'

export class BusinessSegmentLabelsService {
  static processLabels(labels: BusinessSegmentLabelsResponse[]): ProcessedBusinessSegmentLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedBusinessSegmentLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedBusinessSegmentLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedBusinessSegmentLabels): string[] {
    try {
      const languages = new Set<string>()
      Object.values(labels).forEach(languageLabels => {
        Object.keys(languageLabels).forEach(language => {
          languages.add(language)
        })
      })
      return Array.from(languages)
    } catch {
      return [DEFAULT_LANGUAGE]
    }
  }
}

export function useBusinessSegmentLabelsWithCache() {
  const { businessSegmentLabels } = useLabels()
  const { businessSegmentLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
            if (businessSegmentLabels) {
        return BusinessSegmentLabelsService.getLabel(businessSegmentLabels, configId, language, fallback)
      }
      return fallback
    },
    [businessSegmentLabels]
  )

  const hasLabels = useCallback(() => {
    return BusinessSegmentLabelsService.hasLabels(businessSegmentLabels || {})
  }, [businessSegmentLabels])

  const getAvailableLanguages = useCallback(() => {
    return BusinessSegmentLabelsService.getAvailableLanguages(businessSegmentLabels || {})
  }, [businessSegmentLabels])

  return {
    data: businessSegmentLabels,
    isLoading: businessSegmentLabelsLoading,
    error: null,
    isError: false,
    isFetching: businessSegmentLabelsLoading,
    isSuccess: !!businessSegmentLabels,
    refetch: () => {
      return Promise.resolve({ data: businessSegmentLabels })
    },
    getLabel,
    hasLabels,
    getAvailableLanguages,
    hasCache: !!businessSegmentLabels,
    cacheStatus: businessSegmentLabels ? 'cached' : businessSegmentLabelsLoading ? 'Loading...' : 'fresh',
  }
}

