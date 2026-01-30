'use client'

import { useCallback, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getWorkflowLabelsByCategory as getWorkflowDefinitionLabel } from '@/constants/mappings/workflowMapping'
import { GlobalLoading } from '@/components/atoms'
import {
  useDeleteWorkflowDefinition,
  useWorkflowDefinitions,
  useWorkflowDefinitionLabelsWithCache,
} from '@/hooks/workflow'
import {
  mapWorkflowDefinitionToUIData,
  type WorkflowDefinitionUIData,
} from '@/services/api/workflowApi'
import type { WorkflowDefinitionFilters } from '@/services/api/workflowApi/workflowDefinitionService'
import { useAppStore } from '@/store'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

// Dynamic import for heavy panel component with proper code splitting
const RightSlideWorkflowDefinitionPanel = dynamic(
  () =>
    import(
      '@/components/organisms/RightSlidePanel/RightSlideWorkflowDefinitionPanel'
    ).then((mod) => ({ default: mod.RightSlideWorkflowDefinitionPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <GlobalLoading />
      </div>
    ),
  }
)

interface WorkflowDefinitionData
  extends WorkflowDefinitionUIData,
  Record<string, unknown> { }

const STATUS_OPTIONS: string[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
  'Active',
  'Inactive',
  'Expired',
  'Cancelled',
]

interface ErrorMessageProps {
  error: Error
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-2xl px-4">
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full dark:bg-red-900/20">
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Failed to load workflow definitions
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {error.message ||
            'An error occurred while loading the data. Please try again.'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="text-sm font-medium text-gray-600 cursor-pointer dark:text-gray-400">
              Error Details (Development)
            </summary>
            <pre className="p-4 mt-2 overflow-auto text-xs text-gray-500 bg-gray-100 rounded dark:text-gray-500 dark:bg-gray-800">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => <GlobalLoading fullHeight />

const WorkflowDefinitionsPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<WorkflowDefinitionData | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [filters] = useState<WorkflowDefinitionFilters>({})
  const currentLanguage = useAppStore((state) => state.language)

  const {
    data: apiResponse,
    isLoading: workflowDefinitionsLoading,
    isFetching: workflowDefinitionsFetching,
    error: workflowDefinitionsError,
    refetch: refetchWorkflowDefinitions,
  } = useWorkflowDefinitions(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    filters
  )

  const deleteMutation = useDeleteWorkflowDefinition()
  const confirmDelete = useDeleteConfirmation()

  const { data: workflowDefinitionLabels, getLabel } =
    useWorkflowDefinitionLabelsWithCache()

  const workflowDefinitionData = useMemo(() => {
    if (!apiResponse?.content) return []
    return apiResponse.content.map((item) =>
      mapWorkflowDefinitionToUIData(item)
    ) as WorkflowDefinitionData[]
  }, [apiResponse])

  const getWorkflowDefinitionLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowDefinitionLabel(configId)
      if (workflowDefinitionLabels) {
        return getLabel(configId, currentLanguage || 'EN', fallback)
      }
      return fallback
    },
    [workflowDefinitionLabels, currentLanguage, getLabel]
  )

  // Memoize table columns to prevent unnecessary re-renders
  const tableColumns = useMemo(
    () => [
      {
        key: 'name',
        label: getWorkflowDefinitionLabelDynamic('CDL_WD_NAME'),
        type: 'text' as const,
        width: 'w-64',
        sortable: true,
        copyable: true,
      },
      {
        key: 'workflowActionName',
        label: getWorkflowDefinitionLabelDynamic('CDL_WD_WORKFLOW_ACTION_DTO'),
        type: 'text' as const,
        width: 'w-64',
        sortable: true,
        copyable: true,
      },
      {
        key: 'actionCode',
        label: getWorkflowDefinitionLabelDynamic('CDL_WD_ACTION_CODE'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'moduleCode',
        label: getWorkflowDefinitionLabelDynamic('CDL_WD_MODULE_CODE'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
        copyable: true,
      },
      {
        key: 'version',
        label: getWorkflowDefinitionLabelDynamic('CDL_WD_VERSION'),
        type: 'text' as const,
        width: 'w-26',
        sortable: true,
        copyable: true,
      },
      {
        key: 'status',
        label: getWorkflowDefinitionLabelDynamic('CDL_COMMON_STATUS'),
        type: 'status' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'actions',
        label: getWorkflowDefinitionLabelDynamic('CDL_COMMON_ACTIONS'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getWorkflowDefinitionLabelDynamic]
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
    data: workflowDefinitionData,
    searchFields: [
      'name',
      'moduleCode',
      'actionCode',
      'workflowActionName',
      'applicationModuleName',
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
      }
    },
    [search, localHandlePageChange]
  )

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setCurrentApiSize(newRowsPerPage)
      setCurrentApiPage(1)
      localHandleRowsPerPageChange(newRowsPerPage)
    },
    [localHandleRowsPerPageChange]
  )

  const apiTotal = apiResponse?.page?.totalElements || 0
  const apiTotalPages = apiResponse?.page?.totalPages || 1

  const hasActiveSearch = useMemo(
    () => Object.values(search).some((value) => value.trim()),
    [search]
  )

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
    (row: WorkflowDefinitionData) => {
      if (isDeleting) return

      confirmDelete({
        itemName: `workflow definition: ${row.name}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteMutation.mutateAsync(String(row.id))
          } catch (error) {
            // Error is handled by the mutation's onError
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [isDeleting, confirmDelete, deleteMutation]
  )

  const handleRowEdit = useCallback((row: WorkflowDefinitionData) => {
    setEditingItem(row)
    setPanelMode('edit')
    setIsPanelOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingItem(null)
    setPanelMode('add')
    setIsPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    setEditingItem(null)
    refetchWorkflowDefinitions()
  }, [refetchWorkflowDefinitions])

  const renderExpandedContent = useCallback(
    () => <div className="grid grid-cols-2 gap-8"></div>,
    []
  )

  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshLoading = isRefreshing || workflowDefinitionsFetching
  const showRefreshOverlay = isRefreshLoading || workflowDefinitionsLoading

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      await refetchWorkflowDefinitions()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refetchWorkflowDefinitions])
  
  
  // Memoize the definition data for the panel
  const panelDefinitionData = useMemo<WorkflowDefinitionUIData | null>(() => {
    if (!editingItem) return null
    return {
      id: String(editingItem.id),
      name: editingItem.name,
      version: editingItem.version,
      createdBy: editingItem.createdBy || '',
      createdAt: editingItem.createdAt || '',
      amountBased: editingItem.amountBased,
      moduleCode: editingItem.moduleCode,
      actionCode: editingItem.actionCode,
      applicationModuleId: editingItem.applicationModuleId || '',
      applicationModuleName: editingItem.applicationModuleName || '',
      applicationModuleDescription:
        editingItem.applicationModuleDescription || '',
      workflowActionId: editingItem.workflowActionId || '',
      workflowActionName: editingItem.workflowActionName || '',
      workflowActionDescription:
        editingItem.workflowActionDescription || '',
      enabled: editingItem.enabled ?? false,
    } as WorkflowDefinitionUIData
  }, [editingItem])

  if (workflowDefinitionsLoading || workflowDefinitionsFetching) {
    return (
      <DashboardLayout title="Workflow Definitions">
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }


  return (
    <>
      <DashboardLayout title="Workflow Definitions">
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
          {workflowDefinitionsLoading ? (
            <LoadingSpinner />
          ) : workflowDefinitionsError ? (
            <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
              <ErrorMessage
                error={workflowDefinitionsError}
                onRetry={refetchWorkflowDefinitions}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="workflowDefinition"
                  customActionButtons={[]}
                  onAddNew={handleAddNew}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshLoading}
                  showButtons={{
                    addNew: true,
                    refresh: true,
                  }}
                />
              </div>

              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-auto">
                  <PermissionAwareDataTable<WorkflowDefinitionData>
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
                    statusOptions={STATUS_OPTIONS}
                    onRowDelete={handleRowDelete}
                    onRowEdit={handleRowEdit}
                    deletePermissions={['*']}
                    viewPermissions={['*']}
                    editPermissions={['*']}
                    updatePermissions={['*']}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>

      {isPanelOpen && (
        <RightSlideWorkflowDefinitionPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          mode={panelMode}
          definitionData={panelDefinitionData}
        />
      )}
    </>
  )
}

const WorkflowDefinitionsPage: React.FC = () => {
  return <WorkflowDefinitionsPageImpl />
}

export default WorkflowDefinitionsPage
