'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { ExpandableDataTable } from '@/components/organisms/ExpandableDataTable'
import { useTableState } from '@/hooks/useTableState'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { getLabelByConfigId as getEntityLabel } from '@/constants/mappings/customerMapping'
import { CommentModal } from '@/components/molecules'
import { RightSlideBeneficiaryPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideBeneficiary'

interface BeneficiaryData extends Record<string, unknown> {
  id: number
  beneficiaryId: string
  beneficiaryName: string
  beneficiaryAddress1: string
  telephoneNo: string
  mobileNo: string
  role: string
  transferType: string
  beneficiaryAccountNoIban: string
  beneficiaryBankSwiftBic: string
  beneficiaryBank: string
  beneficiaryRoutingCode: string
  remarks: string
  documentId: string
  documentName: string
  documentDescription: string
  uploadDocument: string
}


const BeneficiaryPageClient = dynamic(
  () => Promise.resolve(BeneficiaryPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const BeneficiaryPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BeneficiaryData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for beneficiary
  const beneficiaryData = useMemo(() => [
    {
      id: 1,
      beneficiaryId: 'BEN001',
      beneficiaryName: 'John Smith',
      beneficiaryAddress1: '123 Main Street, New York, NY 10001',
      telephoneNo: '+1-555-0123',
      mobileNo: '+1-555-0124',
      role: 'Primary Beneficiary',
      transferType: 'Wire Transfer',
      beneficiaryAccountNoIban: 'US64SVBKUS6S3300958879',
      beneficiaryBankSwiftBic: 'SVBKUS6S',
      beneficiaryBank: 'Silicon Valley Bank',
      beneficiaryRoutingCode: '021000021',
      remarks: 'Primary beneficiary for the trust fund',
      documentId: 'id_proof',
      documentName: 'Passport Copy',
      documentDescription: 'Valid passport for identity verification',
      uploadDocument: 'passport_john_smith.pdf',
    },
    {
      id: 2,
      beneficiaryId: 'BEN002',
      beneficiaryName: 'Sarah Johnson',
      beneficiaryAddress1: '456 Oak Avenue, Los Angeles, CA 90210',
      telephoneNo: '+1-555-0234',
      mobileNo: '+1-555-0235',
      role: 'Secondary Beneficiary',
      transferType: 'ACH Transfer',
      beneficiaryAccountNoIban: 'US64CHASUS33U3300958879',
      beneficiaryBankSwiftBic: 'CHASUS33',
      beneficiaryBank: 'JPMorgan Chase Bank',
      beneficiaryRoutingCode: '021000021',
      remarks: 'Secondary beneficiary in case of primary beneficiary unavailability',
      documentId: 'address_proof',
      documentName: 'Utility Bill',
      documentDescription: 'Recent utility bill for address verification',
      uploadDocument: 'utility_bill_sarah.pdf',
    },
    {
      id: 3,
      beneficiaryId: 'BEN003',
      beneficiaryName: 'Michael Brown',
      beneficiaryAddress1: '789 Pine Street, Chicago, IL 60601',
      telephoneNo: '+1-555-0345',
      mobileNo: '+1-555-0346',
      role: 'Contingent Beneficiary',
      transferType: 'Check',
      beneficiaryAccountNoIban: 'US64BOFAUS3N3300958879',
      beneficiaryBankSwiftBic: 'BOFAUS3N',
      beneficiaryBank: 'Bank of America',
      beneficiaryRoutingCode: '026009593',
      remarks: 'Contingent beneficiary for emergency situations',
      documentId: 'bank_statement',
      documentName: 'Bank Statement',
      documentDescription: 'Recent bank statement for account verification',
      uploadDocument: 'bank_statement_michael.pdf',
    },
  ] as BeneficiaryData[], [])

  const getEntityLabelDynamic = useCallback(
    (configId: string): string => {
      return getEntityLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'beneficiaryId',
      label: getEntityLabelDynamic('CDL_BEN_BENEFICIARY_ID'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'beneficiaryName',
      label: getEntityLabelDynamic('CDL_BEN_BENEFICIARY_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'role',
      label: getEntityLabelDynamic('CDL_BEN_ROLE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'transferType',
      label: getEntityLabelDynamic('CDL_BEN_TRANSFER_TYPE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'beneficiaryBank',
      label: getEntityLabelDynamic('CDL_BEN_BENEFICIARY_BANK'),
      type: 'text' as const,
      width: 'w-48',
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
    data: beneficiaryData,
    searchFields: [
      'beneficiaryId',
      'beneficiaryName',
      'role',
      'transferType',
      'beneficiaryBank',
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

  const handleRowDelete = (row: BeneficiaryData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: BeneficiaryData) => {
    const transformedData = {
      name: row.beneficiaryName || '',
      actionKey: 'beneficiary',
      actionName: 'Beneficiary',
      moduleCode: 'ENTITY',
      description: 'Beneficiary Management',
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

  const renderExpandedContent = (row: BeneficiaryData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_BEN_BENEFICIARY_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.beneficiaryId || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_BEN_BENEFICIARY_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.beneficiaryName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_BEN_ROLE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.role || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_BEN_TRANSFER_TYPE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.transferType || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_BEN_BENEFICIARY_BANK')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.beneficiaryBank || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_BEN_TELEPHONE_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.telephoneNo || '-'}
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
            Edit Beneficiary
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Beneficiary
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Beneficiary"
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
              <ExpandableDataTable<BeneficiaryData>
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
        title="Delete Beneficiary"
        message={`Are you sure you want to delete this beneficiary record?`}
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
      <RightSlideBeneficiaryPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const BeneficiaryPage: React.FC = () => {
  return <BeneficiaryPageClient />
}

export default BeneficiaryPage