import { useBuildPartnerAssetLabelsWithUtils } from './useBuildPartnerAssetLabels'

/**
 * Phase 2: Label Utility Hook for Project Stepper Forms
 * 
 * This hook provides a simple interface to replace hardcoded labels
 * with API-driven labels while maintaining fallback safety.
 * 
 * Usage:
 * const { getLabel } = useProjectLabels();
 * const label = getLabel('CDL_BPA_CIF', 'Build Partner CIF');
 */
export const useProjectLabels = () => {
  const { data, isLoading, error } = useBuildPartnerAssetLabelsWithUtils();
  
  /**
   * Get label by configId with fallback safety
   * @param configId - The configuration ID (e.g., 'CDL_BPA_CIF')
   * @param fallback - The fallback text if API fails or label not found
   * @returns The API label or fallback text
   */
  const getLabel = (configId: string, fallback: string): string => {
    // If still loading, return fallback to prevent flickering
    if (isLoading) {
      return fallback;
    }
    
    // If API error or no data, return fallback
    if (error || !data) {
      console.warn(`Label API unavailable, using fallback for ${configId}: ${fallback}`);
      return fallback;
    }
    
    // Try to get label from API data
    const labels = data[configId];
    if (labels && labels['EN']) {
      return labels['EN'];
    }
    
    // Special debugging for CDL_BPA_STATUS only
    if (configId === 'CDL_BPA_STATUS') {
      console.log(`🔍 CDL_BPA_STATUS Debug:`, {
        availableKeys: Object.keys(data).filter(key => key.includes('STATUS')),
        allKeys: Object.keys(data),
        hasCDL_BPA_STATUS: !!data['CDL_BPA_STATUS'],
        cdlBpaStatusValue: data['CDL_BPA_STATUS']
      });
    }
    
    // If label not found in API, return fallback
    console.info(`Label not found for ${configId}, using fallback: ${fallback}`);
    return fallback;
  };
  
  /**
   * Check if labels are available from API
   */
  const hasLabels = (): boolean => {
    return !isLoading && !error && !!data;
  };
  
  /**
   * Get loading state
   */
  const isLabelsLoading = (): boolean => {
    return isLoading;
  };
  
  /**
   * Get error state
   */
  const hasError = (): boolean => {
    return !!error;
  };
  
  /**
   * Get error message for debugging
   */
  const getErrorMessage = (): string | null => {
    return error?.message || null;
  };
  
  return {
    getLabel,
    hasLabels,
    isLabelsLoading,
    hasError,
    getErrorMessage,
    // Expose raw data for advanced usage if needed
    data,
    isLoading,
    error
  };
};

export default useProjectLabels;
