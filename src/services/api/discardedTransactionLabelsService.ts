import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

export interface DiscardedTransactionLabelResponse {
  id: string
  key: string
  value: string
  language: string
  category: string
}

export type ProcessedDiscardedTransactionLabels = Record<
  string,
  Record<string, string>
>

class DiscardedTransactionLabelsService {
  /**
   * Fetch discarded transaction labels from API
   */
  static async fetchLabels(): Promise<DiscardedTransactionLabelResponse[]> {
    try {
      

      const response = await apiClient.get<DiscardedTransactionLabelResponse[]>(
        buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.TRANSCATIONS_LABEL)
      )

     

      return response || []
    } catch (error) {
      
      throw error
    }
  }

  /**
   * Process raw API labels into structured format
   */
  static processLabels(
    rawLabels: DiscardedTransactionLabelResponse[]
  ): ProcessedDiscardedTransactionLabels {
    

    const processed = rawLabels.reduce(
      (acc: ProcessedDiscardedTransactionLabels, label) => {
        const { key, value, language } = label

        if (!acc[key]) {
          acc[key] = {}
        }

        acc[key][language] = value
        return acc
      },
      {}
    )

   

    return processed
  }

  /**
   * Get label by key, language with fallback
   */
  static getLabel(
    labels: ProcessedDiscardedTransactionLabels,
    key: string,
    language: string,
    fallback: string
  ): string {
    if (!labels || !labels[key]) {
      return fallback
    }

    const labelsByLanguage = labels[key]
    if (!labelsByLanguage) {
      return fallback
    }

    // Try exact language match first
    if (labelsByLanguage[language]) {
      return labelsByLanguage[language]
    }

    // Try English as fallback
    if (labelsByLanguage['en']) {
      return labelsByLanguage['en']
    }

    // Try any available language
    const availableLanguages = Object.keys(labelsByLanguage)
    if (availableLanguages.length > 0) {
      const firstLanguage = availableLanguages[0]
      if (firstLanguage && labelsByLanguage[firstLanguage]) {
        return labelsByLanguage[firstLanguage]
      }
    }

    return fallback
  }

  /**
   * Check if labels are available
   */
  static hasLabels(labels: ProcessedDiscardedTransactionLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  /**
   * Get available languages for labels
   */
  static getAvailableLanguages(
    labels: ProcessedDiscardedTransactionLabels
  ): string[] {
    if (!labels || Object.keys(labels).length === 0) {
      return []
    }

    const languageSet = new Set<string>()
    Object.values(labels).forEach((labelsByLang) => {
      Object.keys(labelsByLang).forEach((lang) => {
        languageSet.add(lang)
      })
    })

    return Array.from(languageSet)
  }

  /**
   * Get all labels for a specific language
   */
  static getLabelsForLanguage(
    labels: ProcessedDiscardedTransactionLabels,
    language: string
  ): Record<string, string> {
    if (!labels) {
      return {}
    }

    const result: Record<string, string> = {}
    Object.entries(labels).forEach(([key, labelsByLang]) => {
      if (!labelsByLang) return

      if (labelsByLang[language]) {
        result[key] = labelsByLang[language]
      } else if (labelsByLang['en']) {
        // Fallback to English
        result[key] = labelsByLang['en']
      } else {
        // Use first available language
        const availableLangs = Object.keys(labelsByLang)
        if (availableLangs.length > 0) {
          const firstLang = availableLangs[0]
          if (firstLang && labelsByLang[firstLang]) {
            result[key] = labelsByLang[firstLang]
          }
        }
      }
    })

    return result
  }

  /**
   * Search labels by partial key match
   */
  static searchLabels(
    labels: ProcessedDiscardedTransactionLabels,
    searchTerm: string,
    language: string = 'en'
  ): Record<string, string> {
    if (!labels || !searchTerm) {
      return {}
    }

    const result: Record<string, string> = {}
    const searchLower = searchTerm.toLowerCase()

    Object.entries(labels).forEach(([key]) => {
      const keyLower = key.toLowerCase()
      const labelValue = DiscardedTransactionLabelsService.getLabel(
        labels,
        key,
        language,
        key
      )
      const labelLower = labelValue.toLowerCase()

      if (keyLower.includes(searchLower) || labelLower.includes(searchLower)) {
        result[key] = labelValue
      }
    })

    return result
  }
}

export default DiscardedTransactionLabelsService
