import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
export interface WorkflowAmountRuleLabelResponse {
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

export type ProcessedWorkflowAmountRuleLabels = Record<
  string,
  Record<string, string>
> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch workflow amount rule labels'
export class WorkflowAmountRuleLabelsService {
  static async fetchLabels(): Promise<WorkflowAmountRuleLabelResponse[]> {
    try {
      const { token } = getAuthCookies()

      if (!token) {
        throw new Error('Authentication token not found')
      }
      const labels = await apiClient.get<WorkflowAmountRuleLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_AMOUNT_RULE,
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
    labels: WorkflowAmountRuleLabelResponse[]
  ): ProcessedWorkflowAmountRuleLabels {
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
    labels: ProcessedWorkflowAmountRuleLabels,
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

  static hasLabels(labels: ProcessedWorkflowAmountRuleLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(
    labels: ProcessedWorkflowAmountRuleLabels
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

export default WorkflowAmountRuleLabelsService
