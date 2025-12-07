import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
import { toast } from 'react-hot-toast'

export interface WorkflowAmountStageOverrideLabelResponse {
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

export type ProcessedWorkflowAmountStageOverrideLabels = Record<
  string,
  Record<string, string>
>
const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch workflow amount stage override labels'

export class WorkflowAmountStageOverrideLabelsService {
  static async fetchLabels(): Promise<
    WorkflowAmountStageOverrideLabelResponse[]
  > {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }

      const labels = await apiClient.get<
        WorkflowAmountStageOverrideLabelResponse[]
      >(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_AMOUNT_STAGE_OVERRIDE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return labels
    } catch (error) {
      toast.error(`${error}`)
      throw new Error(ERROR_MESSAGE)
    }
  }

  static processLabels(
    labels: WorkflowAmountStageOverrideLabelResponse[]
  ): ProcessedWorkflowAmountStageOverrideLabels {
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
    labels: ProcessedWorkflowAmountStageOverrideLabels,
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

  static hasLabels(
    labels: ProcessedWorkflowAmountStageOverrideLabels
  ): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(
    labels: ProcessedWorkflowAmountStageOverrideLabels
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

export default WorkflowAmountStageOverrideLabelsService
