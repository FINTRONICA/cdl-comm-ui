import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

// Types for Beneficiary dropdown responses
export interface BeneficiaryDropdownResponse {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: {
    id: number
    configId: string        // Stable identifier (e.g., "BANK_SBI")
    configValue: string     // Display value (e.g., "State Bank of India")
    content: string | null
    status: string | null
    enabled: boolean
  }
  remarks: string | null
  status: string | null
  enabled: boolean
}

export interface BeneficiaryDropdownOption {
  id: number
  configId: string         // Stable identifier for mapping
  configValue: string      // Display value
  settingValue: string     // Backend value
  enabled: boolean
}

export type ProcessedBeneficiaryDropdowns = Record<string, BeneficiaryDropdownOption[]>

const ERROR_MESSAGE = 'Failed to fetch beneficiary dropdown data'

export class BeneficiaryDropdownService {
  static async fetchBankNames(): Promise<BeneficiaryDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const bankNames = await apiClient.get<BeneficiaryDropdownResponse[]>(
        API_ENDPOINTS.BENEFICIARY_DROPDOWNS.BANK_NAMES,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('✅ BeneficiaryDropdownService: Bank names fetched successfully')
      console.log('📊 Bank Names API Response:', bankNames)
      return bankNames
    } catch (error) {
      console.error('❌ BeneficiaryDropdownService: Error fetching bank names:', error)
      throw new Error(ERROR_MESSAGE)
    }
  }

  static async fetchTransferTypes(): Promise<BeneficiaryDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const transferTypes = await apiClient.get<BeneficiaryDropdownResponse[]>(
        API_ENDPOINTS.BENEFICIARY_DROPDOWNS.TRANSFER_TYPES,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('✅ BeneficiaryDropdownService: Transfer types fetched successfully')
      console.log('📊 Transfer Types API Response:', transferTypes)
      return transferTypes
    } catch (error) {
      console.error('❌ BeneficiaryDropdownService: Error fetching transfer types:', error)
      throw new Error(ERROR_MESSAGE)
    }
  }

  /**
   * Process and transform raw API response to dropdown format (generic method)
   */
  static processDropdownOptions(options: BeneficiaryDropdownResponse[]): BeneficiaryDropdownOption[] {
    return options
      .filter(option => option.enabled)
      .map(option => ({
        id: option.id,
        configId: option.languageTranslationId.configId,
        configValue: option.languageTranslationId.configValue,
        settingValue: option.settingValue,
        enabled: option.enabled
      }))
  }

  /**
   * Get display label with fallback mechanism
   */
  static getDisplayLabel(
    option: BeneficiaryDropdownOption,
    fallbackValue?: string
  ): string {
    // Priority: configValue -> fallbackValue -> formatted configId
    if (option.configValue && option.configValue.trim()) {
      return option.configValue.trim()
    }
    
    if (fallbackValue && fallbackValue.trim()) {
      return fallbackValue.trim()
    }
    
    return this.formatConfigId(option.configId)
  }

  /**
   * Format configId to readable text (fallback)
   */
  private static formatConfigId(configId: string): string {
    return configId
      .replace(/^BANK_/, '')
      .replace(/^BENEFICIARY_/, '')
      .replace(/^TRANSFER_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Get option by ID
   */
  static getOptionById(options: BeneficiaryDropdownOption[], id: number): BeneficiaryDropdownOption | undefined {
    return options.find(option => option.id === id)
  }

  /**
   * Get option by configId
   */
  static getOptionByConfigId(options: BeneficiaryDropdownOption[], configId: string): BeneficiaryDropdownOption | undefined {
    return options.find(option => option.configId === configId)
  }

  /**
   * Check if dropdown options are available
   */
  static hasOptions(options: BeneficiaryDropdownOption[]): boolean {
    return options && options.length > 0
  }
}
