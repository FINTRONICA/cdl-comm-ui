import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
import { FeeDropdownService } from './feeDropdownService'

// Types for Project dropdown responses
export interface ProjectDropdownResponse {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: {
    id: number
    configId: string        // Stable identifier (e.g., "CDL_PROJECT_TYPE_RESIDENTIAL")
    configValue: string     // Display value (e.g., "Residential")
    content: string | null
    status: string | null
    enabled: boolean
  }
  remarks: string | null
  status: string | null
  enabled: boolean
}

export interface ProjectDropdownOption {
  id: number
  configId: string         // Stable identifier for mapping
  configValue: string      // Display value
  settingValue: string     // Backend value
  enabled: boolean
}

const ERROR_MESSAGE = 'Failed to fetch project dropdown data'

export class ProjectDropdownService {
  /**
   * Fetch project types from the API
   */
  static async fetchProjectTypes(): Promise<ProjectDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const projectTypes = await apiClient.get<ProjectDropdownResponse[]>(
        API_ENDPOINTS.PROJECT_DROPDOWNS.TYPES,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('✅ ProjectDropdownService.fetchProjectTypes Success:', { 
        hasResult: !!projectTypes, 
        resultType: typeof projectTypes, 
        resultLength: projectTypes?.length || 0,
        timestamp: new Date().toISOString() 
      })
      
      return projectTypes
    } catch (error) {
      console.error('❌ ProjectDropdownService.fetchProjectTypes Failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetch project statuses from the API
   */
  static async fetchProjectStatuses(): Promise<ProjectDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const projectStatuses = await apiClient.get<ProjectDropdownResponse[]>(
        API_ENDPOINTS.PROJECT_DROPDOWNS.STATUSES,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('✅ ProjectDropdownService.fetchProjectStatuses Success:', { 
        hasResult: !!projectStatuses, 
        resultType: typeof projectStatuses, 
        resultLength: projectStatuses?.length || 0,
        timestamp: new Date().toISOString() 
      })
      
      return projectStatuses
    } catch (error) {
      console.error('❌ ProjectDropdownService.fetchProjectStatuses Failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process project types into dropdown options
   */
  static processProjectTypes(rawData: ProjectDropdownResponse[]): ProjectDropdownOption[] {
    return rawData
      .filter(item => item.enabled && item.languageTranslationId?.enabled)
      .map(item => ({
        id: item.id,
        configId: item.languageTranslationId.configId,
        configValue: item.languageTranslationId.configValue,
        settingValue: item.settingValue,
        enabled: item.enabled
      }))
      .sort((a, b) => a.configValue.localeCompare(b.configValue))
  }

  /**
   * Fetch project currencies from the API using existing fee dropdown service
   */
  static async fetchProjectCurrencies() {
    try {
      console.log('✅ ProjectDropdownService.fetchProjectCurrencies - Using existing FeeDropdownService')
      return await FeeDropdownService.fetchCurrencies()
    } catch (error) {
      console.error('❌ ProjectDropdownService.fetchProjectCurrencies Failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process project statuses into dropdown options
   */
  static processProjectStatuses(rawData: ProjectDropdownResponse[]): ProjectDropdownOption[] {
    return rawData
      .filter(item => item.enabled && item.languageTranslationId?.enabled)
      .map(item => ({
        id: item.id,
        configId: item.languageTranslationId.configId,
        configValue: item.languageTranslationId.configValue,
        settingValue: item.settingValue,
        enabled: item.enabled
      }))
      .sort((a, b) => a.configValue.localeCompare(b.configValue))
  }

  /**
   * Process project currencies into dropdown options using existing fee dropdown service
   */
  static async processProjectCurrencies() {
    try {
      console.log('✅ ProjectDropdownService.processProjectCurrencies - Using existing FeeDropdownService')
      const rawData = await FeeDropdownService.fetchCurrencies()
      return rawData
        .filter(item => item.enabled && item.languageTranslationId?.enabled)
        .map(item => ({
          id: item.id,
          configId: item.languageTranslationId.configId,
          configValue: item.languageTranslationId.configValue,
          settingValue: item.settingValue,
          enabled: item.enabled
        }))
        .sort((a, b) => a.configValue.localeCompare(b.configValue))
    } catch (error) {
      console.error('❌ ProjectDropdownService.processProjectCurrencies Failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetch bank account statuses from the API
   */
  static async fetchBankAccountStatuses(): Promise<ProjectDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const bankAccountStatuses = await apiClient.get<ProjectDropdownResponse[]>(
        API_ENDPOINTS.PROJECT_DROPDOWNS.BANK_ACCOUNT_STATUS,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('✅ ProjectDropdownService.fetchBankAccountStatuses Success:', { 
        hasResult: !!bankAccountStatuses, 
        resultType: typeof bankAccountStatuses, 
        resultLength: bankAccountStatuses?.length || 0,
        timestamp: new Date().toISOString() 
      })
      
      return bankAccountStatuses
    } catch (error) {
      console.error('❌ ProjectDropdownService.fetchBankAccountStatuses Failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process bank account statuses into dropdown options
   */
  static processBankAccountStatuses(rawData: ProjectDropdownResponse[]): ProjectDropdownOption[] {
    return rawData
      .filter(item => item.enabled && item.languageTranslationId?.enabled)
      .map(item => ({
        id: item.id,
        configId: item.languageTranslationId.configId,
        configValue: item.languageTranslationId.configValue,
        settingValue: item.settingValue,
        enabled: item.enabled
      }))
      .sort((a, b) => a.configValue.localeCompare(b.configValue))
  }

  /**
   * Fetch blocked payment types from the API
   */
  static async fetchBlockedPaymentTypes(): Promise<ProjectDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const blockedPaymentTypes = await apiClient.get<ProjectDropdownResponse[]>(
        API_ENDPOINTS.PROJECT_DROPDOWNS.BLOCKED_PAYMENT_TYPE,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      
      return blockedPaymentTypes
    } catch (error) {
      console.error('❌ ProjectDropdownService.fetchBlockedPaymentTypes Failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process blocked payment types into dropdown options
   */
  static processBlockedPaymentTypes(rawData: ProjectDropdownResponse[]): ProjectDropdownOption[] {
    return rawData
      .filter(item => item.enabled && item.languageTranslationId?.enabled)
      .map(item => ({
        id: item.id,
        configId: item.languageTranslationId.configId,
        configValue: item.languageTranslationId.configValue,
        settingValue: item.settingValue,
        enabled: item.enabled
      }))
      .sort((a, b) => a.configValue.localeCompare(b.configValue))
  }
}
