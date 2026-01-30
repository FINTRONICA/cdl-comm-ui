'use client'

import { useCallback, useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { useWorkflowActionLabelsWithCache } from '@/hooks/workflow/useWorkflowActionLabelsWithCache'
import { getWorkflowLabelsByCategory as getWorkflowActionLabel } from '@/constants/mappings/workflowMapping'
import { useAppStore } from '@/store'
import { GlobalLoading } from '@/components/atoms'
import { useWorkflowActions, useDeleteWorkflowAction } from '@/hooks/workflow'
import {
  mapWorkflowActionToUIData,
  type WorkflowActionUIData,
} from '@/services/api/workflowApi'
import { RightSlideWorkflowActionPanel } from '@/components/organisms/RightSlidePanel/RightSlideWorkflowActionPanel'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

interface WorkflowActionData
  extends WorkflowActionUIData,
  Record<string, unknown> { }

interface ErrorMessageProps {
  error: Error
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl px-4">
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
          <svg
            className="w-12 h-12 text-red-600"
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
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Failed to load workflow actions
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
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => <GlobalLoading fullHeight />
const WorkflowActionPage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingAction, setEditingAction] =
    useState<WorkflowActionUIData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleting, setIsDeleting] = useState(false)

  const currentLanguage = useAppStore((state) => state.language)

  const { data: workflowActionLabels, getLabel } =
    useWorkflowActionLabelsWithCache()

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)

  const {
    data: apiResponse,
    isLoading: workflowActionsLoading,
    isFetching: workflowActionsFetching,
    error: workflowActionsError,
    refetch: refetchWorkflowActions,
    updatePagination,
    apiPagination,
  } = useWorkflowActions(Math.max(0, currentApiPage - 1), currentApiSize)

  const deleteMutation = useDeleteWorkflowAction()
  const confirmDelete = useDeleteConfirmation()

  const workflowActionsData = useMemo(() => {
    if (apiResponse?.content) {
      return apiResponse.content.map((item) =>
        mapWorkflowActionToUIData(item)
      ) as WorkflowActionData[]
    }
    return []
  }, [apiResponse])

  const getWorkflowActionLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowActionLabel(configId)

      if (workflowActionLabels) {
        return getLabel(configId, currentLanguage || 'EN', fallback)
      }
      return fallback
    },
    [workflowActionLabels, currentLanguage, getLabel]
  )

  const tableColumns = useMemo(
    () => [
      {
        key: 'name',
        label: getWorkflowActionLabelDynamic('CDL_WA_NAME'),
        type: 'text' as const,
        width: 'w-70',
        sortable: true,
        copyable: true,

      },
      {
        key: 'actionKey',
        label: getWorkflowActionLabelDynamic('CDL_WA_ACTION_KEY'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'actionName',
        label: getWorkflowActionLabelDynamic('CDL_WA_ACTION_NAME'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'moduleCode',
        label: getWorkflowActionLabelDynamic('CDL_WA_MODULE_CODE'),
        type: 'text' as const,
        width: 'w-48',
        sortable: true,
        copyable: true,
      },
      {
        key: 'description',
        label: getWorkflowActionLabelDynamic('CDL_WA_DESCRIPTION'),
        type: 'text' as const,
        width: 'w-60',
        sortable: true,
        copyable: true,
      },
      {
        key: 'actions',
        label: getWorkflowActionLabelDynamic('CDL_COMMON_ACTIONS'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getWorkflowActionLabelDynamic]
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
    data: workflowActionsData,
    searchFields: [
      'actionKey',
      'actionName',
      'moduleCode',
      'name',
      'description',
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
    [search, localHandlePageChange, currentApiSize, updatePagination]
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
    (row: WorkflowActionData) => {
      if (isDeleting) {
        return
      }

      confirmDelete({
        itemName: `workflow action: ${row.actionName || row.actionKey}`,
        itemId: row.id.toString(),
        onConfirm: async () => {
          try {
            setIsDeleting(true)
            await deleteMutation.mutateAsync(row.id.toString())
          } catch (error) {
            // Extract detailed error message from axios error
            let errorMessage = 'Failed to delete workflow action'

            if (error && typeof error === 'object' && 'response' in error) {
              const axiosError = error as {
                response?: {
                  status?: number
                  data?: { message?: string; error?: string }
                }
                message?: string
              }

              const status = axiosError.response?.status
              const responseData = axiosError.response?.data

              if (responseData?.message) {
                errorMessage = responseData.message
              } else if (responseData?.error) {
                errorMessage = responseData.error
              } else if (status === 500) {
                errorMessage = 'Server error occurred. Please try again later or contact support if the problem persists.'
              } else if (status === 404) {
                errorMessage = 'Workflow action not found. It may have already been deleted.'
              } else if (status === 403) {
                errorMessage = 'You do not have permission to delete this workflow action.'
              } else if (status) {
                errorMessage = `Request failed with status ${status}. Please try again.`
              } else if (axiosError.message) {
                errorMessage = axiosError.message
              }
            } else if (error instanceof Error) {
              errorMessage = error.message
            }

            console.error('Failed to delete workflow action:', {
              error,
              message: errorMessage,
              rowId: row.id,
              rowName: row.actionName || row.actionKey,
            })

            // Don't re-throw - let React Query handle the error state
            // The API client's error handler will show the toast notification
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [isDeleting, confirmDelete, deleteMutation]
  )

  const handleRowView = useCallback((row: WorkflowActionData) => {
    setEditingAction(row)
    setPanelMode('edit')
    setIsPanelOpen(true)
  }, [])

  const handleRowEdit = useCallback((row: WorkflowActionData) => {
    setEditingAction(row)
    setPanelMode('edit')
    setIsPanelOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingAction(null)
    setPanelMode('add')
    setIsPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    setEditingAction(null)
    refetchWorkflowActions()
  }, [refetchWorkflowActions])

  const renderExpandedContent = useCallback(
    () => <div className="grid grid-cols-2 gap-8"></div>,
    []
  )

  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshLoading = isRefreshing || workflowActionsFetching
  const showRefreshOverlay = isRefreshLoading || workflowActionsLoading

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      await refetchWorkflowActions()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refetchWorkflowActions])
  
  if (workflowActionsLoading || workflowActionsFetching) {
    return (
      <DashboardLayout title="Workflow Actions">
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }
  return (
    <>
      <DashboardLayout title="Workflow Actions">
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
          {/* Show loading state within the layout */}
          {workflowActionsLoading ? (
            <LoadingSpinner />
          ) : workflowActionsError ? (
            <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
              <ErrorMessage
                error={workflowActionsError as Error}
                onRetry={refetchWorkflowActions}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="workflowAction"
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
                  <PermissionAwareDataTable<WorkflowActionData>
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
                    onRowDelete={handleRowDelete}
                    // onRowView={handleRowView}
                    onRowEdit={handleRowEdit}
                    // viewPermissions={['*']}
                    deletePermissions={['*']}
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
      <RightSlideWorkflowActionPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingAction}
      />
    </>
  )
}

export default WorkflowActionPage
