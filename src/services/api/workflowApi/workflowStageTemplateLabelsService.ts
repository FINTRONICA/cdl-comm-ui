import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import apiClient from '@/lib/apiClient'
import { getAuthCookies } from '@/utils/cookieUtils'
import { toast } from 'react-hot-toast'

export interface WorkflowStageTemplateLabelResponse {
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

export type ProcessedWorkflowStageTemplateLabels = Record<
  string,
  Record<string, string>
>

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch workflow stage template labels'

export class WorkflowStageTemplateLabelsService {
  static async fetchLabels(): Promise<WorkflowStageTemplateLabelResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }

      const labels = await apiClient.get<WorkflowStageTemplateLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_STAGE_TEMPLATE,
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
    labels: WorkflowStageTemplateLabelResponse[]
  ): ProcessedWorkflowStageTemplateLabels {
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
    labels: ProcessedWorkflowStageTemplateLabels,
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

  static hasLabels(labels: ProcessedWorkflowStageTemplateLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(
    labels: ProcessedWorkflowStageTemplateLabels
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

export default WorkflowStageTemplateLabelsService
