'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { useTableState } from '../../../hooks/useTableState'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useTasPayments, FundEgressData } from '@/hooks/useFundEgress'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable/PermissionAwareDataTable'

// Define the manual payment data structure
interface ManualPaymentData extends Record<string, unknown> {
  id: number
  date: string
  takermsPaymentRefNo: string
  developerName: string
  projectName: string
  paymentType: string
  approvalStatus: string
}

// Transform FundEgressData to ManualPaymentData for UI display
const transformFundEgressToTasPayment = (
  fundEgress: FundEgressData
): ManualPaymentData => {
  const mapApiStatus = (taskStatusDTO: any | null): string => {
    if (!taskStatusDTO) {
      return 'INITIATED'
    }

    // Use the code from taskStatusDTO directly as it matches our new status options
    return taskStatusDTO.code || 'INITIATED'
  }

  return {
    id: fundEgress.id || 0,
    date: fundEgress.fePaymentDate
      ? new Date(fundEgress.fePaymentDate).toLocaleDateString('en-GB')
      : 'N/A',
    takermsPaymentRefNo: fundEgress.fePaymentRefNumber || 'N/A',
    developerName: fundEgress.buildPartnerDTO?.bpName || 'N/A',
    projectName: fundEgress.realEstateAssestDTO?.reaName || 'N/A',
    paymentType: fundEgress.voucherPaymentTypeDTO?.name || 'N/A',
    approvalStatus: mapApiStatus(fundEgress.taskStatusDTO),
  }
}

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
]

const createTableColumns = (
  getLabel: (configId: string, language?: string, fallback?: string) => string
) => [
  {
    key: 'date',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.DATE,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.DATE
    ),
    type: 'text' as const,
    width: 'w-32',
    sortable: true,
  },
  {
    key: 'takermsPaymentRefNo',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.EMS_REF,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.EMS_REF
    ),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'developerName',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.DEVELOPER_NAME,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.DEVELOPER_NAME
    ),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'projectName',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.PROJECT_NAME,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.PROJECT_NAME
    ),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'paymentType',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.PAYMENT_TYPE,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.PAYMENT_TYPE
    ),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'approvalStatus',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.APPROVAL_STATUS,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.APPROVAL_STATUS
    ),
    type: 'status' as const,
    width: 'w-32',
    sortable: true,
  },
  {
    key: 'actions',
    label: getLabel(
      MANUAL_PAYMENT_LABELS.TABLE_COLUMNS.ACTIONS,
      'EN',
      MANUAL_PAYMENT_LABELS.FALLBACKS.TABLE_COLUMNS.ACTIONS
    ),
    type: 'actions' as const,
    width: 'w-20',
  },
]

