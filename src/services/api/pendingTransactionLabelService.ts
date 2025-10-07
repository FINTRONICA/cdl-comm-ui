import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'
import { getPendingTransactionLabel } from '@/constants/mappings/pendingTransactionMapping'
import type {
  LabelConfig,
  ProcessedTransactionLabels,
  LabelConfigFilters,
} from '@/types/labelConfig'

/**
 * Service for managing pending transaction label configurations from the API
 * Handles fetching, caching, and processing of pending transaction label data
 */
export class PendingTransactionLabelService {
  private labelCache: Map<string, ProcessedTransactionLabels> = new Map()
  private lastCacheTime: number = 0
  private cacheExpiry: number = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch all pending transaction labels from the API
   * @returns Promise<LabelConfig[]>
   */
  async getPendingTransactionLabels(): Promise<LabelConfig[]> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PENDING_TRANSACTIONS_LABEL
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
  async getPendingTransactionLabelsWithCache(): Promise<LabelConfig[]> {
    const now = Date.now()
    const cacheKey = 'pending-transaction-labels'

    if (
      this.labelCache.has(cacheKey) &&
      now - this.lastCacheTime < this.cacheExpiry
    ) {
      const cached = this.labelCache.get(cacheKey)
      return cached?.labels || []
    }

    try {
      const labels = await this.getPendingTransactionLabels()
      const processedLabels: ProcessedTransactionLabels = {
        labels: labels || [],
        totalCount: labels?.length || 0,
      }
      this.labelCache.set(cacheKey, processedLabels)
      this.lastCacheTime = now
      return labels
    } catch (error) {
      const cached = this.labelCache.get(cacheKey)
      return cached?.labels || []
    }
  }

  /**
   * Get a specific label by configId and language code
   * @param configId - The configuration ID to search for
   * @param languageCode - The language code (default: 'EN')
   * @returns The label value or configId as fallback
   */
  async getLabel(
    configId: string,
    languageCode: string = 'EN'
  ): Promise<string> {
    try {
      const labels = await this.getPendingTransactionLabelsWithCache()
      
      const matchingLabel = labels.find(
        (label) =>
          label.configId === configId &&
          label.appLanguageCode.languageCode === languageCode &&
          label.enabled &&
          !label.deleted
      )

      const result = matchingLabel?.configValue || getPendingTransactionLabel(configId)
      return result
    } catch (error) {
      return getPendingTransactionLabel(configId)
    }
  }

  /**
   * Get labels filtered by specific criteria
   * @param filters - Filter criteria
   * @returns Filtered labels
   */
  async getLabelsByFilters(filters: LabelConfigFilters): Promise<LabelConfig[]> {
    try {
      const labels = await this.getPendingTransactionLabelsWithCache()
      
      return labels.filter((label) => {
        if (filters.configId && label.configId !== filters.configId) {
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
   * @returns Labels for the specified module
   */
  async getLabelsByModule(
    moduleCode: string,
    languageCode: string = 'EN'
  ): Promise<LabelConfig[]> {
    return this.getLabelsByFilters({
      moduleCode,
      languageCode,
      enabled: true,
      deleted: false,
    })
  }

  /**
   * Get labels by language
   * @param languageCode - The language code
   * @returns Labels for the specified language
   */
  async getLabelsByLanguage(languageCode: string): Promise<LabelConfig[]> {
    return this.getLabelsByFilters({
      languageCode,
      enabled: true,
      deleted: false,
    })
  }

  /**
   * Get all available language codes from the labels
   * @returns Array of unique language codes
   */
  async getAvailableLanguages(): Promise<string[]> {
    try {
      const labels = await this.getPendingTransactionLabelsWithCache()
      const languages = new Set<string>()
      
      labels.forEach((label) => {
        if (label.enabled && !label.deleted) {
          languages.add(label.appLanguageCode.languageCode)
        }
      })
      
      return Array.from(languages)
    } catch (error) {
      return ['EN'] // Default fallback
    }
  }

  /**
   * Get all available config IDs
   * @returns Array of unique config IDs
   */
  async getAvailableConfigIds(): Promise<string[]> {
    try {
      const labels = await this.getPendingTransactionLabelsWithCache()
      const configIds = new Set<string>()
      
      labels.forEach((label) => {
        if (label.enabled && !label.deleted) {
          configIds.add(label.configId)
        }
      })
      
      return Array.from(configIds)
    } catch (error) {
      return []
    }
  }

  /**
   * Check if a specific configId exists in the labels
   * @param configId - The configuration ID to check
   * @returns Boolean indicating if the configId exists
   */
  async hasConfigId(configId: string): Promise<boolean> {
    try {
      const configIds = await this.getAvailableConfigIds()
      return configIds.includes(configId)
    } catch (error) {
      return false
    }
  }

  /**
   * Get label statistics
   * @returns Object with label statistics
   */
  async getLabelStats(): Promise<{
    totalLabels: number
    enabledLabels: number
    availableLanguages: string[]
    availableConfigIds: string[]
  }> {
    try {
      const labels = await this.getPendingTransactionLabelsWithCache()
      const enabledLabels = labels.filter(label => label.enabled && !label.deleted)
      const languages = await this.getAvailableLanguages()
      const configIds = await this.getAvailableConfigIds()
      
      return {
        totalLabels: labels.length,
        enabledLabels: enabledLabels.length,
        availableLanguages: languages,
        availableConfigIds: configIds,
      }
    } catch (error) {
      return {
        totalLabels: 0,
        enabledLabels: 0,
        availableLanguages: ['EN'],
        availableConfigIds: [],
      }
    }
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
      isExpired: now - this.lastCacheTime > this.cacheExpiry,
    }
  }
}

// Export singleton instance
export const pendingTransactionLabelService = new PendingTransactionLabelService()
