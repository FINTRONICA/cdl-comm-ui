import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

export interface BeneficiaryLabelResponse {
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

export type ProcessedBeneficiaryLabels = Record<string, Record<string, string>> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch product program labels'

export class BeneficiaryLabelsService {
  static async fetchLabels(): Promise<BeneficiaryLabelResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
        const labels = await apiClient.get<BeneficiaryLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY,
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

  static processLabels(labels: BeneficiaryLabelResponse[]): ProcessedBeneficiaryLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedBeneficiaryLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedBeneficiaryLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedBeneficiaryLabels): string[] {
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

export default BeneficiaryLabelsService
