import { useState, useMemo, useEffect } from 'react'

interface ActivityData {
  developer: string
  maker: string
  recentActor: string
  comment: string
  createdDate: string
  updatedDate: string
  status: string
  activityId: string
  activityType: string
  projectName: string
  priority: string
  dueDate: string
  documents: Array<{ name: string; status: string; color: string }>
  recentActivity: Array<{ date: string; action: string; color: string }>
}

interface SearchState {
  developer: string
  maker: string
  recentActor: string
  comment: string
  createdDate: string
  updatedDate: string
  status: string
}

export const useActivitiesTable = (data: ActivityData[]) => {
  const [search, setSearch] = useState<SearchState>({
    developer: '',
    maker: '',
    recentActor: '',
    comment: '',
    createdDate: '',
    updatedDate: '',
    status: '',
  })
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  // Filtered data
  const filtered = useMemo(() => {
    return data.filter(
      (row) =>
        row.developer.toLowerCase().includes(search.developer.toLowerCase()) &&
        row.maker.toLowerCase().includes(search.maker.toLowerCase()) &&
        row.recentActor
          .toLowerCase()
          .includes(search.recentActor.toLowerCase()) &&
        row.comment.toLowerCase().includes(search.comment.toLowerCase()) &&
        row.createdDate
          .toLowerCase()
          .includes(search.createdDate.toLowerCase()) &&
        row.updatedDate
          .toLowerCase()
          .includes(search.updatedDate.toLowerCase()) &&
        (search.status ? row.status === search.status : true)
    )
  }, [data, search])

  const totalRows = filtered.length
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startItem = totalRows > 0 ? (page - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(page * rowsPerPage, totalRows)
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  // Reset to page 1 if current page is beyond available data
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
  }, [page, totalPages])

  const handleSearchChange = (field: keyof SearchState, value: string) => {
    setSearch((prev) => ({ ...prev, [field]: value }))
    setPage(1) // Reset to first page when searching
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(1) // Reset to first page when changing rows per page
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowSelectionChange = (newSelectedRows: number[]) => {
    setSelectedRows(newSelectedRows)
  }

  const handleRowExpansionChange = (newExpandedRows: number[]) => {
    setExpandedRows(newExpandedRows)
  }

  return {
    search,
    filtered,
    paginated,
    totalRows,
    totalPages,
    startItem,
    endItem,
    page,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  }
} 