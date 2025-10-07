'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '../../../components/organisms/PermissionAwareDataTable'
import { useTableState } from '../../../hooks/useTableState'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { usePendingTransactionsUI } from '@/hooks'
import { usePendingTransactionLabelApi } from '@/hooks/usePendingTransactionLabelApi'
import { useDeletePendingTransaction } from '@/hooks/usePendingTransactions'
import { getPendingTransactionLabel } from '@/constants/mappings/pendingTransactionMapping'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'

interface TransactionData extends Record<string, unknown> {
  id: number
  projectName: string
  projectRegulatorId: string
  tranReference: string
  tranDesc: string
  tranAmount: number
  tranDate: string
  narration: string
  tasMatch: string
  approvalStatus: string
}

const usePendingRows = (page: number, size: number) => {
  const filters = React.useMemo(() => ({ isAllocated: false }), [])
  const { data, isLoading, error } = usePendingTransactionsUI(
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
        id: Number(ui.id),
        projectName: ui.projectName || '—',
        projectRegulatorId: ui.projectRegulatorId || '—',
        tranReference: ui.referenceId || '—',
        tranDesc: ui.description || 'TRANSFER',
        tranAmount: Number(ui.amount || '0'),
        tranDate: ui.transactionDate
          ? new Date(ui.transactionDate).toLocaleDateString('en-GB')
          : '',
        narration: ui.narration || '—',
        tasMatch: ui.tasUpdate || '—',
        approvalStatus:
          ui.taskStatusDTO?.name ||
          mapPaymentStatusToApprovalStatus(ui.paymentStatus),
      }
    })
  }, [data])

  const total = data?.page?.totalElements || 0
  const totalPages = data?.page?.totalPages || 1

  return { rows, total, totalPages, isLoading, error }
}

const mapPaymentStatusToApprovalStatus = (paymentStatus: string): string => {
  // Fallback mapping when taskStatusDTO is not available
  switch (paymentStatus?.toUpperCase()) {
    case 'PENDING':
      return 'PENDING'
    case 'INCOMPLETE':
      return 'INITIATED'
    case 'IN_REVIEW':
    case 'REVIEW':
      return 'IN_PROGRESS'
    case 'REJECTED':
    case 'FAILED':
      return 'REJECTED'
    case 'APPROVED':
    case 'SUCCESS':
      return 'APPROVED'
    default:
      return 'INITIATED'
  }
}

const UnallocatedTransactionPage: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  // Template download hook
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Template download handler
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.SPLIT)
    } catch (error) {}
  }

  const [isDeleting, setIsDeleting] = useState(false)

  const { getLabelResolver } = useSidebarConfig()
  const unallocatedTitle = getLabelResolver
    ? getLabelResolver('unallocated', 'Unallocated')
    : 'Unallocated'
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = usePendingTransactionLabelApi()

  const getTransactionLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, 'EN')

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getPendingTransactionLabel(configId)
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
  } = usePendingRows(currentApiPage, currentApiSize)

  const deleteMutation = useDeletePendingTransaction()
  const confirmDelete = useDeleteConfirmation()

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
      'projectName',
      'projectRegulatorId',
      'tranReference',
      'tranDesc',
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
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1)
    localHandleRowsPerPageChange(newRowsPerPage)
  }

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

  const tableColumns = [
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
    {
      key: 'tasMatch',
      label: getTransactionLabelDynamic('CDL_TRAN_TAS_STATUS'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'approvalStatus',
      label: getTransactionLabelDynamic('CDL_TRAN_STATUS'),
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const statusOptions = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'DRAFT',
    'INITIATED',
  ]

  const handleRowView = (row: TransactionData) => {
    router.push(`/transactions/unallocated/${row.id}`)
  }

  const handleRowDelete = (row: TransactionData) => {
    if (isDeleting) {
      return
    }

    confirmDelete({
      itemName: `transaction: ${row.tranReference}`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          await deleteMutation.mutateAsync(String(row.id))
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          throw error // Re-throw to keep dialog open on error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  const handleRowClick = (row: TransactionData) => {
    router.push(`/transactions/unallocated/${row.id}`)
  }

  const renderCustomCell = (column: string, value: unknown) => {
    if (column === 'tranAmount' && typeof value === 'number') {
      return `${formatNumber(value)}`
    }
    return String(value || '')
  }

  const renderExpandedContent = (row: TransactionData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Transaction Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div>
            <span className="text-gray-600">TAS Match:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.tasMatch}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Approval Status:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.approvalStatus}
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
            Allocate Transaction
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Download Transaction Report
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
      <DashboardLayout title={unallocatedTitle}>
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
      <DashboardLayout title={unallocatedTitle}>
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

      <DashboardLayout title={unallocatedTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-end gap-2 py-3.5 px-4">
              <PageActionButtons
                entityType="pendingPayment"
                onDownloadTemplate={handleDownloadTemplate}
                isDownloading={isDownloading}
                showButtons={{
                  downloadTemplate: true,
                  uploadDetails: true,
                  addNew: false,
                }}
              />
            </div>
          </div>

          <PermissionAwareDataTable<TransactionData>
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
            statusOptions={statusOptions}
            onRowView={handleRowView}
            onRowDelete={handleRowDelete}
            onRowClick={handleRowClick}
            renderCustomCell={renderCustomCell}
            deletePermissions={['pending_tran_delete']}
            viewPermissions={['pending_tran_view']}
            updatePermissions={['pending_tran_update']}
            showDeleteAction={true}
            showViewAction={true}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      </DashboardLayout>
    </>
  )
}

export default UnallocatedTransactionPage
