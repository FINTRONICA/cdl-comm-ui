// Simple Labels Loader Service
// Loads labels from multiple APIs and stores them in Zustand

import { SidebarLabelsService } from "@/services/api/sidebarLabelsService";
import { PartyLabelsService } from "@/services/api/masterApi/Customer/partyLabelsService";
import { useAppStore } from "@/store";
import PendingTransactionLabelsService from "@/services/api/pendingTransactionLabelsService";

export interface LoadResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  results: Array<{
    apiName: string;
    success: boolean;
    error?: string;
  }>;
}

export class SimpleLabelsLoader {
  async loadAllLabels(): Promise<LoadResult> {
    // Set loading states
    this.setAllLoadingStates(true);

    try {
      // Load all APIs in parallel
      const results = await Promise.allSettled([
        this.loadSidebarLabels(),
        this.loadPendingTransactionLabels(),
      ]);

      // Process results
      let successCount = 0;
      let errorCount = 0;

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
        } else {
          errorCount++;
        }
      });

      // Check if we have enough successful loads
      // Only 2 labels are loaded now (Sidebar and Pending Transaction)
      const expectedCount = 2;
      const hasEnoughLabels = successCount >= expectedCount;

      if (hasEnoughLabels) {
      } else {
        console.warn(
          "⚠️ [LABELS] Not enough labels loaded:",
          successCount,
          `out of ${expectedCount}`
        );
      }

      const loadResult: LoadResult = {
        success: hasEnoughLabels,
        successCount,
        errorCount,
        results: results.map((result, index) => {
          const apiNames = [
            "Sidebar Labels",
            "Pending Transaction Labels",
            // 'Party Labels', // Temporarily commented out
          ];
          const apiName = apiNames[index] || `API ${index + 1}`;

          if (result.status === "fulfilled") {
            return {
              apiName,
              success: result.value.success,
              error: result.value.error,
              data: result.value.data,
            };
          } else {
            return {
              apiName,
              success: false,
              error: result.reason?.message || "Unknown error",
            };
          }
        }) as LoadResult["results"],
      };

      return loadResult;
    } catch (error) {
      console.error("[LABELS] Critical loading failure:", error);
      throw error;
    } finally {
      // Always clear loading states
      this.setAllLoadingStates(false);
    }
  }

  /**
   * Load sidebar labels
   */
  private async loadSidebarLabels() {
    try {
      const data = await SidebarLabelsService.fetchLabels();
      const processed = SidebarLabelsService.processLabels(data);

      // Store in Zustand
      useAppStore.getState().setSidebarLabels(processed);
      useAppStore.getState().setSidebarLabelsError(null);

      return { success: true, data: processed };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      useAppStore.getState().setSidebarLabelsError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private async loadPendingTransactionLabels() {
    try {
      const data = await PendingTransactionLabelsService.fetchLabels();
      const processed = PendingTransactionLabelsService.processLabels(data);

      // Store in Zustand
      useAppStore.getState().setPendingTransactionLabels(processed);
      useAppStore.getState().setPendingTransactionLabelsError(null);

      return { success: true, data: processed };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      useAppStore.getState().setPendingTransactionLabelsError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private async loadPartyLabels() {
    try {
      const data = await PartyLabelsService.fetchLabels();
      const processed = PartyLabelsService.processLabels(data);

      // Store in Zustand
      useAppStore.getState().setPartyLabels(processed);
      useAppStore.getState().setPartyLabelsError(null);

      return { success: true, data: processed };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      useAppStore.getState().setPartyLabelsError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Set all loading states
   */
  private setAllLoadingStates(loading: boolean) {
    const state = useAppStore.getState();
    state.setSidebarLabelsLoading(loading);
    // Build Partner, Capital Partner, and Build Partner Asset loading states removed - modules deleted
    state.setPendingTransactionLabelsLoading(loading);
    state.setPartyLabelsLoading(loading);
  }

  /**
   * Clear all labels from store
   */
  clearAllLabels() {
    useAppStore.getState().clearAllLabels();
  }
}

export const getLabelsLoader = (): SimpleLabelsLoader => {
  return new SimpleLabelsLoader();
};

export const loadAllLabelsCompliance = async (): Promise<LoadResult> => {
  const loader = new SimpleLabelsLoader();
  return loader.loadAllLabels();
};
