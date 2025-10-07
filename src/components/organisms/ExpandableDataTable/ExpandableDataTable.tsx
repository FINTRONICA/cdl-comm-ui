import React, { useMemo, useCallback } from 'react'
import { Checkbox } from '../../atoms/Checkbox'
import { StatusBadge } from '../../atoms/StatusBadge'
import { TableSearchRow } from '../../molecules/TableSearchRow'
import { ActionDropdown } from '../../molecules/ActionDropdown'

import { MultiSelect } from '../../atoms/MultiSelect'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { formatDateForDisplay } from '../../../utils'

interface Column {
  key: string
  label: string
  width?: string
  sortable?: boolean
  searchable?: boolean
  type:
    | 'checkbox'
    | 'text'
    | 'custom'
    | 'status'
    | 'actions'
    | 'select'
    | 'date'
    | 'expand'
    | 'user'
    | 'comment'
  options?: { value: string; label: string }[]
}

interface ExpandableDataTableProps<T = Record<string, unknown>> {
  renderActions?: (row: T, index: number) => React.ReactNode
  data: T[]
  columns: Column[]
  searchState: Record<string, string>
  onSearchChange: (field: string, value: string) => void
  paginationState: {
    page: number
    rowsPerPage: number
    totalRows: number
    totalPages: number
    startItem: number
    endItem: number
  }
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  selectedRows: number[]
  onRowSelectionChange: (selectedRows: number[]) => void
  expandedRows: number[]
  onRowExpansionChange: (expandedRows: number[]) => void
  renderExpandedContent?: (row: T, index: number) => React.ReactNode
  statusOptions?: string[]
  className?: string
  onDataChange?: (
    rowIndex: number,
    field: string,
    value: string | string[]
  ) => void
  renderCustomCell?: (
    column: string,
    value: unknown,
    row: T,
    index: number
  ) => React.ReactNode
  onRowDelete?: (row: T, index: number) => void
  onRowView?: (row: T, index: number) => void
  onRowEdit?: (row: T, index: number) => void
  showDeleteAction?: boolean
  showViewAction?: boolean
  showEditAction?: boolean
  onRowClick?: (row: T, index: number) => void
  onRowGallery?: (row: T, index: number) => void
  onRowTransaction?: (row: T, index: number) => void
  showGalleryAction?: boolean
  showTransactionAction?: boolean
  sortConfig?: {
    key: string
    direction: 'asc' | 'desc'
  } | null
  onSort?: (key: string) => void
}

