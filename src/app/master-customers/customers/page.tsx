'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { Spinner } from '@/components/atoms/Spinner'
import { displayValue } from '@/utils/nullHandling'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { 
  masterCustomerTabs, 
  masterCustomerTabRoutes, 
  getActiveTabFromPathname, 
  getActiveTabLabel 
} from '@/constants/masterCustomerTabs'


const actionButtons: Array<{
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  icon?: string
  iconAlt?: string
}> = []
interface CustomerData extends Record<string, unknown> {
  id?: string | number
  referenceId?: string | number
  referenceType?: string
  moduleName?: string
  actionKey?: string
  bpName?: string
  currentStageOrder?: string | number
  taskStatus?: string
  createdAt?: string
  amount?: string | number
  currency?: string
}

// const tabs: Tab[] = [
//   { id: 'customerMaster', label: 'Customer Master' },
//   { id: 'accountPurpose', label: 'Account Purpose' },
//   { id: 'investmentMaster', label: 'Investment Master' },
//   { id: 'businessSegment', label: 'Business Segment' },
//   { id: 'businessSubSegment', label: 'Business Sub Segment' },
//   { id: 'dealtype', label: 'Deal Type' },
//   { id: 'dealSubtype', label: 'Deal Sub type' },
//   { id: 'productProgram', label: 'Product Program' },
//   { id: 'beneficiary', label: 'Beneficiary' },
//   { id: 'document', label: 'Document' },
//   { id: 'dealSegment', label: 'Deal Segment' },
//   { id: 'ledgerAccount', label: 'Ledger Account' },
//   { id: 'countryCode', label: 'Country Code' },
//   { id: 'currencyCode', label: 'Currency Code' },
// ]



const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'DRAFT', 'INITIATED']


const CustomersPageImpl: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading: isDownloading } = useTemplateDownload()
  
  // Get active tab from current pathname
  const activeTab = getActiveTabFromPathname(pathname)

  // Mock data for demonstration - only used for the 'customer' tab
  const mockData: CustomerData[] = useMemo(() => {
    if (activeTab === 'customer') {
      return [
        { 
          id: 1562, 
          referenceId: 1562, 
          referenceType: 'CUSTOMER', 
          moduleName: 'CUSTOMER_MASTER', 
          actionKey: 'CREATE', 
          bpName: 'John Doe Customer', 
          currentStageOrder: 1, 
          taskStatus: 'PENDING', 
          createdAt: '2025-09-19T13:27:10.83...',
          amount: 100000,
          currency: 'USD'
        },
        { 
          id: 1563, 
          referenceId: 1563, 
          referenceType: 'CUSTOMER', 
          moduleName: 'CUSTOMER_MASTER', 
          actionKey: 'UPDATE', 
          bpName: 'Jane Smith Customer', 
          currentStageOrder: 2, 
          taskStatus: 'APPROVED', 
          createdAt: '2025-09-19T14:15:30.45...',
          amount: 150000,
          currency: 'EUR'
        },
      ]
    }
    return []
  }, [activeTab])

  const handleTabChange = useCallback((tabId: string) => {
    // Navigate to the dedicated route for the selected tab
    const route = masterCustomerTabRoutes[tabId]
    if (route) {
      router.push(route)
    }
  }, [router])

  // Table columns configuration matching the reference design
  const tableColumns = [
    {
      key: 'id',
      label: 'ID',
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'referenceId',
      label: 'Reference ID',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'referenceType',
      label: 'Reference Type',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'moduleName',
      label: 'Module Name',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'actionKey',
      label: 'Action Key',
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'bpName',
      label: 'BP Name',
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
  
    {
      key: 'taskStatus',
      label: 'Task Status',
      type: 'status' as const,
      width: 'w-30',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
      render: (value: string | number | null | undefined) =>
        displayValue(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  // Use the generic table state hook with customer data - only when customer tab is active
  const tableState = useTableState({
    data: mockData,
    searchFields: [
      'id',
      'referenceId',
      'referenceType',
      'moduleName',
      'actionKey',
      'bpName',
      'currentStageOrder',
      'taskStatus',
      'createdAt',
    ],
    initialRowsPerPage: 20,
  })

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
  } = tableState

  const handleDownloadTemplate = async () => {
   
  }


  const handleRowDelete = useCallback(async (row: CustomerData) => {
    try {
      console.log('Deleting customer:', row.id)
      // Add your delete logic here
        } catch (error) {
      console.log('Error deleting customer:', error)
    }
  }, [])

  const handleRowView = useCallback(async (row: CustomerData) => {
    try {
      console.log('Viewing customer:', row.id)
      // Add your view logic here
    } catch (error) {
      console.log('Error viewing customer:', error)
    }
  }, [])

  const renderExpandedContent = (row: CustomerData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">ID:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.id)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Reference ID:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.referenceId)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Reference Type:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.referenceType)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Module Name:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.moduleName)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Action Key:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.actionKey)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">BP Name:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.bpName)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Current Stage Order:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.currentStageOrder)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Task Status:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.taskStatus)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Created At:</span>
            <span className="ml-2 font-medium text-gray-800">
              {displayValue(row.createdAt)}
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
            View Customer
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  )

  const hasNoDataForTab = mockData.length === 0

  // Show loading state while data is being fetched
  if (false) {
    return (
      <TablePageLayout
        title="Master Customers"
        tabs={masterCustomerTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading customer data...</p>
          </div>
        </div>
      </TablePageLayout>
    )
  }

  // Get the current active tab's label
  const activeTabLabel = getActiveTabLabel(activeTab)

  return (
    <TablePageLayout
      title={`Master Customers : ${activeTabLabel}`}
      tabs={masterCustomerTabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {hasNoDataForTab ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No data available
            </h3>
            <p className="text-gray-600">
              There are no customers available at the moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <PageActionButtons
              entityType="customer"
              customActionButtons={actionButtons}
              onDownloadTemplate={handleDownloadTemplate}
              isDownloading={isDownloading}
              showButtons={{
                downloadTemplate: true,
                uploadDetails: true,
                addNew: true
              }}
            />
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <ExpandableDataTable<CustomerData>
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
                onRowSelectionChange={(selectedRows) => handleRowSelectionChange(0, selectedRows.length > 0)}
                expandedRows={expandedRows}
                onRowExpansionChange={(expandedRows) => handleRowExpansionChange(0, expandedRows.length > 0)}
                renderExpandedContent={renderExpandedContent}
                statusOptions={statusOptions}
                onRowView={handleRowView}
                showViewAction={true}
                onRowDelete={handleRowDelete}
                onRowClick={() => {}}
                showDeleteAction={true}
              />
            </div>
          </div>
        </div>
      )}
    </TablePageLayout>
  )
}

const CustomersPageClient = dynamic(
  () => Promise.resolve(CustomersPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const CustomersPage: React.FC = () => {
  return <CustomersPageClient />
}

export default CustomersPage
