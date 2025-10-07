import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  financialInstitutionService, 
  FinancialInstitution, 
  FinancialInstitutionRequest,
  FinancialInstitutionSearchParams,
  FinancialInstitutionListResponse 
} from '@/services/api/financialInstitutionService'

// Hook return type
interface UseFinancialInstitutionsReturn {
  // Data
  financialInstitutions: FinancialInstitution[]
  selectedFinancialInstitution: FinancialInstitution | null
  
  // Loading states
  loading: boolean
  loadingById: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  
  // Error states
  error: string | null
  errorById: string | null
  createError: string | null
  updateError: string | null
  deleteError: string | null
  
  // Pagination
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  
  // Actions
  fetchFinancialInstitutions: (params?: FinancialInstitutionSearchParams) => Promise<void>
  fetchFinancialInstitutionById: (id: string | number) => Promise<void>
  createFinancialInstitution: (data: FinancialInstitutionRequest) => Promise<FinancialInstitution | null>
  updateFinancialInstitution: (id: string | number, data: Partial<FinancialInstitutionRequest>) => Promise<FinancialInstitution | null>
  deleteFinancialInstitution: (id: string | number) => Promise<boolean>
  searchFinancialInstitutions: (searchTerm: string, page?: number, size?: number) => Promise<void>
  clearErrors: () => void
  clearSelected: () => void
}

// Hook options
interface UseFinancialInstitutionsOptions {
  autoFetch?: boolean
  initialPage?: number
  initialPageSize?: number
  initialSearchParams?: FinancialInstitutionSearchParams
}

/**
 * Custom hook for managing financial institutions
 * @param options - Hook configuration options
 * @returns Financial institutions data and actions
 */
export const useFinancialInstitutions = (
  options: UseFinancialInstitutionsOptions = {}
): UseFinancialInstitutionsReturn => {
  const {
    autoFetch = true,
    initialPage = 0,
    initialPageSize = 20,
    initialSearchParams = {}
  } = options

  // State management
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([])
  const [selectedFinancialInstitution, setSelectedFinancialInstitution] = useState<FinancialInstitution | null>(null)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingById, setLoadingById] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Error states
  const [error, setError] = useState<string | null>(null)
  const [errorById, setErrorById] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  
  // Pagination state
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Fetch financial institutions with pagination
  const fetchFinancialInstitutions = useCallback(async (params: FinancialInstitutionSearchParams = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const searchParams = {
        page: currentPage,
        size: pageSize,
        ...initialSearchParams,
        ...params
      }
      
      const result: FinancialInstitutionListResponse = await financialInstitutionService.getFinancialInstitutions(searchParams)
      
      setFinancialInstitutions(result.content || [])
      setTotalElements(result.page?.totalElements || 0)
      setTotalPages(result.page?.totalPages || 0)
      setCurrentPage(result.page?.number || 0)
      setPageSize(result.page?.size || pageSize)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial institutions'
      setError(errorMessage)
      console.error('useFinancialInstitutions.fetchFinancialInstitutions Failed:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, initialSearchParams])

  // Fetch financial institution by ID
  const fetchFinancialInstitutionById = useCallback(async (id: string | number) => {
    try {
      setLoadingById(true)
      setErrorById(null)
      
      const result = await financialInstitutionService.getFinancialInstitutionById(id)
      setSelectedFinancialInstitution(result)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial institution'
      setErrorById(errorMessage)
      console.error('useFinancialInstitutions.fetchFinancialInstitutionById Failed:', errorMessage)
    } finally {
      setLoadingById(false)
    }
  }, [])

  // Create financial institution
  const createFinancialInstitution = useCallback(async (data: FinancialInstitutionRequest): Promise<FinancialInstitution | null> => {
    try {
      setCreating(true)
      setCreateError(null)
      
      const result = await financialInstitutionService.createFinancialInstitution(data)
      
      // Refresh the list
      await fetchFinancialInstitutions()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create financial institution'
      setCreateError(errorMessage)
      console.error('useFinancialInstitutions.createFinancialInstitution Failed:', errorMessage)
      return null
    } finally {
      setCreating(false)
    }
  }, [fetchFinancialInstitutions])

  // Update financial institution
  const updateFinancialInstitution = useCallback(async (
    id: string | number, 
    data: Partial<FinancialInstitutionRequest>
  ): Promise<FinancialInstitution | null> => {
    try {
      setUpdating(true)
      setUpdateError(null)
      
      const result = await financialInstitutionService.updateFinancialInstitution(id, data)
      
      // Update the selected financial institution if it's the same one
      if (selectedFinancialInstitution?.id === result.id) {
        setSelectedFinancialInstitution(result)
      }
      
      // Refresh the list
      await fetchFinancialInstitutions()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update financial institution'
      setUpdateError(errorMessage)
      console.error('useFinancialInstitutions.updateFinancialInstitution Failed:', errorMessage)
      return null
    } finally {
      setUpdating(false)
    }
  }, [selectedFinancialInstitution, fetchFinancialInstitutions])

  // Delete financial institution
  const deleteFinancialInstitution = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      setDeleting(true)
      setDeleteError(null)
      
      await financialInstitutionService.deleteFinancialInstitution(id)
      
      // Clear selected if it's the deleted one
      if (selectedFinancialInstitution?.id === id) {
        setSelectedFinancialInstitution(null)
      }
      
      // Refresh the list
      await fetchFinancialInstitutions()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete financial institution'
      setDeleteError(errorMessage)
      console.error('useFinancialInstitutions.deleteFinancialInstitution Failed:', errorMessage)
      return false
    } finally {
      setDeleting(false)
    }
  }, [selectedFinancialInstitution, fetchFinancialInstitutions])

  // Search financial institutions
  const searchFinancialInstitutions = useCallback(async (
    searchTerm: string, 
    page: number = 0, 
    size: number = pageSize
  ) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await financialInstitutionService.searchFinancialInstitutions(searchTerm, page, size)
      
      setFinancialInstitutions(result.content || [])
      setTotalElements(result.page?.totalElements || 0)
      setTotalPages(result.page?.totalPages || 0)
      setCurrentPage(result.page?.number || 0)
      setPageSize(result.page?.size || size)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search financial institutions'
      setError(errorMessage)
      console.error('useFinancialInstitutions.searchFinancialInstitutions Failed:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null)
    setErrorById(null)
    setCreateError(null)
    setUpdateError(null)
    setDeleteError(null)
  }, [])

  // Clear selected financial institution
  const clearSelected = useCallback(() => {
    setSelectedFinancialInstitution(null)
  }, [])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchFinancialInstitutions()
    }
  }, [autoFetch, fetchFinancialInstitutions])

  return {
    // Data
    financialInstitutions,
    selectedFinancialInstitution,
    
    // Loading states
    loading,
    loadingById,
    creating,
    updating,
    deleting,
    
    // Error states
    error,
    errorById,
    createError,
    updateError,
    deleteError,
    
    // Pagination
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    
    // Actions
    fetchFinancialInstitutions,
    fetchFinancialInstitutionById,
    createFinancialInstitution,
    updateFinancialInstitution,
    deleteFinancialInstitution,
    searchFinancialInstitutions,
    clearErrors,
    clearSelected,
  }
}

