'use client'

import React, { useCallback, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { GlobalLoading } from '@/components/atoms'
import { RightSlideAgreementTypePanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideAgreementTypePanel'
import {
  useAgreementTypes,
  useDeleteAgreementType,
  useRefreshAgreementTypes,
} from '@/hooks/master/CustomerHook/useAgreementType'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import { AgreementType } from '@/services/api/masterApi/Customer/agreementTypeService'
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from '@/store/confirmationDialogStore'
import { useCreateWorkflowRequest } from '@/hooks/workflow'

interface AgreementTypeData extends Record<string, unknown> {
  id: number
  agreementTypeId?: string
  uuid?: string
  agreementTypeName: string
  agreementTypeDescription: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
}

const STATUS_OPTIONS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
]

const DEFAULT_PAGE_SIZE = 20
const INITIAL_PAGE = 1

const AgreementTypePageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'approve'>('add')
  const [editingItem, setEditingItem] = useState<AgreementTypeData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(INITIAL_PAGE)
  const [currentApiSize, setCurrentApiSize] = useState(DEFAULT_PAGE_SIZE)
  const [searchFilters] = useState<{ name?: string }>({})

  // API hooks
  const {
    data: agreementTypesResponse,
    isLoading: agreementTypesLoading,
    error: agreementTypesError,
    updatePagination,
    apiPagination,
  } = useAgreementTypes(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteAgreementTypeMutation = useDeleteAgreementType()
  const confirmDelete = useDeleteConfirmation()
  const confirmApprove = useApproveConfirmation()
  const createWorkflowRequest = useCreateWorkflowRequest()
  const refreshAgreementTypes = useRefreshAgreementTypes()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const agreementTypeData = useMemo(() => {
    if (!agreementTypesResponse) {
      return []
    }

    // Handle both paginated and non-paginated responses
    const content = Array.isArray(agreementTypesResponse)
      ? agreementTypesResponse
      : agreementTypesResponse.content || []

    if (!Array.isArray(content) || content.length === 0) {
      return []
    }

    return content.map((agreementType: AgreementType) => ({
      id: agreementType.id,
      agreementTypeId: agreementType.uuid || `MAT-${agreementType.id}`,
      uuid: agreementType.uuid,
      agreementTypeName: agreementType.agreementTypeName || '',
      agreementTypeDescription: agreementType.agreementTypeDescription || '',
      active: agreementType.active ?? true,
      enabled: agreementType.enabled ?? true,
      deleted: agreementType.deleted ?? false,
    })) as AgreementTypeData[]
  }, [agreementTypesResponse])

  const getAgreementTypeLabel = useCallback(
    (configId: string): string => getMasterLabel(configId),
    []
  )

  const tableColumns = useMemo(
    () => [
      {
        key: 'agreementTypeId',
        label: getAgreementTypeLabel('CDL_MAT_ID'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
      },
      {
        key: 'agreementTypeName',
        label: getAgreementTypeLabel('CDL_MAT_NAME'),
        type: 'text' as const,
        width: 'w-64',
        sortable: true,
      },
      {
        key: 'agreementTypeDescription',
        label: getAgreementTypeLabel('CDL_MAT_DESCRIPTION'),
        type: 'text' as const,
        width: 'w-96',
        sortable: true,
      },
      {
        key: 'status',
        label: getAgreementTypeLabel('CDL_MAT_STATUS'),
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
    ],
    [getAgreementTypeLabel]
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
    data: agreementTypeData,
    searchFields: ['agreementTypeId', 'agreementTypeName', 'agreementTypeDescription'],
    initialRowsPerPage: currentApiSize,
  })

  const hasActiveSearch = useMemo(
    () => Object.values(search).some((value) => value.trim() !== ''),
    [search]
  )

  const apiTotal = apiPagination?.totalElements || 0
  const apiTotalPages = apiPagination?.totalPages || 1

  const effectiveTotalRows = hasActiveSearch ? localTotalRows : apiTotal
  const effectiveTotalPages = hasActiveSearch ? localTotalPages : apiTotalPages
  const effectivePage = hasActiveSearch ? localPage : currentApiPage

  const effectiveStartItem = hasActiveSearch
    ? startItem
    : (currentApiPage - 1) * currentApiSize + 1
  const effectiveEndItem = hasActiveSearch
    ? endItem
    : Math.min(currentApiPage * currentApiSize, apiTotal)

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (hasActiveSearch) {
        localHandlePageChange(newPage)
      } else {
        setCurrentApiPage(newPage)
        updatePagination(Math.max(0, newPage - 1), currentApiSize)
      }
    },
    [hasActiveSearch, localHandlePageChange, currentApiSize, updatePagination]
  )

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setCurrentApiSize(newRowsPerPage)
      setCurrentApiPage(INITIAL_PAGE)
      updatePagination(0, newRowsPerPage)
      localHandleRowsPerPageChange(newRowsPerPage)
    },
    [localHandleRowsPerPageChange, updatePagination]
  )

  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementTypeData, _index: number) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `agreement type: ${row.agreementTypeName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteAgreementTypeMutation.mutateAsync(String(row.id))
            refreshAgreementTypes()
          } catch (error) {
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [deleteAgreementTypeMutation, confirmDelete, isDeleting, refreshAgreementTypes]
  )

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementTypeData, _index: number) => {
      const dataIndex = agreementTypeData.findIndex((item) => item.id === row.id)
      setEditingItem(row)
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null)
      setPanelMode('edit')
      setIsPanelOpen(true)
    },
    [agreementTypeData]
  )

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
      await downloadTemplate('AgreementTypeTemplate.xlsx')
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshAgreementTypes()
    setIsUploadDialogOpen(false)
  }, [refreshAgreementTypes])

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
    // Error is handled by UploadDialog component
  }, [])

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementTypeData, _index: number) => {
      confirmApprove({
        itemName: `agreement type: ${row.agreementTypeName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: 'AGREEMENT_TYPE',
              moduleName: 'AGREEMENT_TYPE',
              actionKey: 'APPROVE',
              payloadJson: row as Record<string, unknown>,
            })
            refreshAgreementTypes()
          } catch (error) {
            throw error
          }
        },
      })
    },
    [confirmApprove, createWorkflowRequest, refreshAgreementTypes]
  )

  const handleAgreementTypeAdded = useCallback(() => {
    refreshAgreementTypes()
    handleClosePanel()
  }, [handleClosePanel, refreshAgreementTypes])

  const handleAgreementTypeUpdated = useCallback(() => {
    refreshAgreementTypes()
    handleClosePanel()
  }, [handleClosePanel, refreshAgreementTypes])

  const renderExpandedContent = useCallback(
    (row: AgreementTypeData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getAgreementTypeLabel('CDL_MAT_ID')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.agreementTypeId || '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getAgreementTypeLabel('CDL_MAT_NAME')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.agreementTypeName || '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getAgreementTypeLabel('CDL_MAT_DESCRIPTION')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.agreementTypeDescription || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [getAgreementTypeLabel]
  )

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="agreementType"
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
          {agreementTypesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : agreementTypesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                <div className="font-semibold mb-2">Error loading agreement types.</div>
                <div className="text-sm">
                  {agreementTypesError instanceof Error
                    ? agreementTypesError.message
                    : 'Please try again.'}
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
                      {JSON.stringify(agreementTypesError, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ) : agreementTypeData.length === 0 ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-gray-500 dark:text-gray-400">
                No agreement types found
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<AgreementTypeData>
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
                statusOptions={STATUS_OPTIONS}
                onRowDelete={handleRowDelete}
                onRowApprove={handleRowApprove}
                onRowEdit={handleRowEdit}
                // deletePermissions={['agreement_type_delete']}
                deletePermissions={['*']}
                // editPermissions={['agreement_type_update']}
                editPermissions={['*']}
                // approvePermissions={['agreement_type_approve']}
                approvePermissions={['*']}
                updatePermissions={['agreement_type_update']}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>


      {isPanelOpen && (
        <RightSlideAgreementTypePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onAgreementTypeAdded={handleAgreementTypeAdded}
          onAgreementTypeUpdated={handleAgreementTypeUpdated}
          mode={panelMode === 'approve' ? 'edit' : panelMode}
          actionData={editingItem as AgreementType | null}
          {...(editingItemIndex !== null && {
            agreementTypeIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Agreement Type Data"
          entityType="agreementType"
        />
      )}
    </>
  )
}

export const AgreementTypePageClient = dynamic(
  () => Promise.resolve(AgreementTypePageImpl),
  {
    ssr: false,
  }
)

const AgreementTypePage: React.FC = () => {
  return <AgreementTypePageClient />
}

export default AgreementTypePage
