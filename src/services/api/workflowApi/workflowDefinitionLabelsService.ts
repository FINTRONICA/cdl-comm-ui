import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
import { toast } from 'react-hot-toast'

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
  applicationModuleDTO?: {
    id: number
    moduleName: string
    moduleDescription?: string
    active?: boolean
  }
  status?: string | null
  enabled?: boolean
}

export type ProcessedWorkflowDefinitionLabels = Record<
  string,
  Record<string, string>
>

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE_FETCH = 'Failed to fetch workflow definition labels'

export class WorkflowDefinitionLabelsService {
  static async fetchLabels(): Promise<WorkflowDefinitionLabelResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }

      const labels = await apiClient.get<WorkflowDefinitionLabelResponse[]>(
        buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_DEFINITION),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return labels
    } catch (error) {
     toast.error(`${error}`)
      throw new Error(ERROR_MESSAGE_FETCH)
    }
  }

  static processLabels(
    labels: WorkflowDefinitionLabelResponse[]
  ): ProcessedWorkflowDefinitionLabels {
    return labels.reduce((acc, { configId, configValue, appLanguageCode }) => {
      if (!configId) return acc
      if (!acc[configId]) acc[configId] = {}
      acc[configId][appLanguageCode.languageCode] = configValue
      return acc
    }, {} as ProcessedWorkflowDefinitionLabels)
  }

  static getLabel(
    labels: ProcessedWorkflowDefinitionLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    if (!labels || !configId) return fallback
    const languageLabels = labels[configId]
    if (!languageLabels) return fallback
    return (
      languageLabels[language] || languageLabels[DEFAULT_LANGUAGE] || fallback
    )
  }

  static hasLabels(labels: ProcessedWorkflowDefinitionLabels): boolean {
    return !!labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(
    labels: ProcessedWorkflowDefinitionLabels
  ): string[] {
    try {
      const languages = new Set<string>()
      if (!labels) return [DEFAULT_LANGUAGE]

      Object.values(labels).forEach((languageMap) => {
        Object.keys(languageMap).forEach((lang) => languages.add(lang))
      })

      return Array.from(languages)
    } catch (error) {
     toast.error(`${error}`)
      return [DEFAULT_LANGUAGE]
    }
  }
}

export default WorkflowDefinitionLabelsService
