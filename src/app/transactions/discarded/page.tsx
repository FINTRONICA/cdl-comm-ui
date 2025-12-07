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
import { GlobalLoading, GlobalError } from '@/components/atoms'

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
    const hasSearch = Object.values(search).some((value) => value.trim())

    if (hasSearch) {
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
  const hasActiveSearch = Object.values(search).some((value) => value.trim())

  const effectiveTotalRows = hasActiveSearch ? localTotalRows : apiTotal
  const effectiveTotalPages = hasActiveSearch ? localTotalPages : apiTotalPages
  const effectivePage = hasActiveSearch ? localPage : currentApiPage

  // Calculate effective startItem and endItem based on pagination type
  const effectiveStartItem = hasActiveSearch
    ? startItem
    : (currentApiPage - 1) * currentApiSize + 1
  const effectiveEndItem = hasActiveSearch
    ? endItem
    : Math.min(currentApiPage * currentApiSize, apiTotal)

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
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error || labelsError) {
    return (
      <DashboardLayout title={discardedTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalError
            error={error?.message || labelsError || 'Unknown error'}
            onRetry={() => window.location.reload()}
            title="Error loading discarded transactions"
            fullHeight
          />
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
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-xl flex flex-col h-full pt-2">
          {/* Table Container with Fixed Pagination */}
          <div className="bg-white/75 dark:bg-gray-800/80 flex-1 flex flex-col min-h-0">
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
                  startItem: effectiveStartItem,
                  endItem: effectiveEndItem,
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
