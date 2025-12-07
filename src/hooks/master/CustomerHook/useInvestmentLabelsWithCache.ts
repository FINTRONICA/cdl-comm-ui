import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { InvestmentLabelsService } from '@/services/api/masterApi/Customer/investmentLabelsService'

export interface InvestmentLabelsResponse {
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

export type ProcessedInvestmentLabels = Record<string, Record<string, string>>

const DEFAULT_LANGUAGE = 'EN'

export class InvestmentLabelsService {
  static processLabels(labels: InvestmentLabelsResponse[]): ProcessedInvestmentLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedInvestmentLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedInvestmentLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedInvestmentLabels): string[] {
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

export function useInvestmentLabelsWithCache() {
  const { investmentLabels } = useLabels()
  const { investmentLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (investmentLabels) {
        return InvestmentLabelsService.getLabel(investmentLabels, configId, language, fallback)
      }
      return fallback
    },
    [investmentLabels]
  )

  const hasLabels = useCallback(() => {
    return InvestmentLabelsService.hasLabels(investmentLabels || {})
  }, [investmentLabels])

  const getAvailableLanguages = useCallback(() => {
    return InvestmentLabelsService.getAvailableLanguages(investmentLabels || {})
  }, [investmentLabels])

  return {
    data: investmentLabels,
    isLoading: investmentLabelsLoading,
    error: null,
    isError: false,
    isFetching: investmentLabelsLoading,
    isSuccess: !!investmentLabels,
    refetch: () => {
      return Promise.resolve({ data: investmentLabels })
    },
    getLabel,
    hasLabels,
    getAvailableLanguages,
    hasCache: !!investmentLabels,
    cacheStatus: investmentLabels ? 'cached' : investmentLabelsLoading ? 'Loading...' : 'fresh',
  }
}

