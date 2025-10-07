import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'
import { getProcessedTransactionLabel } from '@/constants/mappings/processedTransactionMapping'
import type {
  LabelConfig,
  ProcessedTransactionLabels,
  LabelConfigFilters,
} from '@/types/labelConfig'

/**
 * Service for managing label configurations from the API
 * Handles fetching, caching, and processing of label data
 */
export class LabelConfigService {
  private labelCache: Map<string, LabelConfig[]> = new Map()
  private cacheExpiry: number = 5 * 60 * 1000 // 5 minutes in milliseconds
  private lastCacheTime: number = 0

  /**
   * Fetch all processed transaction labels from the API
   * @returns Promise<LabelConfig[]>
   */
  async getProcessedTransactionLabels(): Promise<LabelConfig[]> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PROCESSED_TRANSACTIONS_LABEL
      )
      
      const result = await apiClient.get<LabelConfig[]>(url)
      
      return result || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Get labels with caching support for better performance
   * @returns Promise<LabelConfig[]>
   */
  async getProcessedTransactionLabelsWithCache(): Promise<LabelConfig[]> {
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
      return this.labelCache.get(cacheKey) || []
    }
  }

  /**
   * Get a specific label by configId and language code
   * @param configId - The configuration ID to search for
   * @param languageCode - The language code (default: 'EN')
   * @returns Promise<string> - The label value or configId as fallback
   */
  async getLabel(
    configId: string,
    languageCode: string = 'EN'
  ): Promise<string> {
    try {
      const labels = await this.getProcessedTransactionLabelsWithCache()
      const matchingLabel = labels.find(
        (label) =>
          label.configId === configId && 
          label.appLanguageCode.languageCode === languageCode &&
          label.enabled &&
          !label.deleted
      )

      const result = matchingLabel?.configValue || getProcessedTransactionLabel(configId)
      return result
    } catch (error) {
      return getProcessedTransactionLabel(configId)
    }
  }

  /**
   * Get labels filtered by specific criteria
   * @param filters - Filter criteria
   * @returns Promise<LabelConfig[]>
   */
  async getLabelsByFilters(filters: LabelConfigFilters): Promise<LabelConfig[]> {
    try {
      const labels = await this.getProcessedTransactionLabelsWithCache()
      
      return labels.filter((label) => {
        if (filters.configId && !label.configId.includes(filters.configId)) {
          return false
        }
        if (filters.languageCode && label.appLanguageCode.languageCode !== filters.languageCode) {
          return false
        }
        if (filters.moduleCode && label.applicationModuleDTO.moduleCode !== filters.moduleCode) {
          return false
        }
        if (filters.enabled !== undefined && label.enabled !== filters.enabled) {
          return false
        }
        if (filters.deleted !== undefined && label.deleted !== filters.deleted) {
          return false
        }
        return true
      })
    } catch (error) {
      return []
    }
  }

  /**
   * Get labels by module for better organization
   * @param moduleCode - The module code to filter by
   * @param languageCode - The language code (default: 'EN')
   * @returns Promise<LabelConfig[]>
   */
  async getLabelsByModule(
    moduleCode: string,
    languageCode: string = 'EN'
  ): Promise<LabelConfig[]> {
    return this.getLabelsByFilters({
      moduleCode,
      languageCode,
      enabled: true,
      deleted: false
    })
  }

  /**
   * Get labels by language for internationalization
   * @param languageCode - The language code
   * @returns Promise<LabelConfig[]>
   */
  async getLabelsByLanguage(languageCode: string): Promise<LabelConfig[]> {
    return this.getLabelsByFilters({
      languageCode,
      enabled: true,
      deleted: false
    })
  }

  /**
   * Process labels into a more usable format
   * @param labels - Raw label data from API
   * @returns ProcessedTransactionLabels
   */
  processLabels(labels: LabelConfig[]): ProcessedTransactionLabels {
    const enabledLabels = labels.filter(label => label.enabled && !label.deleted)
    
    return {
      labels: enabledLabels,
      totalCount: enabledLabels.length
    }
  }

  /**
   * Create a label lookup map for faster access
   * @param labels - Array of label configurations
   * @param languageCode - Language code to use (default: 'EN')
   * @returns Map<string, string> - configId to configValue mapping
   */
  createLabelMap(labels: LabelConfig[], languageCode: string = 'EN'): Map<string, string> {
    const labelMap = new Map<string, string>()
    
    labels
      .filter(label => 
        label.appLanguageCode.languageCode === languageCode &&
        label.enabled &&
        !label.deleted
      )
      .forEach(label => {
        labelMap.set(label.configId, label.configValue)
      })
    
    return labelMap
  }

  /**
   * Get available languages from the labels
   * @param labels - Array of label configurations
   * @returns string[] - Array of available language codes
   */
  getAvailableLanguages(labels: LabelConfig[]): string[] {
    const languages = new Set<string>()
    
    labels.forEach(label => {
      if (label.enabled && !label.deleted) {
        languages.add(label.appLanguageCode.languageCode)
      }
    })
    
    return Array.from(languages).sort()
  }

  /**
   * Check if labels are available
   * @param labels - Labels to check
   * @returns boolean
   */
  hasLabels(labels: ProcessedTransactionLabels | null): boolean {
    return labels !== null && labels.labels.length > 0
  }

  /**
   * Clear the labels cache
   */
  clearCache(): void {
    this.labelCache.clear()
    this.lastCacheTime = 0
  }

  /**
   * Get cache statistics
   * @returns Object with cache information
   */
  getCacheStats(): { size: number; lastUpdate: number; isExpired: boolean } {
    const now = Date.now()
    return {
      size: this.labelCache.size,
      lastUpdate: this.lastCacheTime,
      isExpired: now - this.lastCacheTime >= this.cacheExpiry
    }
  }
}

// Export singleton instance
export const labelConfigService = new LabelConfigService()