const ExpandableDataTableComponent = <T extends Record<string, unknown>>({
  data,
  columns,
  searchState,
  onSearchChange,
  paginationState,
  onPageChange,
  onRowsPerPageChange,
  selectedRows,
  onRowSelectionChange,
  expandedRows,
  onRowExpansionChange,
  renderExpandedContent,
  statusOptions = [],
  className = '',
  onDataChange,
  renderCustomCell,
  onRowDelete,
  onRowView,
  onRowEdit,
  renderActions,
  onRowGallery,
  onRowTransaction,
  showDeleteAction = true,
  showViewAction = true,
  showEditAction = true,
  showGalleryAction = true,
  showTransactionAction = true,
  onRowClick,
  sortConfig,
  onSort,
}: ExpandableDataTableProps<T>) => {
  const { page, rowsPerPage, totalRows, totalPages, startItem, endItem } =
    paginationState

  // Memoize selection logic
  const toggleRow = useCallback(
    (index: number) => {
      const newSelected = selectedRows.includes(index)
        ? selectedRows.filter((i) => i !== index)
        : [...selectedRows, index]
      onRowSelectionChange(newSelected)
    },
    [selectedRows, onRowSelectionChange]
  )

  const toggleSelectAll = useCallback(() => {
    if (selectedRows.length === data.length && data.length > 0) {
      onRowSelectionChange([])
    } else {
      onRowSelectionChange(data.map((_, index) => index))
    }
  }, [selectedRows.length, data.length, onRowSelectionChange])

  const toggleExpandedRow = useCallback(
    (index: number) => {
      const newExpanded = expandedRows.includes(index)
        ? expandedRows.filter((i) => i !== index)
        : [...expandedRows, index]
      onRowExpansionChange(newExpanded)
    },
    [expandedRows, onRowExpansionChange]
  )

  // Memoize page numbers generation
  const generatePageNumbers = useCallback(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }, [page, totalPages])

  // Memoize page numbers
  const pageNumbers = useMemo(
    () => generatePageNumbers(),
    [generatePageNumbers]
  )

  return (
    <div className={`${className} flex flex-col h-full`}>
      <div className="flex-1 overflow-auto">
        <div className="overflow-auto w-full">
          <table className="w-full min-w-[1200px] table-fixed">
            <thead className="sticky top-0 z-20 bg-[#FFFFFF]">
              <tr className="border-gray-200">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${column.width || 'w-auto'} text-xs font-semibold px-4 py-3.5 text-[#1E2939] ${column.type === 'checkbox' ? 'border-r border-[#CAD5E2] text-center w-4 h-4' : 'text-left'}`}
                  >
                    {column.type === 'checkbox' ? (
                      <div className="flex items-center justify-center w-4 h-4">
                        <Checkbox
                          checked={
                            data.length > 0 &&
                            selectedRows.length === data.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4"
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-1 font-sans font-normal leading-[16px] tracking-normal ${
                          column.sortable
                            ? 'cursor-pointer hover:text-[#155DFC]'
                            : ''
                        }`}
                        onClick={() => column.sortable && onSort?.(column.key)}
                      >
                        {column.label}
                        {column.sortable && (
                          <>
                            {sortConfig?.key === column.key ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="w-[16px] h-[16px] text-[#155DFC]" />
                              ) : (
                                <ArrowDown className="w-[16px] h-[16px] text-[#155DFC]" />
                              )
                            ) : (
                              <ArrowDownUp className="w-[16px] h-[16px] text-[#90A1B9]" />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
              {/* Search Row */}
              <TableSearchRow
                columns={columns}
                search={searchState}
                onSearchChange={onSearchChange}
                statusOptions={statusOptions}
              />
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {data.map((row, index) => (
                <React.Fragment key={index}>
                  <tr
                    className={`transition-colors min-h-[64px] ${
                      selectedRows.includes(index)
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    } ${onRowClick ? ' hover:bg-gray-50' : ''}`}
                    onClick={
                      onRowClick ? () => onRowClick(row, index) : undefined
                    }
                  >
                    {columns.map((column) => {
                      if (column.type === 'expand') {
                        return (
                          <td
                            key={column.key}
                            className="w-8 px-2.5 py-1.5 whitespace-nowrap justify-center items-center"
                          >
                            <button
                              className="p-1 transition-colors rounded hover:bg-gray-100"
                              onClick={() => toggleExpandedRow(index)}
                            >
                              {expandedRows.includes(index) ? (
                                <img
                                  src="/chevron-down.svg"
                                  alt="chevron-down icon"
                                />
                              ) : (
                                <img
                                  src="/chevron-right.svg"
                                  alt="chevron-right icon"
                                />
                              )}
                            </button>
                          </td>
                        )
                      }

                      if (column.type === 'checkbox') {
                        return (
                          <td
                            key={column.key}
                            className="w-8 px-2.5 py-1.5 whitespace-nowrap justify-center items-center"
                          >
                            <Checkbox
                              checked={selectedRows.includes(index)}
                              onChange={() => toggleRow(index)}
                              className="w-4 h-4"
                            />
                          </td>
                        )
                      }

                      if (column.type === 'actions') {
                        return (
                          <td
                            key={column.key}
                            className="w-20 px-2.5 py-1.5 whitespace-nowrap"
                          >
                            {renderActions ? (
                              renderActions(row, index)
                            ) : (
                              <ActionDropdown
                                {...(onRowDelete && {
                                  onDelete: () => onRowDelete(row, index),
                                })}
                                {...(onRowView && {
                                  onView: () => onRowView(row, index),
                                })}
                                {...(onRowEdit && {
                                  onEdit: () => onRowEdit(row, index),
                                })}
                                {...(onRowGallery && {
                                  onGallery: () => onRowGallery(row, index),
                                })}
                                {...(onRowTransaction && {
                                  onTransaction: () =>
                                    onRowTransaction(row, index),
                                })}
                                showDelete={showDeleteAction}
                                showView={showViewAction}
                                showEdit={showEditAction}
                                showGallery={showGalleryAction}
                                showTransaction={showTransactionAction}
                              />
                            )}
                          </td>
                        )
                      }
                      const value = row[column.key]
                      const displayValue = value

                      if (column.type === 'date' && value) {
                        const formattedDate = formatDateForDisplay(
                          value as string
                        )
                        return (
                          <td
                            key={column.key}
                            className={`${column.width || 'w-auto'} px-4 py-3.5 text-sm text-[#1E2939]`}
                          >
                            <div className="flex flex-col">
                              <span className="font-sans font-normal text-[14px] leading-[16px] align-middle tracking-[0] text-[#1E2939]">
                                {formattedDate.date}
                              </span>
                              <span className="font-sans font-normal text-[14px] leading-[16px] align-middle tracking-[0] text-[#1E2939]">
                                {formattedDate.time}
                              </span>
                            </div>
                          </td>
                        )
                      }

                      if (column.type === 'status' && value) {
                        return (
                          <td
                            key={column.key}
                            className={`${column.width || 'w-auto'} px-4 py-3.5 text-sm text-[#1E2939]`}
                          >
                            <StatusBadge status={value as string} />
                          </td>
                        )
                      }

                      if (column.type === 'select' && column.options) {
                        return (
                          <td
                            key={column.key}
                            className={`${column.width || 'w-auto'} px-4 py-3.5 text-sm text-[#1E2939]`}
                          >
                            <MultiSelect
                              options={column.options}
                              value={Array.isArray(value) ? value : [value]}
                              onChange={(newValue) =>
                                onDataChange?.(index, column.key, newValue)
                              }
                            />
                          </td>
                        )
                      }

                      if (column.type === 'custom' && renderCustomCell) {
                        return (
                          <td
                            key={column.key}
                            className={`${column.width || 'w-auto'} px-4 py-3.5 text-sm text-[#1E2939] max-w-0`}
                          >
                            <div className="truncate">
                              {renderCustomCell(column.key, value, row, index)}
                            </div>
                          </td>
                        )
                      }

                      if (
                        column.type === 'comment' &&
                        typeof value === 'object' &&
                        value !== null
                      ) {
                        return (
                          <td
                            key={column.key}
                            className={`${column.width || 'w-auto'} px-4 py-3.5 text-sm text-[#1E2939]`}
                          >
                            <button
                              className="text-blue-600 underline hover:text-blue-800"
                              onClick={() => {
                                // Handle comment click
                              }}
                            >
                              View Comment
                            </button>
                          </td>
                        )
                      }

                      // Default cell for all other types
                      return (
                        <td
                          key={column.key}
                          className={`${column.width || 'w-auto'} px-4 py-3.5 text-sm text-[#1E2939] max-w-0`}
                        >
                          <div
                            className="truncate"
                            title={displayValue as string}
                          >
                            {displayValue as string}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                  {expandedRows.includes(index) && renderExpandedContent && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-4 bg-gray-50"
                      >
                        {renderExpandedContent(row, index)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {startItem}-{endItem} of {totalRows} row(s)
          </span>
          {/* <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none [&>option]:text-gray-900 shadow-sm"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt} className="text-gray-900">
                  {opt}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg shadow-sm hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg shadow-sm hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md font-sans leading-3.5 border border-gray-300 shadow-sm transition-colors ${
                page === pageNum
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg shadow-sm hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg shadow-sm hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
          <div className="relative w-full">
            <select
              className="block w-full py-2 pl-2 pr-6 font-sans text-sm text-gray-900 transition bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Dropdown icon */}
            <div className="absolute inset-y-0 flex items-center font-sans text-gray-500 pointer-events-none right-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const ExpandableDataTable = React.memo(ExpandableDataTableComponent) as <
  T extends Record<string, unknown>,
>(
  props: ExpandableDataTableProps<T>
) => React.ReactElement
