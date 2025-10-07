import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'

export interface ProcessedTransactionLabel {
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

export interface ProcessedTransactionLabelsResponse {
  labels: ProcessedTransactionLabel[]
  totalCount: number
}

export class ProcessedTransactionLabelsService {
  /**
   * Fetch processed transaction labels from API endpoint '/app-language-translation/transactions'
   * This endpoint provides labels for all transaction types including allocated/processed transactions
   */
  async getProcessedTransactionLabels(): Promise<ProcessedTransactionLabel[]> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.TRANSCATIONS_LABEL
      )
      console.log('🔧 getProcessedTransactionLabels: Making API call to:', url)
      const result = await apiClient.get<ProcessedTransactionLabel[]>(url)
      console.log('🔧 getProcessedTransactionLabels: API response:', { 
        count: result?.length, 
        firstItem: result?.[0],
        url 
      })
      return result || []
    } catch (error) {
      console.error('🔧 getProcessedTransactionLabels: API error:', error)
      throw error
    }
  }

  /**
   * Get a specific label by configId and language code
   */
  async getProcessedTransactionLabel(
    configId: string,
    languageCode: string = 'en'
  ): Promise<string> {
    try {
      const labels = await this.getProcessedTransactionLabels()
      const matchingLabel = labels.find(
        (label) =>
          label.configId === configId && label.languageCode === languageCode
      )

      const result = matchingLabel?.configValue || configId
      return result
    } catch (error) {
      // Fallback to configId if API fails
      return configId
    }
  }

  /**
   * Get labels by category for better organization
   */
  async getProcessedTransactionLabelsByCategory(
    category: string,
    languageCode: string = 'en'
  ): Promise<ProcessedTransactionLabel[]> {
    try {
      const labels = await this.getProcessedTransactionLabels()
      const filteredLabels = labels.filter(
        (label) =>
          label.category === category && label.languageCode === languageCode
      )
      return filteredLabels
    } catch (error) {
      return []
    }
  }

  /**
   * Cache management for better performance
   */
  private labelCache: Map<string, ProcessedTransactionLabel[]> = new Map()
  private cacheExpiry: number = 5 * 60 * 1000 // 5 minutes in milliseconds
  private lastCacheTime: number = 0

  /**
   * Get labels with caching support
   */
  async getProcessedTransactionLabelsWithCache(): Promise<
    ProcessedTransactionLabel[]
  > {
    const now = Date.now()
    const cacheKey = 'processed-transaction-labels'

    if (
      this.labelCache.has(cacheKey) &&
      now - this.lastCacheTime < this.cacheExpiry
    ) {
      return this.labelCache.get(cacheKey) || []
    }

    try {
      const labels = await this.getProcessedTransactionLabels()
      this.labelCache.set(cacheKey, labels)
      this.lastCacheTime = now
      return labels
    } catch (error) {
      // Return cached data if available, even if expired
      return this.labelCache.get(cacheKey) || []
    }
  }

  /**
   * Clear the labels cache
   */
  clearCache(): void {
    this.labelCache.clear()
    this.lastCacheTime = 0
  }
}

export const processedTransactionLabelsService =
  new ProcessedTransactionLabelsService()
