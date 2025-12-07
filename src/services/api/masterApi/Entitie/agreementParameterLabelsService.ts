import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

export interface AgreementParameterLabelResponse {
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

export type ProcessedAgreementParameterLabels = Record<string, Record<string, string>> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch agreement parameter labels'

export class AgreementParameterLabelsService {
    static async fetchLabels(): Promise<AgreementParameterLabelResponse[]> {
        try {
            const { token } = getAuthCookies()

            if (!token) {
                throw new Error('Authentication token not found')
            }
            const labels = await apiClient.get<AgreementParameterLabelResponse[]>(
                API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUILD_PARTNER_ASSET,
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

    static processLabels(labels: AgreementParameterLabelResponse[]): ProcessedAgreementParameterLabels {
        return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
            if (!processedLabels[configId]) {
                processedLabels[configId] = {}
            }
            processedLabels[configId][appLanguageCode.languageCode] = configValue
            return processedLabels
        }, {} as Record<string, Record<string, string>>)
    }

    static getLabel(
        labels: ProcessedAgreementParameterLabels,
        configId: string,
        language: string,
        fallback: string
    ): string {
        const languageLabels = labels[configId]
        return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
    }

    static hasLabels(labels: ProcessedAgreementParameterLabels): boolean {
        return labels && Object.keys(labels).length > 0
    }

    static getAvailableLanguages(labels: ProcessedAgreementParameterLabels): string[] {
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

export default AgreementParameterLabelsService