const TASPaymentPage: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const confirmDelete = useDeleteConfirmation()
  const { getLabelResolver } = useSidebarConfig()
  const tasPaymentTitle = getLabelResolver
    ? getLabelResolver('tas', 'TAS Payments')
    : 'TAS Payment'

  // Use translation hook for TAS payment labels (same as manual payment)
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  // Use TAS payments API hook
  const {
    data: fundEgressData,
    loading: apiLoading,
    error: apiError,
    updatePagination,
    apiPagination,
    deleteFundEgress,
  } = useTasPayments({
    size: currentApiSize,
    page: Math.max(0, currentApiPage - 1),
  })

  const manualPaymentsData = useMemo(() => {
    return fundEgressData.map(transformFundEgressToTasPayment)
  }, [fundEgressData])

  // Create table columns with translation
  const tableColumns = createTableColumns(getLabel)

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
    data: manualPaymentsData,
    searchFields: [
      'date',
      'takermsPaymentRefNo',
      'developerName',
      'projectName',
      'paymentType',
      'approvalStatus',
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

  // Get API totals from the API response
  const apiTotal = apiPagination.totalElements
  const apiTotalPages = apiPagination.totalPages

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

  // Action handlers
  const handleViewPayment = (row: ManualPaymentData) => {
    try {
      // Find the corresponding fund egress data to get the ID
      const fundEgressItem = fundEgressData.find(
        (item) => item.fePaymentRefNumber === row.takermsPaymentRefNo
      )

      if (fundEgressItem?.id) {
        // Use Next.js router for navigation
        router.push(`/transactions/tas/new/${fundEgressItem.id}?step=0`)
      } else {
        // Handle case where fund egress item is not found
      }
    } catch (error) {
      // Handle navigation error silently
    }
  }

  const handleDeletePayment = (row: ManualPaymentData) => {
    if (isDeleting) {
      return
    }

    confirmDelete({
      itemName: `TAS payment: ${row.takermsPaymentRefNo}`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          await deleteFundEgress(row.id.toString())
        } catch (error) {
          throw error // Re-throw to keep dialog open on error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  // Render expanded content using same labels as manual payment
  const renderExpandedContent = (row: ManualPaymentData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          {getLabel(
            MANUAL_PAYMENT_LABELS.EXPANDED_SECTIONS.PAYMENT_INFO,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_SECTIONS.PAYMENT_INFO
          )}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getLabel(
                MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS.DATE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_FIELDS.DATE
              )}
              :
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.date as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getLabel(
                MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS.EMS_REF,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_FIELDS.EMS_REF
              )}
              :
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.takermsPaymentRefNo as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getLabel(
                MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS.DEVELOPER_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_FIELDS.DEVELOPER_NAME
              )}
              :
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.developerName as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getLabel(
                MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS.PROJECT_NAME,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_FIELDS.PROJECT_NAME
              )}
              :
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.projectName as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getLabel(
                MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS.PAYMENT_TYPE,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_FIELDS.PAYMENT_TYPE
              )}
              :
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.paymentType as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getLabel(
                MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS.APPROVAL_STATUS,
                'EN',
                MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_FIELDS.APPROVAL_STATUS
              )}
              :
            </span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.approvalStatus as string}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          {getLabel(
            MANUAL_PAYMENT_LABELS.EXPANDED_SECTIONS.PAYMENT_DOCUMENTS,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.EXPANDED_SECTIONS.PAYMENT_DOCUMENTS
          )}
        </h4>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            {getLabel(
              MANUAL_PAYMENT_LABELS.DOCUMENTS.INVOICE,
              'EN',
              MANUAL_PAYMENT_LABELS.FALLBACKS.DOCUMENTS.INVOICE
            )}
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            {getLabel(
              MANUAL_PAYMENT_LABELS.DOCUMENTS.CONSTRUCTION_PROGRESS,
              'EN',
              MANUAL_PAYMENT_LABELS.FALLBACKS.DOCUMENTS.CONSTRUCTION_PROGRESS
            )}
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            {getLabel(
              MANUAL_PAYMENT_LABELS.DOCUMENTS.APPROVAL,
              'EN',
              MANUAL_PAYMENT_LABELS.FALLBACKS.DOCUMENTS.APPROVAL
            )}
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
            {getLabel(
              MANUAL_PAYMENT_LABELS.DOCUMENTS.HISTORY,
              'EN',
              MANUAL_PAYMENT_LABELS.FALLBACKS.DOCUMENTS.HISTORY
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // Show loading state while API data is being fetched
  if (apiLoading) {
    return (
      <>
        {isSidePanelOpen && (
          <LeftSlidePanel
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
          />
        )}

        <DashboardLayout title={tasPaymentTitle}>
          <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
            {/* Loading State */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC]"></div>
                <div className="text-gray-600 text-sm">Loading...</div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </>
    )
  }

  // Show error state if API call failed
  if (apiError) {
    return (
      <>
        {isSidePanelOpen && (
          <LeftSlidePanel
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
          />
        )}

        <DashboardLayout title={tasPaymentTitle}>
          <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
            {/* Error State */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-red-500 text-6xl">⚠️</div>
                <div className="text-red-600 text-lg font-medium">
                  Failed to load TAS payment data
                </div>
                <div className="text-gray-600 text-sm text-center max-w-md">
                  {apiError}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#155DFC] text-white rounded-lg hover:bg-[#1248CC] transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </>
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

      <DashboardLayout title={tasPaymentTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          {/* Sticky Header Section */}
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            {/* Action Buttons */}
          </div>

          {/* Table Container with Fixed Pagination */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<ManualPaymentData>
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
                onRowView={handleViewPayment}
                onRowDelete={handleDeletePayment}
                // showViewAction={true}
                // showDeleteAction={true}
                onSort={handleSort}
                sortConfig={sortConfig}
                deletePermissions={['tas_payment_delete']}
                viewPermissions={['tas_payment_view']}
                editPermissions={['tas_payment_update']}
                // updatePermissions={['tas_payment_update']}
                // showDeleteAction={true}
                // showViewAction={true}
                // showEditAction={true}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default TASPaymentPage
