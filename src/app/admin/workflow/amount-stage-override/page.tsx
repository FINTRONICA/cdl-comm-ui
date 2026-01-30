'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getWorkflowLabelsByCategory as getWorkflowAmountStageOverrideLabel } from '@/constants/mappings/workflowMapping'
import { GlobalLoading } from '@/components/atoms'

// Dynamic import for heavy panel component with proper code splitting
const RightSlideWorkflowAmountStageOverridePanel = dynamic(
  () =>
    import(
      '@/components/organisms/RightSlidePanel/RightSlideWorkflowAmountStageOverridePanel'
    ).then((mod) => ({ default: mod.RightSlideWorkflowAmountStageOverridePanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <GlobalLoading />
      </div>
    ),
  }
)

// Main page component - no need for dynamic import since it's already a client component
import {
  useDeleteWorkflowAmountStageOverride,
  useWorkflowAmountStageOverrides,
  useBuildWorkflowAmountStageOverrideLabelsWithCache,
} from '@/hooks/workflow'
import {
  mapWorkflowAmountStageOverrideToUI,
  type WorkflowAmountStageOverrideUIData,
} from '@/services/api/workflowApi'
import type { WorkflowAmountStageOverrideFilters } from '@/services/api/workflowApi/workflowAmountStageOverrideService'
import { useAppStore } from '@/store'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

interface WorkflowAmountStageOverrideData
  extends WorkflowAmountStageOverrideUIData,
  Record<string, unknown> { }

const statusOptions = [
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
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Failed to load workflow amount stage overrides
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {error.message ||
            'An error occurred while loading the data. Please try again.'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="text-sm font-medium text-gray-600 cursor-pointer dark:text-gray-300">
              Error Details (Development)
            </summary>
            <pre className="p-4 mt-2 overflow-auto text-xs text-gray-500 bg-gray-100 rounded dark:text-gray-400 dark:bg-gray-800">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          aria-label="Retry loading data"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => <GlobalLoading fullHeight />

const WorkflowAmountStageOverridesPage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] =
    useState<WorkflowAmountStageOverrideData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [filters] = useState<WorkflowAmountStageOverrideFilters>({})
  const currentLanguage = useAppStore((state) => state.language)

  const {
    data: apiResponse,
    isLoading: workflowAmountStageOverridesLoading,
    isFetching: workflowAmountStageOverridesFetching,
    error: workflowAmountStageOverridesError,
    refetch: refetchWorkflowAmountStageOverrides,
  } = useWorkflowAmountStageOverrides(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    filters
  )

  const deleteMutation = useDeleteWorkflowAmountStageOverride()
  const confirmDelete = useDeleteConfirmation()

  const { data: workflowAmountStageOverrideLabels, getLabel } =
    useBuildWorkflowAmountStageOverrideLabelsWithCache()

  const workflowAmountStageOverrideData = useMemo(() => {
    if (apiResponse?.content) {
      return apiResponse.content.map((item) =>
        mapWorkflowAmountStageOverrideToUI(item)
      ) as WorkflowAmountStageOverrideData[]
    }
    return []
  }, [apiResponse])

  const getWorkflowAmountStageOverrideLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowAmountStageOverrideLabel(configId)

      if (workflowAmountStageOverrideLabels) {
        return getLabel(configId, currentLanguage || 'EN', fallback)
      }
      return fallback
    },
    [workflowAmountStageOverrideLabels, currentLanguage, getLabel]
  )

  const tableColumns = useMemo(
    () => [
      {
        key: 'stageKey',
        label: getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_STAGE_KEY'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
        copyable: true,
      },
      {
        key: 'stageOrder',
        label: getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_STAGE_ORDER'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'requiredApprovals',
        label: getWorkflowAmountStageOverrideLabelDynamic(
          'CDL_WASO_REQUIRED_APPROVALS'
        ),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'keycloakGroup',
        label: getWorkflowAmountStageOverrideLabelDynamic(
          'CDL_WASO_KEYCLOAK_GROUP'
        ),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
        copyable: true,
      },

      {
        key: 'workflowAmountRuleName',
        label: getWorkflowAmountStageOverrideLabelDynamic(
          'CDL_WAR_WORKFLOW_AMOUNT_RULE'
        ),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
        copyable: true,
      },
      {
        key: 'status',
        label: getWorkflowAmountStageOverrideLabelDynamic('CDL_COMMON_STATUS'),
        type: 'status' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'actions',
        label: getWorkflowAmountStageOverrideLabelDynamic('CDL_COMMON_ACTIONS'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getWorkflowAmountStageOverrideLabelDynamic]
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
    data: workflowAmountStageOverrideData,
    searchFields: [
      'stageOrder',
      'requiredApprovals',
      'keycloakGroup',
      'stageKey',
      'workflowAmountRuleName',
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
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1)
    localHandleRowsPerPageChange(newRowsPerPage)
  }

  const apiTotal = apiResponse?.page?.totalElements || 0
  const apiTotalPages = apiResponse?.page?.totalPages || 1

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
    (row: WorkflowAmountStageOverrideData) => {
      if (isDeleting || deleteMutation.isPending) {
        return
      }

      if (!row?.id) {
        return
      }

      confirmDelete({
        itemName: `workflow amount stage override: ${row.stageKey || row.id}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteMutation.mutateAsync(String(row.id))
            // Refetch data after successful delete
            await refetchWorkflowAmountStageOverrides()
          } catch (error) {
            // Error is handled by the mutation's onError
            throw error
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [isDeleting, deleteMutation, confirmDelete, refetchWorkflowAmountStageOverrides]
  )

  const handleRowEdit = useCallback(
    (row: WorkflowAmountStageOverrideData) => {
      if (!row?.id) {
        return
      }
      setEditingItem(row)
      setPanelMode('edit')
      setIsPanelOpen(true)
    },
    []
  )

  const handleAddNew = useCallback(() => {
    setEditingItem(null)
    setPanelMode('add')
    setIsPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    setEditingItem(null)
    refetchWorkflowAmountStageOverrides()
  }, [refetchWorkflowAmountStageOverrides])

  const renderExpandedContent = () => (
    <div className="grid grid-cols-2 gap-8"></div>
  )

  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshLoading = isRefreshing || workflowAmountStageOverridesFetching
  const showRefreshOverlay =
    isRefreshLoading || workflowAmountStageOverridesLoading

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      await refetchWorkflowAmountStageOverrides()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refetchWorkflowAmountStageOverrides])

  if (workflowAmountStageOverridesLoading || workflowAmountStageOverridesFetching) {
    return (
      <DashboardLayout title="Workflow Amount Stage Overrides">
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <DashboardLayout title="Workflow Amount Stage Overrides">
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
          {workflowAmountStageOverridesLoading ? (
            <LoadingSpinner />
          ) : workflowAmountStageOverridesError ? (
            <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
              <ErrorMessage
                error={workflowAmountStageOverridesError}
                onRetry={refetchWorkflowAmountStageOverrides}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="workflowAmountStageOverride"
                  customActionButtons={actionButtons}
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
                  <PermissionAwareDataTable<WorkflowAmountStageOverrideData>
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
        <RightSlideWorkflowAmountStageOverridePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          mode={panelMode}
          stageOverrideData={
            editingItem
              ? ({
                id: editingItem.id,
                stageOrder: editingItem.stageOrder,
                requiredApprovals: editingItem.requiredApprovals,
                keycloakGroup: editingItem.keycloakGroup,
                stageKey: editingItem.stageKey,
                workflowAmountRuleId: editingItem.workflowAmountRuleId,
                workflowAmountRuleName:
                  editingItem.workflowAmountRuleName || '',
                active: editingItem.active ?? false,
              } as WorkflowAmountStageOverrideUIData)
              : null
          }
        />
      )}
    </>
  )
}

export default WorkflowAmountStageOverridesPage
