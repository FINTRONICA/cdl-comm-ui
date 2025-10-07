import { useState, useEffect, useCallback } from 'react'
import {
  feeRepushLabelService,
  FeeRepushLabelApiResponse,
  FeeRepushLabelMap,
} from '@/services/api/feeRepushLabelService'

export interface UseFeeRepushLabelsResult {
  data: FeeRepushLabelApiResponse[] | null
  labelMap: FeeRepushLabelMap | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getLabel: (configId: string, fallback?: string) => string
  clearCache: () => void
}

export const useFeeRepushLabelsWithCache = (
  languageCode: string = 'EN'
): UseFeeRepushLabelsResult => {
  const [data, setData] = useState<FeeRepushLabelApiResponse[] | null>(null)
  const [labelMap, setLabelMap] = useState<FeeRepushLabelMap | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
   

    try {
      setLoading(true)
      setError(null)

      // Fetch labels and transform to map in parallel
      const [labelsData, labelsMap] = await Promise.all([
        feeRepushLabelService.getFeeRepushLabels(languageCode),
        feeRepushLabelService.getFeeRepushLabelMap(languageCode),
      ])

    

      setData(labelsData)
      setLabelMap(labelsMap)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch fee repush labels'


      setError(errorMessage)
      setData(null)
      setLabelMap(null)
    } finally {
      setLoading(false)
    }
  }, [languageCode])

  const getLabel = useCallback(
    (configId: string, fallback?: string): string => {
      if (!labelMap) {
      
        return fallback || configId
      }

      const result = labelMap[configId] || fallback || configId

    

      return result
    },
    [labelMap]
  )

  const clearCache = useCallback(() => {
   

    feeRepushLabelService.clearCache(languageCode)

    // Refetch after clearing cache
    fetchLabels()
  }, [languageCode, fetchLabels])

  const refetch = useCallback(async () => {
  
    // Clear cache first, then refetch
    feeRepushLabelService.clearCache(languageCode)
    await fetchLabels()
  }, [languageCode, fetchLabels])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  // Debug logging
  useEffect(() => {
  
  }, [data, labelMap, loading, error, languageCode])

  return {
    data,
    labelMap,
    loading,
    error,
    refetch,
    getLabel,
    clearCache,
  }
}

// Enhanced hook with specific label getters for Fee Repush
export const useFeeRepushLabelsEnhanced = (languageCode: string = 'EN') => {
  const { data, labelMap, loading, error, refetch, getLabel, clearCache } =
    useFeeRepushLabelsWithCache(languageCode)

  // Specific label getters for common Fee Repush labels
  const getProjectNameLabel = useCallback(
    () => getLabel('CDL_FEE_BPA_NAME', 'Project Name'),
    [getLabel]
  )

  const getFeeTypeLabel = useCallback(
    () => getLabel('CDL_FEE_TYPE', 'Fee Type'),
    [getLabel]
  )

  const getAmountLabel = useCallback(
    () => getLabel('CDL_FEE_AMOUNT', 'Amount'),
    [getLabel]
  )

  const getTransactionDateLabel = useCallback(
    () => getLabel('CDL_FEE_TRAN_DATE', 'Transaction Date'),
    [getLabel]
  )

  const getApprovalStatusLabel = useCallback(
    () => getLabel('CDL_FEE_APP_STATUS', 'Approval Status'),
    [getLabel]
  )

  const getPaymentTypeLabel = useCallback(
    () => getLabel('CDL_FEE_PAYMENT_TYPE', 'Payment Type'),
    [getLabel]
  )

  const getActionLabel = useCallback(
    () => getLabel('CDL_FEE_ACTION', 'Actions'),
    [getLabel]
  )

  const getFeeRepushTitleLabel = useCallback(
    () => getLabel('CDL_FEE_REPUSH', 'Fee Reconciliation'),
    [getLabel]
  )

  return {
    data,
    labelMap,
    loading,
    error,
    refetch,
    getLabel,
    clearCache,
    // Specific label getters
    getProjectNameLabel,
    getFeeTypeLabel,
    getAmountLabel,
    getTransactionDateLabel,
    getApprovalStatusLabel,
    getPaymentTypeLabel,
    getActionLabel,
    getFeeRepushTitleLabel,
  }
}
