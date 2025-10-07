import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import apiClient from '@/lib/apiClient'
import { getAuthCookies } from '@/utils/cookieUtils'

export interface WorkflowRequestLabelResponse {
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

export type ProcessedWorkflowRequestLabels = Record<
    string,
    Record<string, string>
>

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch workflow request labels'

export class WorkflowRequestLabelsService {
    static async fetchLabels(): Promise<WorkflowRequestLabelResponse[]> {
        try {
            const { token } = getAuthCookies()

            if (!token) {
                throw new Error('Authentication token not found')
            }
            const labels = await apiClient.get<WorkflowRequestLabelResponse[]>(
                API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_REQUEST_LABELS,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            return labels
        } catch (error) {
            console.log(
                ' WorkflowRequestLabelsService: Error fetching labels:',
                error
            )
            throw new Error(ERROR_MESSAGE)
        }
    }


    static processLabels(
        labels: WorkflowRequestLabelResponse[]
    ): ProcessedWorkflowRequestLabels {
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
        labels: ProcessedWorkflowRequestLabels,
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


    static hasLabels(labels: ProcessedWorkflowRequestLabels): boolean {
        return labels && Object.keys(labels).length > 0
    }


    static getAvailableLanguages(
        labels: ProcessedWorkflowRequestLabels
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
            console.error(
                'WorkflowRequestLabelsService: Error getting available languages:',
                error
            )
            return [DEFAULT_LANGUAGE]
        }
    }
}

export default WorkflowRequestLabelsService
