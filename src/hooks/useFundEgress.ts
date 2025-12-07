import { useState, useCallback, useEffect } from 'react'
import {
  fundEgressService,
  type FundEgressRequest,
  type FundEgressResponse,
  type FundEgressData,
} from '@/services/api/fundEgressService'

// Re-export the interface from service
export type { FundEgressData }

// Hook return type for manual payments
export interface UseManualPaymentsReturn {
  data: FundEgressData[]
  loading: boolean
  error: string | null
  fetchFundEgress: () => Promise<void>
  deleteFundEgress: (id: string) => Promise<void>
  approveFundEgress: (id: string) => Promise<void>
  rejectFundEgress: (id: string, reason: string) => Promise<void>
  updatePagination: (page: number, size?: number) => void
  pagination: {
    page: number
    size: number
  }
  apiPagination: {
    totalElements: number
    totalPages: number
  }
}

// Hook options
export interface UseManualPaymentsOptions {
  size?: number
  page?: number
}

// Hook return type
export interface UseFundEgressReturn {
  submitPayment: (paymentData: FundEgressRequest) => Promise<FundEgressResponse>
  loading: boolean
  error: string | null
  response: FundEgressResponse | null
  reset: () => void
}

/**
 * Hook to submit fund egress payments
 * @returns Object containing submit function, loading state, error, response, and reset function
 */
export function useFundEgress(): UseFundEgressReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<FundEgressResponse | null>(null)

  const submitPayment = useCallback(
    async (paymentData: FundEgressRequest): Promise<FundEgressResponse> => {
      try {
        setLoading(true)
        setError(null)
        setResponse(null)

      

        const result = await fundEgressService.submitFundEgress(paymentData)

        setResponse(result)

     

        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)

       

        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setResponse(null)
  }, [])

  return {
    submitPayment,
    loading,
    error,
    response,
    reset,
  }
}

/**
 * Hook to manage manual payments (fund egress data)
 * @param options - Hook options
 * @returns Object containing data, loading state, error, and CRUD functions
 */
export function useManualPayments(
  options: UseManualPaymentsOptions = {}
): UseManualPaymentsReturn {
  const { size: initialSize = 20, page: initialPage = 0 } = options

  const [data, setData] = useState<FundEgressData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: initialSize,
  })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 0,
  })

  const fetchFundEgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the service to fetch fund egress data
      const result = await fundEgressService.getFundEgressData(
        pagination.page,
        pagination.size
      )
      setData(result.content)
      setApiPagination({
        totalElements: result.page.totalElements,
        totalPages: result.page.totalPages,
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size])

  const deleteFundEgress = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

 
      await fundEgressService.deleteFundEgress(id)

      // Remove from local state after successful deletion
      setData((prevData) =>
        prevData.filter((item) => item.id.toString() !== id)
      )

    
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)

    

      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const approveFundEgress = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

     

      // Use the service to approve fund egress
      await fundEgressService.approveFundEgress(id)

      // Update local state after successful approval
      setData((prevData) =>
        prevData.map((item) =>
          item.id.toString() === id
            ? { ...item, fePaymentStatus: 'APPROVED' }
            : item
        )
      )

   
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)

    

      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const rejectFundEgress = useCallback(async (id: string, reason: string) => {
    try {
      setLoading(true)
      setError(null)

    

      // Use the service to reject fund egress
      await fundEgressService.rejectFundEgress(id, reason)

      // Update local state after successful rejection
      setData((prevData) =>
        prevData.map((item) =>
          item.id.toString() === id
            ? { ...item, fePaymentStatus: 'REJECTED', feRemark: reason }
            : item
        )
      )

    
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)

    

      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data on mount
  const updatePagination = useCallback((page: number, size?: number) => {
    setPagination((prev) => ({
      page,
      size: size !== undefined ? size : prev.size,
    }))
  }, [])

  useEffect(() => {
    fetchFundEgress()
  }, [fetchFundEgress])

  return {
    data,
    loading,
    error,
    fetchFundEgress,
    deleteFundEgress,
    approveFundEgress,
    rejectFundEgress,
    updatePagination,
    pagination,
    apiPagination,
  }
}

/**
 * Hook to manage TAS payments (alias for useManualPayments)
 * @param options - Hook options
 * @returns Object containing data, loading state, error, and CRUD functions
 */
export function useTasPayments(
  options: UseManualPaymentsOptions = {}
): UseManualPaymentsReturn {
  return useManualPayments(options)
}
