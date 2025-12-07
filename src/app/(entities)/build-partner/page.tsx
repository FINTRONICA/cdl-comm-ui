'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const DevelopersPageClient = dynamic(
  () => Promise.resolve(DevelopersPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
        <GlobalLoading fullHeight />
      </div>
    ),
  }
)

import { useCallback, useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '@/constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'
import { GlobalLoading } from '@/components/atoms'
import {
  useBuildPartners,
  useDeleteBuildPartner,
} from '@/hooks/useBuildPartners'
import {
  mapBuildPartnerToUIData,
  type BuildPartnerUIData,
} from '@/services/api/buildPartnerService'
import type { BuildPartnerFilters } from '@/services/api/buildPartnerService'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { useRouter } from 'next/navigation'

interface DeveloperData extends BuildPartnerUIData, Record<string, unknown> {}

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
    <div className="max-w-md w-full text-center">
      <div className="mb-8">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
          <svg
            className="h-12 w-12 text-red-600"
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Failed to load developers
        </h1>
        <p className="text-gray-600 mb-4">
          {error.message ||
            'An error occurred while loading the data. Please try again.'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-600 font-medium">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-4 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => <GlobalLoading fullHeight />

const DevelopersPageImpl: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentLanguage = useAppStore((state) => state.language)

  const {
    downloadTemplate,
    isLoading: isDownloading,
    error: downloadError,
    clearError,
  } = useTemplateDownload()

  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [filters] = useState<BuildPartnerFilters>({})

  const { getLabelResolver } = useSidebarConfig()

  const developersPageTitle = getLabelResolver
    ? getLabelResolver('developers', 'Developers')
    : 'Developers'

  const {
    data: apiResponse,
    isLoading: developersLoading,
    error: developersError,
    refetch: refetchDevelopers,
    updatePagination,
    apiPagination,
  } = useBuildPartners(Math.max(0, currentApiPage - 1), currentApiSize, filters)

  const deleteMutation = useDeleteBuildPartner()
  const confirmDelete = useDeleteConfirmation()

  const developersData = useMemo(() => {
    if (apiResponse?.content) {
      return apiResponse.content.map((item) =>
        mapBuildPartnerToUIData(item)
      ) as DeveloperData[]
    }
    return []
  }, [apiResponse])

  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)

      if (buildPartnerLabels) {
        return getLabel(configId, currentLanguage || 'EN', fallback)
      }
      return fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  const tableColumns = [
    {
      key: 'name',
      label: getBuildPartnerLabelDynamic('CDL_BP_NAME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'developerId',
      label: getBuildPartnerLabelDynamic('CDL_BP_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'developerCif',
      label: getBuildPartnerLabelDynamic('CDL_BP_CIF'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'localeNames',
      label: getBuildPartnerLabelDynamic('CDL_BP_NAME_LOCALE'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'status',
      label: getBuildPartnerLabelDynamic('CDL_BP_STATUS'),
      type: 'status' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'actions',
      label: getBuildPartnerLabelDynamic('CDL_BP_DOC_ACTION'),
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
    data: developersData,
    searchFields: [
      'name',
      'developerId',
      'developerCif',
      'localeNames',
      'status',
    ],
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

  const actionButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    icon?: string
    iconAlt?: string
  }> = []

  const handleRowDelete = (row: DeveloperData) => {
    if (isDeleting) {
      return
    }

    confirmDelete({
      itemName: `build partner: ${row.name}`,
      itemId: row.developerId,
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          await deleteMutation.mutateAsync(row.id)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete build partner: ${errorMessage}`)

          throw error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  const handleRowView = (row: DeveloperData) => {
    router.push(`/build-partner/${row.id}/step/1?mode=view`)
  }

  const handleRowEdit = (row: DeveloperData) => {
    router.push(`/build-partner/${row.id}/step/1?editing=true`)
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.BUILD_PARTNER)
    } catch (error) {}
  }

  const renderExpandedContent = () => (
    <div className="grid grid-cols-2 gap-8"></div>
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
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
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

      <DashboardLayout title={developersPageTitle}>
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          {/* Show loading state within the layout */}
          {developersLoading ? (
            <LoadingSpinner />
          ) : developersError ? (
            <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
              <ErrorMessage
                error={developersError}
                onRetry={refetchDevelopers}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 bg-white/75 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="developer"
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

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                  <PermissionAwareDataTable<DeveloperData>
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
                    deletePermissions={['bp_delete']}
                    viewPermissions={['bp_view']}
                    editPermissions={['bp_update']}
                    updatePermissions={['bp_update']}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  )
}

const DevelopersPage: React.FC = () => {
  return <DevelopersPageClient />
}

export default DevelopersPage
