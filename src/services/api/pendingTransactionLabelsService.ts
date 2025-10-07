import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

export interface PendingTransactionLabelResponse {
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

export type ProcessedPendingTransactionLabels = Record<
  string,
  Record<string, string>
> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch pending transaction labels'

export class PendingTransactionLabelsService {
  /**
   * Fetch pending transaction labels from the API
   */
  static async fetchLabels(): Promise<PendingTransactionLabelResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }

      const labels = await apiClient.get<PendingTransactionLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.TRANSCATIONS_LABEL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return labels
    } catch (error) {
      throw new Error(ERROR_MESSAGE)
    }
  }

  static processLabels(
    labels: PendingTransactionLabelResponse[]
  ): ProcessedPendingTransactionLabels {
    return labels.reduce(
      (processedLabels, { configId, configValue, appLanguageCode }) => {
        if (!processedLabels[configId]) {
          processedLabels[configId] = {}
        }
        processedLabels[configId][appLanguageCode?.languageCode] = configValue
        return processedLabels
      },
      {} as Record<string, Record<string, string>>
    )
  }

  /**
   * Get a specific label by configId and language with fallback
   */
  static getLabel(
    labels: ProcessedPendingTransactionLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return (
      languageLabels?.[language] ||
      languageLabels?.[DEFAULT_LANGUAGE] ||
      fallback
    )
  }

  /**
   * Check if labels are available
   */
  static hasLabels(labels: ProcessedPendingTransactionLabels): boolean {
    return !!labels && Object.keys(labels).length > 0
  }

  /**
   * Get available languages from processed labels
   */
  static getAvailableLanguages(
    labels: ProcessedPendingTransactionLabels
  ): string[] {
    try {
      const languages = new Set<string>()

      Object.values(labels).forEach((languageLabels) => {
        Object.keys(languageLabels).forEach((language) => {
          languages.add(language)
        })
      })

      return Array.from(languages)
    } catch (error) {
      return [DEFAULT_LANGUAGE]
    }
  }
}

export default PendingTransactionLabelsService
