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
import { RightSlideProductProgramPanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideProductProgramPanel'
import {
  useProductPrograms,
  useDeleteProductProgram,
  useRefreshProductPrograms,
} from '@/hooks/master/CustomerHook/useProductProgram'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import { ProductProgram } from '@/services/api/masterApi/Customer/productProgramService'

interface ProductProgramData extends Record<string, unknown> {
  id: number
  productProgramId?: string
  uuid?: string
  productProgramName: string
  productProgramDescription: string
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

export const ProductProgramPageClient = dynamic(
  () => Promise.resolve(ProductProgramPageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
)

const ProductProgramPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<ProductProgramData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<ProductProgramData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<{ name?: string }>({})

  // API hooks
  const {
        data: productProgramsResponse,
    isLoading: productProgramsLoading,
    error: productProgramsError,
    updatePagination,
    apiPagination,
  } = useProductPrograms(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const AgreementSegmentPageClient = dynamic(
    () => Promise.resolve(AgreementSegmentPageImpl),
    {
      ssr: false,
      loading: () => (
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      ),
    }
  )
  const deleteProductProgramMutation = useDeleteProductProgram()
  const refreshProductPrograms = useRefreshProductPrograms()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const productProgramData = useMemo(() => {
    if (!productProgramsResponse?.content) return []
    return productProgramsResponse.content.map((productProgram: ProductProgram) => ({
      id: productProgram.id,
      productProgramId: productProgram.uuid || `MPP-${productProgram.id}`,
      uuid: productProgram.uuid,
      productProgramName: productProgram.programName,
      productProgramDescription: productProgram.programDescription,
      active: productProgram.active,
      enabled: productProgram.enabled,
      deleted: productProgram.deleted,
      status: productProgram.active ? 'ACTIVE' : 'INACTIVE',
    })) as ProductProgramData[]
  }, [productProgramsResponse])

  const getProductProgramLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'productProgramId',
      label: getProductProgramLabelDynamic('CDL_MPP_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'productProgramName',
      label: getProductProgramLabelDynamic('CDL_MPP_NAME'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'productProgramDescription',
      label: getProductProgramLabelDynamic('CDL_MPP_DESCRIPTION'),
      type: 'text' as const,
      width: 'w-96',
      sortable: true,
    },
    {
      key: 'status',
      label: getProductProgramLabelDynamic('CDL_MPP_STATUS'),
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
    data: productProgramData,
    searchFields: ['productProgramId', 'productProgramName', 'productProgramDescription'],
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
      await deleteProductProgramMutation.mutateAsync(String(deleteItem.id))
      refreshProductPrograms()
      setIsDeleteModalOpen(false)
      setDeleteItem(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error(`Failed to delete product program: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRowDelete = (row: ProductProgramData) => {
    if (isDeleting) return
    setDeleteItem(row)
    setIsDeleteModalOpen(true)
  }

  const handleRowEdit = (row: ProductProgramData) => {
    // Find index in the full data array (not just paginated)
    const index = productProgramData.findIndex((item) => item.id === row.id)
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
      await downloadTemplate('ProductProgramTemplate.xlsx')
    } catch (error) {
      console.error('Failed to download template:', error)
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshProductPrograms()
    setIsUploadDialogOpen(false)
  }, [refreshProductPrograms])

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error)
  }, [])

  const handleProductProgramAdded = useCallback(() => {
    refreshProductPrograms()
    handleClosePanel()
  }, [handleClosePanel, refreshProductPrograms])

  const handleProductProgramUpdated = useCallback(() => {
    refreshProductPrograms()
    handleClosePanel()
  }, [handleClosePanel, refreshProductPrograms])

  const renderExpandedContent = (row: ProductProgramData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getProductProgramLabelDynamic('CDL_MPP_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.productProgramId || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getProductProgramLabelDynamic('CDL_MPP_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.productProgramName || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
                {getProductProgramLabelDynamic('CDL_MPP_DESCRIPTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.productProgramDescription || '-'}
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
              entityType="productProgram"
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
          {productProgramsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : productProgramsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading product programs. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<ProductProgramData>
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
        title="Delete Product Program"
        message={`Are you sure you want to delete this product program: ${deleteItem?.productProgramName || ''}?`}
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
        <RightSlideProductProgramPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onProductProgramAdded={handleProductProgramAdded}
          onProductProgramUpdated={handleProductProgramUpdated}
          mode={panelMode}
          actionData={editingItem as ProductProgram | null}
          {...(editingItemIndex !== null && {
            productProgramIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Product Program Data"
          entityType="productProgram"
        />
      )}
    </>
  )
}

const ProductProgramPage: React.FC = () => {
  return <ProductProgramPageClient />
}

export default ProductProgramPage
