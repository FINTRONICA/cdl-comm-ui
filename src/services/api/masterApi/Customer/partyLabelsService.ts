// Temporarily commented out - Party labels imports
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

export interface PartyLabelsResponse {
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

export type ProcessedPartyLabels = Record<string, Record<string, string>> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch Party labels'

export class PartyLabelsService {
  static async fetchLabels(): Promise<PartyLabelsResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }
      // Temporarily commented out - Party labels endpoint
      const url = buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PARTY)
      const labels = await apiClient.get<PartyLabelsResponse[]>(url)
      return labels

      // Return empty array for now
      return []
    } catch {
      throw new Error(ERROR_MESSAGE)
    }
  }

  static processLabels(labels: PartyLabelsResponse[]): ProcessedPartyLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedPartyLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedPartyLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedPartyLabels): string[] {
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

export default PartyLabelsService
