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
import { RightSlideAccountPurposePanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideAccountPurposePanel'
import {
  useAccountPurposes,
  useDeleteAccountPurpose,
  useRefreshAccountPurposes,
} from '@/hooks/master/CustomerHook/useAccountPurpose'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import { AccountPurpose, CriticalityDTO, TaskStatusDTO } from '@/services/api/masterApi/Customer/accountPurposeService'

interface AccountPurposeData extends Record<string, unknown> {
  id: number
  accountPurposeId?: string
  uuid?: string
  accountPurposeCode: string
  accountPurposeName: string
  criticalityDTO?: CriticalityDTO | null
  taskStatusDTO?: TaskStatusDTO | null
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

export const AccountPurposePageClient = dynamic(
  () => Promise.resolve(AccountPurposePageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
)

const AccountPurposePageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<AccountPurposeData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<AccountPurposeData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<{ name?: string }>({})

  // API hooks
  const {
        data: accountPurposesResponse,
    isLoading: accountPurposesLoading,
    error: accountPurposesError,
    updatePagination,
    apiPagination,
  } = useAccountPurposes(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteAccountPurposeMutation = useDeleteAccountPurpose()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const accountPurposeData = useMemo(() => {
    if (!accountPurposesResponse?.content) return []
    return accountPurposesResponse.content.map((accountPurpose: AccountPurpose) => ({
      id: accountPurpose.id,
      accountPurposeId: accountPurpose.uuid || `AP-${accountPurpose.id}`,
      uuid: accountPurpose.uuid,
      accountPurposeCode: accountPurpose.accountPurposeCode || '',
      accountPurposeName: accountPurpose.accountPurposeName,
      criticalityDTO: accountPurpose.criticalityDTO,
      taskStatusDTO: accountPurpose.taskStatusDTO,
      active: accountPurpose.active,
      enabled: accountPurpose.enabled,
      deleted: accountPurpose.deleted,
      status: accountPurpose.active ? 'ACTIVE' : 'INACTIVE',
    })) as AccountPurposeData[]
  }, [accountPurposesResponse])

  const getAccountPurposeLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'accountPurposeId',
      label: getAccountPurposeLabelDynamic('CDL_MAP_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'accountPurposeName',
      label: getAccountPurposeLabelDynamic('CDL_MAP_NAME'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'accountPurposeCode',
      label: getAccountPurposeLabelDynamic('CDL_MAP_CODE'),
      type: 'text' as const,
      width: 'w-96',
      sortable: true,
    },
    {
      key: 'status',
      label: getAccountPurposeLabelDynamic('CDL_MAP_STATUS'),
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
    data: accountPurposeData,
    searchFields: ['accountPurposeId', 'accountPurposeName', 'accountPurposeCode'],
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
      await deleteAccountPurposeMutation.mutateAsync(String(deleteItem.id))
      setIsDeleteModalOpen(false)
      setDeleteItem(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error(`Failed to delete account purpose: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRowDelete = (row: AccountPurposeData) => {
    if (isDeleting) return
    setDeleteItem(row)
    setIsDeleteModalOpen(true)
  }

  const handleRowEdit = (row: AccountPurposeData) => {
    // Find index in the full data array (not just paginated)
    const index = accountPurposeData.findIndex((item) => item.id === row.id)
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
      // Use a generic template name for investment, or create one if needed
      await downloadTemplate('AccountPurposeTemplate.xlsx')
    } catch (error) {
      console.error('Failed to download template:', error)
    }
  }, [downloadTemplate])

  const refreshAccountPurposes = useRefreshAccountPurposes()

  const handleUploadSuccess = useCallback(() => {
    refreshAccountPurposes()
    setIsUploadDialogOpen(false)
  }, [refreshAccountPurposes])

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error)
  }, [])

  const handleAccountPurposeAdded = useCallback(() => {
    refreshAccountPurposes()
    handleClosePanel()
  }, [handleClosePanel, refreshAccountPurposes])

  const handleAccountPurposeUpdated = useCallback(() => {
    refreshAccountPurposes()
    handleClosePanel()
  }, [handleClosePanel, refreshAccountPurposes])

  const renderExpandedContent = (row: AccountPurposeData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_MAP_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountPurposeId || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_MAP_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountPurposeName || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_MAP_CODE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountPurposeCode || '-'}
            </span>
          </div>
          {row.criticalityDTO && (
            <div className="col-span-2">
              <span className="text-gray-600">
                {getAccountPurposeLabelDynamic('CDL_MAP_CRITICALITY')}:
              </span>
              <span className="ml-2 font-medium text-gray-800">
                {row.criticalityDTO.languageTranslationId?.configValue ||
                  row.criticalityDTO.settingValue ||
                  '-'}
              </span>
            </div>
          )}
          {row.taskStatusDTO && (
            <div className="col-span-2">
              <span className="text-gray-600">
                Task Status:
              </span>
              <span className="ml-2 font-medium text-gray-800">
                {row.taskStatusDTO.name || row.taskStatusDTO.code || '-'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
                  entityType="accountPurpose"
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
          {accountPurposesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : accountPurposesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading account purposes. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<AccountPurposeData>
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
            title="Delete Account Purpose"
        message={`Are you sure you want to delete this account purpose: ${deleteItem?.accountPurposeName || ''}?`}
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
        <RightSlideAccountPurposePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onAccountPurposeAdded={handleAccountPurposeAdded}
          onAccountPurposeUpdated={handleAccountPurposeUpdated}
          mode={panelMode}
          actionData={editingItem as AccountPurpose | null}
          {...(editingItemIndex !== null && {
            accountPurposeIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
              title="Upload Account Purpose Data"
          entityType="accountPurpose"
        />
      )}
    </>
  )
}

const AccountPurposePage: React.FC = () => {
  return <AccountPurposePageClient />
}

export default AccountPurposePage
