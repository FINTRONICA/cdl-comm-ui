import { useCallback } from 'react'
import { useLabels, useLabelsLoadingState } from '@/store'
import { AgreementTypeLabelsService } from '@/services/api/masterApi/Customer/agreementTypeLabelsService'
export interface AgreementTypeLabelsResponse {
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

export type ProcessedAgreementTypeLabels = Record<string, Record<string, string>>

const DEFAULT_LANGUAGE = 'EN'

export class AgreementTypeLabelsServiceHook {
  static processLabels(labels: AgreementTypeLabelsResponse[]): ProcessedAgreementTypeLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedAgreementTypeLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedAgreementTypeLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedAgreementTypeLabels): string[] {
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

export function useAgreementTypeLabelsWithCache() {
  const { agreementTypeLabels } = useLabels()
  const { agreementTypeLabelsLoading } = useLabelsLoadingState()

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
            if (agreementTypeLabels) {
        return AgreementTypeLabelsService.getLabel(agreementTypeLabels, configId, language, fallback)
      }
      return fallback
    },
    [agreementTypeLabels]
  )

  const hasLabels = useCallback(() => {
    return AgreementTypeLabelsService.hasLabels(agreementTypeLabels || {})
    }, [agreementTypeLabels])

  const getAvailableLanguages = useCallback(() => {
    return AgreementTypeLabelsService.getAvailableLanguages(agreementTypeLabels || {})
  }, [agreementTypeLabels])

  return {
    data: agreementTypeLabels,
    isLoading: agreementTypeLabelsLoading,
    error: null,
    isError: false,
    isFetching: agreementTypeLabelsLoading,
    isSuccess: !!agreementTypeLabels,
    refetch: () => {
      return Promise.resolve({ data: agreementTypeLabels })
    },
    getLabel,
    hasLabels,
    getAvailableLanguages,
    hasCache: !!agreementTypeLabels,
    cacheStatus: agreementTypeLabels ? 'cached' : agreementTypeLabelsLoading ? 'Loading...' : 'fresh',
  }
}

