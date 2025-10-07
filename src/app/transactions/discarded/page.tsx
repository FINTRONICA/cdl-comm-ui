'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { ExpandableDataTable } from '../../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../../hooks/useTableState'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useDiscardedTransactionsUI } from '@/hooks'
import { useLabelConfigApi } from '@/hooks/useLabelConfigApi'
import { getDiscardedTransactionLabel } from '@/constants/mappings/discardedTransactionMapping'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { Tooltip } from '@mui/material'

// Define the transaction data structure to match UI
interface TransactionData extends Record<string, unknown> {
  developerName: string
  projectName: string
  projectRegulatorId: string
  tranReference: string
  tranDesc: string
  tranAmount: number
  tranDate: string
  narration: string
}

// API rows hook using UI-mapped service with proper pagination
const useDiscardedRows = (page: number, size: number) => {
  const filters = React.useMemo(() => ({ isAllocated: true }), [])
  const { data, isLoading, error } = useDiscardedTransactionsUI(
    Math.max(0, page - 1),
    size,
    filters
  )

  const rows: TransactionData[] = useMemo(() => {
    if (!data?.content) {
      return []
    }

    const items = data.content as any[]

    return items.map((ui: any) => {
      return {
        developerName: ui.developerName || '—',
        projectName: ui.projectName || '—',
        projectRegulatorId: ui.projectRegulatorId || '—',
        tranReference: ui.referenceId || '—',
        tranDesc: ui.description || 'TRANSFER',
        tranAmount: Number(ui.amount || '0'),
        tranDate: ui.transactionDate
          ? new Date(ui.transactionDate).toLocaleDateString('en-GB')
          : '',
        narration: ui.narration || '—',
      }
    })
  }, [data])

  const total = data?.page?.totalElements || 0
  const totalPages = data?.page?.totalPages || 1

  return { rows, total, totalPages, isLoading, error }
}

