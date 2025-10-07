import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

// Types for Developer dropdown responses
export interface DeveloperDropdownResponse {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: {
    id: number
    configId: string        // Stable identifier (e.g., "CDL_REGULATOR_AJMAN")
    configValue: string     // Display value (e.g., "Ajman")
    content: string | null
    status: string | null
    enabled: boolean
  }
  remarks: string | null
  status: string | null
  enabled: boolean
}

export interface DeveloperDropdownOption {
  id: number
  configId: string         // Stable identifier for mapping
  configValue: string      // Display value
  settingValue: string     // Backend value
  enabled: boolean
}

export type ProcessedDeveloperDropdowns = Record<string, DeveloperDropdownOption[]>

const ERROR_MESSAGE = 'Failed to fetch developer dropdown data'

export class DeveloperDropdownService {
  /**
   * Fetch regulatory authorities from the API
   */
  static async fetchRegulatoryAuthorities(): Promise<DeveloperDropdownResponse[]> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const authorities = await apiClient.get<DeveloperDropdownResponse[]>(
        API_ENDPOINTS.DEVELOPER_DROPDOWNS.REGULATORY_AUTHORITIES,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('✅ DeveloperDropdownService: Regulatory authorities fetched successfully')
      console.log('📊 Regulatory Authorities API Response:', authorities)
      return authorities
    } catch (error) {
      console.error('❌ DeveloperDropdownService: Error fetching regulatory authorities:', error)
      throw new Error(ERROR_MESSAGE)
    }
  }


  /**
   * Process and transform raw API response to dropdown format
   */
  static processRegulatoryAuthorities(authorities: DeveloperDropdownResponse[]): DeveloperDropdownOption[] {
    return authorities
      .filter(authority => authority.enabled)
      .map(authority => ({
        id: authority.id,
        configId: authority.languageTranslationId.configId,
        configValue: authority.languageTranslationId.configValue,
        settingValue: authority.settingValue,
        enabled: authority.enabled
      }))
  }

  /**
   * Process and transform raw API response to dropdown format (generic method)
   */
  static processDropdownOptions(options: DeveloperDropdownResponse[]): DeveloperDropdownOption[] {
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
    option: DeveloperDropdownOption,
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
      .replace(/^CDL_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Get option by ID
   */
  static getOptionById(options: DeveloperDropdownOption[], id: number): DeveloperDropdownOption | undefined {
    return options.find(option => option.id === id)
  }

  /**
   * Get option by configId
   */
  static getOptionByConfigId(options: DeveloperDropdownOption[], configId: string): DeveloperDropdownOption | undefined {
    return options.find(option => option.configId === configId)
  }

  /**
   * Check if dropdown options are available
   */
  static hasOptions(options: DeveloperDropdownOption[]): boolean {
    return options && options.length > 0
  }
}
