import { useState, useEffect, useCallback } from 'react'
import {
  processedTransactionService,
  ProcessedTransaction,
  ProcessedTransactionUIData,
  ProcessedTransactionFilters,
} from '@/services/api/processedTransactionService'
import type { PaginatedResponse } from '@/types'

export interface UseProcessedTransactionsResult {
  data: PaginatedResponse<ProcessedTransactionUIData> | null
  rawData: PaginatedResponse<ProcessedTransaction> | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: ProcessedTransactionFilters) => void
  updatePagination: (page: number, size?: number) => void
  deleteTransaction: (id: string) => Promise<void>
  filters: ProcessedTransactionFilters
  pagination: {
    page: number
    size: number
  }
}

export const useProcessedTransactions = (
  initialPage: number = 0,
  initialSize: number = 20,
  initialFilters: ProcessedTransactionFilters = {}
): UseProcessedTransactionsResult => {
  const [data, setData] =
    useState<PaginatedResponse<ProcessedTransactionUIData> | null>(null)
  const [rawData, setRawData] =
    useState<PaginatedResponse<ProcessedTransaction> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] =
    useState<ProcessedTransactionFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: initialSize,
  })

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [uiData, apiData] = await Promise.all([
        processedTransactionService.getProcessedTransactionsUIData(
          pagination.page,
          pagination.size,
          filters
        ),
        processedTransactionService.getProcessedTransactions(
          pagination.page,
          pagination.size,
          filters
        ),
      ])

      setData(uiData)
      setRawData(apiData)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch processed transactions'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, filters])

  const updateFilters = useCallback(
    (newFilters: ProcessedTransactionFilters) => {
      setFilters(newFilters)
      setPagination((prev) => ({ ...prev, page: 0 }))
    },
    [filters]
  )

  const updatePagination = useCallback(
    (page: number, size?: number) => {
      setPagination((prev) => ({
        page,
        size: size !== undefined ? size : prev.size,
      }))
    },
    [pagination]
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        await processedTransactionService.deleteProcessedTransaction(id)

        if (data) {
          setData((prevData) => {
            if (!prevData) return null
            return {
              ...prevData,
              content: prevData.content.filter((item) => item.id !== id),
            }
          })
        }

        if (rawData) {
          setRawData((prevRawData) => {
            if (!prevRawData) return null
            return {
              ...prevRawData,
              content: prevRawData.content.filter(
                (item) => item.id.toString() !== id
              ),
            }
          })
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to delete processed transaction'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [data, rawData]
  )

  const refetch = useCallback(async () => {
    await fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    data,
    rawData,
    loading,
    error,
    refetch,
    updateFilters,
    updatePagination,
    deleteTransaction,
    filters,
    pagination,
  }
}
