import React from 'react'
import { Checkbox } from '../../atoms/Checkbox'
import { Badge } from '../../atoms/Badge'
import { IconButton } from '../../atoms/IconButton'
import { TableSearchRow } from '../../molecules/TableSearchRow'
import { TablePagination } from '../../molecules/TablePagination'
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react'
import { formatDateForDisplay } from '../../../utils'

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

interface SearchState extends Record<string, string> {
  developer: string
  maker: string
  recentActor: string
  comment: string
  createdDate: string
  updatedDate: string
  status: string
}

interface ActivitiesTableProps {
  data: ActivityData[]
  search: SearchState
  onSearchChange: (field: string, value: string) => void
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
  statusOptions: string[]
  className?: string
}

export const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  data,
  search,
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
  statusOptions,
  className = '',
}) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      case 'incomplete':
        return 'incomplete'
      case 'in review':
        return 'inReview'
      default:
        return 'default'
    }
  }

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

  // Define columns for TableSearchRow
  const columns = [
    {
      key: 'checkbox',
      label: 'Checkbox',
      type: 'checkbox' as const,
      width: 'w-12',
    },
    { key: 'expand', label: 'Expand', type: 'expand' as const, width: 'w-8' },
    { key: 'developer', label: 'Developer', width: 'w-40' },
    { key: 'maker', label: 'Maker', width: 'w-32' },
    { key: 'recentActor', label: 'Recent Actor', width: 'w-32' },
    { key: 'comment', label: 'Comment', width: 'w-56' },
    { key: 'createdDate', label: 'Created Date', width: 'w-40' },
    { key: 'updatedDate', label: 'Updated Date', width: 'w-40' },
    { key: 'status', label: 'Status', type: 'status' as const, width: 'w-28' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1200px] table-fixed">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-12 px-6 py-4 text-left">
                <Checkbox checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="w-8 px-2 py-4"></th>
              <th className="w-40 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Developer
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Maker
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Recent Actor
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-56 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Comment
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-40 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Created Date
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-40 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Updated Date
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-28 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Status
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="w-20 px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            <TableSearchRow
              columns={columns}
              search={search}
              onSearchChange={onSearchChange}
              statusOptions={statusOptions}
            />
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((row, i) => (
              <React.Fragment key={i}>
                <tr
                  className={`hover:bg-gray-50 transition-colors min-h-[64px] ${
                    selectedRows.includes(i)
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  <td className="w-12 px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(i)}
                      onChange={() => toggleRow(i)}
                    />
                  </td>
                  <td className="w-8 px-2 py-4 whitespace-nowrap">
                    <button
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => toggleExpandedRow(i)}
                    >
                      {expandedRows.includes(i) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="w-40 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.developer}
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.maker}
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.recentActor}
                  </td>
                  <td className="w-56 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.comment}
                  </td>
                  <td className="w-40 px-6 py-4 text-sm text-gray-500">
                    {(() => {
                      const { date, time } = formatDateForDisplay(
                        row.createdDate
                      )
                      return (
                        <div className="flex flex-col">
                          <span className="font-medium">{date}</span>
                          <span className="text-xs text-gray-400">{time}</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="w-40 px-6 py-4 text-sm text-gray-500">
                    {(() => {
                      const { date, time } = formatDateForDisplay(
                        row.updatedDate
                      )
                      return (
                        <div className="flex flex-col">
                          <span className="font-medium">{date}</span>
                          <span className="text-xs text-gray-400">{time}</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="w-28 px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={getStatusVariant(row.status)}
                      size="sm"
                      showDot={true}
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="w-20 px-6 py-4 whitespace-nowrap text-right">
                    <IconButton
                      icon={MoreVertical}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    />
                  </td>
                </tr>
                {expandedRows.includes(i) && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={10} className="px-6 py-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">
                            Activity Info
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Activity ID:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {row.activityId}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Activity Type:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {row.activityType}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Activity Status:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {row.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Developer:</span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {row.developer}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Project:</span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {row.projectName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Investor:</span>
                              <span className="ml-2 text-gray-800 font-medium">
                                {row.recentActor}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Guarantee:</span>
                              <span className="ml-2 text-gray-800 font-medium">
                                Pending
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment:</span>
                              <span className="ml-2 text-gray-800 font-medium">
                                Pending
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Partial Payment:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                Pending
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Split & Allocate:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                Pending
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                TAS Deposit:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                Pending
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Fund Rollback:
                              </span>
                              <span className="ml-2 text-gray-800 font-medium">
                                Pending
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">
                            Documentation Status
                          </h4>
                          <div className="space-y-3">
                            {row.documents.map((doc, index) => (
                              <button
                                key={index}
                                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm"
                              >
                                {doc.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">
                          Recent Activity
                        </h4>
                        <div className="space-y-3">
                          {row.recentActivity.map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm"
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-3 ${
                                  activity.color === 'blue'
                                    ? 'bg-blue-500'
                                    : activity.color === 'green'
                                      ? 'bg-green-500'
                                      : activity.color === 'yellow'
                                        ? 'bg-yellow-500'
                                        : activity.color === 'red'
                                          ? 'bg-red-500'
                                          : 'bg-gray-500'
                                }`}
                              ></div>
                              <span className="text-gray-600 mr-2">
                                {activity.date}
                              </span>
                              <span className="text-gray-900">
                                {activity.action}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        startItem={startItem}
        endItem={endItem}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  )
}
