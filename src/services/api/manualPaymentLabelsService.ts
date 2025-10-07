import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'

export interface ManualPaymentLabel {
  id: number
  configId: string
  configValue: string
  appLanguageCode: {
    id: number
    languageCode: string
    nameKey: string
    nameNativeValue: string
    deleted: boolean
    enabled: boolean
    rtl: boolean
  }
  applicationModuleDTO: {
    id: number
    moduleName: string
    moduleCode: string
    moduleDescription: string
    deleted: boolean
    enabled: boolean
    active: boolean
  }
  status: any
  enabled: boolean
  deleted: any
}

export interface ManualPaymentLabelsResponse {
  labels: ManualPaymentLabel[]
  totalCount: number
}

export class ManualPaymentLabelsService {
  private static cache: ManualPaymentLabel[] | null = null
  private static cacheTimestamp: number = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch manual payment labels from API endpoint '/app-language-translation/payments'
   * This endpoint provides labels specifically for manual payment transactions
   */
  async getManualPaymentLabels(): Promise<ManualPaymentLabel[]> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PAYMENTS_LABEL
      )
      const result = await apiClient.get<ManualPaymentLabel[]>(url)
      return result || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a specific label by configId and language code
   */
  async getManualPaymentLabel(
    configId: string,
    languageCode: string = 'EN'
  ): Promise<ManualPaymentLabel | null> {
    try {
      const labels = await this.getManualPaymentLabels()
      return (
        labels.find(
          (label) =>
            label.configId === configId &&
            label.appLanguageCode?.languageCode === languageCode
        ) || null
      )
    } catch (error) {
      throw error
    }
  }

  /**
   * Get labels by category
   */
  async getManualPaymentLabelsByCategory(
    category: string,
    languageCode: string = 'EN'
  ): Promise<ManualPaymentLabel[]> {
    try {
      const labels = await this.getManualPaymentLabels()
      return labels.filter(
        (label) =>
          label.configId.includes(category) &&
          label.appLanguageCode?.languageCode === languageCode
      )
    } catch (error) {
      throw error
    }
  }

  /**
   * Get labels with caching for better performance
   */
  async getManualPaymentLabelsWithCache(): Promise<ManualPaymentLabel[]> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (
      ManualPaymentLabelsService.cache &&
      now - ManualPaymentLabelsService.cacheTimestamp < ManualPaymentLabelsService.CACHE_DURATION
    ) {
      return ManualPaymentLabelsService.cache
    }

    // Fetch fresh data
    const labels = await this.getManualPaymentLabels()
    
    // Update cache
    ManualPaymentLabelsService.cache = labels
    ManualPaymentLabelsService.cacheTimestamp = now
    
    return labels
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    ManualPaymentLabelsService.cache = null
    ManualPaymentLabelsService.cacheTimestamp = 0
  }
}

export const manualPaymentLabelsService = new ManualPaymentLabelsService()
