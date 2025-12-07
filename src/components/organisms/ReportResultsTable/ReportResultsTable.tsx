'use client'

import React from 'react'
import { Calendar } from 'lucide-react'

interface ReportResultRow {
  id: string
  [key: string]: string | number | boolean | null | undefined
}

interface ReportResultsTableProps {
  data: ReportResultRow[]
  columns: {
    key: string
    title: string
    type?: 'text' | 'date' | 'number' | 'status'
  }[]
  isLoading?: boolean
  onDownload?: (format: 'pdf' | 'excel') => void
  reportTitle?: string
}

export const ReportResultsTable: React.FC<ReportResultsTableProps> = ({
  data,
  columns,
  isLoading = false,
  onDownload,
  reportTitle = 'Report Results',
}) => {
  const formatCellValue = (
    value: string | number | boolean | null | undefined,
    type: string = 'text'
  ) => {
    if (value === null || value === undefined) return '-'

    switch (type) {
      case 'date':
        return new Date(value as string | number).toLocaleDateString('en-GB')
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value
      case 'status':
        const statusValue = value.toString().toLowerCase()
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              statusValue === 'active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : statusValue === 'inactive'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
            }`}
          >
            {value}
          </span>
        )
      default:
        return value.toString()
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Generating report...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {reportTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data?.length || 0} record{(data?.length || 0) !== 1 ? 's' : ''}{' '}
              found
            </p>
          </div>
          {/* {onDownload && data && data.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload('excel')}
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                <Download className="w-3 h-3" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload('pdf')}
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                <Download className="w-3 h-3" />
                PDF
              </Button>
            </div>
          )} */}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                #
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100"
                    >
                      {formatCellValue(row[column.key], column.type)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500"
                >
                  No data available. Generate a report to see results here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Showing {data?.length || 0} of {data?.length || 0} results
          </span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span>Generated: {new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
