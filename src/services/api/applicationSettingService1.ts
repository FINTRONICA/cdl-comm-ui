import { apiClient } from '@/lib/apiClient'

export interface ApplicationSetting {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId?: {
    id: number
    configId: string
    configValue: string
    content: string | null
    status: string | null
    enabled: boolean
    deleted: boolean
  }
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean
}

class ApplicationSettingService {
  /**
   * Get application settings by setting key
   * @param settingKey The setting key to filter by
   * @returns Promise with array of application settings
   */
  async getApplicationSettings(
    settingKey: string
  ): Promise<ApplicationSetting[]> {
    try {
      // Remove the duplicate /api/v1 prefix since apiClient already adds it
      const response = await apiClient.get<ApplicationSetting[]>(
        `/application-setting`,
        {
          params: {
            'settingKey.equals': settingKey,
          },
        }
      )

      return response
    } catch (error) {
      console.error(
        `Error fetching application settings for key ${settingKey}:`,
        error
      )
      throw error
    }
  }

  /**
   * Get application setting by ID
   * @param id The setting ID
   * @returns Promise with application setting
   */
  async getApplicationSettingById(id: number): Promise<ApplicationSetting> {
    try {
      // Remove the duplicate /api/v1 prefix since apiClient already adds it
      const response = await apiClient.get<ApplicationSetting>(
        `/application-setting/${id}`
      )
      return response
    } catch (error) {
      console.error(`Error fetching application setting with ID ${id}:`, error)
      throw error
    }
  }

  async getApplicationSettingByIdAndKey(
    id: number,
    settingKey: string
  ): Promise<ApplicationSetting> {
    try {
      const response = await apiClient.get<ApplicationSetting[]>(
        `/application-setting`,
        {
          params: {
            'id.equals': id,
            'settingKey.equals': settingKey,
          },
        }
      )

      if (response.length === 0) {
        throw new Error(
          `No application setting found for ID ${id} and key ${settingKey}`
        )
      }

      const setting = response[0]
      if (!setting) {
        throw new Error(
          `No application setting found for ID ${id} and key ${settingKey}`
        )
      }

      return setting
    } catch (error) {
      console.error(
        `Error fetching application setting for ID ${id} and key ${settingKey}:`,
        error
      )
      throw error
    }
  }
}

export const applicationSettingService = new ApplicationSettingService()
