'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getPaymentLabel } from '@/constants/mappings/customerMapping'
import { CommentModal } from '@/components/molecules'
import { RightSlidePanel } from '@/components/organisms/RightSlidePanel'

interface PaymentData extends Record<string, unknown> {
  id: number
  paymentRefNo: string
  dealNo: string
  clientName: string
  paymentAmount: string
  paymentDate: string
  paymentMethod: string
  transactionReference: string
  status: string
  // Additional fields for form compatibility
  ruleRefNo?: string
  fromAccountDr?: string
  amountCapDr?: string
  amountDr?: string
  minimumBalance?: string
  thresholdAmount?: string
  transferType?: string
  occurrence?: string
  recurringFrequency?: string
  firstTxnDate?: Date | null
  endDate?: Date | null
  retryDays?: string
  retryUptoEndOfMonthExecution?: boolean
  resetCounter?: string
  dependence?: string
  remarks?: string
  toAccount?: string
  paymentType?: string
  swiftCode?: string
  amountCapCr?: string
  amountCr?: string
  priority?: string
  percentageShare?: string
  beneficiaryName?: string
}

const PaymentPageClient = dynamic(
  () => Promise.resolve(PaymentPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const PaymentPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PaymentData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'view'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Dummy data for payments
  const paymentData = useMemo(() => [
    {
      id: 1,
      paymentRefNo: 'PAY001',
      dealNo: 'DEAL001',
      clientName: 'ABC Corporation',
      paymentAmount: '100000.00',
      paymentDate: '2024-01-15',
      paymentMethod: 'Bank Transfer',
      transactionReference: 'TXN001',
      status: 'Completed',
    },
    {
      id: 2,
      paymentRefNo: 'PAY002',
      dealNo: 'DEAL002',
      clientName: 'XYZ Ltd',
      paymentAmount: '50000.00',
      paymentDate: '2024-02-20',
      paymentMethod: 'Credit Card',
      transactionReference: 'TXN002',
      status: 'Pending',
    },
    {
      id: 3,
      paymentRefNo: 'PAY003',
      dealNo: 'DEAL003',
      clientName: 'Global Enterprises',
      paymentAmount: '75000.00',
      paymentDate: '2024-03-10',
      paymentMethod: 'Bank Transfer',
      transactionReference: 'TXN003',
      status: 'Completed',
    },
  ] as PaymentData[], [])

  const getPaymentLabelDynamic = useCallback(
    (configId: string): string => {
      return getPaymentLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'paymentRefNo',
      label: 'Payment Ref No',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'dealNo',
      label: 'Deal No',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'clientName',
      label: 'Client Name',
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'paymentAmount',
      label: 'Payment Amount',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
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
    data: paymentData,
    searchFields: [
      'paymentRefNo',
      'dealNo',
      'clientName',
      'paymentAmount',
      'status',
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

  const handleRowDelete = (row: PaymentData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: PaymentData) => {
    const transformedData: PaymentData = {
      ...row,
      ruleRefNo: row.paymentRefNo || '',
      fromAccountDr: '',
      amountCapDr: '',
      amountDr: row.paymentAmount || '',
      minimumBalance: '',
      thresholdAmount: '',
      transferType: '',
      occurrence: '',
      recurringFrequency: '',
      firstTxnDate: row.paymentDate ? new Date(row.paymentDate) : null,
      endDate: null,
      retryDays: '',
      retryUptoEndOfMonthExecution: false,
      resetCounter: '',
      dependence: '',
      remarks: '',
      toAccount: '',
      paymentType: row.paymentMethod || '',
      swiftCode: '',
      amountCapCr: '',
      amountCr: '',
      priority: '',
      percentageShare: '',
      beneficiaryName: '',
    }
    setEditingItem(transformedData)
    setPanelMode('view')
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

  const renderExpandedContent = (row: PaymentData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Payment Ref No:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.paymentRefNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Deal No:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Client Name:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.clientName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Payment Amount:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.paymentAmount || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Payment Date:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.paymentDate || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.status || '-'}
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
            Edit Payment
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Payment
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Customer Payment : Payment"
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
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
              <ExpandableDataTable<PaymentData>
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
        title="Delete Payment"
        message={`Are you sure you want to delete this payment record?`}
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
      <RightSlidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={panelMode === 'add' ? 'Add Payment' : panelMode === 'edit' ? 'Edit Payment' : 'View Payment'}
      />
    </>
  )
}

const PaymentPage: React.FC = () => {
  return <PaymentPageClient />
}

export default PaymentPage
