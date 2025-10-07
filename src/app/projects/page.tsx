'use client'

import React, { useState, useCallback } from 'react'
import { DashboardLayout } from '../../components/templates/DashboardLayout'
import { ExpandableDataTable } from '../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../hooks/useTableState'
import { getStatusCardConfig } from '../../utils/statusUtils'
import { StatusCards } from '../../components/molecules/StatusCards'
import { PageActionButtons } from '../../components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useBuildPartnerAssetLabelsWithCache } from '../../hooks/useBuildPartnerAssetLabelsWithCache'
import { getBuildPartnerAssetLabel } from '../../constants/mappings/buildPartnerAsset'
import { useAppStore } from '@/store'
import {
  useProjects,
  useProjectStats,
  useDeleteProject,
} from '@/hooks/useProjects'
import type { ProjectData } from '@/services/api'
import { mapRealEstateAssetToProjectData } from '@/services/api'

const statusOptions = ['Approved', 'In Review', 'Rejected', 'Incomplete']

const ProjectsPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language)

  // Fetch build partner asset labels from BUILD_PARTNER_ASSET API with localStorage cache
  const { data: buildPartnerAssetLabels, getLabel } =
    useBuildPartnerAssetLabelsWithCache()

  // Fetch real estate assets data from API
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects(0, 100) // Fetch first 100 projects for now

  // Extract the actual projects data from the paginated response and map to UI format
  const projectsData =
    projectsResponse?.content?.map(mapRealEstateAssetToProjectData) || []

  // Fetch real estate asset statistics for status cards
  const { data: stats, isLoading: statsLoading } = useProjectStats()

  // Delete mutation hook
  const deleteMutation = useDeleteProject()

  // Create dynamic label getter function
  const getBuildPartnerAssetLabelDynamic = useCallback(
    (configId: string): string => {
      if (buildPartnerAssetLabels) {
        // Use cached/API labels if available (no need to check loading state)
        return getLabel(
          configId,
          currentLanguage,
          getBuildPartnerAssetLabel(configId)
        )
      }
      // Fallback to static mapping
      return getBuildPartnerAssetLabel(configId)
    },
    [buildPartnerAssetLabels, currentLanguage, getLabel]
  )

  // Define table columns with dynamic labels
  const tableColumns = [
    {
      key: 'name',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_NAME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'developerId',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_BP_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'developerCif',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_BP_CIF'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'developerName',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_BP_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'projectStatus',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_BP_STATUS'),
      type: 'status' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'approvalStatus',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_BP_APPROVAL_STATUS'),
      type: 'status' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'actions',
      label: getBuildPartnerAssetLabelDynamic('CDL_BPA_DOC_ACTION'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  // Simple table state - use API data or empty array if loading
  const {
    search,
    paginated,
    totalRows,
    totalPages,
    page,
    rowsPerPage,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
  } = useTableState({
    data: projectsData,
    searchFields: [
      'name',
      'developerId',
      'developerCif',
      'developerName',
      'projectStatus',
      'approvalStatus',
    ],
    initialRowsPerPage: 20,
  })

  // Debug: Log labels data
  console.log('🏷️ Build Partner Asset Labels:', {
    buildPartnerAssetLabels: !!buildPartnerAssetLabels,
    firstLabel: buildPartnerAssetLabels
      ? getLabel('CDL_BPA_NAME', currentLanguage, 'FALLBACK')
      : 'NO_LABELS',
  })

  // Debug: Log API data
  console.log('🏗️ Real Estate Assets API Data:', {
    projectsResponse: !!projectsResponse,
    projectsLoading,
    projectsError,
    projectsData: projectsData.length,
    stats: !!stats,
    statsLoading,
  })

  // Action handlers using API mutations
  const handleRowDelete = async (row: ProjectData) => {
    if (confirm(`Are you sure you want to delete project: ${row.name}?`)) {
      try {
        await deleteMutation.mutateAsync(row.id.toString())
        // The mutation will automatically refetch data
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project')
      }
    }
  }

  const handleRowView = (row: ProjectData) => {
    alert(`View project: ${row.name}`)
  }

  // Status card configuration using API stats
  const statusCardConfig = [
    {
      label: 'Total Projects',
      count: stats?.total || 0,
      color: 'bg-[#F1F5F9] border border-[#CAD5E2]',
      textColor: 'text-[#314158]',
      dotColor: 'bg-[#314158]',
    },
    {
      label: 'Rejected Projects',
      count: stats?.rejected || 0,
      ...getStatusCardConfig('Rejected'),
    },
    {
      label: 'Incomplete Projects',
      count: stats?.incomplete || 0,
      ...getStatusCardConfig('Incomplete'),
    },
    {
      label: 'In Review Projects',
      count: stats?.inReview || 0,
      ...getStatusCardConfig('In Review'),
    },
    {
      label: 'Approved Projects',
      count: stats?.approved || 0,
      ...getStatusCardConfig('Approved'),
    },
  ]

  // Expanded content with dynamic labels
  const renderExpandedContent = (row: ProjectData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Project Name:</span> {row.name}
        </div>
        <div>
          <span className="font-semibold">Developer ID:</span> {row.developerId}
        </div>
        <div>
          <span className="font-semibold">Developer CIF:</span>{' '}
          {row.developerCif}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Status:</span> {row.projectStatus}
        </div>
        <div>
          <span className="font-semibold">Approval:</span> {row.approvalStatus}
        </div>
      </div>
    </div>
  )

  // Loading state
  if (projectsLoading || statsLoading) {
    return (
      <DashboardLayout title="Projects">
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (projectsError) {
    return (
      <DashboardLayout title="Projects">
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="text-lg text-red-600">
            Error loading: {projectsError.message}
          </div>
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

      <DashboardLayout title="Projects">
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <div className="px-4 py-6">
              <StatusCards cards={statusCardConfig} />
            </div>
            <PageActionButtons entityType="project" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<ProjectData>
                data={paginated as ProjectData[]}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: page,
                  rowsPerPage: rowsPerPage,
                  totalRows: totalRows,
                  totalPages,
                  startItem: (page - 1) * rowsPerPage + 1,
                  endItem: Math.min(page * rowsPerPage, totalRows),
                }}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                selectedRows={[]} // No selection in this table
                onRowSelectionChange={() => {}} // No selection in this table
                expandedRows={[]} // No expanded rows in this table
                onRowExpansionChange={() => {}} // No expanded rows in this table
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

export default ProjectsPage
