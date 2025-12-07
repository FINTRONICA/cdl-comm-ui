'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo, useRef } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getWorkflowActionLabel } from '@/constants/mappings/workflowMapping'
import { useAppStore } from '@/store'
import { GlobalLoading } from '@/components/atoms'
import {
  useWorkflowActions,
  useDeleteWorkflowAction,
  useWorkflowActionLabelsWithCache,
} from '@/hooks/workflow'
import {
  mapWorkflowActionToUIData,
  type WorkflowActionUIData,
} from '@/services/api/workflowApi'
import { RightSlideWorkflowActionPanel } from '@/components/organisms/RightSlidePanel/RightSlideWorkflowActionPanel'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { toast } from 'react-hot-toast'

interface WorkflowActionData
  extends WorkflowActionUIData,
    Record<string, unknown> {}

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
          Failed to load workflow actions
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

const WorkflowActionPageClient = dynamic(
  () => Promise.resolve(WorkflowActionPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="bg-[#FFFFFFBF] dark:bg-[#0B1220] rounded-2xl flex flex-col h-full text-gray-900 dark:text-white">
        <GlobalLoading fullHeight />
      </div>
    ),
  }
)

const LoadingSpinner: React.FC = () => (
  <div className="bg-[#FFFFFFBF] dark:bg-[#0B1220] rounded-2xl flex flex-col h-full text-gray-900 dark:text-white">
    <GlobalLoading fullHeight />
  </div>
)

const WorkflowActionPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingAction, setEditingAction] =
    useState<WorkflowActionUIData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleting, setIsDeleting] = useState(false)
  const deletingRef = useRef<Set<string | number>>(new Set())

  const currentLanguage = useAppStore((state) => state.language)

  const { data: workflowActionLabels, getLabel } =
    useWorkflowActionLabelsWithCache()

  const {
    data: apiResponse,
    isLoading: workflowActionsLoading,
    error: workflowActionsError,
    refetch: refetchWorkflowActions,
  } = useWorkflowActions(0, 1000)

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
      if (workflowActionLabels) {
        return getLabel(
          configId,
          currentLanguage,
          getWorkflowActionLabel(configId)
        )
      }
      return getWorkflowActionLabel(configId)
    },
    [workflowActionLabels, currentLanguage, getLabel]
  )

  const tableColumns = [
    {
      key: 'actionKey',
      label: getWorkflowActionLabelDynamic('CDL_WA_ACTION_KEY'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'actionName',
      label: getWorkflowActionLabelDynamic('CDL_WA_ACTION_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'moduleCode',
      label: getWorkflowActionLabelDynamic('CDL_WA_MODULE_CODE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'name',
      label: getWorkflowActionLabelDynamic('CDL_WA_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'description',
      label: getWorkflowActionLabelDynamic('CDL_WA_DESCRIPTION'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'actions',
      label: getWorkflowActionLabelDynamic('CDL_WA_ACTIONS'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  const {
    search,
    paginated: paginatedData,
    totalRows,
    totalPages,
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
    data: workflowActionsData,
    searchFields: [
      'actionKey',
      'actionName',
      'moduleCode',
      'name',
      'description',
    ],
    initialRowsPerPage: 20,
  })

  const paginated = paginatedData
  const actionButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    icon?: string
    iconAlt?: string
  }> = []

  const handleRowDelete = (row: WorkflowActionData) => {
    if (isDeleting || (deleteMutation as { isPending?: boolean })?.isPending) {
      return
    }

    confirmDelete({
      itemName: `workflow action: ${row.actionName || row.actionKey}`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true)
          if (deletingRef.current.has(row.id)) {
            return
          }

          deletingRef.current.add(row.id)

          try {
            await deleteMutation.mutateAsync(row.id.toString())
          } finally {
            deletingRef.current.delete(row.id)
          }

          refetchWorkflowActions()
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          toast.error(`Failed to delete: ${errorMessage}`)
          throw error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  const handleRowView = (row: WorkflowActionData) => {
    setEditingAction(row)
    setPanelMode('edit')
    setIsPanelOpen(true)
  }

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

  if (workflowActionsLoading) {
    return <LoadingSpinner />
  }

  if (workflowActionsError) {
    return (
      <ErrorMessage
        error={workflowActionsError}
        onRetry={refetchWorkflowActions}
      />
    )
  }

  return (
    <>
      <DashboardLayout title="Workflow Actions">
        <div className="bg-[#FFFFFFBF] dark:bg-gray-800 rounded-2xl flex flex-col h-full text-gray-900 dark:text-white">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 rounded-t-2xl">
            <PageActionButtons
              entityType="workflowAction"
              onAddNew={handleAddNew}
              showButtons={{ addNew: true }}
              customActionButtons={actionButtons}
            />
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<WorkflowActionData>
                data={paginated}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: page,
                  rowsPerPage: rowsPerPage,
                  totalRows: totalRows,
                  totalPages: totalPages,
                  startItem: totalRows > 0 ? (page - 1) * rowsPerPage + 1 : 0,
                  endItem: Math.min(page * rowsPerPage, totalRows),
                }}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                selectedRows={selectedRows}
                onRowSelectionChange={handleRowSelectionChange}
                expandedRows={expandedRows}
                onRowExpansionChange={handleRowExpansionChange}
                onRowDelete={handleRowDelete}
                onRowView={handleRowView}
                onRowClick={() => {}}
                showDeleteAction={true}
                showViewAction={true}
              />
            </div>
          </div>
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

const WorkflowActionPage: React.FC = () => {
  return <WorkflowActionPageClient />
}

export default WorkflowActionPage
