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
import { RightSlideFeesPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideFees'

interface FeesData extends Record<string, unknown> {
  id: number
  regulatoryRefNo: string
  startDate: Date
  endDate: Date
  fee: string
  feeType: string
  feesFrequency: string
  frequencyBasis: string
  location: string
  dealType: string
  dealSubType: string
  productProgramme: string
  dealPriority: string
  amountRatePerTransaction: string
  debitAccount: string
  creditToAccount: string
  documentId: string
  documentName: string
  documentDescription: string
  uploadDocument: string
}


const FeesPageClient = dynamic(
  () => Promise.resolve(FeesPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const FeesPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FeesData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for fees
  const feesData = useMemo(() => [
    {
      id: 1,
      regulatoryRefNo: 'REG001',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      fee: 'Processing Fee',
      feeType: 'Fixed',
      feesFrequency: 'Monthly',
      frequencyBasis: 'Calendar',
      location: 'New York',
      dealType: 'Escrow',
      dealSubType: 'Property',
      productProgramme: 'Standard',
      dealPriority: 'High',
      amountRatePerTransaction: '500.00',
      debitAccount: 'ACC001',
      creditToAccount: 'ACC002',
      documentId: 'fee_schedule',
      documentName: 'Fee Schedule 2024',
      documentDescription: 'Standard fee schedule for escrow transactions',
      uploadDocument: 'fee_schedule_2024.pdf',
    },
    {
      id: 2,
      regulatoryRefNo: 'REG002',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      fee: 'Maintenance Fee',
      feeType: 'Percentage',
      feesFrequency: 'Quarterly',
      frequencyBasis: 'Business Days',
      location: 'London',
      dealType: 'Investment',
      dealSubType: 'Bond',
      productProgramme: 'Premium',
      dealPriority: 'Medium',
      amountRatePerTransaction: '2.5',
      debitAccount: 'ACC003',
      creditToAccount: 'ACC004',
      documentId: 'regulatory_document',
      documentName: 'Regulatory Compliance Document',
      documentDescription: 'Document outlining regulatory compliance requirements',
      uploadDocument: 'regulatory_compliance.pdf',
    },
    {
      id: 3,
      regulatoryRefNo: 'REG003',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-02-28'),
      fee: 'Transaction Fee',
      feeType: 'Tiered',
      feesFrequency: 'Per Transaction',
      frequencyBasis: 'Working Days',
      location: 'Singapore',
      dealType: 'Loan',
      dealSubType: 'Personal',
      productProgramme: 'Basic',
      dealPriority: 'Low',
      amountRatePerTransaction: '25.00',
      debitAccount: 'ACC005',
      creditToAccount: 'ACC006',
      documentId: 'agreement',
      documentName: 'Fee Agreement',
      documentDescription: 'Agreement outlining transaction fee structure',
      uploadDocument: 'fee_agreement.pdf',
    },
  ] as FeesData[], [])

  const getEntityLabelDynamic = useCallback(
    (configId: string): string => {
      return getEntityLabel(configId)
    },
    []
  )

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const tableColumns = [
    {
      key: 'regulatoryRefNo',
      label: getEntityLabelDynamic('CDL_FEE_REGULATORY_REF_NO'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'fee',
      label: getEntityLabelDynamic('CDL_FEE_FEE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'feeType',
      label: getEntityLabelDynamic('CDL_FEE_FEE_TYPE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'feesFrequency',
      label: getEntityLabelDynamic('CDL_FEE_FEES_FREQUENCY'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'amountRatePerTransaction',
      label: getEntityLabelDynamic('CDL_FEE_AMOUNT_RATE_PER_TRANSACTION'),
      type: 'text' as const,
      width: 'w-40',
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
    data: feesData,
    searchFields: [
      'regulatoryRefNo',
      'fee',
      'feeType',
      'feesFrequency',
      'amountRatePerTransaction',
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

  const handleRowDelete = (row: FeesData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: FeesData) => {
    const transformedData = {
      name: row.fee || '',
      actionKey: 'fees',
      actionName: 'Fees',
      moduleCode: 'ENTITY',
      description: 'Fees Management',
      id: row.id,
      regulatoryRefNo: row.regulatoryRefNo,
      startDate: row.startDate,
      endDate: row.endDate,
      fee: row.fee,
      feeType: row.feeType,
      feesFrequency: row.feesFrequency,
      frequencyBasis: row.frequencyBasis,
      location: row.location,
      dealType: row.dealType,
      dealSubType: row.dealSubType,
      productProgramme: row.productProgramme,
      dealPriority: row.dealPriority,
      amountRatePerTransaction: row.amountRatePerTransaction,
      debitAccount: row.debitAccount,
      creditToAccount: row.creditToAccount,
      documentId: row.documentId,
      documentName: row.documentName,
      documentDescription: row.documentDescription,
      uploadDocument: row.uploadDocument,
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

  const renderExpandedContent = (row: FeesData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_FEE_REGULATORY_REF_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.regulatoryRefNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_FEE_FEE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.fee || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_FEE_FEE_TYPE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.feeType || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_FEE_FEES_FREQUENCY')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.feesFrequency || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_FEE_AMOUNT_RATE_PER_TRANSACTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.amountRatePerTransaction || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_FEE_LOCATION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.location || '-'}
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
            Edit Fees
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Fees
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Fees"
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
              <ExpandableDataTable<FeesData>
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
        title="Delete Fees"
        message={`Are you sure you want to delete this fees record?`}
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
      <RightSlideFeesPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const FeesPage: React.FC = () => {
  return <FeesPageClient />
}

export default FeesPage