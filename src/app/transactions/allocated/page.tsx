'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '../../../components/organisms/PermissionAwareDataTable'
import { useTableState } from '../../../hooks/useTableState'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useProcessedTransactions } from '@/hooks/useProcessedTransactions'
import { getProcessedTransactionLabel } from '@/constants/mappings/processedTransactionMapping'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useProcessedTransactionLabelApi } from '@/hooks/useProcessedTransactionLabelApi'
import type { ProcessedTransactionUIData } from '@/services/api/processedTransactionService'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { GlobalLoading, GlobalError } from '@/components/atoms'

interface TransactionTableData
  extends ProcessedTransactionUIData,
    Record<string, unknown> {}

const AllocatedTransactionPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const confirmDelete = useDeleteConfirmation()

  const { getLabelResolver } = useSidebarConfig()
  const allocatedTitle = getLabelResolver
    ? getLabelResolver('allocated', 'Allocated')
    : 'Allocated'
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = useProcessedTransactionLabelApi()

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
      const apiLabel = getLabelFromApi(configId, 'EN')

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getProcessedTransactionLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi]
  )

  const tableColumns = [
    {
      key: 'date',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_DATETIME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'transId',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_RECON_TRANSACTION_ID'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'unitNo',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_UNIT_REFERENCE_NUMBER'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'tasCbsMatch',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TAS_UPDATE_APPLIED_FLAG'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'amount',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_AMOUNT'),
      type: 'custom' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'narration',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_NARRATION'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'paymentStatus',
      label: getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TAS_PAYMENT_STATUS_CODE'),
      type: 'status' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'actions',
      label: getTransactionLabelDynamic('CDL_TRAN_ACTION'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  const statusOptions = [
    'SUCCESS',
    'PENDING',
    'FAILED',
    'IN_PROGRESS',
    'APPROVED',
    'REJECTED',
    'INITIATED',
  ]

  const tableData = useMemo(() => {
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
      'unitNo',
      'tasCbsMatch',
      'amount',
      'narration',
      'paymentStatus',
    ],
    initialRowsPerPage: currentApiSize,
  })

  const handlePageChange = (newPage: number) => {
    const hasSearch = Object.values(search).some((value) => value.trim())

    if (hasSearch) {
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete transaction: ${errorMessage}`)
          throw error // Re-throw to keep dialog open on error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  const renderExpandedContent = (row: TransactionTableData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Transaction Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_DATETIME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{row.date}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_RECON_TRANSACTION_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.transId}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_UNIT_REFERENCE_NUMBER')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{row.unitNo}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_DESCRIPTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.description}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TAS_UPDATE_APPLIED_FLAG')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.tasCbsMatch}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_AMOUNT')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.amount} {row.currency}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_NARRATION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.narration}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TAS_PAYMENT_STATUS_CODE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.paymentStatus}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TOTAL_TRANSACTION_AMOUNT')}:
            </span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.totalAmount} {row.currency}
            </span>
          </div>
          {row.processingRemarks && row.processingRemarks !== '—' && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_PROCESSING_REMARKS')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.processingRemarks}
              </span>
            </div>
          )}
          {row.batchTransactionId && row.batchTransactionId !== '—' && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_BATCH_TRANSACTION_ID')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.batchTransactionId}
              </span>
            </div>
          )}
          {row.paymentReferenceNumber && row.paymentReferenceNumber !== '—' && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_PAYMENT_REFERENCE_NUMBER')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.paymentReferenceNumber}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Transaction Actions
        </h4>
        <div className="space-y-3">
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            {getTransactionLabelDynamic('CDL_TRAN_ACTION')} - View Details
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            {getTransactionLabelDynamic('CDL_TRAN_TEMPLATE_DOWNLOAD')} - Report
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            {getTransactionLabelDynamic('CDL_TRAN_ROLLBACK')} - Deallocate
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            Export Transaction Data
          </button>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            Additional Details
          </h5>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {row.processingRemarks && row.processingRemarks !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_PROCESSING_REMARKS')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.processingRemarks}</span>
              </div>
            )}
            {row.transactionParticular1 && row.transactionParticular1 !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_PARTICULAR_1')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.transactionParticular1}</span>
              </div>
            )}
            {row.transactionParticular2 && row.transactionParticular2 !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_PARTICULAR_2')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.transactionParticular2}</span>
              </div>
            )}
            {row.transactionParticularRemark1 && row.transactionParticularRemark1 !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_PARTICULAR_REMARK_1')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.transactionParticularRemark1}</span>
              </div>
            )}
            {row.transactionParticularRemark2 && row.transactionParticularRemark2 !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_TRANSACTION_PARTICULAR_REMARK_2')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.transactionParticularRemark2}</span>
              </div>
            )}
            {row.chequeReferenceNumber && row.chequeReferenceNumber !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_CHEQUE_REFERENCE_NUMBER')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.chequeReferenceNumber}</span>
              </div>
            )}
            {row.paymentReferenceNumber && row.paymentReferenceNumber !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_PAYMENT_REFERENCE_NUMBER')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.paymentReferenceNumber}</span>
              </div>
            )}
            {row.batchTransactionId && row.batchTransactionId !== '—' && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_BATCH_TRANSACTION_ID')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.batchTransactionId}</span>
              </div>
            )}
            {row.subBucketIdentifier && row.subBucketIdentifier !== '—' && (
            <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {getTransactionLabelDynamic('CDL_RECONCILED_TRANSACTION_SUB_BUCKET_IDENTIFIER')}:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{row.subBucketIdentifier}</span>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (transactionsLoading || labelsLoading) {
    return (
      <DashboardLayout title={allocatedTitle}>
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (transactionsError || labelsError) {
    return (
      <DashboardLayout title={allocatedTitle}>
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalError
            error={transactionsError || labelsError || 'Unknown error'}
            onRetry={() => window.location.reload()}
            title="Error loading allocated transactions"
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

      <DashboardLayout title={allocatedTitle}>
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <div className="flex flex-col flex-1 min-h-0">
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
                onRowDelete={handleRowDelete}
                deletePermissions={['processed_tran_delete']}
                viewPermissions={['processed_tran_view']}
                updatePermissions={['processed_tran_update']}
                showDeleteAction={true}
                showViewAction={true}
                onSort={handleSort}
                sortConfig={sortConfig}
                statusOptions={statusOptions}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default AllocatedTransactionPage
