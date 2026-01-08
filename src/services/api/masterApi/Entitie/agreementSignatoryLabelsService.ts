import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
export interface AgreementSignatoryLabelResponse {
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

export type ProcessedAgreementSignatoryLabels = Record<string, Record<string, string>>
export class AgreementSignatoryLabelsService {

  static async fetchLabels(): Promise<AgreementSignatoryLabelResponse[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ESCROW_AGREEMENT)
      const response = await apiClient.get<AgreementSignatoryLabelResponse[]>(url)
      return Array.isArray(response) ? response : []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching agreement signatory labels:', error)
      }
      return []
    }
  }

  static processLabels(labels: AgreementSignatoryLabelResponse[]): ProcessedAgreementSignatoryLabels {
    const processed: ProcessedAgreementSignatoryLabels = {}

    labels.forEach((label) => {
      const configId = label.configId
      const language = label.appLanguageCode?.languageCode || 'EN'
      const configValue = label.configValue || label.content || ''

      if (!processed[configId]) {
        processed[configId] = {}
      }

      processed[configId][language] = configValue
    })

    return processed
  }

  static getLabel(
    labels: ProcessedAgreementSignatoryLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    return labels[configId]?.[language] || labels[configId]?.['EN'] || fallback
  }

  static hasLabels(labels: ProcessedAgreementSignatoryLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedAgreementSignatoryLabels): string[] {
    const languages = new Set<string>()
    Object.values(labels).forEach((langMap) => {
      Object.keys(langMap).forEach((lang) => languages.add(lang))
    })
    return Array.from(languages)
  }
}
