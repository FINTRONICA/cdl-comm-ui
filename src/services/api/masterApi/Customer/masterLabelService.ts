import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'

export interface MasterLabel {
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

export class MasterLabelService {
  private static cache: Record<string, MasterLabel[]> = {}
  private static cacheTimestamps: Record<string, number> = {}
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch master labels from API endpoint based on category
   */
  async getMasterLabels(category: string): Promise<MasterLabel[]> {
    try {
      let endpoint = ''
      switch (category) {
        case 'ACCOUNT_PURPOSE':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE
          break
        case 'INVESTMENT':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT
          break
        case 'BUSINESS_SEGMENT':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT
          break
        case 'BUSINESS_SUB_SEGMENT':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT
          break
        case 'AGREEMENT_TYPE':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.AGREEMENT_TYPE
          break
        case 'AGREEMENT_SUB_TYPE':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.AGREEMENT_SUB_TYPE
          break
        case 'PRODUCT_PROGRAM':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM
          break
        case 'AGREEMENT_SEGMENT':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.AGREEMENT_SEGMENT
          break
        case 'GENERAL_LEDGER_ACCOUNT':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.GENERAL_LEDGER_ACCOUNT
          break
        case 'COUNTRY':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY
          break
        case 'CURRENCY':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY
          break
        case 'BENEFICIARY':
          endpoint = API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY
          break
        default:
          return []
      }

      if (!endpoint) return []

      const url = buildApiUrl(endpoint)
      const result = await apiClient.get<MasterLabel[]>(url)
      return result || []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error fetching ${category} labels:`, error)
      }
      return []
    }
  }

  /**
   * Get labels with caching for better performance
   */
  async getMasterLabelsWithCache(category: string): Promise<MasterLabel[]> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (
      MasterLabelService.cache[category] &&
      MasterLabelService.cacheTimestamps[category] &&
      now - MasterLabelService.cacheTimestamps[category] < MasterLabelService.CACHE_DURATION
    ) {
      return MasterLabelService.cache[category]
    }

    // Fetch fresh data
    const labels = await this.getMasterLabels(category)
    
    // Update cache
    MasterLabelService.cache[category] = labels
    MasterLabelService.cacheTimestamps[category] = now
    
    return labels
  }

  /**
   * Get a specific label by configId and language code
   */
  async getMasterLabel(
    category: string,
    configId: string,
    languageCode: string = 'EN'
  ): Promise<MasterLabel | null> {
    try {
      const labels = await this.getMasterLabelsWithCache(category)
      return (
        labels.find(
          (label) =>
            label.configId === configId &&
            label.appLanguageCode?.languageCode === languageCode
        ) || null
      )
    } catch (error) {
      return null
    }
  }

  /**
   * Clear the cache for a specific category or all categories
   */
  clearCache(category?: string): void {
    if (category) {
      delete MasterLabelService.cache[category]
      delete MasterLabelService.cacheTimestamps[category]
    } else {
      MasterLabelService.cache = {}
      MasterLabelService.cacheTimestamps = {}
    }
  }
}

export const masterLabelService = new MasterLabelService()


