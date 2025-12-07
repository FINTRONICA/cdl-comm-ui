import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import apiClient from '@/lib/apiClient'
import { getAuthCookies } from '@/utils/cookieUtils'
import { toast } from 'react-hot-toast'

export interface WorkflowActionLabelResponse {
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

export type ProcessedWorkflowActionLabels = Record<
  string,
  Record<string, string>
>

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch workflow action labels'

export class WorkflowActionLabelsService {
  static async fetchLabels(): Promise<WorkflowActionLabelResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }
      const labels = await apiClient.get<WorkflowActionLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_ACTIONS,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return labels
    } catch (error) {
      toast.error(`${error}`)
      throw new Error(ERROR_MESSAGE)
    }
  }

  static processLabels(
    labels: WorkflowActionLabelResponse[]
  ): ProcessedWorkflowActionLabels {
    return labels.reduce(
      (processedLabels, { configId, configValue, appLanguageCode }) => {
        if (!processedLabels[configId]) {
          processedLabels[configId] = {}
        }
        processedLabels[configId][appLanguageCode.languageCode] = configValue
        return processedLabels
      },
      {} as Record<string, Record<string, string>>
    )
  }

  static getLabel(
    labels: ProcessedWorkflowActionLabels,
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

  static hasLabels(labels: ProcessedWorkflowActionLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(
    labels: ProcessedWorkflowActionLabels
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
      toast.error(`${error}`)
      return [DEFAULT_LANGUAGE]
    }
  }
}

export default WorkflowActionLabelsService

