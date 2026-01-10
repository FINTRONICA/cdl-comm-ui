'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { GlobalLoading } from '@/components/atoms'
import { RightSlideBusinessSubSegmentPanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideBusinessSubSegmentPanel'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import {
  useBusinessSubSegments,
  useDeleteBusinessSubSegment,
  useRefreshBusinessSegments,
} from '@/hooks/master/CustomerHook/useBusinessSubSegment'
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from '@/store/confirmationDialogStore'
import { useCreateWorkflowRequest } from '@/hooks/workflow'

interface BusinessSubSegmentData extends Record<string, unknown> {
  id: number
  businessSubSegmentId?: string
  uuid?: string
  businessSubSegmentName: string
  businessSubSegmentDescription: string
  businessSegmentNameDTO: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
}

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
]

const BusinessSubSegmentPageClient = dynamic(
  () => Promise.resolve(BusinessSubSegmentPageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
)

const BusinessSubSegmentPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'approve'>('add')
  const [editingItem, setEditingItem] = useState<BusinessSubSegmentData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<{ name?: string }>({})

  // API hooks
  const {
    data: businessSubSegmentsResponse,
    isLoading: businessSubSegmentsLoading,
    error: businessSubSegmentsError,
    updatePagination,
    apiPagination,
  } = useBusinessSubSegments(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteBusinessSubSegmentMutation = useDeleteBusinessSubSegment()
  const confirmDelete = useDeleteConfirmation()
  const confirmApprove = useApproveConfirmation()
  const createWorkflowRequest = useCreateWorkflowRequest()
  const refreshBusinessSubSegments = useRefreshBusinessSegments()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const businessSubSegmentData = useMemo(() => {
        if (!businessSubSegmentsResponse?.content) return []
    return businessSubSegmentsResponse.content.map((businessSubSegment) => ({
      id: businessSubSegment.id,
      businessSubSegmentId: businessSubSegment.uuid || `MBSS-${businessSubSegment.id}`,
      uuid: businessSubSegment.uuid,
      businessSubSegmentName: businessSubSegment.subSegmentName || '',
      businessSubSegmentDescription: businessSubSegment.subSegmentDescription || '',
      businessSegmentNameDTO: businessSubSegment.businessSegmentNameDTO?.segmentName || businessSubSegment.businessSegmentNameDTO?.id?.toString() || '-',
      active: businessSubSegment.active,
      enabled: businessSubSegment.enabled,
      deleted: businessSubSegment.deleted,
    })) as BusinessSubSegmentData[]
  }, [businessSubSegmentsResponse])

  const getBusinessSubSegmentLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'businessSubSegmentId',
      label: getBusinessSubSegmentLabelDynamic('CDL_MBSS_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'businessSubSegmentName',
      label: getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME'),
      type: 'text' as const,
      width: 'w-56',
      sortable: true,
    },
    {
      key: 'businessSubSegmentDescription',
      label: getBusinessSubSegmentLabelDynamic('CDL_MBSS_DESCRIPTION'),
      type: 'text' as const,
      width: 'w-65',
      sortable: true,
    },
    {
      key: 'businessSegmentNameDTO',
      label: getBusinessSubSegmentLabelDynamic('CDL_MBS_NAME'),
      type: 'text' as const,
      width: 'w-56',
      sortable: true,
    },
    {
      key: 'status',
      label: getBusinessSubSegmentLabelDynamic('CDL_COMMON_STATUS'),
      type: 'status' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'actions',
      label: getBusinessSubSegmentLabelDynamic('CDL_COMMON_ACTIONS'),
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
    data: businessSubSegmentData,
    searchFields: ['businessSubSegmentId', 'businessSubSegmentName', 'businessSubSegmentDescription'],
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

  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: BusinessSubSegmentData, _index: number) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `business sub segment: ${row.businessSubSegmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteBusinessSubSegmentMutation.mutateAsync(String(row.id))
            refreshBusinessSubSegments()
          } catch (error) {
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [deleteBusinessSubSegmentMutation, confirmDelete, isDeleting, refreshBusinessSubSegments]
  )

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: BusinessSubSegmentData, _index: number) => {
      const dataIndex = businessSubSegmentData.findIndex((item) => item.id === row.id)
      setEditingItem(row)
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null)
      setPanelMode('edit')
      setIsPanelOpen(true)
    },
    [businessSubSegmentData]
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
      await downloadTemplate('BusinessSubSegmentTemplate.xlsx')
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshBusinessSubSegments()
    setIsUploadDialogOpen(false)
  }, [refreshBusinessSubSegments])

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
    // Error is handled by UploadDialog component
  }, [])

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: BusinessSubSegmentData, _index: number) => {
      confirmApprove({
        itemName: `business sub segment: ${row.businessSubSegmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: 'BUSINESS_SUB_SEGMENT',
              moduleName: 'BUSINESS_SUB_SEGMENT',
              actionKey: 'APPROVE',
              payloadJson: row as Record<string, unknown>,
            })
            refreshBusinessSubSegments()
          } catch (error) {
            throw error
          }
        },
      })
    },
    [confirmApprove, createWorkflowRequest, refreshBusinessSubSegments]
  )

  const handleBusinessSubSegmentAdded = useCallback(() => {
      refreshBusinessSubSegments()
    handleClosePanel()
  }, [handleClosePanel, refreshBusinessSubSegments])

  const handleBusinessSubSegmentUpdated = useCallback(() => {
    refreshBusinessSubSegments()
    handleClosePanel()
  }, [handleClosePanel, refreshBusinessSubSegments])

  const renderExpandedContent = (row: BusinessSubSegmentData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getBusinessSubSegmentLabelDynamic('CDL_MBSS_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSubSegmentId || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSubSegmentName || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getBusinessSubSegmentLabelDynamic('CDL_MBS_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSegmentNameDTO || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getBusinessSubSegmentLabelDynamic('CDL_MBSS_DESCRIPTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSubSegmentDescription || '-'}
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
              entityType="businessSubSegment"
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
          {businessSubSegmentsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : businessSubSegmentsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading business sub segments. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<BusinessSubSegmentData>
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
                onRowApprove={handleRowApprove}
                onRowEdit={handleRowEdit}
                // deletePermissions={['business_sub_segment_delete']}
                deletePermissions={['*']}
                // editPermissions={['business_sub_segment_update']}
                editPermissions={['*']}
                // approvePermissions={['business_sub_segment_approve']}
                approvePermissions={['*']}
                updatePermissions={['business_sub_segment_update']}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <RightSlideBusinessSubSegmentPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onBusinessSubSegmentAdded={handleBusinessSubSegmentAdded}
          onBusinessSubSegmentUpdated={handleBusinessSubSegmentUpdated}
          mode={panelMode === 'approve' ? 'edit' : panelMode}
          actionData={editingItem as unknown as import('@/services/api/masterApi/Customer/businessSubSegmentService').BusinessSubSegment | null}
          {...(editingItemIndex !== null && {
            businessSubSegmentIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Business Segment Data"
          entityType="businessSegment"
        />
      )}
    </>
  )
}

const BusinessSubSegmentPage: React.FC = () => {
  return <BusinessSubSegmentPageClient />
}

export default BusinessSubSegmentPage