// Simplified hook for dropdown usage
export const useFinancialInstitutionsDropdown = () => {
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFinancialInstitutions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await financialInstitutionService.getAllFinancialInstitutions()
      setFinancialInstitutions(result)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial institutions'
      setError(errorMessage)
      console.error('❌ useFinancialInstitutionsDropdown Failed:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFinancialInstitutions()
  }, [fetchFinancialInstitutions])

  return {
    financialInstitutions,
    loading,
    error,
    refetch: fetchFinancialInstitutions
  }
}

// Hook for enabled financial institutions dropdown with pagination
export const useEnabledFinancialInstitutionsDropdown = () => {
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const pageSize = 20 // Fixed page size for dropdown

  const fetchEnabledFinancialInstitutions = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      if (page === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const result = await financialInstitutionService.getFinancialInstitutions({ 
        enabled: true,
        page,
        size: pageSize
      })
      
      const enabledInstitutions = result.content.filter(fi => fi.enabled)
      
      if (append) {
        setFinancialInstitutions(prev => [...prev, ...enabledInstitutions])
      } else {
        setFinancialInstitutions(enabledInstitutions)
      }
      
      setTotalElements(result.page?.totalElements || 0)
      setHasMore(result.page ? (result.page.number + 1) < result.page.totalPages : false)
      setCurrentPage(result.page?.number || 0)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enabled financial institutions'
      setError(errorMessage)
      console.error('❌ useEnabledFinancialInstitutionsDropdown Failed:', errorMessage)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [pageSize])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchEnabledFinancialInstitutions(currentPage + 1, true)
    }
  }, [fetchEnabledFinancialInstitutions, currentPage, loadingMore, hasMore])

  const reset = useCallback(() => {
    setFinancialInstitutions([])
    setCurrentPage(0)
    setHasMore(true)
    setTotalElements(0)
    fetchEnabledFinancialInstitutions(0, false)
  }, [fetchEnabledFinancialInstitutions])

  useEffect(() => {
    fetchEnabledFinancialInstitutions(0, false)
  }, [fetchEnabledFinancialInstitutions])

  // Transform for dropdown usage
  const dropdownOptions = useMemo(() => {
    const options = financialInstitutionService.transformListForDropdown(financialInstitutions)
    
    // Add "Load More" option if there are more items
    if (hasMore && !loadingMore) {
      options.push({
        id: -1, // Special ID for load more
        displayName: 'Load More...',
        settingValue: '__LOAD_MORE__'
      })
    }
    
    // Add loading indicator if loading more
    if (loadingMore) {
      options.push({
        id: -2, // Special ID for loading
        displayName: 'Loading more...',
        settingValue: '__LOADING__'
      })
    }
    
    return options
  }, [financialInstitutions, hasMore, loadingMore])

  return {
    financialInstitutions,
    dropdownOptions,
    loading,
    loadingMore,
    error,
    hasMore,
    totalElements,
    currentPage,
    loadMore,
    refetch: reset,
    reset
  }
}
