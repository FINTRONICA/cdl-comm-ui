import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'
import { getGroupManagementLabel } from '@/constants/mappings/groupManagementMapping'
import type {
  LabelConfig,
  ProcessedTransactionLabels,
  LabelConfigFilters,
} from '@/types/labelConfig'

/**
 * Service for managing group management label configurations from the API
 * Handles fetching, caching, and processing of label data
 */
export class GroupManagementLabelService {
  private labelCache: Map<string, ProcessedTransactionLabels> = new Map()
  private cacheExpiry: number = 5 * 60 * 1000 // 5 minutes in milliseconds
  private lastCacheTime: number = 0

  /**
   * Fetch all group management labels from the API
   * @returns Promise<LabelConfig[]>
   */
  async getGroupManagementLabels(): Promise<LabelConfig[]> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.GROUP_MANAGEMENT_LABEL
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
  async getGroupManagementLabelsWithCache(): Promise<LabelConfig[]> {
    const now = Date.now()
    const cacheKey = 'group-management-labels'

    if (
      this.labelCache.has(cacheKey) &&
      now - this.lastCacheTime < this.cacheExpiry
    ) {
      const cached = this.labelCache.get(cacheKey)
      return cached?.labels || []
    }

    try {
      const labels = await this.getGroupManagementLabels()
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
   * @returns The configValue if found, otherwise the configId or fallback
   */
  getLabel(configId: string, languageCode: string = 'EN'): string {
    try {
      const cachedData = this.labelCache.get('group-management-labels')
      const labels = cachedData?.labels || []

      let matchingLabel = labels.find(
        (label) =>
          label.configId === configId &&
          label.appLanguageCode.languageCode === languageCode &&
          label.enabled &&
          !label.deleted
      )

      if (!matchingLabel && languageCode !== languageCode.toUpperCase()) {
        matchingLabel = labels.find(
          (label) =>
            label.configId === configId &&
            label.appLanguageCode.languageCode === languageCode.toUpperCase() &&
            label.enabled &&
            !label.deleted
        )
      }

      if (!matchingLabel && languageCode !== languageCode.toLowerCase()) {
        matchingLabel = labels.find(
          (label) =>
            label.configId === configId &&
            label.appLanguageCode.languageCode === languageCode.toLowerCase() &&
            label.enabled &&
            !label.deleted
        )
      }

      if (!matchingLabel) {
        matchingLabel = labels.find(
          (label) =>
            label.configId === configId &&
            label.enabled &&
            !label.deleted
        )
      }

      const result = matchingLabel?.configValue || getGroupManagementLabel(configId)
      return result
    } catch (error) {
      return getGroupManagementLabel(configId)
    }
  }

  /**
   * Get labels filtered by specific criteria
   * @param filters - Filter criteria
   * @returns Filtered labels
   */
  getLabelsByFilters(filters: LabelConfigFilters): LabelConfig[] {
    try {
      const cachedData = this.labelCache.get('group-management-labels')
      const labels = cachedData?.labels || []
      return labels.filter((label) => {
        if (filters.configId && label.configId !== filters.configId) {
          return false
        }
        if (
          filters.languageCode &&
          label.appLanguageCode.languageCode !== filters.languageCode
        ) {
          return false
        }
        if (
          filters.moduleCode &&
          label.applicationModuleDTO.moduleCode !== filters.moduleCode
        ) {
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
  getLabelsByModule(moduleCode: string, languageCode: string = 'EN'): LabelConfig[] {
    return this.getLabelsByFilters({ moduleCode, languageCode })
  }

  /**
   * Get labels by language
   * @param languageCode - The language code to filter by
   * @returns Labels for the specified language
   */
  getLabelsByLanguage(languageCode: string): LabelConfig[] {
    return this.getLabelsByFilters({ languageCode })
  }

  /**
   * Refresh the labels cache
   */
  async refreshCache(): Promise<void> {
    this.lastCacheTime = 0 // Invalidate cache
    await this.getGroupManagementLabelsWithCache()
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

export const groupManagementLabelService = new GroupManagementLabelService()
