import React from 'react'
import { IconButton } from '../../atoms/IconButton'
import { Select } from '../../atoms/Select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalRows: number
  rowsPerPage: number
  startItem: number
  endItem: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  className?: string
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  startItem,
  endItem,
  onPageChange,
  onRowsPerPageChange,
  className = '',
}) => {
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

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 ${className}`}
    >
      {/* Left side - Row count info */}
      <div className="flex items-center">
        <span className="text-sm text-gray-500">
          {startItem}-{endItem} of {totalRows} row(s)
        </span>
      </div>

      {/* Center - Page navigation */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={ChevronsLeft}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First page"
          className="p-2 h-[36px] w-[36px] text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
        />
        <IconButton
          icon={ChevronLeft}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Previous page"
          className="p-2 h-[36px] w-[36px] text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
        />

        {generatePageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <IconButton
          icon={ChevronRight}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          title="Next page"
          className="p-2 h-[36px] w-[36px] text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
        />
        <IconButton
          icon={ChevronsRight}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
          className="p-2 h-[36px] w-[36px] text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
        />
      </div>

      {/* Right side - Rows per page dropdown */}
      <div className="flex items-center gap-2">
        <Select
          value={rowsPerPage.toString()}
          onChange={(value) => onRowsPerPageChange(Number(value))}
          options={[10, 20, 50, 100].map((opt) => ({
            value: opt.toString(),
            label: opt.toString(),
          }))}
          placeholder=""
          className=" w-[70px] border border-gray-300 rounded-lg pl-4 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none [&>option]:text-gray-900 shadow-sm"
        />
      </div>
    </div>
  )
}
