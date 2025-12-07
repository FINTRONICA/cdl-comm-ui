import { useCallback } from 'react'
import { useAccountLabels } from './useAccount'
import { AccountLabelsService } from '@/services/api/masterApi/Entitie/accountLabelsService'
import type { ProcessedAccountLabels } from '@/services/api/masterApi/Entitie/accountLabelsService'

export function useAccountLabelsWithCache() {
    // Use React Query hook to fetch labels
    const query = useAccountLabels()
    
    // Process the labels data to match the expected format
    const accountLabels = query.data as ProcessedAccountLabels | undefined

    const getLabel = useCallback(
        (configId: string, language: string, fallback: string) => {
            if (accountLabels) {
                return AccountLabelsService.getLabel(accountLabels, configId, language, fallback)
            }
            return fallback
        },
        [accountLabels]
    )

    const hasLabels = useCallback(() => {
        return AccountLabelsService.hasLabels(accountLabels || {})
    }, [accountLabels])

    const getAvailableLanguages = useCallback(() => {
        return AccountLabelsService.getAvailableLanguages(accountLabels || {})
    }, [accountLabels])

    // Return identical API structure for backward compatibility
    return {
        // React Query-like structure for compatibility
        data: accountLabels,
        isLoading: query.isLoading,
        error: query.error,
        isError: query.isError,
        isFetching: query.isFetching,
        isSuccess: query.isSuccess,
        refetch: query.refetch,

        // Original hook API functions (unchanged signatures)
        getLabel,
        hasLabels,
        getAvailableLanguages,

        // Compatibility properties (maintained for existing UI components)
        hasCache: !!accountLabels,
        cacheStatus: accountLabels ? 'cached' : query.isLoading ? 'Loading...' : 'fresh',
    }
}
