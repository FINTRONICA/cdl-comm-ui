import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'

// Surety Bond Translation Types
export interface AppLanguageCode {
  id: number
  languageCode: string
  nameKey: string
  nameNativeValue: string
  enabled: boolean
  deleted: boolean
  rtl: boolean
}

export interface ApplicationModuleDTO {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription: string
  deleted: boolean
  active: boolean
}

export interface SuretyBondTranslation {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: AppLanguageCode
  applicationModuleDTO: ApplicationModuleDTO
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export class SuretyBondTranslationService {
  /**
   * Get all surety bond translations
   * @returns Promise<SuretyBondTranslation[]>
   */
  async getAllSuretyBondTranslations(): Promise<SuretyBondTranslation[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION_SURETY_BOND.GET_ALL)
      const result = await apiClient.get<SuretyBondTranslation[]>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * Get translations by config ID pattern
   * @param configIdPattern - Pattern to match config IDs
   * @returns Promise<SuretyBondTranslation[]>
   */
  async getTranslationsByConfigIdPattern(configIdPattern: string): Promise<SuretyBondTranslation[]> {
    try {
      const allTranslations = await this.getAllSuretyBondTranslations()
      return allTranslations.filter(translation => 
        translation.configId.includes(configIdPattern)
      )
    } catch (error) {
      throw error
    }
  }

  /**
   * Get translations by language code
   * @param languageCode - Language code (e.g., 'EN', 'ES')
   * @returns Promise<SuretyBondTranslation[]>
   */
  async getTranslationsByLanguage(languageCode: string): Promise<SuretyBondTranslation[]> {
    try {
      const allTranslations = await this.getAllSuretyBondTranslations()
      return allTranslations.filter(translation => 
        translation.appLanguageCode.languageCode === languageCode
      )
    } catch (error) {
      throw error
    }
  }
}

// Export singleton instance
export const suretyBondTranslationService = new SuretyBondTranslationService()