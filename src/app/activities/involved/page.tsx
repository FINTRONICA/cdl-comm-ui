'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TablePageLayout } from '../../../components/templates/TablePageLayout'
import { ExpandableDataTable } from '../../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../../hooks/useTableState'
import { GlobalLoading, GlobalError } from '@/components/atoms'
import { CommentModal } from '@/components/molecules'
import { RightSlideWorkflowTransactionStatePanel } from '@/components/organisms/RightSlidePanel'
import { type EngagementsActionsUIData } from '@/services/api/workflowApi/workflowRequestService'
import { displayValue } from '@/utils/nullHandling'
import { getLabelByConfigId as getWorkflowRequestLabel } from '@/constants/mappings/workflowMapping'
import { useAppStore } from '@/store'
import { useEngagementsActionsUIData } from '@/hooks/workflow/useWorkflowRequest'
import type { WorkflowRequestFilters } from '@/services/api/workflowApi/workflowRequestService'
import { useWorkflowRequestLabelsWithCache } from '@/hooks/workflow'
import { formatDateOnly, truncateWords } from '@/utils'
import { ACTIVITIES_TABS, TAB_TO_MODULE_MAP } from '@/constants/activitiesTabs'

interface WorkflowRequestData
  extends EngagementsActionsUIData,
    Record<string, unknown> {
  payloadJson?: {
    bpName?: string
    bpCifrera?: string
    bpLicenseNo?: string
    [key: string]: unknown
  }
}

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
]

