'use client'

import { useCallback, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getWorkflowLabelsByCategory as getWorkflowAmountRuleLabel } from '@/constants/mappings/workflowMapping'
import { GlobalLoading } from '@/components/atoms'
import {
  useDeleteWorkflowAmountRule,
  useWorkflowAmountRules,
  useWorkflowAmountRuleLabelsWithCache,
} from '@/hooks/workflow'
import {
  mapWorkflowAmountRuleToUI,
  type WorkflowAmountRuleUIData,
} from '@/services/api/workflowApi'
import type { WorkflowAmountRuleFilters } from '@/services/api/workflowApi/workflowAmountRuleService'
import { useAppStore } from '@/store'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

// Dynamic import for heavy panel component with proper code splitting
const RightSlideWorkflowAmountRulePanel = dynamic(
  () =>
    import(
      '@/components/organisms/RightSlidePanel/RightSlideWorkflowAmountRulePanel'
    ).then((mod) => ({ default: mod.RightSlideWorkflowAmountRulePanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <GlobalLoading />
      </div>
    ),
  }
)

interface WorkflowAmountRuleData
  extends WorkflowAmountRuleUIData,
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
          Failed to load workflow amount rules
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

const WorkflowAmountRulesPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<WorkflowAmountRuleData | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [filters] = useState<WorkflowAmountRuleFilters>({})
  const currentLanguage = useAppStore((state) => state.language)

  const {
    data: apiResponse,
    isLoading: workflowAmountRulesLoading,
    isFetching: workflowAmountRulesFetching,
    error: workflowAmountRulesError,
    refetch: refetchWorkflowAmountRules,
  } = useWorkflowAmountRules(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    filters
  )

  const deleteMutation = useDeleteWorkflowAmountRule()
  const confirmDelete = useDeleteConfirmation()

  const { data: workflowAmountRuleLabels, getLabel } =
    useWorkflowAmountRuleLabelsWithCache()

  const workflowAmountRuleData = useMemo(() => {
    if (!apiResponse?.content) return []
    return apiResponse.content.map((item) => {
      const uiData = mapWorkflowAmountRuleToUI(item)
      return {
        ...uiData,
        workflowDefinitionName: uiData.workflowDefinitionDTO?.name || '',
      } as WorkflowAmountRuleData
    })
  }, [apiResponse])

  const getWorkflowAmountRuleLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowAmountRuleLabel(configId)
      if (workflowAmountRuleLabels) {
        return getLabel(configId, currentLanguage || 'EN', fallback)
      }
      return fallback
    },
    [workflowAmountRuleLabels, currentLanguage, getLabel]
  )

  // Memoize table columns to prevent unnecessary re-renders
  const tableColumns = useMemo(
    () => [
      {
        key: 'currency',
        label: getWorkflowAmountRuleLabelDynamic('CDL_WAR_CURRENCY'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'minAmount',
        label: getWorkflowAmountRuleLabelDynamic('CDL_WAR_MIN_AMOUNT'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'maxAmount',
        label: getWorkflowAmountRuleLabelDynamic('CDL_WAR_MAX_AMOUNT'),
        type: 'text' as const,
        width: 'w-32',
        sortable: true,
        copyable: true,
      },
      {
        key: 'priority',
        label: getWorkflowAmountRuleLabelDynamic('CDL_WAR_PRIORITY'),
        type: 'text' as const,
        width: 'w-26',
        sortable: true,
        copyable: true,

      },
      {
        key: 'requiredMakers',
        label: getWorkflowAmountRuleLabelDynamic('CDL_WAR_REQUIRED_MAKERS'),
        type: 'text' as const,
        width: 'w-26',
        sortable: true,
        copyable: true,

      },
      {
        key: 'requiredCheckers',
        label: getWorkflowAmountRuleLabelDynamic('CDL_WAR_REQUIRED_CHECKERS'),
        type: 'text' as const,
        width: 'w-26',
        sortable: true,
        copyable: true,

      },
      {
        key: 'workflowDefinitionName',
        label: getWorkflowAmountRuleLabelDynamic(
          'CDL_WAR_WORKFLOW_DEFINITION_DTO'
        ),
        type: 'text' as const,
        width: 'w-75',
        sortable: true,
        copyable: true,

      },
      {
        key: 'status',
        label: getWorkflowAmountRuleLabelDynamic('CDL_COMMON_STATUS'),
        type: 'status' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'actions',
        label: getWorkflowAmountRuleLabelDynamic('CDL_COMMON_ACTIONS'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getWorkflowAmountRuleLabelDynamic]
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
    data: workflowAmountRuleData,
    searchFields: [
      'currency',
      'minAmount',
      'maxAmount',
      'priority',
      'requiredMakers',

      'requiredCheckers',
      'workflowDefinitionName',
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
    (row: WorkflowAmountRuleData) => {
      if (isDeleting) return

      confirmDelete({
        itemName: `workflow amount rule: ${row.currency}`,
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

  const handleRowEdit = useCallback((row: WorkflowAmountRuleData) => {
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
    refetchWorkflowAmountRules()
  }, [refetchWorkflowAmountRules])

  const renderExpandedContent = useCallback(
    () => <div className="grid grid-cols-2 gap-8"></div>,
    []
  )
   // Memoize the amount rule data for the panel
   const panelAmountRuleData = useMemo<WorkflowAmountRuleUIData | null>(() => {
    if (!editingItem) return null
    return {
      id: String(editingItem.id),
      currency: editingItem.currency,
      minAmount: editingItem.minAmount,
      maxAmount: editingItem.maxAmount,
      priority: editingItem.priority,
      requiredMakers: editingItem.requiredMakers,
      requiredCheckers: editingItem.requiredCheckers,
      workflowDefinitionDTO: editingItem.workflowDefinitionDTO,
      workflowId: editingItem.workflowId,
      amountRuleName: editingItem.amountRuleName || '',
      workflowAmountStageOverrideDTOS:
        editingItem.workflowAmountStageOverrideDTOS || [],
      enabled: editingItem.enabled ?? false,
    } as WorkflowAmountRuleUIData
  }, [editingItem])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshLoading = isRefreshing || workflowAmountRulesFetching
  const showRefreshOverlay = isRefreshLoading || workflowAmountRulesLoading

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      await refetchWorkflowAmountRules()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refetchWorkflowAmountRules])
  if (workflowAmountRulesLoading || workflowAmountRulesFetching) {
    return (
      <DashboardLayout title="Workflow Amount Rules">
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      )
    }

 

  return (
    <>
      <DashboardLayout title="Workflow Amount Rules">
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
          {workflowAmountRulesLoading ? (
            <LoadingSpinner />
          ) : workflowAmountRulesError ? (
            <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
              <ErrorMessage
                error={workflowAmountRulesError}
                onRetry={refetchWorkflowAmountRules}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="workflowAmountRule"
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
                  <PermissionAwareDataTable<WorkflowAmountRuleData>
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
        <RightSlideWorkflowAmountRulePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          mode={panelMode}
          amountRuleData={panelAmountRuleData}
        />
      )}
    </>
  )
}

const WorkflowAmountRulesPage: React.FC = () => {
  return <WorkflowAmountRulesPageImpl />
}

export default WorkflowAmountRulesPage
