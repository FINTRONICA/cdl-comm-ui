import React, { useState } from 'react'
import { TableRow } from '../../molecules/TableRow'
import { Pagination } from '../../molecules/Pagination'
import { Typography } from '../../atoms/Typography'
import { ArrowUpDown } from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'badge' | 'date' | 'amount' | 'actions'
  badgeVariant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default'
}

interface DataTableProps {
  data: Record<string, string | React.ReactNode>[]
  columns: Column[]
  onRowAction?: (action: string, data: Record<string, string | React.ReactNode>) => void
  itemsPerPage?: number
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onRowAction,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  // State for each column's search value
  const [columnSearch, setColumnSearch] = useState<{ [key: string]: string }>(
    () => Object.fromEntries(columns.map((col) => [col.key, '']))
  )
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Filter data based on column search
  const filteredData = data.filter((item) =>
    columns.every((col) => {
      const searchVal = columnSearch[col.key]?.toLowerCase() || ''
      if (!searchVal) return true
      const value = String(item[col.key] ?? '').toLowerCase()
      return value.includes(searchVal)
    })
  )

  // Sort data
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key] ?? ''
        const bValue = b[sortConfig.key] ?? ''
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
  }

  // Handler for column search input
  const handleColumnSearch = (key: string, value: string) => {
    setColumnSearch((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  return (
    <div className="bg-white px-0 md:px-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left font-semibold text-sm text-gray-600 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Typography variant="caption" className="font-semibold">
                      {column.label}
                    </Typography>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="hover:bg-gray-200 p-1 rounded"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-2 bg-white">
                  {column.type !== 'actions' && (
                    <input
                      className="w-full border border-gray-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Search`}
                      value={columnSearch[column.key] || ''}
                      onChange={(e) => handleColumnSearch(column.key, e.target.value)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <TableRow
                key={index}
                data={item}
                columns={columns}
                onActionClick={onRowAction}
              />
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-400">No data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-6 gap-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
