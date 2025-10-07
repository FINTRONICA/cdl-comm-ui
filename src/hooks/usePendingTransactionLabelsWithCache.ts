import { useCallback } from 'react'
import { useAppStore } from '@/store'
import PendingTransactionLabelsService, {
  type ProcessedPendingTransactionLabels,
} from '@/services/api/pendingTransactionLabelsService'

export function usePendingTransactionLabelsWithCache() {
  const pendingTransactionLabels = useAppStore(
    (state) => state.pendingTransactionLabels
  ) as ProcessedPendingTransactionLabels | null
  const pendingTransactionLabelsLoading = useAppStore(
    (state) => state.pendingTransactionLabelsLoading
  )

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (pendingTransactionLabels) {
        return PendingTransactionLabelsService.getLabel(
          pendingTransactionLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [pendingTransactionLabels]
  )

  const hasLabels = useCallback(() => {
    return PendingTransactionLabelsService.hasLabels(
      pendingTransactionLabels || ({} as any)
    )
  }, [pendingTransactionLabels])

  const getAvailableLanguages = useCallback(() => {
    return PendingTransactionLabelsService.getAvailableLanguages(
      pendingTransactionLabels || ({} as any)
    )
  }, [pendingTransactionLabels])

  return {
    data: pendingTransactionLabels,
    isLoading: pendingTransactionLabelsLoading,
    error: null,
    isError: false,
    isFetching: pendingTransactionLabelsLoading,
    isSuccess: !!pendingTransactionLabels,
    refetch: () => {
      console.log(
        '🏦 [COMPLIANCE] Refetch requested - handled by compliance loader'
      )
      return Promise.resolve({ data: pendingTransactionLabels })
    },

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!pendingTransactionLabels,
    cacheStatus: pendingTransactionLabels
      ? 'cached'
      : pendingTransactionLabelsLoading
        ? 'loading'
        : 'fresh',
  }
}