const InvolvedActivitiesPage: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('buildPartner')
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [isTxnPanelOpen, setIsTxnPanelOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<{
    comment: string
    developer: string
    activityId?: string
  } | null>(null)
  const [selectedTxnId, setSelectedTxnId] = useState<
    string | number | undefined
  >()
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const currentLanguage = useAppStore((state) => state.language)

  const workflowFilters = useMemo((): WorkflowRequestFilters => {
    const moduleName = TAB_TO_MODULE_MAP[activeTab]
    return moduleName ? { moduleName } : {}
  }, [activeTab])

  const {
    data: workflowResponse,
    isLoading: workflowLoading,
    error: workflowError,
    refetch: refetchWorkflow,
  } = useEngagementsActionsUIData(currentPage, pageSize, workflowFilters)

  const workflowData = useMemo((): WorkflowRequestData[] => {
    if (!workflowResponse?.content) return []

    return workflowResponse.content.map((item) => {
      const payloadJson = item.payloadJson as Record<string, unknown>
      const payloadName = (payloadJson?.bpName as string) || '-'
      const bpCifrera = (payloadJson?.bpCifrera as string) || '-'

      const result = {
        ...item,
        payloadJson: item.payloadJson,
        payloadName,
        bpCifrera,
        createdAt: formatDateOnly(item.createdAt),
      } as WorkflowRequestData

      return result
    })
  }, [workflowResponse])

  const hasNoDataForTab = workflowData.length === 0 && !workflowLoading

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(0)
  }, [])

  const handleRowView = useCallback(
    async (row: WorkflowRequestData) => {
      try {
        const id = row.id.toString()
        let navigationPath = ''

        switch (activeTab) {
          // Entity tabs
          // case 'buildPartner':
          //   navigationPath = `/build-partner/${id}/step/1?mode=view`
          //   break
          // case 'buildPartnerAsset':
          //   navigationPath = `/build-partner-assets/${id}?view=true`
          //   break
          // case 'capitalPartner':
          //   navigationPath = `/capital-partner/${id}?mode=view`
          //   break
          // case 'suretyBond':
          //   navigationPath = `/surety_bond/new/${id}?step=0&mode=view`
          //   break
          // case 'payments':
          //   navigationPath = `/transactions/manual/new/${id}?step=0&mode=view`
          //   break
          // Master data tabs - navigate to master list pages
          case 'accountPurpose':
            navigationPath = `/master/account-purpose`
            break
          case 'agreementSegment':
            navigationPath = `/master/agreement-segment`
            break
          case 'agreementType':
            navigationPath = `/master/agreement-Type`
            break
          case 'agreementSubType':
            navigationPath = `/master/agreement-sub-type`
            break
          case 'businessSegment':
            navigationPath = `/master/business-segment`
            break
          case 'businessSubSegment':
            navigationPath = `/master/business-sub-segment`
            break
          case 'currency':
            navigationPath = `/master/currency`
            break
          case 'country':
            navigationPath = `/master/country`
            break
          case 'investment':
            navigationPath = `/master/investment`
            break
          case 'productProgram':
            navigationPath = `/master/product`
            break
          case 'generalLedgerAccount':
            navigationPath = `/master/general-ledger-account`
            break
          // Stepper-based tabs - navigate to stepper list pages
          case 'account':
            navigationPath = `/escrow-account`
            break
          case 'party':
            navigationPath = `/master/party`
            break
          case 'agreement':
            navigationPath = `/agreement`
            break
          case 'agreementSignatory':
            navigationPath = `/agreement-signatory`
            break
          case 'agreementParameter':
            navigationPath = `/agreement-parameter`
            break
          case 'agreementFeeSchedule':
            navigationPath = `/agreement-fee-schedule`
            break
          case 'paymentBeneficiary':
            navigationPath = `/payment-beneficiary`
            break
          case 'standingInstruction':
            navigationPath = `/payment-instruction`
            break
          default:
            return
        }

        router.push(navigationPath)
      } catch {
        // Error handling is done by router
      }
    },
    [activeTab, router]
  )

  const handleCommentClick = (
    _column: string,
    value: unknown
  ): React.ReactNode => {
    return <span>{displayValue(value)}</span>
  }

  const handleRowTransaction = async (
    row: WorkflowRequestData,
    index: number
  ) => {
    try {
      const id = row?.id ?? `temp-${index}`
      setSelectedTxnId(id)
      setIsTxnPanelOpen(true)
    } catch {
      const id = row?.id ?? `temp-${index}`
      setSelectedTxnId(id)
      setIsTxnPanelOpen(true)
    }
  }

  const getDynamicPageTitle = (
    activeTab: string,
    pageType: 'pending' | 'involved'
  ): string => {
    const tab = ACTIVITIES_TABS.find((t) => t.id === activeTab)
    const moduleName = tab?.label?.trim() || ''

    if (pageType === 'pending') {
      return `Pending Activities: ${moduleName}`
    } else {
      return `Involved Activities: ${moduleName}`
    }
  }

  const {
    search,
    paginated,
    totalRows,
    totalPages,
    startItem,
    endItem,
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
    data: workflowData,
    searchFields: [
      'moduleName',
      'amount',
      'currency',
      'stageKey',
      'createdAt',
      'myRemarks',
      'stageName',
      'stageStatus',
      'payloadName',
      'bpCifrera',
    ],
    initialRowsPerPage: 20,
  })

  const { data: workflowRequestLabels, getLabel } =
    useWorkflowRequestLabelsWithCache()
  const getWorkflowRequestLabelDynamic = useCallback(
    (configId: string): string => {
      if (workflowRequestLabels) {
        return getLabel(
          configId,
          currentLanguage,
          getWorkflowRequestLabel(configId)
        )
      }
      return getWorkflowRequestLabel(configId)
    },
    [workflowRequestLabels, currentLanguage, getLabel]
  )

  const tableColumns = [
    {
      key: 'moduleName',
      label: getWorkflowRequestLabelDynamic('MODULE_NAME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        truncateWords(value, 15),
    },
    {
      key: 'stageKey',
      label: 'Stage Key',
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },

    {
      key: 'stageName',
      label: getWorkflowRequestLabelDynamic('STAGE_NAME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        truncateWords(value, 15),
    },
    {
      key: 'payloadName',
      label: getWorkflowRequestLabelDynamic('BP_NAME'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        truncateWords(value, 15),
    },
    {
      key: 'amount',
      label: getWorkflowRequestLabelDynamic('AMOUNT'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'currency',
      label: getWorkflowRequestLabelDynamic('CURRENCY'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },

    {
      key: 'bpCifrera',
      label: getWorkflowRequestLabelDynamic('BP_CIFRERA'),
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },

    {
      key: 'myRemarks',
      label: getWorkflowRequestLabelDynamic('MY_REMARKS'),

      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        truncateWords(value, 15),
    },
    {
      key: 'createdAt',
      label: getWorkflowRequestLabelDynamic('CREATED_AT'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'stageStatus',
      label: getWorkflowRequestLabelDynamic('STAGE_STATUS'),
      type: 'status' as const,
      width: 'w-35',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  if (workflowLoading) {
    return (
      <TablePageLayout
        title={getDynamicPageTitle(activeTab, 'involved')}
        tabs={ACTIVITIES_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </TablePageLayout>
    )
  }

  if (workflowError) {
    return (
      <TablePageLayout
        title={getDynamicPageTitle(activeTab, 'involved')}
        tabs={ACTIVITIES_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalError
            error={workflowError}
            onRetry={refetchWorkflow}
            title="Error loading workflow requests"
            fullHeight
          />
        </div>
      </TablePageLayout>
    )
  }

  return (
    <>
      {commentModalOpen && selectedComment && (
        <CommentModal
          open={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
        />
      )}

      <TablePageLayout
        title={getDynamicPageTitle(activeTab, 'involved')}
        tabs={ACTIVITIES_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {hasNoDataForTab ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                No data available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no workflow requests for the selected tab &ldquo;
                {ACTIVITIES_TABS.find((tab) => tab.id === activeTab)?.label}&rdquo;.
              </p>
            </div>
          </div>
        ) : (
          <ExpandableDataTable<WorkflowRequestData>
            data={paginated}
            columns={tableColumns}
            searchState={search}
            onSearchChange={handleSearchChange}
            paginationState={{
              page,
              rowsPerPage,
              totalRows,
              totalPages,
              startItem,
              endItem,
            }}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            selectedRows={selectedRows}
            onRowSelectionChange={handleRowSelectionChange}
            expandedRows={expandedRows}
            onRowExpansionChange={handleRowExpansionChange}
            statusOptions={statusOptions}
            renderCustomCell={handleCommentClick}
            onRowTransaction={handleRowTransaction}
            onRowView={handleRowView}
            showViewAction={true}
          />
        )}
      </TablePageLayout>
      <RightSlideWorkflowTransactionStatePanel
        isOpen={isTxnPanelOpen}
        onClose={() => {
          setIsTxnPanelOpen(false)
        }}
        transactionId={selectedTxnId ?? ''}
        activeTab={activeTab}
        onApprove={() => {}}
        onReject={() => {}}
      />
      {selectedComment && (
        <CommentModal
          open={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false)
            setSelectedComment(null)
          }}
        />
      )}
    </>
  )
}

export default InvolvedActivitiesPage
