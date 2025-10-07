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
import { RightSlideParameterPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideParameter'

interface ParameterData extends Record<string, unknown> {
  id: number
  parameterRefNo: string
  dealStartDate: Date
  dealEndDate: Date
  permittedInvestmentAllowed: string
  permittedInvestment: string
  amendmentAllowed: string
  dealClosureBasis: string
  dealNotes: string
}


const ParameterPageClient = dynamic(
  () => Promise.resolve(ParameterPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const ParameterPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ParameterData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for parameter
  const parameterData = useMemo(() => [
    {
      id: 1,
      parameterRefNo: 'PAR001',
      dealStartDate: new Date('2024-01-01'),
      dealEndDate: new Date('2024-12-31'),
      permittedInvestmentAllowed: 'Yes',
      permittedInvestment: 'Stocks',
      amendmentAllowed: 'Yes',
      dealClosureBasis: 'Maturity',
      dealNotes: 'Standard commercial deal parameters with stock investment allowance',
    },
    {
      id: 2,
      parameterRefNo: 'PAR002',
      dealStartDate: new Date('2024-02-01'),
      dealEndDate: new Date('2025-01-31'),
      permittedInvestmentAllowed: 'No',
      permittedInvestment: '',
      amendmentAllowed: 'No',
      dealClosureBasis: 'Early Termination',
      dealNotes: 'Restricted deal with no investment allowance and no amendments',
    },
    {
      id: 3,
      parameterRefNo: 'PAR003',
      dealStartDate: new Date('2024-03-01'),
      dealEndDate: new Date('2026-02-28'),
      permittedInvestmentAllowed: 'Yes',
      permittedInvestment: 'Bonds',
      amendmentAllowed: 'Yes',
      dealClosureBasis: 'Mutual Agreement',
      dealNotes: 'Long-term deal with bond investment and flexible closure terms',
    },
  ] as ParameterData[], [])

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
      key: 'parameterRefNo',
      label: getEntityLabelDynamic('CDL_PAR_PARAMETER_REF_NO'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'dealStartDate',
      label: getEntityLabelDynamic('CDL_PAR_DEAL_START_DATE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: Date) => formatDate(value),
    },
    {
      key: 'dealEndDate',
      label: getEntityLabelDynamic('CDL_PAR_DEAL_END_DATE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (value: Date) => formatDate(value),
    },
    {
      key: 'permittedInvestmentAllowed',
      label: getEntityLabelDynamic('CDL_PAR_PERMITTED_INVESTMENT_ALLOWED'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'dealClosureBasis',
      label: getEntityLabelDynamic('CDL_PAR_DEAL_CLOSURE_BASIS'),
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
    data: parameterData,
    searchFields: [
      'parameterRefNo',
      'permittedInvestmentAllowed',
      'permittedInvestment',
      'amendmentAllowed',
      'dealClosureBasis',
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

  const handleRowDelete = (row: ParameterData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: ParameterData) => {
    const transformedData = {
      name: row.parameterRefNo || '',
      actionKey: 'parameter',
      actionName: 'Parameter',
      moduleCode: 'ENTITY',
      description: 'Parameter Management',
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

  const renderExpandedContent = (row: ParameterData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PAR_PARAMETER_REF_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.parameterRefNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PAR_DEAL_START_DATE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealStartDate ? formatDate(row.dealStartDate) : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PAR_DEAL_END_DATE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.dealEndDate ? formatDate(row.dealEndDate) : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PAR_PERMITTED_INVESTMENT_ALLOWED')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.permittedInvestmentAllowed || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PAR_PERMITTED_INVESTMENT')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.permittedInvestment || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PAR_AMENDMENT_ALLOWED')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.amendmentAllowed || '-'}
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
            Edit Parameter
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Parameter
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Parameter"
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
              <ExpandableDataTable<ParameterData>
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
        title="Delete Parameter"
        message={`Are you sure you want to delete this parameter record?`}
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
      <RightSlideParameterPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const ParameterPage: React.FC = () => {
  return <ParameterPageClient />
}

export default ParameterPage