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
import { RightSlideDealPrimaryPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideDealPrimary'

interface DealPrimaryData extends Record<string, unknown> {
  id: number
  dealId: string
  dealStatus: string
  mainEscrowCif: string
  clientName: string
  productManager: string
  businessSegment: string
  businessSubsegment: string
  regulatory: string
  fees: string
  rmName: string
  location: string
  dealType: string
  dealSubType: string
  productProgram: string
  dealPriority: string
  freeField1: string
  freeField2: string
  freeField3: string
  freeField4: string
}


const DealPrimaryPageClient = dynamic(
  () => Promise.resolve(DealPrimaryPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const DealPrimaryPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DealPrimaryData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for deal primary
  const dealPrimaryData = useMemo(() => [
    {
      id: 1,
      dealId: 'DP001',
      dealStatus: 'Active',
      mainEscrowCif: 'CIF001',
      clientName: 'ABC Corporation',
      productManager: 'John Smith',
      businessSegment: 'Commercial',
      businessSubsegment: 'Real Estate',
      regulatory: 'Yes',
      fees: 'Standard',
      rmName: 'Jane Doe',
      location: 'New York',
      dealType: 'Escrow',
      dealSubType: 'Property',
      productProgram: 'Standard',
      dealPriority: 'High',
      freeField1: 'Custom Field 1',
      freeField2: 'Custom Field 2',
      freeField3: 'Custom Field 3',
      freeField4: 'Custom Field 4',
    },
    {
      id: 2,
      dealId: 'DP002',
      dealStatus: 'Pending',
      mainEscrowCif: 'CIF002',
      clientName: 'XYZ Ltd',
      productManager: 'Mike Johnson',
      businessSegment: 'Investment',
      businessSubsegment: 'Securities',
      regulatory: 'No',
      fees: 'Premium',
      rmName: 'Sarah Wilson',
      location: 'London',
      dealType: 'Investment',
      dealSubType: 'Bond',
      productProgram: 'Premium',
      dealPriority: 'Medium',
      freeField1: 'Custom Field 1',
      freeField2: 'Custom Field 2',
      freeField3: 'Custom Field 3',
      freeField4: 'Custom Field 4',
    },
    {
      id: 3,
      dealId: 'DP003',
      dealStatus: 'Completed',
      mainEscrowCif: 'CIF003',
      clientName: 'Global Enterprises',
      productManager: 'David Brown',
      businessSegment: 'Retail',
      businessSubsegment: 'Banking',
      regulatory: 'Yes',
      fees: 'Basic',
      rmName: 'Lisa Anderson',
      location: 'Singapore',
      dealType: 'Loan',
      dealSubType: 'Personal',
      productProgram: 'Basic',
      dealPriority: 'Low',
      freeField1: 'Custom Field 1',
      freeField2: 'Custom Field 2',
      freeField3: 'Custom Field 3',
      freeField4: 'Custom Field 4',
    },
  ] as DealPrimaryData[], [])

  const getEntityLabelDynamic = useCallback(
    (configId: string): string => {
      return getEntityLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'dealId',
      label: getEntityLabelDynamic('CDL_EDP_DEAL_ID'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'dealStatus',
      label: getEntityLabelDynamic('CDL_EDP_DEAL_STATUS'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'clientName',
      label: getEntityLabelDynamic('CDL_EDP_CLIENT_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'productManager',
      label: getEntityLabelDynamic('CDL_EDP_PRODUCT_MANAGER'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'businessSegment',
      label: getEntityLabelDynamic('CDL_EDP_BUSINESS_SEGMENT'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'dealPriority',
      label: getEntityLabelDynamic('CDL_EDP_DEAL_PRIORITY'),
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
    data: dealPrimaryData,
    searchFields: [
      'dealId',
      'dealStatus',
      'clientName',
      'productManager',
      'businessSegment',
      'dealPriority',
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

  const handleRowDelete = (row: DealPrimaryData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: DealPrimaryData) => {
    const transformedData = {
      name: row.clientName || '',
      actionKey: 'deal-primary',
      actionName: 'Deal Primary',
      moduleCode: 'ENTITY',
      description: 'Deal Primary Management',
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

  const renderExpandedContent = (row: DealPrimaryData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_EDP_DEAL_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealId || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_EDP_DEAL_STATUS')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealStatus || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_EDP_CLIENT_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.clientName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_EDP_PRODUCT_MANAGER')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.productManager || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_EDP_BUSINESS_SEGMENT')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSegment || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_EDP_DEAL_PRIORITY')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealPriority || '-'}
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
            Edit Deal Primary
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Deal Primary
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Deal Primary"
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
              <ExpandableDataTable<DealPrimaryData>
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
        title="Delete Deal Primary"
        message={`Are you sure you want to delete this deal primary record?`}
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
      <RightSlideDealPrimaryPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const DealPrimaryPage: React.FC = () => {
  return <DealPrimaryPageClient />
}

export default DealPrimaryPage