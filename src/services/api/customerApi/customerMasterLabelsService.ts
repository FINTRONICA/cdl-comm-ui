import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

export interface CustomerMasterLabelResponse {
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

export type ProcessedCustomerMasterLabels = Record<string, Record<string, string>> // configId -> language -> label

const DEFAULT_LANGUAGE = 'EN'
const ERROR_MESSAGE = 'Failed to fetch customer master labels'

export class CustomerMasterLabelsService {
  static async fetchLabels(): Promise<CustomerMasterLabelResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      const labels = await apiClient.get<CustomerMasterLabelResponse[]>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CUSTOMER_MASTER_LABEL,
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

  static processLabels(labels: CustomerMasterLabelResponse[]): ProcessedCustomerMasterLabels {
    return labels.reduce((processedLabels, { configId, configValue, appLanguageCode }) => {
      if (!processedLabels[configId]) {
        processedLabels[configId] = {}
      }
      processedLabels[configId][appLanguageCode.languageCode] = configValue
      return processedLabels
    }, {} as Record<string, Record<string, string>>)
  }

  static getLabel(
    labels: ProcessedCustomerMasterLabels,
    configId: string,
    language: string,
    fallback: string
  ): string {
    const languageLabels = labels[configId]
    return languageLabels?.[language] || languageLabels?.[DEFAULT_LANGUAGE] || fallback
  }

  static hasLabels(labels: ProcessedCustomerMasterLabels): boolean {
    return labels && Object.keys(labels).length > 0
  }

  static getAvailableLanguages(labels: ProcessedCustomerMasterLabels): string[] {
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

  // Get customer master labels by language
  static async getLabels(language: string = 'EN'): Promise<ProcessedCustomerMasterLabels> {
    try {
      const labels = await this.fetchLabels()
      const processedLabels = this.processLabels(labels)
      return processedLabels
    } catch (error) {
      throw new Error(ERROR_MESSAGE)
    }
  }

  // Get customer master label by config ID
  static async getLabelByConfigId(configId: string, language: string = 'EN'): Promise<string> {
    try {
      const labels = await this.getLabels(language)
      return this.getLabel(labels, configId, language, configId)
    } catch (error) {
      throw new Error(ERROR_MESSAGE)
    }
  }

  // Create customer master label
  static async createLabel(data: any): Promise<CustomerMasterLabelResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const response = await apiClient.post<CustomerMasterLabelResponse>(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CUSTOMER_MASTER,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response
    } catch (error) {
      throw new Error('Failed to create customer master label')
    }
  }

  // Update customer master label
  static async updateLabel(id: string, data: any): Promise<CustomerMasterLabelResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const response = await apiClient.put<CustomerMasterLabelResponse>(
        `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CUSTOMER_MASTER}/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response
    } catch (error) {
      throw new Error('Failed to update customer master label')
    }
  }

  // Delete customer master label
  static async deleteLabel(id: string): Promise<void> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      await apiClient.delete(
        `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CUSTOMER_MASTER}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
    } catch (error) {
      throw new Error('Failed to delete customer master label')
    }
  }

  // Get all available languages for customer master labels
  static async getAvailableLanguages(): Promise<string[]> {
    try {
      const labels = await this.fetchLabels()
      const processedLabels = this.processLabels(labels)
      return this.getAvailableLanguages(processedLabels)
    } catch (error) {
      return [DEFAULT_LANGUAGE]
    }
  }
}

export default CustomerMasterLabelsService
