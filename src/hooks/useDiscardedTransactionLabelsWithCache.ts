import { useCallback } from 'react'
import { useAppStore } from '@/store'
import DiscardedTransactionLabelsService, {
  type ProcessedDiscardedTransactionLabels,
} from '@/services/api/discardedTransactionLabelsService'

export function useDiscardedTransactionLabelsWithCache() {
  const discardedTransactionLabels = useAppStore(
    (state) => state.discardedTransactionLabels
  ) as ProcessedDiscardedTransactionLabels | null
  const discardedTransactionLabelsLoading = useAppStore(
    (state) => state.discardedTransactionLabelsLoading
  )

  const getLabel = useCallback(
    (configId: string, language: string, fallback: string) => {
      if (discardedTransactionLabels) {
        return DiscardedTransactionLabelsService.getLabel(
          discardedTransactionLabels,
          configId,
          language,
          fallback
        )
      }
      return fallback
    },
    [discardedTransactionLabels]
  )

  const hasLabels = useCallback(() => {
    return DiscardedTransactionLabelsService.hasLabels(
      discardedTransactionLabels || ({} as any)
    )
  }, [discardedTransactionLabels])

  const getAvailableLanguages = useCallback(() => {
    return DiscardedTransactionLabelsService.getAvailableLanguages(
      discardedTransactionLabels || ({} as any)
    )
  }, [discardedTransactionLabels])

  return {
    data: discardedTransactionLabels,
    isLoading: discardedTransactionLabelsLoading,
    error: null,
    isError: false,
    isFetching: discardedTransactionLabelsLoading,
    isSuccess: !!discardedTransactionLabels,
    refetch: () => {
      console.log(
        '🏦 [COMPLIANCE] Refetch requested - handled by compliance loader'
      )
      return Promise.resolve({ data: discardedTransactionLabels })
    },

    getLabel,
    hasLabels,
    getAvailableLanguages,

    hasCache: !!discardedTransactionLabels,
    cacheStatus: discardedTransactionLabels
      ? 'cached'
      : discardedTransactionLabelsLoading
        ? 'loading'
        : 'fresh',
  }
}
