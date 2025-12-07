import { useState, useMemo, useCallback } from 'react'

interface UseTableStateProps<T> {
  data: T[]
  searchFields: string[]
  initialRowsPerPage?: number
}

const parseNumericValue = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim()
    if (!normalized) {
      return null
    }

    const parsed = Number(normalized)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return null
}

export const useTableState = <T>({
  data,
  searchFields,
  initialRowsPerPage = 20,
}: UseTableStateProps<T>) => {
  const [search, setSearch] = useState<Record<string, string>>(() =>
    Object.fromEntries(searchFields.map((field) => [field, '']))
  )
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const memoizedSearchFields = useMemo(() => searchFields, [searchFields])

  const filtered = useMemo(() => {
    const hasSearchValues = Object.values(search).some(
      (val) => val.trim() !== ''
    )
    let filteredData = data

    if (hasSearchValues) {
      filteredData = data.filter((row: unknown) => {
        return memoizedSearchFields.every((field) => {
          const searchVal = search[field]?.trim() || ''
          if (!searchVal) return true

          const value = (row as Record<string, unknown>)[field]

          // For status fields, use exact match (case-insensitive)
          if (field === 'status' || field === 'paymentStatus' || field === 'approvalStatus') {
            return String(value ?? '').toUpperCase() === searchVal.toUpperCase()
          }

          // For other fields, use substring match (case-insensitive)
          const searchLower = searchVal.toLowerCase()
          const valueLower = String(value ?? '').toLowerCase()
          return valueLower.includes(searchLower)
        })
      })
    }

    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortConfig.key]
        const bVal = (b as Record<string, unknown>)[sortConfig.key]

        // Handle null/undefined values - nulls go to the end
        if (aVal === null || aVal === undefined) {
          if (bVal === null || bVal === undefined) return 0
          return 1 // a is null, b is not - a goes after b
        }
        if (bVal === null || bVal === undefined) return -1 // b is null, a is not - b goes after a

        // Handle numeric values
        const aNum = parseNumericValue(aVal)
        const bNum = parseNumericValue(bVal)

        if (aNum !== null && bNum !== null) {
          if (aNum === bNum) {
            return 0
          }

          const comparison = aNum - bNum
          return sortConfig.direction === 'asc' ? comparison : -comparison
        }

        // Handle array values (e.g., roleName)
        if (Array.isArray(aVal) && Array.isArray(bVal)) {
          const aStr = aVal.join(', ').toLowerCase()
          const bStr = bVal.join(', ').toLowerCase()
          const comparison = aStr.localeCompare(bStr)
          return sortConfig.direction === 'asc' ? comparison : -comparison
        }

        // Convert to string and compare case-insensitively
        const aStr = String(aVal).toLowerCase().trim()
        const bStr = String(bVal).toLowerCase().trim()

        if (aStr === bStr) return 0

        const comparison = aStr.localeCompare(bStr)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return filteredData
  }, [data, search, sortConfig, memoizedSearchFields])

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

  const paginated = useMemo(() => {
    const { startIndex, endIndex } = pagination
    return filtered.slice(startIndex, endIndex)
  }, [filtered, pagination])

  const handleSearchChange = useCallback((field: string, value: string) => {
    setSearch((prev) => {
      const newSearch = { ...prev, [field]: value }

      setPage(1)
      return newSearch
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(1)
  }, [])

  const handleRowSelectionChange = useCallback((selectedRows: number[]) => {
    setSelectedRows(selectedRows)
  }, [])

  const handleRowExpansionChange = useCallback((expandedRows: number[]) => {
    setExpandedRows(expandedRows)
  }, [])

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      } else {
        return { key, direction: 'asc' }
      }
    })
    setPage(1) // Reset to first page when sorting changes
  }, [])

  return {
    filtered,
    paginated,

    totalRows: pagination.totalRows,
    totalPages: pagination.totalPages,
    startItem: pagination.startIndex + 1,
    endItem: pagination.endIndex,
    page,
    rowsPerPage,

    search,
    handleSearchChange,

    selectedRows,
    expandedRows,
    handleRowSelectionChange,
    handleRowExpansionChange,

    sortConfig,
    handleSort,

    handlePageChange,
    handleRowsPerPageChange,
  }
}
