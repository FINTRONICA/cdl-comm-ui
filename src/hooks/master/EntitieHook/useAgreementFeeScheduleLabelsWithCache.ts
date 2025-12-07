import { useCallback } from 'react'
import { useAgreementFeeScheduleLabels } from './useAgreementFeeSchedule'
import { AgreementFeeScheduleLabelsService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleLabelsService'
import type { ProcessedAgreementFeeScheduleLabels } from '@/services/api/masterApi/Entitie/agreementFeeScheduleLabelsService'

export function useAgreementFeeScheduleLabelsWithCache() {
    // Use React Query hook to fetch labels
    const query = useAgreementFeeScheduleLabels()
    
    // Process the labels data to match the expected format
    const agreementFeeScheduleLabels = query.data as ProcessedAgreementFeeScheduleLabels | undefined

    const getLabel = useCallback(
        (configId: string, language: string, fallback: string) => {
            if (agreementFeeScheduleLabels) {
                return AgreementFeeScheduleLabelsService.getLabel(agreementFeeScheduleLabels, configId, language, fallback)
            }
            return fallback
        },
        [agreementFeeScheduleLabels]
    )

    const hasLabels = useCallback(() => {
        return AgreementFeeScheduleLabelsService.hasLabels(agreementFeeScheduleLabels || {})
    }, [agreementFeeScheduleLabels])

    const getAvailableLanguages = useCallback(() => {
        return AgreementFeeScheduleLabelsService.getAvailableLanguages(agreementFeeScheduleLabels || {})
    }, [agreementFeeScheduleLabels])

    // Return identical API structure for backward compatibility
    return {
        // React Query-like structure for compatibility
        data: agreementFeeScheduleLabels,
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
        hasCache: !!agreementFeeScheduleLabels,
        cacheStatus: agreementFeeScheduleLabels ? 'cached' : query.isLoading ? 'Loading...' : 'fresh',
    }
}


