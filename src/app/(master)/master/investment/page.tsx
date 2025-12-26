'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { GlobalLoading } from '@/components/atoms'
import { RightSlideInvestmentTypePanel } from '@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideInvestmentTypePanel'
import type { Investment } from '@/services/api/masterApi/Customer/investmentService'
import {
  useInvestments,
  useDeleteInvestment,
  useRefreshInvestments,
} from '@/hooks/master/CustomerHook/useInvestment'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { UploadDialog } from '@/components/molecules/UploadDialog'
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from '@/store/confirmationDialogStore'
import { useCreateWorkflowRequest } from '@/hooks/workflow'

interface InvestmentData extends Record<string, unknown> {
  id: number
  investmentId?: string
  uuid?: string
  investmentName: string
  investmentDescription: string
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

const InvestmentPageClient = dynamic(
  () => Promise.resolve(InvestmentPageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
)

const InvestmentPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'approve'>('add')
  const [editingItem, setEditingItem] = useState<InvestmentData | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [searchFilters] = useState<{ name?: string }>({})

  // API hooks
  const {
    data: investmentsResponse,
    isLoading: investmentsLoading,
    error: investmentsError,
    updatePagination,
    apiPagination,
  } = useInvestments(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  )

  const deleteInvestmentMutation = useDeleteInvestment()
  const confirmDelete = useDeleteConfirmation()
  const confirmApprove = useApproveConfirmation()
  const createWorkflowRequest = useCreateWorkflowRequest()
  const refreshInvestments = useRefreshInvestments()
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Transform API data to table format
  const investmentData = useMemo(() => {
    if (!investmentsResponse?.content) return []
    return investmentsResponse.content.map((investment: Investment) => ({
      id: investment.id,
      investmentId: investment.uuid || `INV-${investment.id}`,
      uuid: investment.uuid,
      investmentName: investment.investmentName,
      investmentDescription: investment.investmentDescription,
      active: investment.active,
      enabled: investment.enabled,
      deleted: investment.deleted,
    })) as InvestmentData[]
  }, [investmentsResponse])

  const getInvestmentLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'investmentId',
      label: getInvestmentLabelDynamic('CDL_MI_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'investmentName',
      label: getInvestmentLabelDynamic('CDL_MI_NAME'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'investmentDescription',
      label: getInvestmentLabelDynamic('CDL_MI_DESCRIPTION'),
      type: 'text' as const,
      width: 'w-96',
      sortable: true,
    },
    {
      key: 'status',
      label: getInvestmentLabelDynamic('CDL_MAP_STATUS'),
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
    data: investmentData,
    searchFields: ['investmentId', 'investmentName', 'investmentDescription'],
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
    (row: InvestmentData, _index: number) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `investment: ${row.investmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteInvestmentMutation.mutateAsync(String(row.id))
            refreshInvestments()
          } catch (error) {
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [deleteInvestmentMutation, confirmDelete, isDeleting, refreshInvestments]
  )

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: InvestmentData, _index: number) => {
      const dataIndex = investmentData.findIndex((item) => item.id === row.id)
      setEditingItem(row)
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null)
      setPanelMode('edit')
      setIsPanelOpen(true)
    },
    [investmentData]
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
      await downloadTemplate('InvestmentTemplate.xlsx')
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate])

  const handleUploadSuccess = useCallback(() => {
    refreshInvestments()
    setIsUploadDialogOpen(false)
  }, [refreshInvestments])

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
    // Error is handled by UploadDialog component
  }, [])

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: InvestmentData, _index: number) => {
      confirmApprove({
        itemName: `investment: ${row.investmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: 'INVESTMENT',
              moduleName: 'INVESTMENT',
              actionKey: 'APPROVE',
              payloadJson: row as Record<string, unknown>,
            })
            refreshInvestments()
          } catch (error) {
            throw error
          }
        },
      })
    },
    [confirmApprove, createWorkflowRequest, refreshInvestments]
  )

  const handleInvestmentAdded = useCallback(() => {
    refreshInvestments()
    handleClosePanel()
  }, [handleClosePanel, refreshInvestments])

  const handleInvestmentUpdated = useCallback(() => {
    refreshInvestments()
    handleClosePanel()
  }, [handleClosePanel, refreshInvestments])

  const renderExpandedContent = (row: InvestmentData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getInvestmentLabelDynamic('CDL_MI_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.investmentId || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getInvestmentLabelDynamic('CDL_MI_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.investmentName || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getInvestmentLabelDynamic('CDL_MI_DESCRIPTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.investmentDescription || '-'}
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
            entityType="investmentType"
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
          {investmentsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : investmentsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading investments. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<InvestmentData>
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
                // deletePermissions={['investment_delete']}
                deletePermissions={['*']}
                // editPermissions={['investment_update']}
                editPermissions={['*']}
                // approvePermissions={['investment_approve']}
                approvePermissions={['*']}
                updatePermissions={['investment_update']}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <RightSlideInvestmentTypePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onInvestmentAdded={handleInvestmentAdded}
          onInvestmentUpdated={handleInvestmentUpdated}
          mode={panelMode === 'approve' ? 'edit' : panelMode}
          actionData={editingItem as Investment | null}
          {...(editingItemIndex !== null && {
            investmentIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Investment Data"
          entityType="investment"
        />
      )}
    </>
  )
}

const InvestmentPage: React.FC = () => {
  return <InvestmentPageClient />
}

export default InvestmentPage
