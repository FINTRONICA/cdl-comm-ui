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
      
      console.log('[ApplicationSettingService] Fetching from URL:', url)
      
      const result = await apiClient.get<ApplicationSetting[]>(url)
      
      console.log('[ApplicationSettingService] API response:', result)
      
      return result || []
    } catch (error) {
      console.error('[ApplicationSettingService] Error in getApplicationSettingsByKey:', error)
      throw error
    }
  }

  /**
   * Get dropdown options for any setting key
   */
  async getDropdownOptionsByKey(settingKey: string): Promise<DropdownOption[]> {
    try {
      const settings = await this.getApplicationSettingsByKey(settingKey)
      
      console.log('[ApplicationSettingService] Raw settings for key:', settingKey, 'Count:', settings?.length || 0)
      console.log('[ApplicationSettingService] Raw settings data:', settings)
      
      if (!settings || settings.length === 0) {
        console.warn('[ApplicationSettingService] No settings returned from API for key:', settingKey)
        return []
      }
      
      // Log filtering details
      const enabledCount = settings.filter(s => s.enabled).length
      const notDeletedCount = settings.filter(s => !s.deleted).length
      const bothCount = settings.filter(s => s.enabled && !s.deleted).length
      
      console.log('[ApplicationSettingService] Filtering stats:', {
        total: settings.length,
        enabled: enabledCount,
        notDeleted: notDeletedCount,
        enabledAndNotDeleted: bothCount
      })
      
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
      
      console.log('[ApplicationSettingService] Mapped options:', options.length, options)
      
      return options
    } catch (err) {
      console.error('[ApplicationSettingService] Error fetching dropdown options for key:', settingKey, err)
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
      console.error('[ApplicationSettingService] Error in getDropdownWithFallback:', err)
      return fallbackOptions
    }
  }
}

export const applicationSettingService = new ApplicationSettingService()
