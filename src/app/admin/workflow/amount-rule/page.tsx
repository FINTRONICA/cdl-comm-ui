'use client'
import dynamic from 'next/dynamic'
import React, { useState, useMemo, useCallback } from 'react'
import { displayValue } from '@/utils/nullHandling'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { Spinner } from '@/components/atoms/Spinner'
import {
  mapWorkflowAmountRuleToUI,
  type WorkflowAmountRuleUIData,
} from '@/services/api/workflowApi'
import { CommentModal } from '@/components/molecules'
import {
  useDeleteWorkflowAmountRule,
  useWorkflowAmountRules,
  useFindAllWorkflowDefinitions,
  useWorkflowAmountRuleLabelsWithCache,
} from '@/hooks/workflow'
import { RightSlideWorkflowAmountRulePanel } from '@/components/organisms/RightSlidePanel/RightSlideWorkflowAmountRulePanel'
import { getLabelByConfigId as getWorkflowAmountRuleLabel } from '@/constants/mappings/workflowMapping'
const ErrorMessage: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
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
          Failed to load workflow amount rules
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

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600"></p>
    </div>
  </div>
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
  active: boolean
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
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
        active: uiData.active,
        status: uiData.active ? 'Active' : 'Inactive',
      }
    })

    return mappedData
  }, [apiResponse])

  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (isDeleting || (deleteMutation as { isPending?: boolean })?.isPending) {
      return
    }

    if (!deleteIds?.length) {
      setIsDeleteModalOpen(false)
      return
    }

    setIsDeleting(true)

    try {
      for (const id of Array.from(new Set(deleteIds))) {
        try {
          if (
            typeof (
              deleteMutation as {
                mutateAsync?: (id: string) => Promise<unknown>
              }
            ).mutateAsync === 'function'
          ) {
            await (
              deleteMutation as {
                mutateAsync: (id: string) => Promise<unknown>
              }
            ).mutateAsync(id.toString())
          } else if (
            typeof (deleteMutation as { mutate?: (id: string) => void })
              .mutate === 'function'
          ) {
            ;(deleteMutation as { mutate: (id: string) => void }).mutate(
              id.toString()
            )
          } else if (
            typeof (window as { deleteApi?: (id: string) => Promise<unknown> })
              .deleteApi === 'function'
          ) {
            const win = window as unknown as {
              deleteApi?: (id: string) => Promise<unknown>
            }
            if (typeof win.deleteApi === 'function') {
              await win.deleteApi(id.toString())
            } else {
              throw new Error(
                'No delete function available (mutateAsync/mutate/deleteApi)'
              )
            }
          }
        } catch (innerErr) {
          console.log(innerErr)
        }
      }

      if (typeof refetch === 'function') {
        try {
          await refetch()
        } catch (refetchErr) {
          console.log(refetchErr)
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteIds([])
      setIsDeleting(false)
    }
  }
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
  const statusOptions = ['Active', 'Inactive']

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
      width: 'w-24',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'maxAmount',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_MIN_AMOUNT'),
      type: 'text' as const,
      width: 'w-24',
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
      width: 'w-32',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'requiredCheckers',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_REQUIRED_CHECKERS'),
      type: 'text' as const,
      width: 'w-36',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'workflowId',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_WORKFLOW_DEFINITION'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },

    {
      key: 'status',
      label: getWorkflowDefinitionLabelDynamic('CDL_WAR_ACTIVE'),
      type: 'status' as const,
      width: 'w-24',
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

    const singleId =
      arg && typeof (arg as ViewRow)?.id === 'string'
        ? (arg as ViewRow).id
        : (arg as WorkflowAmountRuleRow)?.id

    const ids: (string | number)[] =
      typeof singleId === 'string' || typeof singleId === 'number'
        ? [singleId]
        : selectedRows
            .map((idx: number) => viewRows[idx]?._raw?.id)
            .filter(
              (v: string | number | undefined): v is string | number =>
                v !== undefined
            )

    if (!ids.length) return

    setDeleteIds(ids)
    setIsDeleteModalOpen(true)
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
      active: row.active,
      status: row.active ? 'Active' : 'Inactive',
    }

    setSelectedAmountRuleForEdit(uiData)
    setIsSidePanelOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />
  }

  // if (!workflowAmountRulesData.length) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-center">
  //         <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
  //           <svg
  //             className="w-12 h-12 text-gray-400"
  //             fill="none"
  //             viewBox="0 0 24 24"
  //             stroke="currentColor"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  //             />
  //           </svg>
  //         </div>
  //         <h3 className="mb-2 text-lg font-medium text-gray-900">
  //           No workflow amount rules found
  //         </h3>
  //         <p className="mb-6 text-gray-600">
  //           There are no workflow amount rules available at the moment.
  //         </p>
  //         <button
  //           onClick={() => {
  //           }}
  //           className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
  //         >
  //           Add New Workflow Amount Rule
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  // Transform data for table using paginated data
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
      status: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {displayValue(row.status)}
        </span>
      ),
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

  const renderExpandedContent = (row: ViewRow) => {
    const rawData = row._raw
    return (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">
            Amount Rule Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Currency:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.currency)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Min Amount:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.minAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Max Amount:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.maxAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Priority:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.priority)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Required Makers:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.requiredMakers)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Required Checkers:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.requiredCheckers)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Workflow Definition:</span>
              <span className="ml-2 font-medium text-gray-800">
                {rawData.workflowDefinitionName ||
                  workflowDefinitionNameMap.get(rawData.workflowId) ||
                  displayValue(rawData.workflowId)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
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
                renderExpandedContent={renderExpandedContent}
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

      <CommentModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Workflow Amount Rules"
        message={`Are you sure you want to delete`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsDeleteModalOpen(false),
            color: 'secondary',
          },
          {
            label: 'Delete',
            onClick: confirmDelete,
            color: 'error',
          },
        ]}
      />
    </>
  )
}

const WorkflowAmountRulesPageClient = dynamic(
  () => Promise.resolve(WorkflowAmountRulesPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const WorkflowAmountRulesPage: React.FC = () => {
  return <WorkflowAmountRulesPageClient />
}

export default WorkflowAmountRulesPage
