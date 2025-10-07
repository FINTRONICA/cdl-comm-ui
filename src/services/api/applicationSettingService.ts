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
    console.log('🔧 ApplicationSettingService.getApplicationSettingsByKey Called:', { 
      settingKey,
      timestamp: new Date().toISOString() 
    })
    
    try {
      const params = new URLSearchParams({
        'settingKey.equals': settingKey
      })
      
      const url = `${buildApiUrl(API_ENDPOINTS.APPLICATION_SETTING.GET_ALL)}?${params.toString()}`
      
      const result = await apiClient.get<ApplicationSetting[]>(url)
      
      console.log('✅ ApplicationSettingService.getApplicationSettingsByKey Success:', { 
        settingKey,
        resultCount: result?.length || 0,
        hasResult: !!result,
        timestamp: new Date().toISOString() 
      })
      
      return result || []
    } catch (error) {
      console.error('❌ ApplicationSettingService.getApplicationSettingsByKey Failed:', { 
        settingKey,
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw error
    }
  }

  /**
   * Get dropdown options for any setting key
   */
  async getDropdownOptionsByKey(settingKey: string): Promise<DropdownOption[]> {
    console.log('🔧 ApplicationSettingService.getDropdownOptionsByKey Called:', { 
      settingKey,
      timestamp: new Date().toISOString() 
    })
    
    try {
      const settings = await this.getApplicationSettingsByKey(settingKey)
      
      // Map settings to dropdown options
      const options: DropdownOption[] = settings
        .filter(setting => setting.enabled && !setting.deleted) // Only include enabled, non-deleted items
        .map(setting => ({
          id: setting.id,
          value: setting.settingValue,
          label: setting.languageTranslationId?.configValue || setting.settingValue
        }))
      
      console.log('✅ ApplicationSettingService.getDropdownOptionsByKey Success:', { 
        settingKey,
        optionsCount: options.length,
        options: options.map(opt => ({ value: opt.value, label: opt.label })),
        timestamp: new Date().toISOString() 
      })
      
      return options
    } catch (error) {
      console.error('❌ ApplicationSettingService.getDropdownOptionsByKey Failed:', { 
        settingKey,
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      
      // Return empty array if API fails
      return []
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
    } catch (error) {
      console.warn(`Failed to fetch dropdown for ${settingKey}, using fallback:`, error)
      return fallbackOptions
    }
  }
}

export const applicationSettingService = new ApplicationSettingService()
