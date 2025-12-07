'use client'
import dynamic from 'next/dynamic'
import React, { useState, useMemo, useCallback } from 'react'
import { displayValue } from '@/utils/nullHandling'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { GlobalLoading } from '@/components/atoms'
import {
  mapWorkflowAmountRuleToUI,
  type WorkflowAmountRuleUIData,
} from '@/services/api/workflowApi'
import {
  useDeleteWorkflowAmountRule,
  useWorkflowAmountRules,
  useFindAllWorkflowDefinitions,
  useWorkflowAmountRuleLabelsWithCache,
} from '@/hooks/workflow'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { RightSlideWorkflowAmountRulePanel } from '@/components/organisms/RightSlidePanel/RightSlideWorkflowAmountRulePanel'
import { getLabelByConfigId as getWorkflowAmountRuleLabel } from '@/constants/mappings/workflowMapping'
import { toast } from 'react-hot-toast'

const ErrorMessage: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-500/20 rounded-full">
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400"
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
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Failed to load workflow amount rules
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-200">
          {error.message ||
            'An error occurred while loading the data. Please try again.'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="text-sm font-medium text-gray-600 dark:text-gray-200 cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="p-4 mt-2 overflow-auto text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => (
  <DashboardLayout title="Amount Rule">
    <div className="bg-[#FFFFFFBF] dark:bg-gray-800 rounded-2xl flex flex-col h-full text-gray-900 dark:text-white">
      <GlobalLoading fullHeight />
    </div>
  </DashboardLayout>
)

type WorkflowAmountRuleRow = {
  id: string | number
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowId: string | number
  workflowDefinitionName?: string
  enabled: boolean
  status?: string | undefined
}
type ViewRow = {
  _raw: WorkflowAmountRuleRow
} & {
  id?: string | undefined
  currency: React.ReactNode
  minAmount: React.ReactNode
  maxAmount: React.ReactNode
  priority: React.ReactNode
  requiredMakers: React.ReactNode
  requiredCheckers: React.ReactNode
  workflowId: React.ReactNode
  status: React.ReactNode
  actions: React.ReactNode
}

const WorkflowAmountRulesPageImpl: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [selectedAmountRuleForEdit, setSelectedAmountRuleForEdit] =
    useState<WorkflowAmountRuleUIData | null>(null)

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useWorkflowAmountRules(currentPage, pageSize)

  const deleteMutation = useDeleteWorkflowAmountRule()
  const confirmDelete = useDeleteConfirmation()

  const workflowAmountRulesData: WorkflowAmountRuleRow[] = useMemo(() => {
    if (!apiResponse?.content) {
      return []
    }

    const mappedData = apiResponse.content.map((item) => {
      const uiData = mapWorkflowAmountRuleToUI(item)

      return {
        id: uiData.id,
        currency: uiData.currency,
        minAmount: uiData.minAmount,
        maxAmount: uiData.maxAmount,
        priority: uiData.priority,
        requiredMakers: uiData.requiredMakers,
        requiredCheckers: uiData.requiredCheckers,
        workflowId: uiData.workflowId || '',
        workflowDefinitionName:
          (item as { workflowDefinitionDTO?: { name?: string } })
            .workflowDefinitionDTO?.name || '',
        enabled: uiData.enabled,
        status: uiData.enabled ? 'Active' : 'Inactive',
      }
    })

    return mappedData
  }, [apiResponse])

  const { data: workflowDefinitionLabels, getLabel } =
    useWorkflowAmountRuleLabelsWithCache()
  const getWorkflowDefinitionLabelDynamic = useCallback(
    (configId: string): string => {
      if (workflowDefinitionLabels && typeof getLabel === 'function') {
        return getLabel(configId, 'EN', getWorkflowAmountRuleLabel(configId))
      }
      return getWorkflowAmountRuleLabel(configId)
    },
    [workflowDefinitionLabels, getLabel]
  )

  const { data: workflowDefinitionsResponse } = useFindAllWorkflowDefinitions()

  const workflowDefinitionNameMap = useMemo(() => {
    if (!workflowDefinitionsResponse?.content) return new Map()

    const map = new Map()
    workflowDefinitionsResponse.content.forEach((def) => {
      map.set(def.id.toString(), def.name)
    })
    return map
  }, [workflowDefinitionsResponse])
  const statusOptions = ['Active', 'Inactive', 'Expired', 'Cancelled']

  const tableColumns = [
    {
      key: 'currency',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_CURRENCY'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'minAmount',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_MIN_AMOUNT'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'maxAmount',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_MIN_AMOUNT'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'priority',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_PRIORITY'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'requiredMakers',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_REQUIRED_MAKERS'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'requiredCheckers',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_REQUIRED_CHECKERS'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'workflowId',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_WORKFLOW_DEFINITION'),
      type: 'text' as const,
      width: 'w-50',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },

    {
      key: 'status',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_ACTIVE'),
      type: 'status' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'actions',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_ACTIONS'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  const {
    search,
    paginated: paginatedData,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  } = useTableState({
    data: workflowAmountRulesData,
    searchFields: [
      'id',
      'currency',
      'minAmount',
      'maxAmount',
      'priority',
      'requiredMakers',
      'requiredCheckers',
      'workflowId',
      'status',
    ],
    initialRowsPerPage: pageSize,
  })

  const totalRows = paginatedData.length
  const totalPages = Math.ceil(totalRows / pageSize)

  const onPageChange = (nextPage: number) => setCurrentPage(nextPage)
  const onRowsPerPageChange = (nextSize: number) => {
    setPageSize(nextSize)
    setCurrentPage(0)
  }

  const handleRowDelete = (
    arg?: React.MouseEvent | (ViewRow | WorkflowAmountRuleRow)
  ) => {
    if (arg && 'stopPropagation' in arg) arg.stopPropagation()

    if (isDeleting || (deleteMutation as { isPending?: boolean })?.isPending) {
      return
    }

    let row: WorkflowAmountRuleRow | undefined

    if (arg && typeof arg === 'object' && !('stopPropagation' in arg)) {
      if ('_raw' in arg) {
        row = (arg as ViewRow)._raw
      } else {
        row = arg as WorkflowAmountRuleRow
      }
    }

    if (!row || !row.id) return

    confirmDelete({
      itemName: `workflow amount rule (${row.currency})`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          await deleteMutation.mutateAsync(row.id.toString())
          refetch()
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(
            `Failed to delete workflow amount rule: ${errorMessage}`
          )
          toast.error(`Failed to delete: ${errorMessage}`)
          throw error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  const handleRowClick = (row: WorkflowAmountRuleRow) => {
    if (!row.id || row.id === '0') {
      alert('Invalid ID - cannot edit this record')
      return
    }

    const uiData: WorkflowAmountRuleUIData = {
      id: row.id,
      currency: row.currency,
      minAmount: row.minAmount,
      maxAmount: row.maxAmount,
      priority: row.priority,
      requiredMakers: row.requiredMakers,
      requiredCheckers: row.requiredCheckers,
      workflowId: row.workflowId,
      workflowDefinitionDTO: {
        id: row.workflowId,
        name: row.workflowDefinitionName || '',
      },
      amountRuleName: `Rule_${row.id}`,
      workflowAmountStageOverrideDTOS: [],
      enabled: row.enabled,
      status: row.enabled ? 'Active' : 'Inactive',
    }

    setSelectedAmountRuleForEdit(uiData)
    setIsSidePanelOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />
  }

  const viewRows: ViewRow[] = paginatedData.map((row) => {
    return {
      _raw: row,
      id: row.id?.toString(),
      currency: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.currency)}
        </div>
      ),
      minAmount: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.minAmount)}
        </div>
      ),
      maxAmount: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.maxAmount)}
        </div>
      ),
      priority: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.priority)}
        </div>
      ),
      requiredMakers: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.requiredMakers)}
        </div>
      ),
      requiredCheckers: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.requiredCheckers)}
        </div>
      ),
      workflowId: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {row.workflowDefinitionName ||
            workflowDefinitionNameMap.get(row.workflowId) ||
            displayValue(row.workflowId)}
        </div>
      ),
      status: row.status,

      actions: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRowClick(row)
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRowDelete(row)
              }}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      ),
    }
  })

  return (
    <>
      <RightSlideWorkflowAmountRulePanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false)
          setSelectedAmountRuleForEdit(null)
        }}
        mode={selectedAmountRuleForEdit ? 'edit' : 'add'}
        amountRuleData={selectedAmountRuleForEdit}
      />

      <DashboardLayout title="Workflow Amount Rules">
        <div className="bg-[#FFFFFFBF] dark:bg-gray-800 rounded-2xl flex flex-col h-full text-gray-900 dark:text-white">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <PageActionButtons
              entityType="workflowAmountRule"
              customActionButtons={[]}
              showButtons={{ addNew: true }}
              onAddNew={() => {
                setSelectedAmountRuleForEdit(null)
                setIsSidePanelOpen(true)
              }}
            />
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<ViewRow>
                data={viewRows}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: currentPage + 1,
                  rowsPerPage: pageSize,
                  totalRows,
                  totalPages,
                  startItem: currentPage * pageSize + 1,
                  endItem: Math.min((currentPage + 1) * pageSize, totalRows),
                }}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                selectedRows={selectedRows}
                onRowSelectionChange={handleRowSelectionChange}
                expandedRows={expandedRows}
                onRowExpansionChange={handleRowExpansionChange}
                statusOptions={statusOptions}
                onRowClick={() => {}}
                onRowDelete={handleRowDelete}
                onRowView={(row: ViewRow) => handleRowClick(row._raw)}
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

const WorkflowAmountRulesPageClient = dynamic(
  () => Promise.resolve(WorkflowAmountRulesPageImpl),
  {
    ssr: false,
    loading: () => (
      <DashboardLayout title="Amount Rule">
        <div className="bg-[#FFFFFFBF] dark:bg-gray-800 rounded-2xl flex flex-col h-full text-gray-900 dark:text-white">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    ),
  }
)

const WorkflowAmountRulesPage: React.FC = () => {
  return <WorkflowAmountRulesPageClient />
}

export default WorkflowAmountRulesPage
