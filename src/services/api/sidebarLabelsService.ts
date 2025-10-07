import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getConfigId } from '@/constants/mappings/sidebarMapping'
import { SidebarLabelResponse, ProcessedLabels } from '@/types/sidebarLabels'
import { getAuthCookies } from '@/utils/cookieUtils'

// Constants
const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch sidebar labels'

export class SidebarLabelsService {
  static async fetchLabels(): Promise<SidebarLabelResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const labels = await apiClient.get<SidebarLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.NAV_MENU,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      return labels
    } catch (error) {
      throw new Error(ERROR_MESSAGE)
    }
  }

  static processLabels(labels: SidebarLabelResponse[]): ProcessedLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId]![appLanguageCode.languageCode] = configValue
     
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {

    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static getLabelBySidebarId(
    labels: ProcessedLabels,
    sidebarId: string,
    language: string,
    fallback: string
  ): string {
    try {
      const configId = getConfigId(sidebarId)
      return this.getLabel(labels, configId, language, fallback)
    } catch (error) {
      return fallback
    }
  }

  static hasLabels(labels: ProcessedLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedLabels): string[] {
    try {
      const languages = new Set<string>()
      
      Object.values(labels).forEach(languageLabels => {
        Object.keys(languageLabels).forEach(language => {
          languages.add(language)
        })
      })
      
      return Array.from(languages)
    } catch (error) {
      return [DEFAULT_LANGUAGE]
    }
  }
}

export default SidebarLabelsService
