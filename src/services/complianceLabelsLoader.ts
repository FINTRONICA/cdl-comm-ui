// Simple Labels Loader Service
// Loads labels from multiple APIs and stores them in Zustand

import { SidebarLabelsService } from '@/services/api/sidebarLabelsService'
import { BuildPartnerLabelsService } from '@/services/api/buildPartnerLabelsService'
import { CapitalPartnerLabelsService } from '@/services/api/capitalPartnerLabelsService'
import { BuildPartnerAssetLabelsService } from '@/services/api/buildPartnerAssetLabelsService'
import { useAppStore } from '@/store'
import PendingTransactionLabelsService from '@/services/api/pendingTransactionLabelsService'

/**
 * Simple interface for loading results
 */
export interface LoadResult {
  success: boolean
  successCount: number
  errorCount: number
  results: Array<{
    apiName: string
    success: boolean
    error?: string
  }>
}

/**
 * Simple Labels Loader
 * Loads all labels from APIs and stores them in Zustand
 */
export class SimpleLabelsLoader {
  /**
   * Load all labels from APIs
   */
  async loadAllLabels(): Promise<LoadResult> {
    // Set loading states
    this.setAllLoadingStates(true)

    try {
      // Load all APIs in parallel
      const results = await Promise.allSettled([
        this.loadSidebarLabels(),
        this.loadBuildPartnerLabels(),
        this.loadCapitalPartnerLabels(),
        this.loadBuildPartnerAssetLabels(),
        this.loadPendingTransactionLabels(),
      ])

      // Process results
      let successCount = 0
      let errorCount = 0

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++
        } else {
          errorCount++
        }
      })

      // Check if we have enough successful loads
      const hasEnoughLabels = successCount >= 3

      if (hasEnoughLabels) {
      } else {
        console.warn(
          '⚠️ [LABELS] Not enough labels loaded:',
          successCount,
          'out of 4'
        )
      }

      const loadResult: LoadResult = {
        success: hasEnoughLabels,
        successCount,
        errorCount,
        results: results.map((result, index) => {
          const apiNames = [
            'Sidebar Labels',
            'Build Partner Labels',
            'Capital Partner Labels',
            'Build Partner Asset Labels',
            'Pending Transaction Labels',
          ]
          const apiName = apiNames[index] || `API ${index + 1}`

          if (result.status === 'fulfilled') {
            return {
              apiName,
              success: result.value.success,
              error: result.value.error,
              data: result.value.data,
            }
          } else {
            return {
              apiName,
              success: false,
              error: result.reason?.message || 'Unknown error',
            }
          }
        }) as LoadResult['results'],
      }

      return loadResult
    } catch (error) {
      console.error('[LABELS] Critical loading failure:', error)
      throw error
    } finally {
      // Always clear loading states
      this.setAllLoadingStates(false)
    }
  }

  /**
   * Load sidebar labels
   */
  private async loadSidebarLabels() {
    try {
      const data = await SidebarLabelsService.fetchLabels()
      const processed = SidebarLabelsService.processLabels(data)

      // Store in Zustand
      useAppStore.getState().setSidebarLabels(processed)
      useAppStore.getState().setSidebarLabelsError(null)

      return { success: true, data: processed }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      useAppStore.getState().setSidebarLabelsError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Load build partner labels
   */
  private async loadBuildPartnerLabels() {
    try {
      const data = await BuildPartnerLabelsService.fetchLabels()
      const processed = BuildPartnerLabelsService.processLabels(data)

      // Store in Zustand
      useAppStore.getState().setBuildPartnerLabels(processed)
      useAppStore.getState().setBuildPartnerLabelsError(null)

      return { success: true, data: processed }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      useAppStore.getState().setBuildPartnerLabelsError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Load capital partner labels
   */
  private async loadCapitalPartnerLabels() {
    try {
      const data = await CapitalPartnerLabelsService.fetchLabels()
      const processed = CapitalPartnerLabelsService.processLabels(data)

      // Store in Zustand
      useAppStore.getState().setCapitalPartnerLabels(processed)
      useAppStore.getState().setCapitalPartnerLabelsError(null)

      return { success: true, data: processed }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      useAppStore.getState().setCapitalPartnerLabelsError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Load build partner asset labels
   */
  private async loadBuildPartnerAssetLabels() {
    try {
      const data = await BuildPartnerAssetLabelsService.fetchLabels()
      const processed = BuildPartnerAssetLabelsService.processLabels(data)

      // Store in Zustand
      useAppStore.getState().setBuildPartnerAssetLabels(processed)
      useAppStore.getState().setBuildPartnerAssetLabelsError(null)

      return { success: true, data: processed }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      useAppStore.getState().setBuildPartnerAssetLabelsError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Load pending transaction labels
   */
  private async loadPendingTransactionLabels() {
    try {
      const data = await PendingTransactionLabelsService.fetchLabels()
      const processed = PendingTransactionLabelsService.processLabels(data)

      // Store in Zustand
      useAppStore.getState().setPendingTransactionLabels(processed)
      useAppStore.getState().setPendingTransactionLabelsError(null)

      return { success: true, data: processed }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      useAppStore.getState().setPendingTransactionLabelsError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Set all loading states
   */
  private setAllLoadingStates(loading: boolean) {
    const state = useAppStore.getState()
    state.setSidebarLabelsLoading(loading)
    state.setBuildPartnerLabelsLoading(loading)
    state.setCapitalPartnerLabelsLoading(loading)
    state.setBuildPartnerAssetLabelsLoading(loading)
    state.setPendingTransactionLabelsLoading(loading)
  }

  /**
   * Clear all labels from store
   */
  clearAllLabels() {
    useAppStore.getState().clearAllLabels()
  }
}

/**
 * Get loader instance
 */
export const getLabelsLoader = (): SimpleLabelsLoader => {
  return new SimpleLabelsLoader()
}

/**
 * Quick load all labels
 */
export const loadAllLabelsCompliance = async (): Promise<LoadResult> => {
  const loader = new SimpleLabelsLoader()
  return loader.loadAllLabels()
}
