import { useCallback } from 'react'
import { useAppStore, useLabels, useLabelsLoadingState } from '@/store'
import { BusinessSubSegmentLabelsService } from '@/services/api/masterApi/Customer/businessSubSegmentLabelsService'
export interface BusinessSubSegmentLabelsResponse {
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

export type ProcessedBusinessSubSegmentLabels = Record<string, Record<string, string>>

const DEFAULT_LANGUAGE = 'EN'

export class BusinessSubSegmentLabelsService {
  static processLabels(labels: BusinessSubSegmentLabelsResponse[]): ProcessedBusinessSubSegmentLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedBusinessSubSegmentLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedBusinessSubSegmentLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedBusinessSubSegmentLabels): string[] {
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

export function useBusinessSubSegmentLabelsWithCache() {
  const businessSubSegmentLabels = useAppStore((state) => state.businessSubSegmentLabels)
  const businessSubSegmentLabelsLoading = useAppStore((state) => state.businessSubSegmentLabelsLoading)

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
            if (businessSubSegmentLabels) {
        return BusinessSubSegmentLabelsService.getLabel(businessSubSegmentLabels, configId, language, fallback)
      }
      return fallback
    },
    [businessSubSegmentLabels]
  )

  const hasLabels = useCallback(() => {
    return BusinessSubSegmentLabelsService.hasLabels(businessSubSegmentLabels || {})
  }, [businessSubSegmentLabels])

  const getAvailableLanguages = useCallback(() => {
        return BusinessSubSegmentLabelsService.getAvailableLanguages(businessSubSegmentLabels || ({} as any))
  }, [businessSubSegmentLabels])

  return {
                    data: businessSubSegmentLabels,
    isLoading: businessSubSegmentLabelsLoading,
    error: null,
    isError: false,
    isFetching: businessSubSegmentLabelsLoading,
    isSuccess: !!businessSubSegmentLabels,
    refetch: () => {
      return Promise.resolve({ data: businessSubSegmentLabels })
    },
    getLabel,
    hasLabels,
    getAvailableLanguages,
    hasCache: !!businessSubSegmentLabels,
    cacheStatus: businessSubSegmentLabels ? 'cached' : businessSubSegmentLabelsLoading ? 'Loading...' : 'fresh',
  }
}

