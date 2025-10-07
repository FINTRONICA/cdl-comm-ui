import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// Fee Repush Label API Response Types
export interface FeeRepushLabelApiResponse {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: {
    id: number
    languageCode: string
    nameKey: string
    nameNativeValue: string
    enabled: boolean
    deleted: boolean
    rtl: boolean
  }
  applicationModuleDTO: {
    id: number
    moduleName: string
    moduleCode: string
    moduleDescription: string
    deleted: boolean
    active: boolean
  }
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

// Fee Repush Label Mapping for easy lookup
export interface FeeRepushLabelMap {
  [configId: string]: string
}

// Fee Repush Label Service Class
export class FeeRepushLabelService {
  private static instance: FeeRepushLabelService
  private labelCache: Map<string, FeeRepushLabelApiResponse[]> = new Map()

  private constructor() {}

  static getInstance(): FeeRepushLabelService {
    if (!FeeRepushLabelService.instance) {
      FeeRepushLabelService.instance = new FeeRepushLabelService()
    }
    return FeeRepushLabelService.instance
  }

  // Get labels from API for specific language
  async getFeeRepushLabels(
    languageCode: string = 'EN'
  ): Promise<FeeRepushLabelApiResponse[]> {
    const cacheKey = `fee-repush-${languageCode.toUpperCase()}`


    // Check cache first
    if (this.labelCache.has(cacheKey)) {
      const cachedLabels = this.labelCache.get(cacheKey)!
      return cachedLabels
    }

    try {
      const url = buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.FEE_REPUSH)
      const queryParams = new URLSearchParams({
        languageCode: languageCode.toUpperCase(),
      })
      const fullUrl = `${url}?${queryParams}`


      const labels = await apiClient.get<FeeRepushLabelApiResponse[]>(fullUrl)

      // Cache the result
      this.labelCache.set(cacheKey, labels || [])

      return labels || []
    } catch (error) {

      // Return empty array on error
      return []
    }
  }

  // Transform API response to a simple key-value map
  transformToLabelMap(labels: FeeRepushLabelApiResponse[]): FeeRepushLabelMap {
    const labelMap: FeeRepushLabelMap = {}

    labels.forEach((label) => {
      if (label.configId && label.configValue) {
        labelMap[label.configId] = label.configValue
      }
    })

    return labelMap
  }

  // Get a specific label by configId with fallback
  async getLabel(
    configId: string,
    languageCode: string = 'EN',
    fallback?: string
  ): Promise<string> {
    try {
      const labels = await this.getFeeRepushLabels(languageCode)
      const labelMap = this.transformToLabelMap(labels)

      const result = labelMap[configId] || fallback || configId

      return result
    } catch (error) {

      return fallback || configId
    }
  }

  // Get labels as a map for easy lookup
  async getFeeRepushLabelMap(
    languageCode: string = 'EN'
  ): Promise<FeeRepushLabelMap> {
    try {
      const labels = await this.getFeeRepushLabels(languageCode)
      return this.transformToLabelMap(labels)
    } catch (error) {
      return {}
    }
  }

  // Clear cache (useful for language changes or manual refresh)
  clearCache(languageCode?: string): void {
    if (languageCode) {
      const cacheKey = `fee-repush-${languageCode.toUpperCase()}`
      this.labelCache.delete(cacheKey)
    } else {
      this.labelCache.clear()
    }
  }

  // Preload labels for better performance
  async preloadLabels(languageCode: string = 'EN'): Promise<void> {

    try {
      await this.getFeeRepushLabels(languageCode)
    } catch (error) {
    }
  }

  // Get all available config IDs
  async getAvailableConfigIds(languageCode: string = 'EN'): Promise<string[]> {
    try {
      const labels = await this.getFeeRepushLabels(languageCode)
      const configIds = labels.map((label) => label.configId).filter(Boolean)

      return configIds
    } catch (error) {

      return []
    }
  }
}

// Export singleton instance
export const feeRepushLabelService = FeeRepushLabelService.getInstance()

// Export helper functions for easy use
export const getFeeRepushLabel = async (
  configId: string,
  languageCode: string = 'EN',
  fallback?: string
): Promise<string> => {
  return feeRepushLabelService.getLabel(configId, languageCode, fallback)
}

export const getFeeRepushLabels = async (
  languageCode: string = 'EN'
): Promise<FeeRepushLabelApiResponse[]> => {
  return feeRepushLabelService.getFeeRepushLabels(languageCode)
}

export const getFeeRepushLabelMap = async (
  languageCode: string = 'EN'
): Promise<FeeRepushLabelMap> => {
  return feeRepushLabelService.getFeeRepushLabelMap(languageCode)
}

// Mapping from API configIds to our component usage
export const FEE_REPUSH_CONFIG_ID_MAPPING = {
  // Table Column Headers (from API response)
  PROJECT_NAME: 'CDL_FEE_BPA_NAME', // "Build Partner Assets Name"
  FEE_TYPE: 'CDL_FEE_TYPE', // "Fee Type"
  AMOUNT: 'CDL_FEE_AMOUNT', // "Amount"
  TRANSACTION_DATE: 'CDL_FEE_TRAN_DATE', // "Transaction Date"
  APPROVAL_STATUS: 'CDL_FEE_APP_STATUS', // "Status"
  PAYMENT_TYPE: 'CDL_FEE_PAYMENT_TYPE', // "Payment Type"
  ACTION: 'CDL_FEE_ACTION', // "Action"

  // Page Title and Module
  FEE_REPUSH_TITLE: 'CDL_FEE_REPUSH', // "Fee Reconciliation"
  FEE_REPUSH_RESPONSE: 'CDL_FEE_REPUSH_RES', // "Fee Reconciliation Response"
}

// Helper function to get mapped config ID
export const getMappedConfigId = (
  key: keyof typeof FEE_REPUSH_CONFIG_ID_MAPPING
): string => {
  return FEE_REPUSH_CONFIG_ID_MAPPING[key]
}
