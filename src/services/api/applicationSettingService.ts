import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// Application Setting types
export interface ApplicationSetting {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: {
    id: number
    configId: string
    configValue: string
    content: string | null
    status: string | null
    enabled: boolean
    deleted: boolean | null
  }
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface DropdownOption {
  value: string
  label: string
  id: number
}

export class ApplicationSettingService {
  /**
   * Get application settings by setting key
   */
  async getApplicationSettingsByKey(settingKey: string): Promise<ApplicationSetting[]> {
    try {
      const params = new URLSearchParams({
        'settingKey.equals': settingKey
      })
      
      const url = `${buildApiUrl(API_ENDPOINTS.APPLICATION_SETTING.GET_ALL)}?${params.toString()}`
      
      const result = await apiClient.get<ApplicationSetting[]>(url)
      
      return result || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Get dropdown options for any setting key
   */
  async getDropdownOptionsByKey(settingKey: string): Promise<DropdownOption[]> {
    try {
      const settings = await this.getApplicationSettingsByKey(settingKey)
      
      if (!settings || settings.length === 0) {
        return []
      }
      
      // Map settings to dropdown options
      const options: DropdownOption[] = settings
        .filter(setting => {
          const isEnabled = setting.enabled !== false // Allow undefined/null as enabled
          const isNotDeleted = setting.deleted !== true // Only exclude if explicitly true
          return isEnabled && isNotDeleted
        })
        .map(setting => {
          const label = setting.languageTranslationId?.configValue || setting.settingValue || 'Unknown'
          return {
            id: setting.id,
            value: setting.settingValue,
            label: label
          }
        })
      
      return options
    } catch (err) {
      throw err // Re-throw to let caller handle
    }
  }

  /**
   * Get document types for investor ID (specific use case)
   */
  async getDocumentTypes(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('INVESTOR_ID_TYPE')
  }

  /**
   * Get fee categories
   */
  async getFeeCategories(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('FEE_CATEGORY')
  }

  /**
   * Get fee frequencies
   */
  async getFeeFrequencies(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('FEE_FREQUENCY')
  }

  /**
   * Get currencies
   */
  async getCurrencies(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('CURRENCY')
  }

  /**
   * Get transfer types
   */
  async getTransferTypes(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('TRANSFER_TYPE')
  }

  /**
   * Get regulatory authorities
   */
  async getRegulatoryAuthorities(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('REGULATOR')
  }

  /**
   * Get build asset types
   */
  async getBuildAssetTypes(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('BUILD_ASSEST_TYPE')
  }

  /**
   * Get build asset statuses
   */
  async getBuildAssetStatuses(): Promise<DropdownOption[]> {
    return this.getDropdownOptionsByKey('BUILD_ASSEST_STATUS')
  }

  /**
   * Generic method to get any dropdown by setting key with fallback options
   */
  async getDropdownWithFallback(
    settingKey: string, 
    fallbackOptions: DropdownOption[] = []
  ): Promise<DropdownOption[]> {
    try {
      const options = await this.getDropdownOptionsByKey(settingKey)
      return options.length > 0 ? options : fallbackOptions
    } catch (err) {
      return fallbackOptions
    }
  }
}

export const applicationSettingService = new ApplicationSettingService()
