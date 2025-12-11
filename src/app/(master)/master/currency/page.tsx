'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useState, useMemo } from 'react'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { GlobalLoading } from '@/components/atoms'
import { CommentModal } from '@/components/molecules'
import { RightSlideCurrencyPanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideCurrency'
import {
  useCurrencies,
  useDeleteCurrency,
  useRefreshCurrencies,
} from '@/hooks/master/CustomerHook/useCurrency'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import { Currency } from '@/services/api/masterApi/Customer/currencyService'

interface CurrencyTableData extends Currency, Record<string, unknown> {
  currencyId?: string
  status?: string
}

export const CurrencyPageClient = dynamic(
  () => Promise.resolve(CurrencyPageImpl),
  {
    ssr: false,
  }
)

const CurrencyPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<CurrencyTableData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<CurrencyTableData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<{ description?: string }>({})

  // API hooks
  const {
    data: currenciesResponse,
    isLoading: currenciesLoading,
    error: currenciesError,
    updatePagination,
    apiPagination,
  } = useCurrencies(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteCurrencyMutation = useDeleteCurrency()
  const refreshCurrencies = useRefreshCurrencies()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const currencyData = useMemo(() => {
    if (!currenciesResponse?.content) return []
    return currenciesResponse.content.map((currency: Currency) => ({
      id: currency.id,
      uuid: currency.uuid,
      currencyId: currency.uuid || `MCUR-${currency.id}`,
      description: currency.description,
      isEnabled: currency.isEnabled,
      enabled: currency.enabled,
      deleted: currency.deleted,
      taskStatusDTO: currency.taskStatusDTO,
      status: currency.taskStatusDTO?.name || '',
    })) as CurrencyTableData[]
  }, [currenciesResponse])

  const getCurrencyLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const tableColumns = useMemo(
    () => [
      {
        key: 'currencyId',
        label: getCurrencyLabelDynamic('CDL_MCUR_ID'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
      },
      {
        key: 'description',
        label: getCurrencyLabelDynamic('CDL_MCUR_DESCRIPTION'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
      },
      {
        key: 'actions',
        label: getCurrencyLabelDynamic('CDL_COMMON_ACTIONS'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getCurrencyLabelDynamic]
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
    data: currencyData,
    searchFields: ['currencyId', 'description'],
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

  const confirmDelete = useCallback(async () => {
    if (isDeleting || !deleteItem) return

    setIsDeleting(true)
    try {
      await deleteCurrencyMutation.mutateAsync(String(deleteItem.id))
      refreshCurrencies()
      setIsDeleteModalOpen(false)
      setDeleteItem(null)
    } catch (error) {
      // Error is handled by the mutation's error state
      // User feedback is provided through the UI
    } finally {
      setIsDeleting(false)
    }
  }, [isDeleting, deleteItem, deleteCurrencyMutation, refreshCurrencies])

  const handleRowDelete = useCallback(
    (row: CurrencyTableData) => {
      if (isDeleting) return
      setDeleteItem(row)
      setIsDeleteModalOpen(true)
    },
    [isDeleting]
  )

  const handleRowEdit = useCallback(
    (row: CurrencyTableData) => {
      const index = currencyData.findIndex((item) => item.id === row.id)
      setEditingItem(row)
      setEditingItemIndex(index >= 0 ? index : null)
      setPanelMode('edit')
      setIsPanelOpen(true)
    },
    [currencyData]
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
      await downloadTemplate('CurrencyTemplate.xlsx')
    } catch (error) {
      // Error handling is done by the hook
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshCurrencies()
    setIsUploadDialogOpen(false)
  }, [refreshCurrencies])

  const handleUploadError = useCallback((error: string) => {
    // Error is displayed by the UploadDialog component
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Currency upload error:', error)
    }
  }, [])

  const handleCurrencyAdded = useCallback(() => {
    refreshCurrencies()
    handleClosePanel()
  }, [handleClosePanel, refreshCurrencies])

  const handleCurrencyUpdated = useCallback(() => {
    refreshCurrencies()
    handleClosePanel()
  }, [handleClosePanel, refreshCurrencies])

  const renderExpandedContent = useCallback(
    (row: CurrencyTableData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getCurrencyLabelDynamic('CDL_MCUR_ID')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.currencyId || row.uuid || `MCUR-${row.id}` || '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getCurrencyLabelDynamic('CDL_MCUR_DESCRIPTION')}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.description || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [getCurrencyLabelDynamic]
  )

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="currency"
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
          {currenciesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : currenciesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                Error loading currencies. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<CurrencyTableData>
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
        title="Delete Currency"
        message={`Are you sure you want to delete this currency: ${deleteItem?.description || ''}?`}
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
        <RightSlideCurrencyPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onCurrencyAdded={handleCurrencyAdded}
          onCurrencyUpdated={handleCurrencyUpdated}
          mode={panelMode}
          actionData={editingItem as Currency | null}
          {...(editingItemIndex !== null && {
            currencyIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Currency Data"
          entityType="currency"
        />
      )}
    </>
  )
}

const CurrencyPage: React.FC = () => {
  return <CurrencyPageClient />
}

export default CurrencyPage
