import { useState, useEffect, useCallback } from 'react'
import {
  suretyBondService,
  SuretyBondResponse,
  SuretyBondRequest,
  SuretyBondSearchParams,
} from '@/services/api/suretyBondService'

// Hook for getting all surety bonds with pagination and search
export const useSuretyBonds = (params: SuretyBondSearchParams = {}) => {
  const [suretyBonds, setSuretyBonds] = useState<SuretyBondResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [pagination, setPagination] = useState({
    page: params.page || 0,
    size: params.size || 20,
  })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  // Sync internal pagination state with external params
  useEffect(() => {
    setPagination({
      page: params.page || 0,
      size: params.size || 20,
    })
  }, [params.page, params.size])

  const fetchSuretyBonds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await suretyBondService.getSuretyBonds({
        ...params,
        page: pagination.page,
        size: pagination.size,
      })

      setSuretyBonds(result.content)
      setTotalElements(result.page.totalElements)
      setTotalPages(result.page.totalPages)

      // Update API pagination
      const newApiPagination = {
        totalElements: result.page.totalElements,
        totalPages: result.page.totalPages,
      }
      setApiPagination(newApiPagination)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch surety bonds'
      setError(errorMessage)
      setSuretyBonds([])
    } finally {
      setLoading(false)
    }
  }, [params, pagination.page, pagination.size])

  useEffect(() => {
    fetchSuretyBonds()
  }, [fetchSuretyBonds])

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newSize !== undefined ? 0 : newPage, // Reset to page 0 when size changes
      size: newSize !== undefined ? newSize : prev.size,
    }))
  }, [])

  return {
    suretyBonds,
    loading,
    error,
    totalElements,
    totalPages,
    refetch: fetchSuretyBonds,
    updatePagination,
    apiPagination,
  } as typeof fetchSuretyBonds & {
    suretyBonds: typeof suretyBonds
    loading: typeof loading
    error: typeof error
    totalElements: typeof totalElements
    totalPages: typeof totalPages
    refetch: typeof fetchSuretyBonds
    updatePagination: typeof updatePagination
    apiPagination: typeof apiPagination
  }
}

// Hook for getting a single surety bond by ID
export const useSuretyBond = (id: string | number | null) => {
  const [suretyBond, setSuretyBond] = useState<SuretyBondResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuretyBond = useCallback(async () => {
    if (!id) {
      setSuretyBond(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await suretyBondService.getSuretyBondById(id)
      setSuretyBond(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch surety bond'
      setError(errorMessage)
      setSuretyBond(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSuretyBond()
  }, [fetchSuretyBond])

  return {
    suretyBond,
    loading,
    error,
    refetch: fetchSuretyBond,
  }
}

// Hook for creating a new surety bond
export const useCreateSuretyBond = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const createSuretyBond = useCallback(
    async (data: SuretyBondRequest): Promise<SuretyBondResponse | null> => {
      try {
        setLoading(true)
        setError(null)

        const result = await suretyBondService.createSuretyBond(data)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create surety bond'
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    createSuretyBond,
    loading,
    error,
  }
}

// Hook for updating a surety bond
export const useUpdateSuretyBond = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const updateSuretyBond = useCallback(
    async (
      id: string | number,
      data: Partial<SuretyBondRequest>
    ): Promise<SuretyBondResponse | null> => {
      try {
        setLoading(true)
        setError(null)

        const result = await suretyBondService.updateSuretyBond(id, data)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update surety bond'
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    updateSuretyBond,
    loading,
    error,
  }
}

// Hook for deleting a surety bond
export const useDeleteSuretyBond = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const deleteSuretyBond = useCallback(
    async (id: string | number): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        await suretyBondService.deleteSuretyBond(id)
        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete surety bond'
        setError(errorMessage)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    deleteSuretyBond,
    loading,
    error,
  }
}

// Hook for searching surety bonds
export const useSearchSuretyBonds = () => {
  const [suretyBonds, setSuretyBonds] = useState<SuretyBondResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const searchSuretyBonds = useCallback(
    async (
      searchTerm: string,
      page: number = 0,
      size: number = 20
    ): Promise<SuretyBondResponse[]> => {
      try {
        setLoading(true)
        setError(null)

        const result = await suretyBondService.searchSuretyBonds(
          searchTerm,
          page,
          size
        )
        setSuretyBonds(result.content)
        return result.content
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to search surety bonds'
        setError(errorMessage)
        setSuretyBonds([])
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    suretyBonds,
    loading,
    error,
    searchSuretyBonds,
  }
}

// Hook for getting all surety bonds as a simple list (for dropdowns)
export const useSuretyBondsDropdown = () => {
  const [suretyBonds, setSuretyBonds] = useState<SuretyBondResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuretyBonds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await suretyBondService.getAllSuretyBonds()
      setSuretyBonds(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch surety bonds'
      setError(errorMessage)
      setSuretyBonds([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuretyBonds()
  }, [fetchSuretyBonds])

  return {
    suretyBonds,
    loading,
    error,
    refetch: fetchSuretyBonds,
  }
}
