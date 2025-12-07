import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
import { ProcessedProductProgramLabels, ProcessedProductProgramLabels, ProductProgramLabelResponse } from './productProgramLabelsService'

export interface CountryLabelResponse {
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

export type ProcessedCountryLabels = Record<string, Record<string, string>> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch country labels'

export class CountryLabelsService {
  static async fetchLabels(): Promise<CountryLabelResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      const labels = await apiClient.get<CountryLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return labels
    } catch {
      throw new Error(ERROR_MESSAGE)
    }
  }

  static processLabels(labels: CountryLabelResponse[]): ProcessedCountryLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedCountryLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedCountryLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedCountryLabels): string[] {
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

export default CountryLabelsService
