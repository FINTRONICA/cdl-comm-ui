'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getEntityLabel } from '@/constants/mappings/customerMapping'
import { CommentModal } from '@/components/molecules'
import { RightSlideAccountPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideAccount'

interface AccountsData extends Record<string, unknown> {
  id: number
  accountRefNo: string
  accountType: string
  accountNo: string
  productCode: string
  accountPurpose: string
  taxPayment: string
  accountName: string
  primaryAccount: string
  iban: string
  currency: string
  accountTitle: string
  virtualAccount: string
  accountType2: string
  accountAssigned1: string
  accountOpeningDate: string
  bulkUploadProcessing: string
  unitaryPayment: string
  lookupField1: string
  lookupField2: string
}


const AccountsPageClient = dynamic(
  () => Promise.resolve(AccountsPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const AccountsPageImpl: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AccountsData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for accounts
  const accountsData = useMemo(() => [
    {
      id: 1,
      accountRefNo: 'ACC001',
      accountType: 'Savings',
      accountNo: '1234567890',
      productCode: 'PROD001',
      accountPurpose: 'Personal',
      taxPayment: 'Yes',
      accountName: 'John Doe Savings',
      primaryAccount: 'Yes',
      iban: 'GB29NWBK60161331926819',
      currency: 'USD',
      accountTitle: 'John Doe',
      virtualAccount: 'VACC001',
      accountType2: 'Standard',
      accountAssigned1: 'Branch001',
      accountOpeningDate: '2024-01-15',
      bulkUploadProcessing: 'No',
      unitaryPayment: 'Yes',
      lookupField1: 'Lookup1',
      lookupField2: 'Lookup2',
    },
    {
      id: 2,
      accountRefNo: 'ACC002',
      accountType: 'Checking',
      accountNo: '0987654321',
      productCode: 'PROD002',
      accountPurpose: 'Business',
      taxPayment: 'No',
      accountName: 'ABC Corp Checking',
      primaryAccount: 'No',
      iban: 'GB29NWBK60161331926820',
      currency: 'EUR',
      accountTitle: 'ABC Corporation',
      virtualAccount: 'VACC002',
      accountType2: 'Premium',
      accountAssigned1: 'Branch002',
      accountOpeningDate: '2024-02-20',
      bulkUploadProcessing: 'Yes',
      unitaryPayment: 'No',
      lookupField1: 'Lookup1',
      lookupField2: 'Lookup2',
    },
  ] as AccountsData[], [])

  const getEntityLabelDynamic = useCallback(
    (configId: string): string => {
      return getEntityLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'accountRefNo',
      label: getEntityLabelDynamic('CDL_ACC_ACCOUNT_REF_NO'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'accountType',
      label: getEntityLabelDynamic('CDL_ACC_ACCOUNT_TYPE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'accountNo',
      label: getEntityLabelDynamic('CDL_ACC_ACCOUNT_NO'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'accountName',
      label: getEntityLabelDynamic('CDL_ACC_ACCOUNT_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'iban',
      label: getEntityLabelDynamic('CDL_ACC_IBAN'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'currency',
      label: getEntityLabelDynamic('CDL_ACC_CURRENCY'),
      type: 'text' as const,
      width: 'w-24',
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
    data: accountsData,
    searchFields: [
      'accountRefNo',
      'accountType',
      'accountNo',
      'accountName',
      'iban',
      'currency',
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

  const handleRowDelete = (row: AccountsData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: AccountsData) => {
    const transformedData = {
      name: row.accountName || '',
      actionKey: 'accounts',
      actionName: 'Accounts',
      moduleCode: 'ENTITY',
      description: 'Accounts Management',
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

  const renderExpandedContent = (row: AccountsData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_ACC_ACCOUNT_REF_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountRefNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_ACC_ACCOUNT_TYPE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountType || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_ACC_ACCOUNT_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_ACC_ACCOUNT_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.accountName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_ACC_IBAN')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.iban || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_ACC_CURRENCY')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.currency || '-'}
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
            Edit Account
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Accounts"
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
              <ExpandableDataTable<AccountsData>
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
        title="Delete Account"
        message={`Are you sure you want to delete this account?`}
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
        actionData={editingItem as never}
      />
    </>
  )
}

const AccountsPage: React.FC = () => {
  return <AccountsPageClient />
}

export default AccountsPage
