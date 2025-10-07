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
  mapWorkflowAmountStageOverrideToUI,
  type WorkflowAmountStageOverrideUIData,
} from '@/services/api/workflowApi'
import { CommentModal } from '@/components/molecules'
import {
  useDeleteWorkflowAmountStageOverride,
  useWorkflowAmountStageOverrides,
} from '@/hooks/workflow'
import { RightSlideWorkflowAmountStageOverridePanel } from '@/components/organisms/RightSlidePanel/RightSlideWorkflowAmountStageOverridePanel'
import { getLabelByConfigId as getWorkflowAmountStageOverrideLabel } from '@/constants/mappings/workflowMapping'

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
          Failed to load workflow amount stage overrides
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

type WorkflowAmountStageOverrideRow = {
  id: number
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  workflowAmountRuleId: number
  workflowAmountRuleName?: string | undefined
  active?: boolean | undefined
}

type ViewRow = {
  _raw: WorkflowAmountStageOverrideRow
} & {
  id: string
  stageOrder: React.JSX.Element
  requiredApprovals: React.JSX.Element
  keycloakGroup: React.JSX.Element
  stageKey: React.JSX.Element
  workflowAmountRuleId: number
  workflowAmountRuleName: React.JSX.Element
  active: React.JSX.Element
  actions: React.JSX.Element
}

const WorkflowAmountStageOverridesPageImpl: React.FC = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [selectedStageOverrideForEdit, setSelectedStageOverrideForEdit] =
    useState<WorkflowAmountStageOverrideUIData | null>(null)

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useWorkflowAmountStageOverrides(currentPage, pageSize)

  const deleteMutation = useDeleteWorkflowAmountStageOverride()

  const workflowAmountStageOverridesData: WorkflowAmountStageOverrideRow[] =
    useMemo(() => {
      if (!apiResponse?.content) {
        return []
      }

      const mappedData = apiResponse.content.map((item) => {
        const uiData = mapWorkflowAmountStageOverrideToUI(item)

        return {
          id: uiData.id,
          stageOrder: uiData.stageOrder,
          requiredApprovals: uiData.requiredApprovals,
          keycloakGroup: uiData.keycloakGroup,
          stageKey: uiData.stageKey,
          workflowAmountRuleId: uiData.workflowAmountRuleId,
          workflowAmountRuleName: uiData.workflowAmountRuleName,
          active: uiData.active,
        }
      })

      return mappedData
    }, [apiResponse])

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
  const statusOptions = ['Active', 'Inactive']

  const getWorkflowAmountStageOverrideLabelDynamic = useCallback(
    (configId: string): string => {
      return getWorkflowAmountStageOverrideLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'stageOrder',
      label: getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_STAGE_ORDER'),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'requiredApprovals',
      label: getWorkflowAmountStageOverrideLabelDynamic(
        'CDL_WASO_REQUIRED_APPROVALS'
      ),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'keycloakGroup',
      label: getWorkflowAmountStageOverrideLabelDynamic(
        'CDL_WASO_KEYCLOAK_GROUP'
      ),
      type: 'text' as const,
      width: 'w-26',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'stageKey',
      label: getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_STAGE_KEY'),
      type: 'text' as const,
      width: 'w-26',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'workflowAmountRuleName',
      label: getWorkflowAmountStageOverrideLabelDynamic(
        'CDL_WAR_WORKFLOW_AMOUNT_RULE'
      ),
      type: 'text' as const,
      width: 'w-26',
      sortable: false,
      render: (value: string | number | null | undefined) =>
        value ? displayValue(value) : '-',
    },
    {
      key: 'actions',
      label: getWorkflowAmountStageOverrideLabelDynamic(
        'CDL_WAR_WORKFLOW_ACTIONS'
      ),
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
    data: workflowAmountStageOverridesData,
    searchFields: [
      'id',
      'stageOrder',
      'requiredApprovals',
      'keycloakGroup',
      'stageKey',
      'workflowAmountRuleName',
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
    arg?: React.MouseEvent | (ViewRow | WorkflowAmountStageOverrideRow)
  ) => {
    if (arg && 'stopPropagation' in arg) arg.stopPropagation()

    const singleId =
      arg && typeof (arg as ViewRow)?.id === 'string'
        ? (arg as ViewRow).id
        : (arg as WorkflowAmountStageOverrideRow)?.id

    const ids: (string | number)[] =
      typeof singleId === 'string' || typeof singleId === 'number'
        ? [singleId]
        : selectedRows
            .map((idx: number) => viewRows[idx]?._raw?.id)
            .filter((v: number | undefined): v is number => v !== undefined)

    if (!ids.length) return

    setDeleteIds(ids)
    setIsDeleteModalOpen(true)
  }

  const handleRowClick = (row: WorkflowAmountStageOverrideRow) => {
    if (!row.id || row.id === 0) {
      return
    }

    const uiData: WorkflowAmountStageOverrideUIData = {
      id: row.id,
      stageOrder: row.stageOrder,
      requiredApprovals: row.requiredApprovals,
      keycloakGroup: row.keycloakGroup,
      stageKey: row.stageKey,
      workflowAmountRuleId: row.workflowAmountRuleId,
      workflowAmountRuleName: row.workflowAmountRuleName || '',
      active: row.active || false,
    }

    setSelectedStageOverrideForEdit(uiData)
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
      workflowAmountRuleId: row.workflowAmountRuleId,
      stageOrder: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.stageOrder)}
        </div>
      ),
      requiredApprovals: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.requiredApprovals)}
        </div>
      ),
      keycloakGroup: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.keycloakGroup)}
        </div>
      ),
      stageKey: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.stageKey)}
        </div>
      ),
      workflowAmountRuleName: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.workflowAmountRuleName)}
        </div>
      ),
      active: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {displayValue(row.active ? 'Active' : 'Inactive')}
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
            Stage Override Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Stage Order:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.stageOrder)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Required Approvals:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.requiredApprovals)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Keycloak Group:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.keycloakGroup)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Stage Key:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.stageKey)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Workflow Amount Rule ID:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.workflowAmountRuleId)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.active ? 'Active' : 'Inactive')}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <RightSlideWorkflowAmountStageOverridePanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false)
          setSelectedStageOverrideForEdit(null)
        }}
        mode={selectedStageOverrideForEdit ? 'edit' : 'add'}
        stageOverrideData={selectedStageOverrideForEdit}
      />

      <DashboardLayout title="Amount Stage Overrides">
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <PageActionButtons
              entityType="workflowAmountStageOverride"
              customActionButtons={[]}
              showButtons={{ addNew: true }}
              onAddNew={() => {
                setSelectedStageOverrideForEdit(null)
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
        title="Delete  Amount Stage Overrides"
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

const WorkflowAmountStageOverridesPageClient = dynamic(
  () => Promise.resolve(WorkflowAmountStageOverridesPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const WorkflowAmountStageOverridesPage: React.FC = () => {
  return <WorkflowAmountStageOverridesPageClient />
}

export default WorkflowAmountStageOverridesPage
