import React from 'react'
import { SearchInput } from '../../atoms/SearchInput'
import { StatusBadge } from '../../atoms/StatusBadge'
import { ActionDropdown } from '../../molecules/ActionDropdown'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDownUp,
} from 'lucide-react'

interface Column {
  key: string
  label: string
  width?: string
  type?: 'text' | 'status' | 'actions' | 'commentCount'
  searchable?: boolean
  sortable?: boolean
}

interface ExpandableRowData {
  [key: string]: unknown
  expandedContent?: React.ReactNode
}

interface ExpandableTableProps {
  columns: Column[]
  data: ExpandableRowData[]
  searchState: Record<string, string>
  onSearchChange: (key: string, value: string) => void
  selectedRows: number[]
  onRowSelectionChange: (selectedRows: number[]) => void
  expandedRows: number[]
  onRowExpansionChange: (expandedRows: number[]) => void
  currentPage: number
  totalPages: number
  totalRows: number
  rowsPerPage: number
  startItem: number
  endItem: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  statusOptions?: string[]
  className?: string
  onRowDelete?: (row: ExpandableRowData, index: number) => void
  onRowView?: (row: ExpandableRowData, index: number) => void
  showDeleteAction?: boolean
  showViewAction?: boolean
}

export const ExpandableTable: React.FC<ExpandableTableProps> = ({
  columns,
  data,
  searchState,
  onSearchChange,
  selectedRows,
  onRowSelectionChange,
  expandedRows,
  onRowExpansionChange,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  startItem,
  endItem,
  onPageChange,
  onRowsPerPageChange,
  statusOptions = [],
  className = '',
  onRowDelete,
  onRowView,
  showDeleteAction = true,
  showViewAction = true,
}) => {
  const allSelected = selectedRows.length === data.length && data.length > 0

  const toggleAll = () => {
    if (allSelected) {
      onRowSelectionChange([])
    } else {
      onRowSelectionChange(data.map((_, i) => i))
    }
  }

  const toggleRow = (index: number) => {
    onRowSelectionChange(
      selectedRows.includes(index)
        ? selectedRows.filter((i) => i !== index)
        : [...selectedRows, index]
    )
  }

  const toggleExpandedRow = (index: number) => {
    onRowExpansionChange(
      expandedRows.includes(index)
        ? expandedRows.filter((i) => i !== index)
        : [...expandedRows, index]
    )
  }

  const generatePageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const renderCell = (column: Column, value: unknown, rowIndex: number) => {
    switch (column.type) {
      case 'status':
        return <StatusBadge status={value} />
      case 'commentCount':
        // If value is a string, count the words/sentences, if it's an array, count the items
        const count = Array.isArray(value)
          ? value.length
          : typeof value === 'string'
            ? value.split(' ').length
            : 0
        return (
          <span className="text-sm font-normal not-italic text-[#1E2939] font-sans leading-4">
            {count} {count === 1 ? 'comment' : 'comments'}
          </span>
        )
      case 'actions':
        const rowData = data[rowIndex]
        return (
          <ActionDropdown
            onDelete={
              onRowDelete && rowData
                ? () => onRowDelete(rowData, rowIndex)
                : undefined
            }
            onView={
              onRowView && rowData
                ? () => onRowView(rowData, rowIndex)
                : undefined
            }
            showDelete={showDeleteAction}
            showView={showViewAction}
          />
        )
      default:
        return (
          <span className="text-sm font-normal not-italic text-[#1E2939] font-sans leading-4">
            {value}
          </span>
        )
    }
  }

  return (
    <div className={`bg-[#FFFFFFBF] ${className}`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1200px] table-fixed">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FFFFFFBF] border-b border-gray-200">
              <th className="w-12 px-6 py-4 text-left"></th>
              <th className="w-8 px-2 py-4 border-r">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.width || 'w-auto'} text-left text-xs font-semibold px-4 py-3.5 text-[#1E2939] tracking-wider`}
                >
                  <div className="flex items-center gap-1 font-outfit font-normal text-[12px] leading-[16px] tracking-normal">
                    {column.label}
                    {column.sortable && (
                      <ArrowDownUp className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-20 text-right text-xs font-semibold px-4 py-3.5 text-[#1E2939] tracking-wider">
                Actions
              </th>
            </tr>
            {/* Search Row */}
            <tr className="bg-[#FFFFFFBF] border-b border-gray-200">
              <th className="px-6 py-3"></th>
              <th className="px-2 py-3 border-r"></th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.width || 'w-auto'} px-4 py-2`}
                >
                  {column.searchable !== false ? (
                    column.type === 'status' ? (
                      <select
                        className="w-full h-8 min-w-0 px-2 py-1 bg-white border border-[#9CA3AF] font-sans text-[#1E2939] font-normal text-xs leading-[1rem] tracking-normal rounded-md placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:leading-3 placeholder:text-[#99A1AF]"
                        value={searchState[column.key] || ''}
                        onChange={(e) =>
                          onSearchChange(column.key, e.target.value)
                        }
                      >
                        <option value="">Search</option>
                        {statusOptions.map((opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="text-gray-900"
                          >
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : column.type === 'commentCount' ? (
                      <SearchInput
                        placeholder="Search by count"
                        value={searchState[column.key] || ''}
                        onChange={(value) => onSearchChange(column.key, value)}
                      />
                    ) : (
                      <SearchInput
                        placeholder="Search"
                        value={searchState[column.key] || ''}
                        onChange={(value) => onSearchChange(column.key, value)}
                      />
                    )
                  ) : null}
                </th>
              ))}
              <th className="w-20 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E2E8F0]">
            {data.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr
                  className={`hover:bg-gray-50 transition-colors min-h-[64px] ${
                    selectedRows.includes(rowIndex)
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  <td className="w-8 px-2.5 py-1.5 whitespace-nowrap justify-center items-center">
                    <button
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => toggleExpandedRow(rowIndex)}
                    >
                      {expandedRows.includes(rowIndex) ? (
                        <img src="/chevron-down.svg" alt="chevron-down icon" />
                      ) : (
                        <img
                          src="/chevron-right.svg"
                          alt="chevron-right icon"
                        />
                      )}
                    </button>
                  </td>
                  <td className="whitespace-nowrap pl-1 border-r justify-center items-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => toggleRow(rowIndex)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="p-4 whitespace-nowrap">
                      {renderCell(column, row[column.key], rowIndex)}
                    </td>
                  ))}
                  <td className="p-4 whitespace-nowrap text-right flex justify-center items-center">
                    <ActionDropdown
                      onDelete={
                        onRowDelete && row
                          ? () => onRowDelete(row, rowIndex)
                          : undefined
                      }
                      onView={
                        onRowView && row
                          ? () => onRowView(row, rowIndex)
                          : undefined
                      }
                      showDelete={showDeleteAction}
                      showView={showViewAction}
                    />
                  </td>
                </tr>
                {expandedRows.includes(rowIndex) && row.expandedContent && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={columns.length + 3} className="px-6 py-6">
                      {row.expandedContent}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pl-6 pr-4 pt-3.5 bg-[#FFFFFFBF] border-t border-t-[#E2E8F0]">
        <div className="flex items-center gap-6">
          <span className="text-sm text-[#4A5565] font-sans font-normal leading-4 align-bottom">
            {startItem}-{endItem} of {totalRows} row(s)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none [&>option]:text-gray-900 shadow-sm"
              value={rowsPerPage}
              onChange={(e) => {
                onRowsPerPageChange(Number(e.target.value))
                onPageChange(1)
              }}
            >
              {[10, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt} className="text-gray-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {generatePageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md font-sans leading-3.5 transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
