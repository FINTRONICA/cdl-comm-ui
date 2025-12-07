'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '../../components/templates/DashboardLayout'
import { useTableState } from '../../hooks/useTableState'
import { PageActionButtons } from '../../components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useDeleteSuretyBond } from '@/hooks/useSuretyBonds'
import {
  suretyBondService,
  SuretyBondResponse,
} from '@/services/api/suretyBondService'
import { useSuretyBondTranslationsByPattern } from '@/hooks/useSuretyBondTranslations'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'

import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useRouter } from 'next/navigation'
import { GlobalLoading, GlobalError } from '@/components/atoms'

// Define the guarantee data structure for UI display
interface GuaranteeData extends Record<string, unknown> {
  id: number
  date: string
  referenceNumber: string
  type: string
  projectName: string
  buildPartnerName: string
  amount: number
  expirationDate: string
  status: string
  issuerBank: string
  openEnded: boolean
}

// Transform SuretyBondResponse to GuaranteeData for UI display
const transformSuretyBondToGuarantee = (
  suretyBond: SuretyBondResponse
): GuaranteeData => {
  // Map task status to display status
  const getStatusFromTaskStatus = (taskStatus: any) => {
    if (!taskStatus) return 'INITIATED'

    switch (taskStatus.code) {
      case 'DRAFT':
        return 'DRAFT'
      case 'IN_PROGRESS':
        return 'IN_PROGRESS'
      case 'COMPLETED':
        return 'COMPLETED'
      case 'CANCELLED':
        return 'CANCELLED'
      case 'EXPIRED':
        return 'EXPIRED'
      default:
        return 'INITIATED'
    }
  }

  return {
    id: suretyBond.id || 0,
    date: suretyBond.suretyBondDate
      ? new Date(suretyBond.suretyBondDate).toLocaleDateString('en-GB')
      : 'N/A',
    referenceNumber: suretyBond.suretyBondReferenceNumber || 'N/A',
    type:
      suretyBond.suretyBondTypeDTO?.languageTranslationId?.configValue || 'N/A',
    projectName: suretyBond.realEstateAssestDTO?.reaName || 'N/A',
    buildPartnerName:
      suretyBond.realEstateAssestDTO?.buildPartnerDTO?.bpName || 'N/A',
    amount: suretyBond.suretyBondAmount || 0,
    expirationDate: suretyBond.suretyBondExpirationDate
      ? new Date(suretyBond.suretyBondExpirationDate).toLocaleDateString(
          'en-GB'
        )
      : 'N/A',
    status: getStatusFromTaskStatus(suretyBond.taskStatusDTO),
    issuerBank: suretyBond.issuerBankDTO?.fiName || 'N/A',
    openEnded: suretyBond.suretyBondOpenEnded || false,
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

const GuaranteePage: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  // Use surety bond translations for labels
  const { translations: sbTranslations, loading: sbTranslationsLoading } =
    useSuretyBondTranslationsByPattern('CDL_SB_')

  // Helper function to get translated label
  const getTranslatedLabel = (configId: string, fallback: string): string => {
    if (sbTranslationsLoading || !sbTranslations.length) {
      return fallback
    }

    const translation = sbTranslations.find((t) => t.configId === configId)
    return translation?.configValue || fallback
  }

  const guaranteeTitle = getTranslatedLabel('CDL_SB_HEADING', 'Surety Bond')

  // Define table columns with translated labels (memoized to prevent recreation)
  const tableColumns = useMemo(
    () => [
      {
        key: 'date',
        label: getTranslatedLabel('CDL_SB_DATE', 'Date'),
        type: 'text' as const,
        sortable: true,
        width: 'w-40',
      },
      {
        key: 'referenceNumber',
        label: getTranslatedLabel('CDL_SB_REF_NO', 'Reference Number'),
        type: 'text' as const,
        sortable: true,
        width: 'w-48',
      },
      {
        key: 'type',
        label: getTranslatedLabel('CDL_SB_TYPE', 'Type'),
        type: 'text' as const,
        sortable: true,
        width: 'w-40',
      },
      {
        key: 'projectName',
        label: getTranslatedLabel('CDL_SB_BPA_NAME', 'Project Name'),
        type: 'text' as const,
        sortable: true,
        width: 'w-56',
      },
      {
        key: 'buildPartnerName',
        label: getTranslatedLabel('CDL_SB_BP_NAME', 'Build Partner Name'),
        type: 'text' as const,
        sortable: true,
        width: 'w-48',
      },
      {
        key: 'amount',
        label: getTranslatedLabel('CDL_SB_AMOUNT', 'Amount'),
        type: 'custom' as const,
        sortable: true,
        width: 'w-32',
        render: (value: number) => value.toLocaleString(),
      },
      {
        key: 'expirationDate',
        label: getTranslatedLabel('CDL_SB_EXPIARY_DATE', 'Expiration Date'),
        type: 'text' as const,
        sortable: true,
        width: 'w-40',
      },
      {
        key: 'status',
        label: getTranslatedLabel('CDL_SB_STATUS', 'Status'),
        type: 'status' as const,
        sortable: true,
        width: 'w-40',
      },
      {
        key: 'actions',
        label: getTranslatedLabel('CDL_SB_ACTIONS', 'Actions'),
        type: 'actions' as const,
        width: 'w-28',
      },
    ],
    [sbTranslations, sbTranslationsLoading]
  )

  // Pagination state (similar to Investors page)
  const [suretyBonds, setSuretyBonds] = useState<SuretyBondResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [, setTotalElements] = useState(0)
  const [, setTotalPages] = useState(0)

  // Use delete surety bond hook
  const { deleteSuretyBond } = useDeleteSuretyBond()
  const confirmDelete = useDeleteConfirmation()

  // Use template download hook
  const {
    downloadTemplate,
    isLoading: isDownloading,
    error: downloadError,
    clearError: clearDownloadError,
  } = useTemplateDownload()

  // Fetch function (similar to Investors page)
  const fetchSuretyBonds = useCallback(async (page: number, size: number) => {
    try {
      setLoading(true)
      setError(null)

      const result = await suretyBondService.getSuretyBonds({
        page: page - 1, // Convert to 0-based indexing
        size: size,
      })

      setSuretyBonds(result.content)
      setTotalElements(result.page.totalElements)
      setTotalPages(result.page.totalPages)

      if (result.page.totalPages === 0 && result.content.length > 0) {
        const calculatedPages = Math.ceil(result.page.totalElements / size) || 1
        setTotalPages(calculatedPages)
      }
    } catch (err: any) {
      setError('Failed to fetch surety bonds')
      setSuretyBonds([])
      setTotalElements(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuretyBonds(currentPage, rowsPerPage)
  }, [fetchSuretyBonds, currentPage, rowsPerPage])

  // Transform API data to UI format
  const guaranteesData = useMemo(() => {
    return suretyBonds.map(transformSuretyBondToGuarantee)
  }, [suretyBonds])

  // Use table state for sorting and filtering functionality
  const {
    search,
    handleSort,
    sortConfig,
    paginated: sortedData,
    totalRows: sortedTotalRows,
    totalPages: sortedTotalPages,
    startItem: sortedStartItem,
    endItem: sortedEndItem,
    handleSearchChange,
    handlePageChange: _handleTablePageChange,
    handleRowsPerPageChange: _handleTableRowsPerPageChange,
  } = useTableState({
    data: guaranteesData,
    searchFields: [
      'referenceNumber',
      'type',
      'projectName',
      'buildPartnerName',
      'status',
    ],
    initialRowsPerPage: rowsPerPage,
  })

  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  // Use sorted data from useTableState hook
  const filteredData = sortedData

  const startItem = sortedStartItem
  const endItem = sortedEndItem

  // Use pagination handlers from useTableState
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    setSelectedRows([])
    setExpandedRows([])
  }, [])

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
    setSelectedRows([])
    setExpandedRows([])
  }, [])

  const handleRowSelectionChange = useCallback((newSelectedRows: number[]) => {
    setSelectedRows(newSelectedRows)
  }, [])

  const handleRowExpansionChange = useCallback((newExpandedRows: number[]) => {
    setExpandedRows(newExpandedRows)
  }, [])

  // Action handlers
  const handleViewGuarantee = (row: GuaranteeData) => {
    router.push(`/surety_bond/new/${row.id}?step=0&mode=view`)
  }

  const handleEditGuarantee = (row: GuaranteeData) => {
    // Navigate to surety bond stepper page with step parameter
    router.push(`/surety_bond/new/${row.id}?step=0`)
  }

  const handleDeleteGuarantee = (row: GuaranteeData) => {
    confirmDelete({
      itemName: `surety bond: ${row.referenceNumber}`,
      itemId: row.id.toString(),
      title: getTranslatedLabel('CDL_SB_DELETE_CONFIRM', 'Delete Surety Bond'),
      message: `${getTranslatedLabel('CDL_SB_DELETE_CONFIRM', 'Are you sure you want to delete this surety bond?')} "${row.referenceNumber}"?\n\nThis action cannot be undone.`,
      successTitle: getTranslatedLabel(
        'CDL_SB_DELETED_SUCCESS',
        'Surety bond deleted successfully'
      ),
      onConfirm: async () => {
        try {
          const success = await deleteSuretyBond(row.id)

          if (success) {
            // Refresh the data (similar to Investors page)
            await fetchSuretyBonds(currentPage, rowsPerPage)
          } else {
            throw new Error(
              getTranslatedLabel(
                'CDL_SB_DELETE_ERROR',
                'Error deleting surety bond'
              )
            )
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete surety bond: ${errorMessage}`)
          throw error // Re-throw to keep dialog open on error
        }
      },
    })
  }

  const handleCreateNew = () => {
    router.push('/surety_bond/new')
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.GUARANTEE)
    } catch (error) {}
  }

  const renderExpandedContent = (row: GuaranteeData) => (
    <div className="p-4 bg-gray-50 border-t">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Issuer Bank:</strong> {row.issuerBank}
        </div>
        <div>
          <strong>Open Ended:</strong> {row.openEnded ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Amount:</strong> ${row.amount.toLocaleString()}
        </div>
        <div>
          <strong>Expiration Date:</strong> {row.expirationDate}
        </div>
      </div>
    </div>
  )

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title={guaranteeTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title={guaranteeTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalError
            error={error}
            onRetry={() => window.location.reload()}
            title="Error loading surety bonds"
            fullHeight
          />
        </div>
      </DashboardLayout>
    )
  }

  // Empty state
  if (!loading && !error && guaranteesData.length === 0) {
    return (
      <DashboardLayout title={guaranteeTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <div className="p-4">
            <PageActionButtons
              entityType="suretyBond"
              onAddNew={handleCreateNew}
              onDownloadTemplate={handleDownloadTemplate}
              isDownloading={isDownloading}
              showButtons={{
                downloadTemplate: true,
                uploadDetails: true,
                addNew: true,
              }}
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                No Surety Bonds Found
              </p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                You haven't created any surety bonds yet.
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Click "Add New Surety Bond" to get started.
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Surety Bond
              </button>
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

      {/* Download Error Alert */}
      {downloadError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Download Error: {downloadError}
            </span>
            <button
              onClick={clearDownloadError}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <DashboardLayout title={guaranteeTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          {/* Sticky Header Section */}
          <div className="sticky top-0 z-10 bg-white/75 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            {/* Action Buttons */}
            <div className="p-4">
              <PageActionButtons
                entityType="suretyBond"
                onAddNew={handleCreateNew}
                onDownloadTemplate={handleDownloadTemplate}
                isDownloading={isDownloading}
                showButtons={{
                  downloadTemplate: true,
                  uploadDetails: true,
                  addNew: true,
                }}
              />
            </div>
          </div>

          {/* Table Container with Fixed Pagination */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<GuaranteeData>
                data={filteredData}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: currentPage,
                  rowsPerPage,
                  totalRows: sortedTotalRows,
                  totalPages: sortedTotalPages,
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
                onRowView={handleViewGuarantee}
                onRowEdit={handleEditGuarantee}
                onRowDelete={handleDeleteGuarantee}
                // showViewAction={true}
                // showDeleteAction={true}
                deletePermissions={['surety_bond_delete']}
                viewPermissions={['surety_bond_view']}
                editPermissions={['surety_bond_update']}
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

export default GuaranteePage
