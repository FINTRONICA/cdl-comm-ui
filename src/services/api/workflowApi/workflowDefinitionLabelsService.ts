import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
export interface WorkflowDefinitionLabelResponse {
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

export type ProcessedWorkflowDefinitionLabels = Record<string, Record<string, string>> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch workflow definition labels'
export class WorkflowDefinitionLabelsService {
  static async fetchLabels(): Promise<WorkflowDefinitionLabelResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }
      const labels = await apiClient.get<WorkflowDefinitionLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_DEFINITION,
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

  static processLabels(labels: WorkflowDefinitionLabelResponse[]): ProcessedWorkflowDefinitionLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedWorkflowDefinitionLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedWorkflowDefinitionLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedWorkflowDefinitionLabels): string[] {
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

export default WorkflowDefinitionLabelsService
