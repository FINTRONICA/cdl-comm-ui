'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getDepositLabel } from '@/constants/mappings/customerMapping'
import { CommentModal } from '@/components/molecules'
import { RightSlideDeposit } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideDeposit'

interface DepositData extends Record<string, unknown> {
  id: number
  depositRefNo: string
  dealNo: string
  clientName: string
  depositReceivableCategory: string
  depositReceivableAmount: string
  subDepositType: string
  transactionDate: string
  transactionReference: string
  escrowAccountNumber: string
  transactionDescription: string
  transactionAmount: string
  transactionDate2: string
  narration: string
}

const DepositPageClient = dynamic(
  () => Promise.resolve(DepositPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)

const DepositPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DepositData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Dummy data for deposits
  const depositData = useMemo(() => [
    {
      id: 1,
      depositRefNo: 'DEP001',
      dealNo: 'DEAL001',
      clientName: 'ABC Corporation',
      depositReceivableCategory: 'Initial Deposit',
      depositReceivableAmount: '100000.00',
      subDepositType: 'Property Deposit',
      transactionDate: '2024-01-15',
      transactionReference: 'TXN001',
      escrowAccountNumber: 'ESC001',
      transactionDescription: 'Initial property deposit payment',
      transactionAmount: '100000.00',
      transactionDate2: '2024-01-15',
      narration: 'Property purchase deposit',
    },
    {
      id: 2,
      depositRefNo: 'DEP002',
      dealNo: 'DEAL002',
      clientName: 'XYZ Ltd',
      depositReceivableCategory: 'Security Deposit',
      depositReceivableAmount: '50000.00',
      subDepositType: 'Rental Deposit',
      transactionDate: '2024-02-20',
      transactionReference: 'TXN002',
      escrowAccountNumber: 'ESC002',
      transactionDescription: 'Rental security deposit',
      transactionAmount: '50000.00',
      transactionDate2: '2024-02-20',
      narration: 'Rental agreement security deposit',
    },
    {
      id: 3,
      depositRefNo: 'DEP003',
      dealNo: 'DEAL003',
      clientName: 'Global Enterprises',
      depositReceivableCategory: 'Performance Deposit',
      depositReceivableAmount: '75000.00',
      subDepositType: 'Contract Deposit',
      transactionDate: '2024-03-10',
      transactionReference: 'TXN003',
      escrowAccountNumber: 'ESC003',
      transactionDescription: 'Contract performance deposit',
      transactionAmount: '75000.00',
      transactionDate2: '2024-03-10',
      narration: 'Contract performance guarantee',
    },
  ] as DepositData[], [])

  const getDepositLabelDynamic = useCallback(
    (configId: string): string => {
      return getDepositLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'depositRefNo',
      label: getDepositLabelDynamic('CDL_DEP_DEPOSIT_REF_NO'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'dealNo',
      label: getDepositLabelDynamic('CDL_DEP_DEAL_NO'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'clientName',
      label: getDepositLabelDynamic('CDL_DEP_CLIENT_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'depositReceivableCategory',
      label: getDepositLabelDynamic('CDL_DEP_DEPOSIT_RECEIVABLE_CATEGORY'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'depositReceivableAmount',
      label: getDepositLabelDynamic('CDL_DEP_DEPOSIT_RECEIVABLE_AMOUNT'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'transactionDate',
      label: getDepositLabelDynamic('CDL_DEP_TRANSACTION_DATE'),
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
    data: depositData,
    searchFields: [
      'depositRefNo',
      'dealNo',
      'clientName',
      'depositReceivableCategory',
      'depositReceivableAmount',
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

  const handleRowDelete = (row: DepositData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: DepositData) => {
    const transformedData = {
      name: row.clientName || '',
      actionKey: 'deposit',
      actionName: 'Deposit',
      moduleCode: 'CUSTOMER_DEPOSIT',
      description: 'Deposit Management',
      ...row
    }
    setEditingItem(transformedData)
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

  const renderExpandedContent = (row: DepositData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getDepositLabelDynamic('CDL_DEP_DEPOSIT_REF_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.depositRefNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getDepositLabelDynamic('CDL_DEP_DEAL_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getDepositLabelDynamic('CDL_DEP_CLIENT_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.clientName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getDepositLabelDynamic('CDL_DEP_DEPOSIT_RECEIVABLE_CATEGORY')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.depositReceivableCategory || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getDepositLabelDynamic('CDL_DEP_DEPOSIT_RECEIVABLE_AMOUNT')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.depositReceivableAmount || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getDepositLabelDynamic('CDL_DEP_TRANSACTION_DATE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.transactionDate || '-'}
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
            Edit Deposit
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Deposit
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Customer Deposit : Deposit"
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
              <ExpandableDataTable<DepositData>
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
        title="Delete Deposit"
        message={`Are you sure you want to delete this deposit record?`}
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
      <RightSlideDeposit
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const DepositPage: React.FC = () => {
  return <DepositPageClient />
}

export default DepositPage