import { useState, useEffect, useCallback } from 'react'
import {
  feeRepushService,
  FeeRepushRecord,
  FeeRepushUIData,
  FeeRepushFilters,
  FeeRepushRequest,
  FeeRepushResponse,
} from '@/services/api/feeRepushService'
import type { PaginatedResponse } from '@/types'

export interface UseFeeRepushResult {
  data: PaginatedResponse<FeeRepushUIData> | null
  rawData: PaginatedResponse<FeeRepushRecord> | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: FeeRepushFilters) => void
  updatePagination: (page: number, size?: number) => void
  retryPayment: (id: string) => Promise<void>
  feeRepush: (id: string, request?: FeeRepushRequest) => Promise<FeeRepushResponse | null>
  filters: FeeRepushFilters
  pagination: {
    page: number
    size: number
  }
}

export const useFeeRepush = (
  initialPage: number = 0,
  initialSize: number = 20,
  initialFilters: FeeRepushFilters = {}
): UseFeeRepushResult => {
  const [data, setData] = useState<PaginatedResponse<FeeRepushUIData> | null>(
    null
  )
  const [rawData, setRawData] =
    useState<PaginatedResponse<FeeRepushRecord> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FeeRepushFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: initialSize,
  })

  const fetchFeeRepushData = useCallback(async () => {

    try {
      setLoading(true)
      setError(null)

      
      const [uiData, apiData] = await Promise.all([
        feeRepushService.getFeeRepushUIData(
          pagination.page,
          pagination.size,
          filters
        ),
        feeRepushService.getFeeRepushRecords(
          pagination.page,
          pagination.size,
          filters
        ),
      ])



      setData(uiData)
      setRawData(apiData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch fee repush data'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, filters])

  const updateFilters = useCallback(
    (newFilters: FeeRepushFilters) => {

      setFilters(newFilters)
     
      setPagination((prev) => ({ ...prev, page: 0 }))
    },
    []
  )

  const updatePagination = useCallback(
    (page: number, size?: number) => {

      setPagination((prev) => {
        const newPagination = {
          page,
          size: size !== undefined ? size : prev.size,
        }

        return newPagination
      })
    },
    [] 
  )

  const retryPayment = useCallback(
    async (id: string) => {

      try {
        setError(null)

       
        await feeRepushService.retryFeePayment(id)



        await fetchFeeRepushData()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to retry fee payment'
        setError(errorMessage)
        throw err 
      }
    },
    [fetchFeeRepushData]
  )

  const feeRepush = useCallback(
    async (id: string, request?: FeeRepushRequest): Promise<FeeRepushResponse | null> => {
      try {
        setError(null)

 
        const result = await feeRepushService.feeRepush(id, request)

       
        await fetchFeeRepushData()

        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to repush fee'
        setError(errorMessage)
        throw err 
      }
    },
    [fetchFeeRepushData]
  )

  const refetch = useCallback(async () => {

    await fetchFeeRepushData()
  }, [fetchFeeRepushData])

  useEffect(() => {
    fetchFeeRepushData()
  }, [fetchFeeRepushData])

  return {
    data,
    rawData,
    loading,
    error,
    refetch,
    updateFilters,
    updatePagination,
    retryPayment,
    feeRepush,
    filters,
    pagination,
  }
}
