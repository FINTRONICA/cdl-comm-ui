'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const DevelopersPageClient = dynamic(
  () => Promise.resolve(DevelopersPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        Loading...
      </div>
    ),
  }
)

import { useCallback, useState, useMemo } from 'react'
import { DashboardLayout } from '../../components/templates/DashboardLayout'
import { ExpandableDataTable } from '../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../hooks/useTableState'
import { getStatusCardConfig } from '../../utils/statusUtils'
import { StatusCards } from '../../components/molecules/StatusCards'
import { PageActionButtons } from '../../components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useBuildPartnerLabelsWithCache } from '../../hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '../../constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'
import { Spinner } from '@/components/atoms/Spinner'
import {
  useBuildPartners,
  useDeleteBuildPartner,
} from '@/hooks/useBuildPartners'
import {
  mapBuildPartnerToUIData,
  type BuildPartnerUIData,
} from '@/services/api/buildPartnerService'
import type {
  BuildPartner,
  BuildPartnerFilters,
} from '@/services/api/buildPartnerService'

// Define the developer data structure - now using BuildPartner interface
interface DeveloperData extends BuildPartnerUIData, Record<string, unknown> {}

const statusOptions = ['Approved', 'In Review', 'Rejected', 'Incomplete']

// Error component for API errors
const ErrorMessage: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full text-center">
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
          Failed to load developers
        </h1>
        <p className="text-gray-600 mb-4">
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

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      {/* <Spinner size="lg" /> */}
      <p className="text-gray-600">Loading123...</p>
    </div>
  </div>
)

// Empty state component
const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">No Data found</h3>
      <p className="mb-6 text-gray-600">
        There are no developers available at the moment.
      </p>
    </div>
  </div>
)

const DevelopersPageImpl: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language)

  // Fetch developer labels from BUILD_PARTNER API with localStorage cache
  const {
    data: buildPartnerLabels,
    isLoading: labelsLoading,
    error: labelsError,
    getLabel,
  } = useBuildPartnerLabelsWithCache()

  // API state management - currently using static data, but ready for API integration
  const [currentPage] = useState(0)
  const [pageSize] = useState(20)
  const [filters] = useState<BuildPartnerFilters>({})

  // Fetch developers data from API
  const {
    data: apiResponse,
    isLoading: developersLoading,
    error: developersError,
    refetch: refetchDevelopers,
  } = useBuildPartners(currentPage, pageSize, filters)

  console.log('apiResponse :', apiResponse)

  // Delete mutation
  const deleteMutation = useDeleteBuildPartner()

  const developersData = useMemo(() => {
    console.log('apiResponse 1:', apiResponse)
    if (apiResponse?.content) {
      return apiResponse.content.map((item) =>
        mapBuildPartnerToUIData(item)
      ) as DeveloperData[]
    }
    return []
  }, [apiResponse])

  // Create dynamic label getter function
  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      if (buildPartnerLabels) {
        // Use cached/API labels if available (no need to check loading state)
        return getLabel(
          configId,
          currentLanguage,
          getBuildPartnerLabel(configId)
        )
      }
      // Fallback to static mapping
      return getBuildPartnerLabel(configId)
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  // Define table columns with dynamic labels
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

  // Get pagination data from API response
  const totalRows = apiResponse?.page?.totalElements || 0
  const totalPages = apiResponse?.page?.totalPages || 0

  // Simple table state
  const {
    search,
    paginated,
    startItem,
    endItem,
    page,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  } = useTableState({
    data: developersData,
    searchFields: [
      'name',
      'developerId',
      'developerCif',
      'localeNames',
      'status',
    ],
    initialRowsPerPage: 20,
  })

  // Generate status cards data
  const statusCards = [
    {
      label: 'Rejected',
      count:
        developersData?.filter((item) => item.status === 'Rejected').length ||
        0,
      ...getStatusCardConfig('Rejected'),
    },
    {
      label: 'Incomplete',
      count:
        developersData?.filter((item) => item.status === 'Incomplete').length ||
        0,
      ...getStatusCardConfig('Incomplete'),
    },
    {
      label: 'In Review',
      count:
        developersData?.filter((item) => item.status === 'In Review').length ||
        0,
      ...getStatusCardConfig('In Review'),
    },
    {
      label: 'Approved',
      count:
        developersData?.filter((item) => item.status === 'Approved').length ||
        0,
      ...getStatusCardConfig('Approved'),
    },
  ]

  // Action buttons - removed unnecessary buttons
  const actionButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    icon?: string
    iconAlt?: string
  }> = []

  // Handle row actions
  const handleRowDelete = (row: DeveloperData, index: number) => {
    console.log('Delete developer:', row, 'at index:', index)
    if (
      confirm(
        `Are you sure you want to delete developer: ${row.name} (ID: ${row.developerId})?`
      )
    ) {
      deleteMutation.mutate(row.id, {
        onSuccess: () => {
          console.log('Developer deleted successfully')
          // The query will automatically refetch due to invalidation
        },
        onError: (error) => {
          console.error('Failed to delete developer:', error)
          alert(`Failed to delete developer: ${error.message}`)
        },
      })
    }
  }

  const handleRowView = (row: DeveloperData, index: number) => {
    console.log('View developer:', row, 'at index:', index)
    // Add your view logic here
    alert(`View developer: ${row.name} (ID: ${row.developerId})`)
  }

  // Render expanded content
  const renderExpandedContent = (_row: DeveloperData) => (
    <div className="grid grid-cols-2 gap-8">
      {/* <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">
          {getBuildPartnerLabel('CDL_BP_DETAILS')}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">{getBuildPartnerLabel('CDL_BP_NAME')}:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.name as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">{getBuildPartnerLabel('CDL_BP_ID')}:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.developerId as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">{getBuildPartnerLabel('CDL_BP_CIF')}:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.developerCif as string}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-800">20 Mar 2024</span>
          </div>
          <div>
            <span className="text-gray-600">{getBuildPartnerLabel('CDL_BP_AUTH_NAME')}:</span>
            <span className="ml-2 font-medium text-gray-800">John Doe</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">
          {getBuildPartnerLabel('CDL_BP_DOC_MANAGEMENT')}
        </h4>
        <div className="space-y-3">
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
            RERA Registration Certificate
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
            Company Registration Documents
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
            Financial Statements
          </button>
          <button className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
            Compliance Certificates
          </button>
        </div>
      </div> */}
    </div>
  )

  // Show loading state
  if (developersLoading) {
    return <LoadingSpinner />
  }

  // Show error state
  if (developersError) {
    return <ErrorMessage error={developersError} onRetry={refetchDevelopers} />
  }

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      <DashboardLayout title="Developers">
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          {/* Sticky Header Section */}
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            {/* <div className="px-4 py-6">
              <StatusCards cards={statusCards} />
            </div> */}
            <PageActionButtons
              entityType="developer"
              customActionButtons={actionButtons}
            />
          </div>

          {/* Table Container with Fixed Pagination */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<DeveloperData>
                data={paginated}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page,
                  rowsPerPage,
                  totalRows,
                  totalPages,
                  startItem,
                  endItem,
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
                showDeleteAction={true}
                showViewAction={true}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

// Main component that gets exported
const DevelopersPage: React.FC = () => {
  return <DevelopersPageClient />
}

export default DevelopersPage
