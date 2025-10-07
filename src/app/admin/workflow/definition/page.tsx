'use client'
import dynamic from 'next/dynamic'
import React, { useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getLabelByConfigId as getWorkflowDefinitionLabel } from '@/constants/mappings/workflowMapping'
import { displayValue } from '@/utils/nullHandling'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { Spinner } from '@/components/atoms/Spinner'
import { useAppStore } from '@/store'

import {
  mapWorkflowDefinitionToUIData,
  type WorkflowDefinitionUIData,
} from '@/services/api/workflowApi'
import { CommentModal } from '@/components/molecules'
import {
  useDeleteWorkflowDefinition,
  useWorkflowDefinitions,
  useWorkflowDefinitionLabelsWithCache,
} from '@/hooks/workflow'
import { RightSlideWorkflowDefinitionPanel } from '@/components/organisms/RightSlidePanel/RightSlideWorkflowDefinitionPanel'

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
          Failed to load workflow definitions
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

type WorkflowDefinitionRow = {
  id: string
  name: string
  version: number
  amountBased: boolean
  moduleCode: string
  actionCode: string
  active: boolean
  createdBy?: string | undefined
  createdAt?: string | undefined
  updatedBy?: string | undefined
  updatedAt?: string | undefined
  status?: string | undefined
  applicationModuleId?: string | undefined
  applicationModuleName?: string | undefined
  applicationModuleDescription?: string | undefined
  workflowActionId?: string | undefined
  workflowActionName?: string | undefined
  workflowActionDescription?: string | undefined
}
type ViewRow = {
  _raw: WorkflowDefinitionRow
} & {
  id?: string | undefined
  name: React.ReactNode
  version: React.ReactNode
  moduleCode: React.ReactNode
  actionCode: React.ReactNode
  applicationModuleName: React.ReactNode
  workflowActionName: React.ReactNode
  amountBased: React.ReactNode
  status: React.ReactNode
  createdBy: React.ReactNode
  createdAt: React.ReactNode
  actions: React.ReactNode
}

