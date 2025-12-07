import { useCallback } from 'react'
import { useAgreementParameterLabels } from './useAgreementParameter'
import { AgreementParameterLabelsService } from '@/services/api/masterApi/Entitie/agreementParameterLabelsService'
import type { ProcessedAgreementParameterLabels } from '@/services/api/masterApi/Entitie/agreementParameterLabelsService'

export function useAgreementParameterLabelsWithCache() {
    // Use React Query hook to fetch labels
    const query = useAgreementParameterLabels()
    
    // Process the labels data to match the expected format
    const agreementParameterLabels = query.data as ProcessedAgreementParameterLabels | undefined

    const getLabel = useCallback(
        (configId: string, language: string, fallback: string) => {
            if (agreementParameterLabels) {
                return AgreementParameterLabelsService.getLabel(agreementParameterLabels, configId, language, fallback)
            }
            return fallback
        },
        [agreementParameterLabels]
    )

    const hasLabels = useCallback(() => {
        return AgreementParameterLabelsService.hasLabels(agreementParameterLabels || {})
    }, [agreementParameterLabels])

    const getAvailableLanguages = useCallback(() => {
        return AgreementParameterLabelsService.getAvailableLanguages(agreementParameterLabels || {})
    }, [agreementParameterLabels])

    // Return identical API structure for backward compatibility
    return {
        // React Query-like structure for compatibility
        data: agreementParameterLabels,
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
        hasCache: !!agreementParameterLabels,
        cacheStatus: agreementParameterLabels ? 'cached' : query.isLoading ? 'Loading...' : 'fresh',
    }
}


