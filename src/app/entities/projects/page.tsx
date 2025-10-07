'use client'

import React, { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useBuildPartnerAssetLabelsWithCache } from '@/hooks/useBuildPartnerAssetLabelsWithCache'
import { getBuildPartnerAssetLabel } from '@/constants/mappings/buildPartnerAsset'
import { useAppStore } from '@/store'
import {
  useProjects,
  useDeleteProject,
  PROJECTS_QUERY_KEY,
} from '@/hooks/useProjects'
import type { ProjectData } from '@/services/api'
import { mapRealEstateAssetToProjectData } from '@/services/api'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'DRAFT', 'INITIATED']

const ProjectsPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tableKey, setTableKey] = useState(0)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language)
  const { getLabelResolver } = useSidebarConfig()
  const projectsTitle = getLabelResolver
    ? getLabelResolver('projects', 'Projects')
    : 'Projects'
  
  // Template download hook
  const { downloadTemplate, isLoading: isDownloading, error: downloadError, clearError } = useTemplateDownload()
  
  // Fetch build partner asset labels from BUILD_PARTNER_ASSET API with localStorage cache
  const { data: buildPartnerAssetLabels, getLabel } =
    useBuildPartnerAssetLabelsWithCache()

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  // Fetch real estate assets data from API
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    error: projectsError,
    updatePagination,
    apiPagination,
  } = useProjects(Math.max(0, currentApiPage - 1), currentApiSize)

  // Extract the actual projects data from the paginated response and map to UI format
  const projectsData =
    projectsResponse?.content?.map(mapRealEstateAssetToProjectData) || []

  const deleteMutation = useDeleteProject()
  const confirmDelete = useDeleteConfirmation()

  const getBuildPartnerAssetLabelDynamic = useCallback(
    (configId: string): string => {
      if (buildPartnerAssetLabels) {
        return getLabel(
          configId,
          currentLanguage,
          getBuildPartnerAssetLabel(configId)
        )
      }
      return getBuildPartnerAssetLabel(configId)
    },
    [buildPartnerAssetLabels, currentLanguage, getLabel]
  )

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

  const {
    search,
    paginated,
    totalRows: localTotalRows,
    totalPages: localTotalPages,
    page: localPage,
    rowsPerPage,
    startItem,
    endItem,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange: localHandlePageChange,
    handleRowsPerPageChange: localHandleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    handleSort,
    sortConfig,
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
    initialRowsPerPage: currentApiSize,
  })

  const handlePageChange = (newPage: number) => {
    const hasActiveSearch = Object.values(search).some((value) => value.trim())

    if (hasActiveSearch) {
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

  const effectiveTotalRows = Object.values(search).some((value) => value.trim())
    ? localTotalRows
    : apiTotal
  const effectiveTotalPages = Object.values(search).some((value) =>
    value.trim()
  )
    ? localTotalPages
    : apiTotalPages
  const effectivePage = Object.values(search).some((value) => value.trim())
    ? localPage
    : currentApiPage

  const handleRowDelete = (row: ProjectData) => {
    if (isDeleting) {
      return
    }

    confirmDelete({
      itemName: `project: ${row.name}`,
      onConfirm: async () => {
        try {
          setIsDeleting(true)

          await deleteMutation.mutateAsync(row.id.toString())

          console.log(`Real Estate Asset has been deleted successfully.`)

          await new Promise((resolve) => setTimeout(resolve, 500))

          await queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })

          updatePagination(Math.max(0, currentApiPage - 1), currentApiSize)

          setTableKey((prev) => prev + 1)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete project: ${errorMessage}`)
          throw error // Re-throw to keep dialog open on error
        } finally {
          setIsDeleting(false)
        }
      }
    })
  }

  const handleRowView = (row: ProjectData) => {
    // Navigate to the project stepper with the project ID in view mode
    router.push(`/projects/${row.id}?view=true`)
  }

  const handleRowEdit = (row: ProjectData) => {
    if (row.id) {
      router.push(`/projects/${row.id}`)
    } else {
      alert('Cannot edit: No ID found for this project')
    }
  }

  // Template download handler
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.BUILD_PARTNER_ASSET)
     
    } catch (error) {
     
    }
  }

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

  if (projectsLoading) {
    return (
      <DashboardLayout title={projectsTitle}>
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (projectsError) {
    return (
      <DashboardLayout title={projectsTitle}>
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

      {/* Download Error Alert */}
      {downloadError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Download Error: {downloadError}</span>
            <button
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <DashboardLayout title={projectsTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <PageActionButtons 
              entityType="project" 
              onDownloadTemplate={handleDownloadTemplate}
              isDownloading={isDownloading}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<ProjectData>
                key={`projects-table-${tableKey}`}
                data={paginated as ProjectData[]}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: effectivePage,
                  rowsPerPage: rowsPerPage,
                  totalRows: effectiveTotalRows,
                  totalPages: effectiveTotalPages,
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
                onRowEdit={handleRowEdit}
                deletePermissions={['bpa_delete']}
                viewPermissions={['bpa_view']}
                editPermissions={['bpa_update']}
                updatePermissions={['bpa_update']}
                showDeleteAction={true}
                showViewAction={true}
                showEditAction={true}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default ProjectsPage