const WorkflowDefinitionsPageImpl: React.FC = () => {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [selectedDefinitionForEdit, setSelectedDefinitionForEdit] =
    useState<WorkflowDefinitionUIData | null>(null)
  const [panelMode, setPanelMode] = useState<'edit' | 'add'>('edit')
  const currentLanguage = useAppStore((s) => s.language)

  const { data: workflowDefinitionLabels, getLabel } =
    useWorkflowDefinitionLabelsWithCache()

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useWorkflowDefinitions(currentPage, pageSize)

  const deleteMutation = useDeleteWorkflowDefinition()

  const workflowDefinitionsData: WorkflowDefinitionRow[] = useMemo(() => {
    if (!apiResponse?.content) {
      return []
    }

    const mappedData = apiResponse.content.map((item) => {
      const uiData = mapWorkflowDefinitionToUIData(item)

      const mappedRow = {
        id: uiData.id.toString(),
        name: uiData.name,
        version: uiData.version,
        amountBased: uiData.amountBased,
        moduleCode: uiData.moduleCode,
        actionCode: uiData.actionCode,
        active: uiData.active,
        createdBy: uiData.createdBy,
        createdAt: uiData.createdAt,
        updatedBy: uiData.updatedBy,
        updatedAt: uiData.updatedAt,
        status: uiData.status || 'Rejected',
        applicationModuleId: uiData.applicationModuleId,
        applicationModuleName: uiData.applicationModuleName,
        applicationModuleDescription: uiData.applicationModuleDescription,
        workflowActionId: uiData.workflowActionId,
        workflowActionName: uiData.workflowActionName,
        workflowActionDescription: uiData.workflowActionDescription,
      }

      return mappedRow
    })

    return mappedData
  }, [apiResponse])

  const getWorkflowDefinitionLabelDynamic = useCallback(
    (configId: string): string => {
      if (workflowDefinitionLabels && typeof getLabel === 'function') {
        return getLabel(
          configId,
          currentLanguage,
          getWorkflowDefinitionLabel(configId)
        )
      }
      return getWorkflowDefinitionLabel(configId)
    },
    [workflowDefinitionLabels, currentLanguage, getLabel]
  )

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

  const tableColumns = [
    {
      key: 'name',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_NAME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'version',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_VERSION'),
      type: 'text' as const,
      width: 'w-26',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'moduleCode',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_MODULE_CODE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'actionCode',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_ACTION_CODE'),
      type: 'text' as const,
      width: 'w-26',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'applicationModuleName',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_APPLICATION_MODULE_ID'),
      type: 'text' as const,
      width: 'w-55',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'workflowActionName',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_WORKFLOW_ACTION_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'amountBased',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_AMOUNT_BASED'),
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'status',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_STATUS'),
      type: 'status' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'createdBy',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_CREATED_BY'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'createdAt',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_CREATED_AT'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },

    {
      key: 'actions',
      label: getWorkflowDefinitionLabelDynamic('CDL_WD_ACTIONS'),
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
    data: workflowDefinitionsData,
    searchFields: [
      'id',
      'name',
      'version',
      'amountBased',
      'moduleCode',
      'actionCode',
      'createdBy',
      'createdAt',
      'status',
      'applicationModuleName',
      'workflowActionName',
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
    arg?: React.MouseEvent | (ViewRow | WorkflowDefinitionRow)
  ) => {
    if (arg && 'stopPropagation' in arg) arg.stopPropagation()

    let singleId: string | number | undefined

    if (arg && typeof arg === 'object' && !('stopPropagation' in arg)) {
      if ('_raw' in arg) {
        singleId = (arg as ViewRow)._raw?.id
      } else {
        singleId = (arg as WorkflowDefinitionRow).id
      }
    }

    const ids: (string | number)[] =
      (typeof singleId === 'string' || typeof singleId === 'number') &&
      singleId !== undefined
        ? [singleId]
        : selectedRows
            .map((idx: number) => {
              const row = viewRows[idx]
              const id = row?._raw?.id
              return id
            })
            .filter(
              (v: string | undefined): v is string =>
                v !== undefined && v !== 'undefined' && v !== 'null'
            )

    if (!ids.length) {
      return
    }

    setDeleteIds(ids)
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: ViewRow) => {
    if (!row._raw.id || row._raw.id === '0') {
      return
    }

    const uiData: WorkflowDefinitionUIData = {
      id: row._raw.id,
      name: row._raw.name,
      version: row._raw.version,
      createdBy: row._raw.createdBy || '',
      createdAt: row._raw.createdAt || '',
      amountBased: row._raw.amountBased,
      moduleCode: row._raw.moduleCode,
      actionCode: row._raw.actionCode,
      applicationModuleId: row._raw.applicationModuleId || '',
      applicationModuleName: row._raw.applicationModuleName || '',
      applicationModuleDescription: row._raw.applicationModuleDescription || '',
      workflowActionId: row._raw.workflowActionId || '',
      workflowActionName: row._raw.workflowActionName || '',
      workflowActionDescription: row._raw.workflowActionDescription || '',
      active: row._raw.active,
    }

    setSelectedDefinitionForEdit(uiData)
    setPanelMode('edit')
    setIsSidePanelOpen(true)
  }

  const handleRowEdit = (row: WorkflowDefinitionRow) => {
    if (!row.id || row.id === '0') {
      return
    }

    const uiData: WorkflowDefinitionUIData = {
      id: row.id,
      name: row.name,
      version: row.version,
      createdBy: row.createdBy || '',
      createdAt: row.createdAt || '',
      amountBased: row.amountBased,
      moduleCode: row.moduleCode,
      actionCode: row.actionCode,
      applicationModuleId: row.applicationModuleId || '',
      applicationModuleName: row.applicationModuleName || '',
      applicationModuleDescription: row.applicationModuleDescription || '',
      workflowActionId: row.workflowActionId || '',
      workflowActionName: row.workflowActionName || '',
      workflowActionDescription: row.workflowActionDescription || '',
      active: row.active,
    }

    setSelectedDefinitionForEdit(uiData)
    setPanelMode('edit')
    setIsSidePanelOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />
  }

  if (!apiResponse?.content || apiResponse.content.length === 0) {
    const hasAuthToken =
      typeof window !== 'undefined' &&
      (localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token') ||
        (typeof document !== 'undefined' &&
          document.cookie.includes('auth_token')))

    if (!hasAuthToken) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full">
                <svg
                  className="w-12 h-12 text-yellow-600"
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
                Authentication Required
              </h1>
              <p className="mb-4 text-gray-600">
                Please log in to access workflow definitions.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    }
  }

  // if (!workflowDefinitionsData.length) {
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
  //           No workflow definitions found
  //         </h3>
  //         <p className="mb-6 text-gray-600">
  //           There are no workflow definitions available at the moment.
  //         </p>
  //         <button
  //           onClick={() => {
  //             // TODO: Implement add functionality
  //           }}
  //           className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
  //         >
  //           Add New Definition
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
      name: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.name)}
        </div>
      ),
      version: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.version)}
        </div>
      ),
      moduleCode: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.moduleCode)}
        </div>
      ),
      actionCode: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.actionCode)}
        </div>
      ),
      applicationModuleName: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          <div className="flex flex-col">
            <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
              {row.applicationModuleDescription &&
              row.applicationModuleDescription !== '-'
                ? displayValue(row.applicationModuleDescription)
                : displayValue(row.applicationModuleName)}
            </div>
          </div>
        </div>
      ),
      workflowActionName: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          <div className="flex flex-col">
            <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
              {row.workflowActionDescription &&
              row.workflowActionDescription !== '-'
                ? displayValue(row.workflowActionDescription)
                : displayValue(row.workflowActionName)}
            </div>
          </div>
        </div>
      ),
      amountBased: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.amountBased ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
          >
            {row.amountBased ? 'Yes' : 'No'}
          </span>
        </div>
      ),
      status: (
        <span className="inline-flex items-center">
          {displayValue(row.status)}
        </span>
      ),
      createdBy: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {displayValue(row.createdBy)}
        </div>
      ),
      createdAt: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          {row.createdAt && row.createdAt !== '-' && row.createdAt !== 'null'
            ? (() => {
                const date = new Date(row.createdAt)
                // Check if date is valid
                if (isNaN(date.getTime())) {
                  return displayValue(row.createdAt)
                }
                const day = date.getDate()
                const month = date.toLocaleString('en-US', { month: 'long' })
                const year = date.getFullYear()
                const hours = date.getHours()
                const minutes = date.getMinutes().toString().padStart(2, '0')
                const ampm = hours >= 12 ? 'PM' : 'AM'
                const displayHours = hours % 12 || 12
                return (
                  <>
                    <div>
                      {day} {month} {year}
                    </div>
                    <div>
                      {displayHours}:{minutes} {ampm}
                    </div>
                  </>
                )
              })()
            : displayValue(row.createdAt)}
        </div>
      ),
      actions: (
        <div className="w-auto px-4 py-3.5 text-sm text-[#1E2939]">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRowView({ _raw: row } as ViewRow)
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
              title="View Definition"
            >
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRowEdit(row)
              }}
              className="text-sm font-medium text-green-600 hover:text-green-800"
              title="Edit Definition"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRowDelete(row)
              }}
              className="text-sm font-medium text-red-600 hover:text-red-800"
              title="Delete Definition"
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
            {getWorkflowDefinitionLabelDynamic('CDL_WD_DETAILS')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                {getWorkflowDefinitionLabelDynamic('CDL_WD_NAME')}:
              </span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData?.name)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">
                {getWorkflowDefinitionLabelDynamic('CDL_WD_VERSION')}:
              </span>
              <span className="ml-2 font-medium text-gray-800">
                {displayValue(rawData.version)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">
                {getWorkflowDefinitionLabelDynamic('CDL_WD_CREATED_AT')}:
              </span>
              <span className="ml-2 font-medium text-gray-800">
                {rawData?.createdAt &&
                rawData.createdAt !== '-' &&
                rawData.createdAt !== 'null'
                  ? (() => {
                      const date = new Date(rawData.createdAt)
                      if (isNaN(date.getTime())) {
                        return displayValue(rawData?.createdAt)
                      }
                      const day = date.getDate()
                      const month = date.toLocaleString('en-US', {
                        month: 'long',
                      })
                      const year = date.getFullYear()
                      const hours = date.getHours()
                      const minutes = date
                        .getMinutes()
                        .toString()
                        .padStart(2, '0')
                      const ampm = hours >= 12 ? 'PM' : 'AM'
                      const displayHours = hours % 12 || 12
                      return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`
                    })()
                  : displayValue(rawData?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">
            Related Data
          </h4>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-gray-600">Application Module:</span>
              <div className="mt-1">
                <div className="font-medium text-gray-800">
                  {rawData.applicationModuleDescription &&
                  rawData.applicationModuleDescription !== '-'
                    ? displayValue(rawData.applicationModuleDescription)
                    : displayValue(rawData.applicationModuleName)}
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Workflow Action:</span>
              <div className="mt-1">
                <div className="font-medium text-gray-800">
                  {rawData.workflowActionDescription &&
                  rawData.workflowActionDescription !== '-'
                    ? displayValue(rawData.workflowActionDescription)
                    : displayValue(rawData.workflowActionName)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <RightSlideWorkflowDefinitionPanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false)
          setSelectedDefinitionForEdit(null)
          setPanelMode('edit')
        }}
        mode={panelMode}
        definitionData={selectedDefinitionForEdit}
      />

      <DashboardLayout
        title={getWorkflowDefinitionLabelDynamic('Workflow Definitions')}
      >
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <div className="px-4 py-6"></div>
            <PageActionButtons
              entityType="workflowDefinition"
              customActionButtons={[]}
              showButtons={{ addNew: true }}
              onAddNew={() => {
                setSelectedDefinitionForEdit(null)
                setPanelMode('add')
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
                onRowDelete={handleRowDelete}
                onRowView={handleRowView}
                showDeleteAction={true}
                showViewAction={true}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>

      <CommentModal
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Workflow Definition"
        message={`Are you sure you want to delete`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsDeleteModalOpen(false),
            color: 'secondary',
            disabled: isDeleting,
          },
          {
            label: isDeleting ? 'Deleting...' : 'Delete',
            onClick: confirmDelete,
            color: 'error',
            disabled: isDeleting,
          },
        ]}
      />
    </>
  )
}

const WorkflowDefinitionsPageClient = dynamic(
  () => Promise.resolve(WorkflowDefinitionsPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const WorkflowDefinitionsPage: React.FC = () => {
  return <WorkflowDefinitionsPageClient />
}

export default WorkflowDefinitionsPage
