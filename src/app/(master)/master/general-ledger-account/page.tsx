'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { GlobalLoading } from '@/components/atoms'
import { CommentModal } from '@/components/molecules'
import { RightSlideGeneralLedgerAccountPanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideGeneralLedgerAccount'
import {
  useGeneralLedgerAccounts,
  useDeleteGeneralLedgerAccount,
  useRefreshGeneralLedgerAccounts,
} from '@/hooks/master/CustomerHook/useGeneralLedgerAccount'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import type { GeneralLedgerAccount, GeneralLedgerAccountFilters } from '@/services/api/masterApi/Customer/generalLedgerAccountService'

interface GeneralLedgerAccountData extends Record<string, unknown> {
  id: number
  generalLedgerAccountId?: string
  uuid?: string
  ledgerAccountNumber: string
  branchIdentifierCode: string
  ledgerAccountDescription: string
  ledgerAccountTypeCode: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  status?: string
}

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
]

export const GeneralLedgerAccountPageClient = dynamic(
  () => Promise.resolve(GeneralLedgerAccountPageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
)

const GeneralLedgerAccountPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<GeneralLedgerAccountData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<GeneralLedgerAccountData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<GeneralLedgerAccountFilters>({})

  // API hooks
  const {
    data: generalLedgerAccountsResponse,
    isLoading: generalLedgerAccountsLoading,
    error: generalLedgerAccountsError,
    updatePagination,
    apiPagination,
  } = useGeneralLedgerAccounts(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteGeneralLedgerAccountMutation = useDeleteGeneralLedgerAccount()
  const refreshGeneralLedgerAccounts = useRefreshGeneralLedgerAccounts()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const generalLedgerAccountData = useMemo(() => {
    if (!generalLedgerAccountsResponse?.content) return []
    return generalLedgerAccountsResponse.content.map((account: GeneralLedgerAccount) => ({
      id: account.id,
      generalLedgerAccountId: account.uuid || `GLA-${account.id}`,
      uuid: account.uuid,
      ledgerAccountNumber: account.ledgerAccountNumber || '',
      branchIdentifierCode: account.branchIdentifierCode || '',
      ledgerAccountDescription: account.ledgerAccountDescription || '',
      ledgerAccountTypeCode: account.ledgerAccountTypeCode || '',
      active: account.active,
      enabled: account.enabled,
      deleted: account.deleted,
      status: account.active ? 'ACTIVE' : 'INACTIVE',
    })) as GeneralLedgerAccountData[]
  }, [generalLedgerAccountsResponse])

  const getGeneralLedgerAccountLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'generalLedgerAccountId',
      label: getGeneralLedgerAccountLabelDynamic('CDL_MGLA_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'ledgerAccountNumber',
      label: getGeneralLedgerAccountLabelDynamic('CDL_MGLA_ACCOUNT_NUMBER'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
   

    {
      key: 'ledgerAccountTypeCode',
      label: getGeneralLedgerAccountLabelDynamic('CDL_MGLA_TYPE_CODE'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'ledgerAccountDescription',
      label: getGeneralLedgerAccountLabelDynamic('CDL_MGLA_DESCRIPTION'),
      type: 'text' as const,
      width: 'w-96',
      sortable: true,
    },
    {
      key: 'status',
      label: getGeneralLedgerAccountLabelDynamic('CDL_MGLA_STATUS'),
      type: 'status' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

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
    data: generalLedgerAccountData,
    searchFields: ['generalLedgerAccountId', 'ledgerAccountNumber', 'ledgerAccountDescription'],
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

  const confirmDelete = async () => {
    if (isDeleting || !deleteItem) return
    setIsDeleting(true)
    try {
      await deleteGeneralLedgerAccountMutation.mutateAsync(String(deleteItem.id))
      refreshGeneralLedgerAccounts()
      setIsDeleteModalOpen(false)
      setDeleteItem(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error(`Failed to delete general ledger account: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRowDelete = (row: GeneralLedgerAccountData) => {
    if (isDeleting) return
    setDeleteItem(row)
    setIsDeleteModalOpen(true)
  }

  const handleRowEdit = (row: GeneralLedgerAccountData) => {
    // Find index in the full data array (not just paginated)
    const index = generalLedgerAccountData.findIndex((item) => item.id === row.id)
    setEditingItem(row)
    setEditingItemIndex(index >= 0 ? index : null)
    setPanelMode('edit')
    setIsPanelOpen(true)
  }

  const handleAddNew = useCallback(() => {
    setEditingItem(null)
    setEditingItemIndex(null)
    setPanelMode('add')
    setIsPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    setEditingItem(null)
    setEditingItemIndex(null)
  }, [])

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadTemplate('GeneralLedgerAccountTemplate.xlsx')
    } catch (error) {
      console.error('Failed to download template:', error)
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshGeneralLedgerAccounts()
    setIsUploadDialogOpen(false)
  }, [refreshGeneralLedgerAccounts])

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error)
  }, [])

  const handleGeneralLedgerAccountAdded = useCallback(() => {
    refreshGeneralLedgerAccounts()
    handleClosePanel()
  }, [handleClosePanel, refreshGeneralLedgerAccounts])

  const handleGeneralLedgerAccountUpdated = useCallback(() => {
    refreshGeneralLedgerAccounts()
    handleClosePanel()
  }, [handleClosePanel, refreshGeneralLedgerAccounts])

  const renderExpandedContent = (row: GeneralLedgerAccountData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getGeneralLedgerAccountLabelDynamic('CDL_MGLA_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.generalLedgerAccountId || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getGeneralLedgerAccountLabelDynamic('CDL_MGLA_ACCOUNT_NUMBER')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.ledgerAccountNumber || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getGeneralLedgerAccountLabelDynamic('CDL_MGLA_IDENTIFIER_CODE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.branchIdentifierCode || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getGeneralLedgerAccountLabelDynamic('CDL_MGLA_TYPE_CODE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.ledgerAccountTypeCode || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getGeneralLedgerAccountLabelDynamic('CDL_MGLA_DESCRIPTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.ledgerAccountDescription || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
              entityType="generalLedgerAccount"
            onAddNew={handleAddNew}
            onDownloadTemplate={handleDownloadTemplate}
            onUploadDetails={() => setIsUploadDialogOpen(true)}
            isDownloading={isDownloading}
            showButtons={{
              addNew: true,
              downloadTemplate: true,
              uploadDetails: true,
            }}
            customActionButtons={[]}
          />
        </div>
        <div className="flex flex-col flex-1 min-h-0">
          {generalLedgerAccountsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : generalLedgerAccountsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading general ledger accounts. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
                <ExpandableDataTable<GeneralLedgerAccountData>
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
                // onRowView={handleRowView}
                onRowEdit={handleRowEdit}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      <CommentModal
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete General Ledger Account"
        message={`Are you sure you want to delete this general ledger account: ${deleteItem?.ledgerAccountNumber || ''}?`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setIsDeleteModalOpen(false)
              setDeleteItem(null)
            },
            color: 'secondary',
            disabled: isDeleting,
          },
          {
            label: isDeleting ? 'Deleting...' : 'Delete',
            onClick: confirmDelete,
            color: 'error',
            disabled: isDeleting,
          },
        ]}
      />
      {isPanelOpen && (
        <RightSlideGeneralLedgerAccountPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onGeneralLedgerAccountAdded={handleGeneralLedgerAccountAdded}
          onGeneralLedgerAccountUpdated={handleGeneralLedgerAccountUpdated}
          mode={panelMode}
          actionData={editingItem as GeneralLedgerAccount | null}
          {...(editingItemIndex !== null && {
            generalLedgerAccountIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload General Ledger Account Data"
          entityType="generalLedgerAccount"
        />
      )}
    </>
  )
}

const GeneralLedgerAccountPage: React.FC = () => {
  return <GeneralLedgerAccountPageClient />
}

export default GeneralLedgerAccountPage