const DiscardedTransactionPage: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const { getLabelResolver } = useSidebarConfig()
  const discardedTitle = getLabelResolver
    ? getLabelResolver('discarded', 'Discarded')
    : 'Discarded'
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = useLabelConfigApi()

  const getTransactionLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, 'EN')

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getDiscardedTransactionLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi]
  )

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  const {
    rows: apiRows,
    total: apiTotal,
    totalPages: apiTotalPages,
    isLoading,
    error,
  } = useDiscardedRows(currentApiPage, currentApiSize)

  const {
    search,
    paginated,
    totalRows: localTotalRows,
    totalPages: localTotalPages,
    startItem,
    endItem,
    page: localPage,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange: localHandlePageChange,
    handleRowsPerPageChange: localHandleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    handleSort,
    sortConfig,
  } = useTableState({
    data: apiRows,
    searchFields: [
      'developerName',
      'projectName',
      'projectRegulatorId',
      'tranReference',
      'tranDesc',
      'narration',
    ],
    initialRowsPerPage: currentApiSize,
  })

  // Handle API pagination - when user changes page in table
  const handlePageChange = (newPage: number) => {
    // Check if we're dealing with filtered/searched data
    const hasActiveSearch = Object.values(search).some((value) => value.trim())

    if (hasActiveSearch) {
      // Use local pagination for searched data
      localHandlePageChange(newPage)
    } else {
      // Use API pagination for full dataset
      setCurrentApiPage(newPage)
    }
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1) // Reset to first page
    localHandleRowsPerPageChange(newRowsPerPage)
  }

  // Determine which pagination values to use
  const effectiveTotalRows = Object.values(search).some((value) => value.trim())
    ? localTotalRows
    : apiTotal
  const effectiveTotalPages = Object.values(search).some((value) =>
    value.trim()
  )
    ? localTotalPages
    : apiTotalPages
  const effectivePage = Object.values(search).some((value) => value.trim())
    ? localPage
    : currentApiPage

  // Define table columns with dynamic labels
  const tableColumns = [
    {
      key: 'developerName',
      label: getTransactionLabelDynamic('CDL_TRANS_BP_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'projectName',
      label: getTransactionLabelDynamic('CDL_TRANS_BPA_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'projectRegulatorId',
      label: 'Project Regulator ID',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'tranReference',
      label: getTransactionLabelDynamic('CDL_TRAN_REFNO'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'tranDesc',
      label: getTransactionLabelDynamic('CDL_TRAN_DESC'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'tranAmount',
      label: getTransactionLabelDynamic('CDL_TRAN_AMOUNT'),
      type: 'custom' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'tranDate',
      label: getTransactionLabelDynamic('CDL_TRAN_DATE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'narration',
      label: getTransactionLabelDynamic('CDL_TRAN_NOTES'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
  ]

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const handleRowClick = (row: TransactionData) => {
    router.push(`/transactions/discarded/${row.tranReference}`)
  }

  const renderCustomCell = (column: string, value: unknown) => {
    if (column === 'tranAmount' && typeof value === 'number') {
      return `${formatNumber(value)}`
    }
    return String(value || '')
  }

  // Render expanded content for transaction details
  const renderExpandedContent = (row: TransactionData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Transaction Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Developer Name:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.developerName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Project Name:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Project Regulator ID:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectRegulatorId}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Transaction Reference:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.tranReference}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Transaction Description:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.tranDesc}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Transaction Amount:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {formatNumber(row.tranAmount)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Transaction Date:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.tranDate}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Narration:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.narration}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Transaction Actions
        </h4>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            View Transaction Details
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Download Transaction Report
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Reallocate Transaction
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Export Transaction Data
          </button>
        </div>
      </div>
    </div>
  )

  if (isLoading || labelsLoading) {
    return (
      <DashboardLayout title={discardedTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isLoading && labelsLoading
                ? 'Loading transactions and labels...'
                : isLoading
                  ? 'Loading transactions...'
                  : 'Loading labels...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || labelsError) {
    return (
      <DashboardLayout title={discardedTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error && labelsError
                ? 'Error Loading Transactions and Labels'
                : error
                  ? 'Error Loading Transactions'
                  : 'Error Loading Labels'}
            </h3>
            <p className="text-gray-600 mb-4">Please try refreshing the page</p>
            <div className="text-left text-xs bg-red-50 p-4 rounded border max-w-md mx-auto">
              <p>
                <strong>Error Details:</strong>
              </p>
              {error && (
                <div className="mb-2">
                  <p>
                    <strong>Transactions:</strong>{' '}
                    {error.message || 'Unknown error'}
                  </p>
                </div>
              )}
              {labelsError && (
                <div className="mb-2">
                  <p>
                    <strong>Labels:</strong> {labelsError}
                  </p>
                </div>
              )}
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-xs">
                  {JSON.stringify({ error, labelsError }, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      <DashboardLayout title={discardedTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          {/* Sticky Header Section */}
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 py-3.5 px-4">
              {/* <button className="flex items-center h-8 py-1.5 gap-1 px-2.5 text-[#155DFC] font-sans font-medium text-[14px] hover:bg-blue-50 rounded-md transition-colors">
                <img src="/fetch icon.svg" alt="fetch icon" />
                Fetch Details
              </button> */}
            </div>
          </div>

          {/* Table Container with Fixed Pagination */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<TransactionData>
                data={paginated}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: effectivePage,
                  rowsPerPage: rowsPerPage,
                  totalRows: effectiveTotalRows,
                  totalPages: effectiveTotalPages,
                  startItem,
                  endItem,
                }}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                selectedRows={selectedRows}
                onRowSelectionChange={handleRowSelectionChange}
                expandedRows={expandedRows}
                onRowExpansionChange={handleRowExpansionChange}
                renderExpandedContent={renderExpandedContent}
                onRowClick={handleRowClick}
                renderCustomCell={renderCustomCell}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default DiscardedTransactionPage
