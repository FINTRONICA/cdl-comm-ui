'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const PartiesPageClient = dynamic(
  () => Promise.resolve(PartiesPageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
)

import { useCallback, useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { usePartyLabelsWithCache } from '@/hooks/master/CustomerHook/usePartyLabelsWithCache'
import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { useAppStore } from '@/store'
import { GlobalLoading } from '@/components/atoms'
import {
  useParties,
  useDeleteParty,
  PARTIES_QUERY_KEY,
} from '@/hooks/master/CustomerHook/useParty'
import {
  mapPartyToUIData,
  type PartyUIData,
  type Party,
} from '@/services/api/masterApi/Customer/partyService'
import type { PartyFilters } from '@/services/api/masterApi/Customer/partyService'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { useRouter } from 'next/navigation'

interface PartyData extends PartyUIData, Record<string, unknown> { }

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
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
          Failed to load parties
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

const PartiesPageImpl: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tableKey, setTableKey] = useState(0)

  const currentLanguage = useAppStore((state) => state.language)
  const queryClient = useQueryClient()

  const {
    downloadTemplate,
    isLoading: isDownloading,
    error: downloadError,
    clearError,
  } = useTemplateDownload()

  const { data: partyLabels, getLabel } =
    usePartyLabelsWithCache()

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [filters] = useState<PartyFilters>({})

  const {
    data: apiResponse,
    isLoading: partiesLoading,
    error: partiesError,
    refetch: refetchParties,
    updatePagination,
    apiPagination,
  } = useParties(Math.max(0, currentApiPage - 1), currentApiSize, filters)

  const deleteMutation = useDeleteParty()
  const confirmDelete = useDeleteConfirmation()

  const partiesData = useMemo(() => {
    if (apiResponse?.content && Array.isArray(apiResponse.content)) {
      return apiResponse.content.map((item: Party) =>
        mapPartyToUIData(item)
      ) as PartyData[]
    }
    return []
  }, [apiResponse])

  const getPartyLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPartyLabel(configId)

      if (partyLabels) {
        return getLabel(configId, currentLanguage || 'EN', fallback)
      }
      return fallback
    },
    [partyLabels, currentLanguage, getLabel]
  )

  const tableColumns = useMemo(
    () => [
      {
        key: 'partyFullName',
        label: getPartyLabelDynamic('CDL_MP_PARTY_NAME'),
        type: 'text' as const,
        width: 'w-40',
        sortable: true,
      },
      {
        key: 'id',
        label: getPartyLabelDynamic('CDL_MP_PARTY_ID'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
      },
      {
        key: 'partyCifNumber',
        label: getPartyLabelDynamic('CDL_MP_PARTY_CIF_NUMBER'),
        type: 'text' as const,
        width: 'w-40',
        sortable: true,
      },
      {
        key: 'emailAddress',
        label: getPartyLabelDynamic('CDL_MP_PARTY_EMAIL'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
      },
      {
        key: 'status',
        label: getPartyLabelDynamic('CDL_COMMON_STATUS'),
        type: 'status' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'actions',
        label: getPartyLabelDynamic('CDL_COMMON_ACTION'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getPartyLabelDynamic]
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
    data: partiesData,
    searchFields: [
      'partyFullName',
      'id',
      'partyCifNumber',
      'emailAddress',
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
    [search, currentApiSize, localHandlePageChange, updatePagination]
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

  const actionButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    icon?: string
    iconAlt?: string
  }> = []

  const handleRowDelete = useCallback(
    (row: PartyData) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `party: ${row.partyFullName}`,
        itemId: row.id,
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteMutation.mutateAsync(row.id)
            await new Promise((resolve) => setTimeout(resolve, 500))
            await queryClient.invalidateQueries({
              queryKey: [PARTIES_QUERY_KEY],
            })
            updatePagination(Math.max(0, currentApiPage - 1), currentApiSize)
            setTableKey((prev) => prev + 1)
          } catch (error) {
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [
      isDeleting,
      confirmDelete,
      deleteMutation,
      queryClient,
      updatePagination,
      currentApiPage,
      currentApiSize,
    ]
  )

  const handleRowView = useCallback(
    (row: PartyData) => {
      router.push(`/master/party/${row.id}/step/1?mode=view`)
    },
    [router]
  )

  const handleRowEdit = useCallback(
    (row: PartyData) => {
      router.push(`/master/party/${row.id}/step/1?editing=true`)
    },
    [router]
  )

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.BUILD_PARTNER)
    } catch {
      // Silently handle download errors
    }
  }, [downloadTemplate])

  const renderExpandedContent = useCallback(
    () => <div className="grid grid-cols-2 gap-8"></div>,
    []
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
        {partiesLoading ? (
          <LoadingSpinner />
        ) : partiesError ? (
          <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
            <ErrorMessage
              error={partiesError}
              onRetry={refetchParties}
            />
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-gray-800/80 rounded-t-2xl">
              <PageActionButtons
                entityType="party"
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
                <PermissionAwareDataTable<PartyData>
                  key={`parties-table-${tableKey}`}
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
                  deletePermissions={['master_party_delete']}
                  viewPermissions={['master_party_view']}
                  editPermissions={['master_party_update']}
                  updatePermissions={['master_party_update']}
                  showDeleteAction={true}
                  showViewAction={true}
                  showEditAction={true}
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

const PartiesPage: React.FC = () => {
  return <PartiesPageClient />
}

export default PartiesPage
