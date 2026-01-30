'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '../../../components/organisms/PermissionAwareDataTable'
import { useTableState } from '../../../hooks/useTableState'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { usePendingTransactionsUI } from '@/hooks'
import { usePendingTransactionLabelApi } from '@/hooks/usePendingTransactionLabelApi'
import { useDeletePendingTransaction } from '@/hooks/usePendingTransactions'
import { getPendingTransactionLabel } from '@/constants/mappings/pendingTransactionMapping'
import type {
  PendingTransactionUIData,
  PendingTransactionFilters,
} from '@/services/api/pendingTransactionService'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { GlobalLoading, GlobalError } from '@/components/atoms'

interface TransactionData extends Record<string, unknown> {
  id: number
  transactionId: string
  projectName: string
  projectRegulatorId: string
  tranReference: string
  tranDesc: string
  tranAmount: number
  tranDate: string
  narration: string
  tasMatch: string
  approvalStatus: string
}

const usePendingRows = (
  page: number,
  size: number,
  searchFilters?: Record<string, string>
) => {
  const filters = React.useMemo(() => {
    const baseFilters: PendingTransactionFilters = { isAllocated: false }
    
    // Convert search filters to API filters
    if (searchFilters) {
      // Only add filters if they have non-empty values
      if (searchFilters.transactionId && searchFilters.transactionId.trim()) {
        baseFilters.transactionId = searchFilters.transactionId.trim()
      }
      if (searchFilters.tranReference && searchFilters.tranReference.trim()) {
        baseFilters.referenceId = searchFilters.tranReference.trim()
      }
    }
    
    return baseFilters
  }, [searchFilters])
  
  const { data, isLoading, isFetching, error, refetch } = usePendingTransactionsUI(
    Math.max(0, page - 1),
    size,
    filters
  )

  const rows: TransactionData[] = useMemo(() => {
    if (!data?.content) {
      return []
    }

    const items: PendingTransactionUIData[] = data.content as PendingTransactionUIData[]

    return items.map((ui: PendingTransactionUIData) => {
      return {
        id: Number(ui.id),
        transactionId: ui.transactionId || '—',
        projectName: ui.projectName || '—',
        projectRegulatorId: ui.projectRegulatorId || '—',
        tranReference: ui.referenceId || '—',
        tranDesc: ui.description || 'TRANSFER',
        tranAmount: Number(ui.amount || '0'),
        tranDate: ui.transactionDate
          ? new Date(ui.transactionDate).toLocaleDateString('en-GB')
          : '',
        narration: ui.narration || '—',
        tasMatch: ui.tasUpdate || '—',
        approvalStatus:
          (ui.taskStatusDTO && typeof ui.taskStatusDTO === 'object' && 'name' in ui.taskStatusDTO
            ? String(ui.taskStatusDTO.name)
            : null) ||
          mapPaymentStatusToApprovalStatus(ui.paymentStatus || '') ||
          '—',
      }
    })
  }, [data])

  const total = data?.page?.totalElements || 0
  const totalPages = data?.page?.totalPages || 1

  return { rows, total, totalPages, isLoading, isFetching, error, refetch }
}

const mapPaymentStatusToApprovalStatus = (paymentStatus: string): string => {
  // Fallback mapping when taskStatusDTO is not available
  switch (paymentStatus?.toUpperCase()) {
    case 'PENDING':
      return 'PENDING'
    case 'INCOMPLETE':
      return 'INITIATED'
    case 'IN_REVIEW':
    case 'REVIEW':
      return 'IN_PROGRESS'
    case 'REJECTED':
    case 'FAILED':
      return 'REJECTED'
    case 'APPROVED':
    case 'SUCCESS':
      return 'APPROVED'
    default:
      return 'INITIATED'
  }
}

