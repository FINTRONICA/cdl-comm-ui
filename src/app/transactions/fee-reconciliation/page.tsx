'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useFeeRepush } from '@/hooks/useFeeRepush'
import { getFeeRepushLabel } from '@/constants/mappings/feeRepushMapping'
import { useFeeRepushLabelsWithCache } from '@/hooks/useFeeRepushLabelsWithCache'
import { useAppStore } from '@/store'
import { RotateCcw } from 'lucide-react'
import {
  useSuccessNotification,
  useErrorNotification,
} from '@/store/notificationStore'

// Import the fee repush UI data type from the service
import type { FeeRepushUIData } from '@/services/api/feeRepushService'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { GlobalLoading, GlobalError } from '@/components/atoms'

// Extend the type to satisfy Record<string, unknown> constraint
interface FeeRepushTableData extends FeeRepushUIData, Record<string, unknown> {}

const statusOptions = [
  'Success',
  'Failed',
  'Pending',
  'Approved',
  'Rejected',
  'Processing',
  'Completed',
  'Cancelled',
]

const FeeRepushPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  const currentLanguage = useAppStore((state) => state.language)

  const showSuccess = useSuccessNotification()
  const showError = useErrorNotification()

  const {
    data: feeRepushData,
    loading: feeRepushLoading,
    error: feeRepushError,
    refetch: refetchFeeRepush,
    retryPayment,
    feeRepush,
    updatePagination,
    pagination,
  } = useFeeRepush(0, 20)

  const {
    data: feeRepushLabels,
    labelMap: feeRepushLabelMap,
    loading: labelsLoading,
    error: labelsError,
    getLabel: getFeeRepushLabelFromAPI,
  } = useFeeRepushLabelsWithCache(currentLanguage)

  const getFeeRepushLabelDynamic = React.useCallback(
    (configId: string): string => {
      const fallbackLabel = getFeeRepushLabel(configId)

      if (feeRepushLabelMap && feeRepushLabelMap[configId]) {
        return feeRepushLabelMap[configId]
      }

      if (getFeeRepushLabelFromAPI) {
        const apiLabel = getFeeRepushLabelFromAPI(configId)
        if (apiLabel !== configId) {
          return apiLabel
        }
      }

      return fallbackLabel
    },
    [feeRepushLabelMap, getFeeRepushLabelFromAPI]
  )

  const tableColumns = [
    {
      key: 'projectName',
      label: getFeeRepushLabelDynamic('CDL_FEE_BPA_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'feeType',
      label: getFeeRepushLabelDynamic('CDL_FEE_TYPE'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'amount',
      label: getFeeRepushLabelDynamic('CDL_FEE_AMOUNT'), // API: "Amount"
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'transactionDate',
      label: getFeeRepushLabelDynamic('CDL_FEE_TRAN_DATE'), // API: "Transaction Date"
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'approvalStatus',
      label: getFeeRepushLabelDynamic('CDL_FEE_APP_STATUS'), // API: "Status"
      type: 'status' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'paymentType',
      label: getFeeRepushLabelDynamic('CDL_FEE_PAYMENT_TYPE'), // API: "Payment Type"
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'actions',
      label: getFeeRepushLabelDynamic('CDL_FEE_ACTION'), // API: "Action"
      type: 'custom' as const,
      width: 'w-20',
    },
  ]

  // Process API data to table format
  const tableData = React.useMemo(() => {
    if (!feeRepushData?.content) {
      return []
    }

    const items = feeRepushData.content

    return items.map((item, _index) => {
      return item as FeeRepushTableData
    })
  }, [feeRepushData])

  // Debug logging to help troubleshoot data issues
  React.useEffect(() => {}, [
    feeRepushData,
    tableData,
    feeRepushLoading,
    feeRepushError,
    pagination,
    feeRepushLabels,
    feeRepushLabelMap,
    labelsLoading,
    labelsError,
    currentLanguage,
  ])
  const { getLabelResolver } = useSidebarConfig()
  const feeRepushTitle = getLabelResolver
    ? getLabelResolver('fee-reconciliation', 'Fee Reconciliation')
    : 'Fee Reconciliation'
  const {
    search,
    paginated,
    selectedRows,
    expandedRows,
    sortConfig,
    handleSearchChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    handleSort,
  } = useTableState({
    data: tableData,
    searchFields: [
      'projectName',
      'feeType',
      'amount',
      'transactionDate',
      'approvalStatus',
      'paymentType',
      'narration',
      'description',
      'failureReason',
    ],
    initialRowsPerPage: pagination.size,
  })
  const handleRetryPayment = async (row: FeeRepushTableData) => {
    try {
      await retryPayment(row.id)
      showSuccess(
        'Payment Retry Initiated',
        `${row.projectName} - ${row.feeType}`
      )
    } catch (error) {
      showError(
        'Payment Retry Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }

  const handleFeeRepush = async (row: FeeRepushTableData) => {
    // Only allow repush if status is FAILED (red)
    if (row.approvalStatus !== 'FAILED') {
      return // Do nothing if not failed status
    }

    try {
      await feeRepush(row.id)
      showSuccess('Fee Repush Initiated', `${row.projectName} - ${row.feeType}`)
    } catch (error) {
      showError(
        'Fee Repush Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }

  // Custom pagination handlers that update API pagination
  const handleApiPageChange = (newPage: number) => {
    updatePagination(newPage - 1, pagination.size) // Convert UI 1-based to API 0-based indexing
  }

  const handleApiRowsPerPageChange = (newSize: number) => {
    updatePagination(0, newSize) // Reset to first page when changing page size
  }

  // Render expanded content
  const renderExpandedContent = (row: FeeRepushTableData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Fee Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Project Name:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fee Type:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.feeType}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Amount:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.amount} {row.currency}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Amount:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.totalAmount} {row.currency}
            </span>
          </div>
          <div>
            <span className="text-gray-600">VAT Percentage:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.specialField1 || '10%'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Transaction Date:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.transactionDate}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Response Status:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.approvalStatus}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Payment Type:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.paymentType}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fee Response:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.description}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Request Body:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.specialField2 || '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Remarks:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.narration}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.isActive}
            </span>
          </div>
        </div>
        {row.failureReason && row.failureReason !== '—' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="text-sm font-semibold text-red-900 mb-2">
              Failure Reason
            </h5>
            <p className="text-sm text-red-700">{row.failureReason}</p>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Fee Details & Actions
        </h4>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Fee Invoice
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            Transaction History
          </button>
          <button
            onClick={() => handleRetryPayment(row)}
            className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm text-blue-700 shadow-sm"
          >
            Retry Payment
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            View Error Details
          </button>
        </div>
        {/* Additional tracking info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-xs font-semibold text-gray-700 mb-2">
            Tracking Information
          </h5>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 text-gray-800">{row.createdDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Updated:</span>
              <span className="ml-2 text-gray-800">{row.updatedDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Created By:</span>
              <span className="ml-2 text-gray-800">{row.createdBy}</span>
            </div>
            <div>
              <span className="text-gray-600">Updated By:</span>
              <span className="ml-2 text-gray-800">{row.updatedBy}</span>
            </div>
            <div>
              <span className="text-gray-600">Active:</span>
              <span className="ml-2 text-gray-800">{row.isActive}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      <DashboardLayout title={feeRepushTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full rounded-t-2xl">
          {/* Sticky Header Section */}
          {/* Action Buttons */}
          {/* <div className="sticky top-0 z-10 bg-white/75 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <PageActionButtons
              entityType="feeRepush"
              showButtons={{ addNew: true }}
            />
          </div> */}

          {/* Loading and Error States */}
          {(feeRepushLoading || labelsLoading) && (
            <div className="flex-1 flex items-center justify-center rounded-t-2xl">
              <GlobalLoading fullHeight />
            </div>
          )}

          {(feeRepushError || labelsError) && (
            <div className="flex-1 flex items-center justify-center rounded-t-2xl">
              <GlobalError
                error={feeRepushError || labelsError || 'Unknown error'}
                onRetry={refetchFeeRepush}
                title="Error loading data"
                fullHeight
              />
            </div>
          )}

          {/* Table Container with Fixed Pagination */}
          {!feeRepushLoading &&
            !labelsLoading &&
            !feeRepushError &&
            !labelsError && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto rounded-t-2xl">
                  <PermissionAwareDataTable<FeeRepushTableData>
                    data={paginated}
                    columns={tableColumns}
                    searchState={search}
                    onSearchChange={handleSearchChange}
                    paginationState={{
                      page: pagination.page + 1, // Convert API 0-based to UI 1-based indexing
                      rowsPerPage: pagination.size,
                      totalRows: feeRepushData?.page?.totalElements || 0,
                      totalPages: feeRepushData?.page?.totalPages || 0,
                      startItem: pagination.page * pagination.size + 1,
                      endItem: Math.min(
                        (pagination.page + 1) * pagination.size,
                        feeRepushData?.page?.totalElements || 0
                      ),
                    }}
                    onPageChange={handleApiPageChange}
                    onRowsPerPageChange={handleApiRowsPerPageChange}
                    selectedRows={selectedRows}
                    onRowSelectionChange={handleRowSelectionChange}
                    expandedRows={expandedRows}
                    onRowExpansionChange={handleRowExpansionChange}
                    renderExpandedContent={renderExpandedContent}
                    renderCustomCell={(column, _value, row, _index) => {
                      if (column === 'actions') {
                        const isFailed = row.approvalStatus === 'FAILED'
                        return (
                          <div className="flex justify-center">
                            <RotateCcw
                              className={`w-5 h-5 ${isFailed ? 'text-red-600 cursor-pointer hover:text-red-800' : 'text-blue-600 cursor-default'}`}
                              onClick={() => handleFeeRepush(row)}
                            />
                          </div>
                        )
                      }
                      return null
                    }}
                    statusOptions={statusOptions}
                    viewPermissions={['fee_repush_view']}
                    updatePermissions={['fee_repush_update']}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </div>
              </div>
            )}
        </div>
      </DashboardLayout>
    </>
  )
}

export default FeeRepushPage
