'use client'

/**
 * Allocated Transactions Page
 *
 * Displays allocated/processed transactions with dynamic labels from the API.
 * Uses Label Configuration API service with fallback to static labels.
 */

import React, { useState } from 'react'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '../../../components/organisms/PermissionAwareDataTable'
import { useTableState } from '../../../hooks/useTableState'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useProcessedTransactions } from '@/hooks/useProcessedTransactions'
import { getProcessedTransactionLabel } from '@/constants/mappings/processedTransactionMapping'
import { useAppStore } from '@/store'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useLabelConfigApi } from '@/hooks/useLabelConfigApi'
import type { ProcessedTransactionUIData } from '@/services/api/processedTransactionService'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

interface TransactionTableData
  extends ProcessedTransactionUIData,
    Record<string, unknown> {}

const AllocatedTransactionPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const confirmDelete = useDeleteConfirmation()

  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const { getLabelResolver } = useSidebarConfig()
  const allocatedTitle = getLabelResolver
    ? getLabelResolver('allocated', 'Allocated')
    : 'Allocated'
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  // Use the new label configuration API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = useLabelConfigApi()

  const {
    data: processedTransactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    updatePagination,
    deleteTransaction,
  } = useProcessedTransactions(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    { isAllocated: true }
  )

  const getTransactionLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getProcessedTransactionLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  const tableColumns = [
    {
      key: 'date',
      label: getTransactionLabelDynamic('CDL_TRAN_DATE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'transId',
      label: getTransactionLabelDynamic('CDL_TRAN_REFNO'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'projectAccountId',
      label: getTransactionLabelDynamic('CDL_TRANS_BP_CIF'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
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
      label: getTransactionLabelDynamic('CDL_TRANS_BPA_REGULATOR'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'unitNo',
      label: getTransactionLabelDynamic('CDL_TRANS_UNIT_HOLDER'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'receivableCategory',
      label: getTransactionLabelDynamic('CDL_TRAN_RECEIVABLE_CATEGORY'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'tasCbsMatch',
      label: getTransactionLabelDynamic('CDL_TRAN_MATCHING_STATUS'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'amount',
      label: getTransactionLabelDynamic('CDL_TRAN_AMOUNT'),
      type: 'custom' as const,
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
    {
      key: 'actions',
      label: getTransactionLabelDynamic('CDL_TRAN_ACTION'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  const tableData = React.useMemo(() => {
    if (!processedTransactionsData?.content) {
      return []
    }

    const items = processedTransactionsData.content

    return items.map((item) => {
      return item as TransactionTableData
    })
  }, [processedTransactionsData])

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
    data: tableData,
    searchFields: [
      'date',
      'transId',
      'projectAccountId',
      'developerName',
      'projectName',
      'projectRegulatorId',
      'unitNo',
      'receivableCategory',
      'narration',
    ],
    initialRowsPerPage: currentApiSize,
  })

  const handlePageChange = (newPage: number) => {
    const hasActiveSearch = Object.values(search).some((value) => value.trim())

    if (hasActiveSearch) {
      localHandlePageChange(newPage)
    } else {
      setCurrentApiPage(newPage)
      updatePagination(Math.max(0, newPage - 1), currentApiSize)
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1)
    updatePagination(0, newRowsPerPage)
    localHandleRowsPerPageChange(newRowsPerPage)
  }

  const apiTotal = processedTransactionsData?.page?.totalElements || 0
  const apiTotalPages = processedTransactionsData?.page?.totalPages || 1

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

  const handleRowDelete = (row: TransactionTableData) => {
    if (isDeleting) {
      return
    }

    confirmDelete({
      itemName: `transaction: ${row.transId}`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          await deleteTransaction(row.id)
          console.log(`Transaction "${row.transId}" has been deleted successfully.`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete transaction: ${errorMessage}`)
          throw error // Re-throw to keep dialog open on error
        } finally {
          setIsDeleting(false)
        }
      }
    })
  }

  const renderExpandedContent = (row: TransactionTableData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Transaction Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_DATE')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">{row.date}</span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_REFNO')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.transId}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRANS_BP_CIF')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectAccountId}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRANS_BP_NAME')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.developerName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRANS_BPA_NAME')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRANS_BPA_REGULATOR')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectRegulatorId}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRANS_UNIT_HOLDER')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">{row.unitNo}</span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_RECEIVABLE_CATEGORY')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.receivableCategory}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_MATCHING_STATUS')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.tasCbsMatch}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_AMOUNT')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.amount} {row.currency}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_NOTES')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.narration}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRANS_APPROVAL_STATUS')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.paymentStatus}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getTransactionLabelDynamic('CDL_TRAN_TOTAL_AMT')}:
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.totalAmount} {row.currency}
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
            {getTransactionLabelDynamic('CDL_TRAN_ACTION')} - View Details
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            {getTransactionLabelDynamic('CDL_TRAN_TEMPLATE_DOWNLOAD')} - Report
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            {getTransactionLabelDynamic('CDL_TRAN_ROLLBACK')} - Deallocate
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Export Transaction Data
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-xs font-semibold text-gray-700 mb-2">
            Additional Details
          </h5>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {row.narration && (
              <div>
                <span className="text-gray-600">
                  {getTransactionLabelDynamic('CDL_TRAN_NOTES')}:
                </span>
                <span className="ml-2 text-gray-800">{row.narration}</span>
              </div>
            )}
            {row.description && (
              <div>
                <span className="text-gray-600">
                  {getTransactionLabelDynamic('CDL_TRAN_DESC')}:
                </span>
                <span className="ml-2 text-gray-800">{row.description}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Allocated:</span>
              <span className="ml-2 text-gray-800">{row.allocated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (transactionsLoading || labelsLoading) {
    return (
      <DashboardLayout title={allocatedTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {transactionsLoading && labelsLoading
                ? 'Loading transactions and labels...'
                : transactionsLoading
                  ? 'Loading transactions...'
                  : 'Loading labels...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (transactionsError || labelsError) {
    return (
      <DashboardLayout title={allocatedTitle}>
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
              {transactionsError && labelsError
                ? 'Error Loading Transactions and Labels'
                : transactionsError
                  ? 'Error Loading Transactions'
                  : 'Error Loading Labels'}
            </h3>
            <p className="text-gray-600 mb-4">Please try refreshing the page</p>
            <div className="text-left text-xs bg-red-50 p-4 rounded border max-w-md mx-auto">
              <p>
                <strong>Error Details:</strong>
              </p>
              {transactionsError && (
                <div className="mb-2">
                  <p>
                    <strong>Transactions:</strong> {transactionsError}
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
                  {JSON.stringify({ transactionsError, labelsError }, null, 2)}
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

      <DashboardLayout title={allocatedTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<TransactionTableData>
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
                onRowDelete={handleRowDelete}
                deletePermissions={['processed_tran_delete']}
                viewPermissions={['processed_tran_view']}
                updatePermissions={['processed_tran_update']}
                showDeleteAction={true}
                showViewAction={true}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default AllocatedTransactionPage
