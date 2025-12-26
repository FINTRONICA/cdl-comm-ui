'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useState, useMemo } from 'react'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { GlobalLoading } from '@/components/atoms'
import { RightSlideCountryPanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideCountry'
import {
  useCountries,
  useDeleteCountry,
  useRefreshCountries,
} from '@/hooks/master/CustomerHook/useCountry'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import { Country } from '@/services/api/masterApi/Customer/countryService'
import { useCountryLabelsWithCache } from '@/hooks/master/CustomerHook/useCountryLabelsWithCache'
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from '@/store/confirmationDialogStore'
import { useCreateWorkflowRequest } from '@/hooks/workflow'

interface CountryTableData extends Country, Record<string, unknown> {
  countryId?: string
  description: string
}

export const CountryPageClient = dynamic(
  () => Promise.resolve(CountryPageImpl),
  {
    ssr: false,
  }
)

const CountryPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'approve'>('add')
  const [editingItem, setEditingItem] = useState<Country | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<{ description?: string }>({})

  // API hooks
  const {
    data: countriesResponse,
    isLoading: countriesLoading,
    error: countriesError,
    updatePagination,
    apiPagination,
  } = useCountries(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteCountryMutation = useDeleteCountry()
  const confirmDelete = useDeleteConfirmation()
  const confirmApprove = useApproveConfirmation()
  const createWorkflowRequest = useCreateWorkflowRequest()
  const refreshCountries = useRefreshCountries()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()
  const { getCountryLabelDynamic } = useCountryLabelsWithCache()

  // Transform API data to table format
  const countryData = useMemo(() => {
    if (!countriesResponse?.content) return []
    return countriesResponse.content.map((country: Country) => ({
      ...country,
      countryId: country.uuid || `CNT-${country.id}`,
    })) as CountryTableData[]
  }, [countriesResponse])

  const tableColumns = useMemo(
    () => [
      {
        key: 'countryId',
        label: getCountryLabelDynamic('CDL_MCNT_ID'),
        type: 'text' as const,
        width: 'w-62',
        sortable: true,
      },
      {
        key: 'description',
        label: getCountryLabelDynamic('CDL_MCNT_DESCRIPTION'),
        type: 'text' as const,
        width: 'w-62',
        sortable: true,
      },
      {
        key: 'actions',
        label: getCountryLabelDynamic('CDL_COMMON_ACTIONS'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getCountryLabelDynamic]
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
    data: countryData,
    searchFields: ['countryId', 'description'],
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
    [localHandleRowsPerPageChange, updatePagination]
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

  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: CountryTableData, _index: number) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `country: ${row.description || row.countryId || 'this country'}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteCountryMutation.mutateAsync(String(row.id))
            refreshCountries()
          } catch (error) {
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [deleteCountryMutation, confirmDelete, isDeleting, refreshCountries]
  )

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: CountryTableData, _index: number) => {
      const dataIndex = countryData.findIndex((item) => item.id === row.id)
      setEditingItem(row)
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null)
      setPanelMode('edit')
      setIsPanelOpen(true)
    },
    [countryData]
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
      await downloadTemplate('CountryTemplate.xlsx')
    } catch {
      // Error handling is done by the hook
      // Could add toast notification here if needed
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshCountries()
    setIsUploadDialogOpen(false)
  }, [refreshCountries])

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
    // Error is handled by UploadDialog component
  }, [])

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: CountryTableData, _index: number) => {
      confirmApprove({
        itemName: `country: ${row.description}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: 'COUNTRY',
              moduleName: 'COUNTRY',
              actionKey: 'APPROVE',
              payloadJson: row as Record<string, unknown>,
            })
            refreshCountries()
          } catch (error) {
            throw error
          }
        },
      })
    },
    [confirmApprove, createWorkflowRequest, refreshCountries]
  )

  const handleCountryAdded = useCallback(() => {
    refreshCountries()
    handleClosePanel()
  }, [handleClosePanel, refreshCountries])

  const handleCountryUpdated = useCallback(() => {
    refreshCountries()
    handleClosePanel()
  }, [handleClosePanel, refreshCountries])

  const renderExpandedContent = useCallback(
    (row: CountryTableData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getCountryLabelDynamic('CDL_MCNT_ID')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.countryId || row.uuid || `CNT-${row.id}` || '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getCountryLabelDynamic('CDL_MCNT_DESCRIPTION')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.description || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Active:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.active ? 'Yes' : 'No'}
              </span>
            </div>
            {row.taskStatusDTO && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Task Status:
                </span>
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                  {row.taskStatusDTO.name || '-'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    [getCountryLabelDynamic]
  )


  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="country"
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
          {countriesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : countriesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                Error loading countries. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<CountryTableData>
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
                onRowApprove={handleRowApprove}
                onRowEdit={handleRowEdit}
                // deletePermissions={['country_delete']}
                deletePermissions={['*']}
                // editPermissions={['country_update']}
                editPermissions={['*']}
                // approvePermissions={['country_approve']}
                approvePermissions={['*']}
                updatePermissions={['country_update']}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <RightSlideCountryPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onCountryAdded={handleCountryAdded}
          onCountryUpdated={handleCountryUpdated}
          mode={panelMode === 'approve' ? 'edit' : panelMode}
          actionData={editingItem}
          {...(editingItemIndex !== null && {
            countryIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Country Data"
          entityType="country"
        />
      )}
    </>
  )
}

const CountryPage: React.FC = () => {
  return <CountryPageClient />
}

export default CountryPage
