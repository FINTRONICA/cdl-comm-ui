import { useState, useMemo, useCallback } from 'react'

interface UseTableStateProps<T> {
  data: T[]
  searchFields: string[]
  initialRowsPerPage?: number
}

export const useTableState = <T>({
  data,
  searchFields,
  initialRowsPerPage = 20,
}: UseTableStateProps<T>) => {
  const [search, setSearch] = useState<Record<string, string>>(
    () => Object.fromEntries(searchFields.map(field => [field, '']))
  )
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Memoize search fields to prevent unnecessary re-renders
  const memoizedSearchFields = useMemo(() => searchFields, [searchFields])

  // Optimized filtered data with proper dependencies
  const filtered = useMemo(() => {
    // Early return if no search values
    const hasSearchValues = Object.values(search).some(val => val.trim() !== '')
    let filteredData = data

    if (hasSearchValues) {
      // Use a more efficient filtering approach with early termination
      filteredData = data.filter((row: unknown) => {
        return memoizedSearchFields.every((field) => {
          const searchVal = search[field]?.toLowerCase().trim() || ''
          if (!searchVal) return true
          const value = String((row as Record<string, unknown>)[field] ?? '').toLowerCase()
          return value.includes(searchVal)
        })
      })
    }

    // Apply sorting if sortConfig is set
    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortConfig.key]
        const bVal = (b as Record<string, unknown>)[sortConfig.key]
        
        if (aVal === bVal) return 0
        
        // Type-safe comparison
        const aStr = String(aVal ?? '')
        const bStr = String(bVal ?? '')
        const comparison = aStr < bStr ? -1 : 1
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return filteredData
  }, [data, search, sortConfig, memoizedSearchFields])

  // Memoize pagination calculations
  const pagination = useMemo(() => {
    const totalRows = filtered.length
    const totalPages = Math.ceil(totalRows / rowsPerPage)
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows)
    
    return {
      totalRows,
      totalPages,
      startIndex,
      endIndex,
    }
  }, [filtered.length, rowsPerPage, page])

  // Memoize paginated data
  const paginated = useMemo(() => {
    const { startIndex, endIndex } = pagination
    return filtered.slice(startIndex, endIndex)
  }, [filtered, pagination])

  // Optimized search change handler
  const handleSearchChange = useCallback((field: string, value: string) => {
    setSearch(prev => {
      const newSearch = { ...prev, [field]: value }
      // Reset to first page when searching
      setPage(1)
      return newSearch
    })
  }, [])

  // Optimized page change handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Optimized rows per page change handler
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(1) // Reset to first page
  }, [])

  // Optimized row selection handler
  const handleRowSelectionChange = useCallback((rowIndex: number, selected: boolean) => {
    setSelectedRows(prev => {
      if (selected) {
        return [...prev, rowIndex]
      } else {
        return prev.filter(index => index !== rowIndex)
      }
    })
  }, [])

  // Optimized row expansion handler
  const handleRowExpansionChange = useCallback((rowIndex: number, expanded: boolean) => {
    setExpandedRows(prev => {
      if (expanded) {
        return [...prev, rowIndex]
      } else {
        return prev.filter(index => index !== rowIndex)
      }
    })
  }, [])

  // Optimized sort handler
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }
      } else {
        return { key, direction: 'asc' }
      }
    })
  }, [])

  return {
    // Data
    filtered,
    paginated,
    
    // Pagination
    totalRows: pagination.totalRows,
    totalPages: pagination.totalPages,
    startItem: pagination.startIndex + 1,
    endItem: pagination.endIndex,
    page,
    rowsPerPage,
    
    // Search
    search,
    handleSearchChange,
    
    // Selection
    selectedRows,
    expandedRows,
    handleRowSelectionChange,
    handleRowExpansionChange,
    
    // Sorting
    sortConfig,
    handleSort,
    
    // Pagination handlers
    handlePageChange,
    handleRowsPerPageChange,
  }
} 