const UnallocatedTransactionPage: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  // Template download hook
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Template download handler
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.SPLIT)
    } catch {
      // Error handled silently
    }
  }

  const [isDeleting, setIsDeleting] = useState(false)

  const { getLabelResolver } = useSidebarConfig()
  const unallocatedTitle = getLabelResolver
    ? getLabelResolver('unallocated', 'Unallocated')
    : 'Unallocated'
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = usePendingTransactionLabelApi()

  const getTransactionLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, 'EN')

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getPendingTransactionLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi]
  )

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  // Initialize search state first
  const [search, setSearch] = useState<Record<string, string>>(() => ({
    transactionId: '',
    tranReference: '',
    projectName: '',
    projectRegulatorId: '',
    tranDesc: '',
    narration: '',
    tranDate: '',
    approvalStatus: '',
  }))

  const handleSearchChange = React.useCallback((field: string, value: string) => {
    setSearch((prev) => {
      const newSearch = { ...prev, [field]: value }
      return newSearch
    })
    // Reset to page 1 when search changes
    setCurrentApiPage(1)
  }, [])

  // Convert search state to API filters for transactionId and tranReference
  const apiSearchFilters = React.useMemo(() => {
    const hasSearch = Object.values(search).some((v) => typeof v === 'string' && v?.trim())
    if (!hasSearch) return undefined
    
    const searchFilters: Record<string, string> = {}
    
    // Check if search is specifically for transactionId or tranReference
    if (search.transactionId && typeof search.transactionId === 'string' && search.transactionId.trim()) {
      searchFilters.transactionId = search.transactionId.trim()
    }
    if (search.tranReference && typeof search.tranReference === 'string' && search.tranReference.trim()) {
      searchFilters.tranReference = search.tranReference.trim()
    }
    
    return Object.keys(searchFilters).length > 0 ? searchFilters : undefined
  }, [search])

  // Fetch data with API filters when searching by transactionId or tranReference
  const {
    rows: apiRows,
    total: apiTotal,
    totalPages: apiTotalPages,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePendingRows(currentApiPage, currentApiSize, apiSearchFilters)

  const deleteMutation = useDeletePendingTransaction()
  const confirmDelete = useDeleteConfirmation()

  // Determine if we're using API search
  const isApiSearch = React.useMemo(() => {
    return !!apiSearchFilters && (
      !!apiSearchFilters.transactionId || 
      !!apiSearchFilters.tranReference
    )
  }, [apiSearchFilters])

  // Apply client-side filtering for all search fields
  const filteredRows = React.useMemo(() => {
    const hasSearch = Object.values(search).some((v) => typeof v === 'string' && v?.trim())
    if (!hasSearch) return apiRows
    
    // Filter all rows based on search criteria
    // Note: If API search is active, apiRows is already filtered by API for transactionId/tranReference
    // We just need to apply additional client-side filters for other fields
    return apiRows.filter((row) => {
      // Get all field values in lowercase for comparison
      const transactionId = String(row.transactionId || '').toLowerCase()
      const tranReference = String(row.tranReference || '').toLowerCase()
      const projectName = String(row.projectName || '').toLowerCase()
      const projectRegulatorId = String(row.projectRegulatorId || '').toLowerCase()
      const tranDesc = String(row.tranDesc || '').toLowerCase()
      const narration = String(row.narration || '').toLowerCase()
      const tranDate = String(row.tranDate || '').toLowerCase()
      // Normalize status value - remove extra spaces and convert to uppercase for consistent matching
      const approvalStatus = String(row.approvalStatus || '').trim().toUpperCase()
      
      // Get search values
      const searchTransactionId = search.transactionId?.trim().toLowerCase() || ''
      const searchTranReference = search.tranReference?.trim().toLowerCase() || ''
      const searchProjectName = search.projectName?.trim().toLowerCase() || ''
      const searchProjectRegulatorId = search.projectRegulatorId?.trim().toLowerCase() || ''
      const searchTranDesc = search.tranDesc?.trim().toLowerCase() || ''
      const searchNarration = search.narration?.trim().toLowerCase() || ''
      const searchTranDate = search.tranDate?.trim().toLowerCase() || ''
      // Normalize status search value - convert to uppercase for consistent matching
      const searchApprovalStatus = search.approvalStatus?.trim().toUpperCase() || ''
      
      // Match each field - if search is empty, it matches (no filter for that field)
      const transactionIdMatch = !searchTransactionId || transactionId.includes(searchTransactionId)
      const tranReferenceMatch = !searchTranReference || tranReference.includes(searchTranReference)
      const projectNameMatch = !searchProjectName || projectName.includes(searchProjectName)
      const projectRegulatorIdMatch = !searchProjectRegulatorId || projectRegulatorId.includes(searchProjectRegulatorId)
      const tranDescMatch = !searchTranDesc || tranDesc.includes(searchTranDesc)
      const narrationMatch = !searchNarration || narration.includes(searchNarration)
      
      // Date field - use substring matching (e.g., "05/12" matches "05/12/2025")
      // Also handle different date formats (DD/MM, DD/MM/YYYY, etc.)
      const tranDateMatch = !searchTranDate || tranDate.includes(searchTranDate)
      
      // Status field - use exact match (case-insensitive) for status dropdown
      // Normalize both values to uppercase for consistent comparison
      const approvalStatusMatch = !searchApprovalStatus || 
        approvalStatus === searchApprovalStatus
      
      // All non-empty search fields must match
      return transactionIdMatch && 
             tranReferenceMatch && 
             projectNameMatch && 
             projectRegulatorIdMatch && 
             tranDescMatch && 
             narrationMatch &&
             tranDateMatch &&
             approvalStatusMatch
    })
  }, [apiRows, search])

  const hasActiveSearch = React.useMemo(() => {
    return Object.values(search).some((v) => typeof v === 'string' && v?.trim())
  }, [search])

  // Use useTableState for pagination and other table features
  const {
    paginated,
    startItem,
    endItem,
    page: localPage,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handlePageChange: localHandlePageChange,
    handleRowsPerPageChange: localHandleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    handleSort,
    sortConfig,
  } = useTableState({
    data: filteredRows,
    searchFields: [], // We handle search manually, so no fields here
    initialRowsPerPage: currentApiSize,
  })

  const finalTotalRows = hasActiveSearch && !isApiSearch
    ? filteredRows.length
    : apiTotal
  const finalTotalPages = hasActiveSearch && !isApiSearch
    ? Math.ceil(filteredRows.length / rowsPerPage)
    : apiTotalPages

  const handlePageChange = (newPage: number) => {
    if (hasActiveSearch && !isApiSearch) {
      // Client-side search - use local pagination
      localHandlePageChange(newPage)
    } else {
      // API search or no search - use API pagination
      setCurrentApiPage(newPage)
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1)
    localHandleRowsPerPageChange(newRowsPerPage)
  }

  const effectiveTotalRows = finalTotalRows
  const effectiveTotalPages = finalTotalPages
  const effectivePage = hasActiveSearch && !isApiSearch
    ? localPage
    : currentApiPage

  // Calculate effective startItem and endItem based on pagination type
  const effectiveStartItem = hasActiveSearch && !isApiSearch
    ? startItem
    : (currentApiPage - 1) * currentApiSize + 1
  const effectiveEndItem = hasActiveSearch && !isApiSearch
    ? endItem
    : Math.min(currentApiPage * currentApiSize, apiTotal)

  const tableColumns = [
    {
      key: 'transactionId',
      label: getTransactionLabelDynamic('CDL_UNRECONCILED_TRANSACTION_ID'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      copyable: true,
    },
    {
      key: 'tranReference',
      label: getTransactionLabelDynamic('CDL_TRAN_REFNO'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      copyable: true,
    },
    {
      key: 'tranDesc',
      label: getTransactionLabelDynamic('CDL_TRAN_DESC'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      copyable: true,
    },
    {
      key: 'tranAmount',
      label: getTransactionLabelDynamic('CDL_TRAN_AMOUNT'),
      type: 'custom' as const,
      width: 'w-40',
      sortable: true,
      copyable: true,
    },
    {
      key: 'tranDate',
      label: getTransactionLabelDynamic('CDL_TRAN_DATE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      copyable: true,
    },
    {
      key: 'narration',
      label: getTransactionLabelDynamic('CDL_TRAN_NOTES'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
      copyable: true,
    },
    {
      key: 'tasMatch',
      label: getTransactionLabelDynamic('CDL_TRAN_TAS_STATUS'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      copyable: true,
    },
    {
      key: 'approvalStatus',
      label: getTransactionLabelDynamic('CDL_TRAN_STATUS'),
      type: 'status' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'actions',
      label: getTransactionLabelDynamic('CDL_TRAN_ACTION'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const statusOptions = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'DRAFT',
    'INITIATED',
  ]

  const handleRowView = (row: TransactionData) => {
    router.push(`/transactions/unallocated/${row.id}`)
  }

  const handleRowDelete = (row: TransactionData) => {
    if (isDeleting) {
      return
    }

    confirmDelete({
      itemName: `transaction: ${row.tranReference}`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          await deleteMutation.mutateAsync(String(row.id))
        } catch (error) {
          throw error // Re-throw to keep dialog open on error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  const handleRowClick = (row: TransactionData) => {
    router.push(`/transactions/unallocated/${row.id}`)
  }

  const renderCustomCell = (column: string, value: unknown) => {
    if (column === 'tranAmount' && typeof value === 'number') {
      return `${formatNumber(value)}`
    }
    return String(value || '')
  }

  const renderExpandedContent = (row: TransactionData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Transaction Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Project Name:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.projectName}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Project Regulator ID:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.projectRegulatorId}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Transaction Reference:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.tranReference}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Transaction Description:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.tranDesc}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Transaction Amount:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {formatNumber(row.tranAmount)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Transaction Date:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.tranDate}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Narration:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.narration}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">TAS Match:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.tasMatch}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400"> Status:</span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
              {row.approvalStatus}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Transaction Actions
        </h4>
        <div className="space-y-3">
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            View Transaction Details
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            Allocate Transaction
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            Download Transaction Report
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
            Export Transaction Data
          </button>
        </div>
      </div>
    </div>
  )

  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshLoading = isRefreshing || isFetching
  const showRefreshOverlay = isRefreshLoading

  const handleRefresh = React.useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refetch])

  if (isLoading || labelsLoading || isFetching) {
    return (
      <DashboardLayout title={unallocatedTitle}>
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error || labelsError) {
    return (
      <DashboardLayout title={unallocatedTitle}>
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalError 
            error={error?.message || labelsError || 'Unknown error'} 
            onRetry={() => window.location.reload()}
            title="Error loading unallocated transactions"
            fullHeight
          />
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

      <DashboardLayout title={unallocatedTitle}>
          <div className="relative flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          {showRefreshOverlay && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 px-4 py-2 rounded-md shadow bg-white/90 dark:bg-gray-900/90">
                <span className="w-5 h-5 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Loading...
                </span>
              </div>
            </div>
          )}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
            <PageActionButtons
              entityType="pendingPayment"
              onRefresh={handleRefresh}
              isRefreshing={isRefreshLoading}
              showButtons={{
                downloadTemplate: false,
                uploadDetails: false,
                addNew: false,
                refresh: true,
              }}
            />
          </div>

          <PermissionAwareDataTable<TransactionData>
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
            onRowView={handleRowView}
            onRowDelete={handleRowDelete}
            onRowClick={handleRowClick}
            renderCustomCell={renderCustomCell}
            deletePermissions={['pending_tran_delete']}
            viewPermissions={['pending_tran_view']}
            updatePermissions={['pending_tran_update']}
            showDeleteAction={true}
            showViewAction={true}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      </DashboardLayout>
    </>
  )
}

export default UnallocatedTransactionPage
