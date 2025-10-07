'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { 
  masterCustomerTabs, 
  masterCustomerTabRoutes, 
  getActiveTabFromPathname, 
  getActiveTabLabel 
} from '@/constants/masterCustomerTabs'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getAccountPurposeLabel } from '@/constants/mappings/customerMapping'
import { useAppStore } from '@/store'
import { Spinner } from '@/components/atoms/Spinner'
import { RightSlideAccountPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideAccount'
import { CommentModal } from '@/components/molecules'

interface AccountPurposeData extends Record<string, unknown> {
  id: number
  accountPurposeId: string
  accountPurposeShortName: string
  accountPurposeFullName: string
  criticality: string
}


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
          Failed to load account purposes
        </h1>
        <p className="mb-4 text-gray-600">
          {error.message ||
            'An error occurred while loading the data. Please try again.'}
        </p>
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

const AccountPurposePageClient = dynamic(
  () => Promise.resolve(AccountPurposePageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Loading account purposes...</p>
    </div>
  </div>
)

const AccountPurposePageImpl: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AccountPurposeData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const currentLanguage = useAppStore((state) => state.language)

  // Get active tab from current pathname
  const activeTab = getActiveTabFromPathname(pathname)

  const handleTabChange = useCallback((tabId: string) => {
    // Navigate to the dedicated route for the selected tab
    const route = masterCustomerTabRoutes[tabId]
    if (route) {
      router.push(route)
    }
  }, [router])

  // Dummy data for account purposes
  const accountPurposeData = useMemo(() => [
    {
      id: 1,
      accountPurposeId: 'AP001',
      accountPurposeShortName: 'Savings',
      accountPurposeFullName: 'Personal Savings Account',
      criticality: 'High',
    },
    {
      id: 2,
      accountPurposeId: 'AP002',
      accountPurposeShortName: 'Checking',
      accountPurposeFullName: 'Business Checking Account',
      criticality: 'Medium',
    },
    {
      id: 3,
      accountPurposeId: 'AP003',
      accountPurposeShortName: 'Investment',
      accountPurposeFullName: 'Investment Portfolio Account',
      criticality: 'High',
    },
    {
      id: 4,
      accountPurposeId: 'AP004',
      accountPurposeShortName: 'Loan',
      accountPurposeFullName: 'Loan Account',
      criticality: 'Medium',
    },
    {
      id: 5,
      accountPurposeId: 'AP005',
      accountPurposeShortName: 'Credit',
      accountPurposeFullName: 'Credit Card Account',
      criticality: 'Low',
    },
  ] as AccountPurposeData[], [])

  const getAccountPurposeLabelDynamic = useCallback(
    (configId: string): string => {
      return getAccountPurposeLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'accountPurposeId',
      label: getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_ID'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'accountPurposeShortName',
      label: getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_SHORT_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'accountPurposeFullName',
      label: getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_FULL_NAME'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'criticality',
      label: getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_CRITICALITY'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
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
    data: accountPurposeData,
    searchFields: [
      'accountPurposeId',
      'accountPurposeShortName',
      'accountPurposeFullName',
      'criticality',
    ],
    initialRowsPerPage: 20,
  })

  const confirmDelete = async () => {
    if (isDeleting) {
      return
    }

    setIsDeleting(true)

    try {
      // Simulate delete operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Deleting items:', deleteIds)
    } catch (err) {
      console.log('Delete operation failed:', err)
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      setDeleteIds([])
    }
  }

  const paginated = paginatedData
  const actionButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    icon?: string
    iconAlt?: string
  }> = []

  const handleRowDelete = (row: AccountPurposeData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: AccountPurposeData) => {
    setEditingItem(row)
    setPanelMode('edit')
    setIsPanelOpen(true)
  }

  const handleAddNew = useCallback(() => {
    setEditingItem(null)
    setPanelMode('add')
    setIsPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    setEditingItem(null)
  }, [])

  const renderExpandedContent = (row: AccountPurposeData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountPurposeId || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_SHORT_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountPurposeShortName || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_FULL_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountPurposeFullName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getAccountPurposeLabelDynamic('CDL_CS_ACCOUNT_PURPOSE_CRITICALITY')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.criticality || '-'}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Actions</h4>
        <div className="space-y-3">
          <button
            onClick={() => handleRowView(row)}
            className="w-full p-3 text-sm text-left text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Edit Account Purpose
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Account Purpose
          </button>
        </div>
      </div>
    </div>
  )

  const activeTabLabel = getActiveTabLabel(activeTab)

  return (
    <>
      <TablePageLayout
        title={`Master Customers : ${activeTabLabel}`}
        tabs={masterCustomerTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <PageActionButtons
              entityType="customer"
              onAddNew={handleAddNew}
              showButtons={{ addNew: true }}
              customActionButtons={actionButtons}
            />
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<AccountPurposeData>
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
                onRowSelectionChange={(selectedRows) => handleRowSelectionChange(0, selectedRows.length > 0)}
                expandedRows={expandedRows}
                onRowExpansionChange={(expandedRows) => handleRowExpansionChange(0, expandedRows.length > 0)}
                renderExpandedContent={renderExpandedContent}
                onRowDelete={handleRowDelete}
                onRowView={handleRowView}
                onRowClick={() => {}}
                showDeleteAction={true}
                showViewAction={true}
              />
            </div>
          </div>
        </div>
      </TablePageLayout>
      <CommentModal
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Account Purpose"
        message={`Are you sure you want to delete this account purpose?`}
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
      <RightSlideAccountPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as any}
      />
    </>
  )
}

const AccountPurposePage: React.FC = () => {
  return <AccountPurposePageClient />
}

export default AccountPurposePage
