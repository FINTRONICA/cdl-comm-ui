'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const EscrowAccountsPageClient = dynamic(
  () => Promise.resolve(EscrowAccountsPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <GlobalLoading fullHeight />
      </div>
    ),
  }
)

import { useCallback, useState, useMemo } from 'react'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useEscrowAccountLabelsWithCache } from '@/hooks/master/CustomerHook/useEscrowAccountLabelsWithCache'
import { useAppStore } from '@/store'
import { GlobalLoading } from '@/components/atoms'
import {
  useEscrowAccounts,
  useDeleteEscrowAccount,
} from '@/hooks/master/CustomerHook/useEscrowAccount'
import {
  mapEscrowAccountToUIData,
  type EscrowAccountUIData,
  type MasterEscrowAccountResponse,
} from '@/services/api/masterApi/Customer/escrowAccountService'
import type { MasterEscrowAccountFilters } from '@/services/api/masterApi/Customer/escrowAccountService'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { useRouter } from 'next/navigation'

interface EscrowAccountData extends EscrowAccountUIData, Record<string, unknown> {}

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
  'ACTIVE',
]

const ErrorMessage: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl px-4">
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Failed to load escrow accounts
        </h1>
        <p className="mb-4 text-gray-600">
          {error.message ||
            'An error occurred while loading the data. Please try again.'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="text-sm font-medium text-gray-600 cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="p-4 mt-2 overflow-auto text-xs text-gray-500 bg-gray-100 rounded">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => <GlobalLoading fullHeight />

const EscrowAccountsPageImpl: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentLanguage = useAppStore((state) => state.language)

  const {
    downloadTemplate,
    isLoading: isDownloading,
    error: downloadError,
    clearError,
  } = useTemplateDownload()

  const { getLabel } = useEscrowAccountLabelsWithCache()

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [filters] = useState<MasterEscrowAccountFilters>({})

  const {
    data: apiResponse,
    isLoading: escrowAccountsLoading,
    error: escrowAccountsError,
    refetch: refetchEscrowAccounts,
    updatePagination,
    apiPagination,
  } = useEscrowAccounts(Math.max(0, currentApiPage - 1), currentApiSize, filters)

  const deleteMutation = useDeleteEscrowAccount()
  const confirmDelete = useDeleteConfirmation()

  const escrowAccountsData = useMemo(() => {
    if (apiResponse?.content && Array.isArray(apiResponse.content)) {
      return apiResponse.content.map((item: MasterEscrowAccountResponse) =>
        mapEscrowAccountToUIData(item)
      ) as EscrowAccountData[]
    }
    return []
  }, [apiResponse])

  const getEscrowAccountLabelDynamic = useCallback(
    (configId: string, fallback: string): string => {
      return getLabel(configId, currentLanguage || 'EN', fallback)
    },
    [getLabel, currentLanguage]
  )

  const handleDownloadTemplate = useCallback(async () => {
    await downloadTemplate(TEMPLATE_FILES.ESCROW_ACCOUNT)
  }, [downloadTemplate])

  const handleRowClick = useCallback(
    (row: EscrowAccountData, index: number) => {
      router.push(`/master/escrow-account/${row.id}/step/1?mode=view`)
    },
    [router]
  )

  const handleRowDelete = useCallback(
    (row: EscrowAccountData, index: number) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `escrow account: ${row.escrowAccountFullName}`,
        itemId: row.id,
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteMutation.mutateAsync(row.id)
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error occurred'
            console.error(`Failed to delete escrow account: ${errorMessage}`)
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [deleteMutation, confirmDelete, isDeleting]
  )

  const handleRowView = useCallback(
    (row: EscrowAccountData, index: number) => {
      router.push(`/master/escrow-account/${row.id}/step/1?mode=view`)
    },
    [router]
  )

  const handleRowEdit = useCallback(
    (row: EscrowAccountData, index: number) => {
      router.push(`/master/escrow-account/${row.id}/step/1?editing=true`)
    },
    [router]
  )

  const tableColumns = useMemo(
    () => [
      {
        key: 'escrowAccountFullName',
        label: getEscrowAccountLabelDynamic(
          'CDL_EA_NAME',
          'Escrow Account Name'
        ),
        type: 'text' as const,
        width: 'w-40',
        sortable: true,
      },
      {
        key: 'id',
        label: getEscrowAccountLabelDynamic('CDL_EA_ID', 'ID'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'escrowAccountNumber',
        label: getEscrowAccountLabelDynamic(
          'CDL_EA_ACCOUNT_NUMBER',
          'Account Number'
        ),
        type: 'text' as const,
        width: 'w-40',
        sortable: true,
      },
      {
        key: 'escrowBankName',
        label: getEscrowAccountLabelDynamic(
          'CDL_EA_BANK_NAME',
          'Bank Name'
        ),
        type: 'text' as const,
        width: 'w-40',
        sortable: true,
      },
      {
        key: 'bankIfscCode',
        label: getEscrowAccountLabelDynamic(
          'CDL_EA_BANK_SWIFT_CODE',
          'Bank Swift/BIC'
        ),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'status',
        label: getEscrowAccountLabelDynamic('CDL_EA_STATUS', 'Status'),
        type: 'status' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'actions',
        label: getEscrowAccountLabelDynamic('CDL_EA_ACTIONS', 'Actions'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getEscrowAccountLabelDynamic]
  )

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
    sortConfig,
    handleSearchChange,
    handlePageChange: localHandlePageChange,
    handleRowsPerPageChange: localHandleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    handleSort,
  } = useTableState({
    data: escrowAccountsData,
    searchFields: [
      'escrowAccountFullName',
      'id',
      'escrowAccountNumber',
      'escrowBankName',
      'bankIfscCode',
      'status',
    ],
    initialRowsPerPage: currentApiSize,
  })

  const handlePageChange = useCallback(
    (newPage: number) => {
      const hasSearch = Object.values(search).some((value) => value.trim())

      if (hasSearch) {
        localHandlePageChange(newPage)
      } else {
        setCurrentApiPage(newPage)
        updatePagination(Math.max(0, newPage - 1), currentApiSize)
      }
    },
    [search, localHandlePageChange, currentApiSize, updatePagination]
  )

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setCurrentApiSize(newRowsPerPage)
      setCurrentApiPage(1)
      updatePagination(0, newRowsPerPage)
      localHandleRowsPerPageChange(newRowsPerPage)
    },
    [updatePagination, localHandleRowsPerPageChange]
  )

  const apiTotal = apiPagination?.totalElements || 0
  const apiTotalPages = apiPagination?.totalPages || 1

  const hasActiveSearch = Object.values(search).some((value) => value.trim())

  const effectiveTotalRows = hasActiveSearch ? localTotalRows : apiTotal
  const effectiveTotalPages = hasActiveSearch ? localTotalPages : apiTotalPages
  const effectivePage = hasActiveSearch ? localPage : currentApiPage

  const effectiveStartItem = hasActiveSearch
    ? startItem
    : (currentApiPage - 1) * currentApiSize + 1
  const effectiveEndItem = hasActiveSearch
    ? endItem
    : Math.min(currentApiPage * currentApiSize, apiTotal)

  const actionButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    icon?: string
    iconAlt?: string
  }> = []

  const renderExpandedContent = () => (
    <div className="grid grid-cols-2 gap-8"></div>
  )

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
        <div className="fixed z-50 px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded shadow-lg top-4 right-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Download Error: {downloadError}
            </span>
            <button
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        {/* Show loading state */}
        {escrowAccountsLoading ? (
          <LoadingSpinner />
        ) : escrowAccountsError ? (
          <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
            <ErrorMessage
              error={escrowAccountsError}
              onRetry={refetchEscrowAccounts}
            />
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-gray-800/80 rounded-t-2xl">
              <PageActionButtons
                entityType="escrowAccount"
                customActionButtons={actionButtons}
                onDownloadTemplate={handleDownloadTemplate}
                isDownloading={isDownloading}
                showButtons={{
                  downloadTemplate: true,
                  uploadDetails: true,
                  addNew: true,
                }}
              />
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-auto">
                <PermissionAwareDataTable<EscrowAccountData>
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
                  statusOptions={statusOptions}
                  onRowDelete={handleRowDelete}
                  onRowView={handleRowView}
                  onRowEdit={handleRowEdit}
                  deletePermissions={['escrow_account_delete']}
                  viewPermissions={['escrow_account_view']}
                  editPermissions={['escrow_account_update']}
                  updatePermissions={['escrow_account_update']}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

const EscrowAccountsPage: React.FC = () => {
  return <EscrowAccountsPageClient />
}

export default EscrowAccountsPage

