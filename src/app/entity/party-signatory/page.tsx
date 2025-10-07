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
import { RightSlidePartySignatoryPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlidePartySignatory'

interface PartySignatoryData extends Record<string, unknown> {
  id: number
  partiesRefNo: string
  partyCrnNumber: string
  partyName: string
  partyAddress1: string
  partyAddress2: string
  partyAddress3: string
  role: string
  partyNoticeAddress1: string
  partyNoticeAddress2: string
  partyNoticeAddress3: string
  partySignatory: string
  noticePerson: string
  noticePersonSignatory: string
  noticePersonEmail: string
  partyAssociateType: string
}


const PartySignatoryPageClient = dynamic(
  () => Promise.resolve(PartySignatoryPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const PartySignatoryPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PartySignatoryData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for party signatory
  const partySignatoryData = useMemo(() => [
    {
      id: 1,
      partiesRefNo: 'PS001',
      partyCrnNumber: 'CRN123456',
      partyName: 'ABC Corporation Ltd',
      partyAddress1: '123 Business Street',
      partyAddress2: 'Suite 100',
      partyAddress3: 'Downtown',
      role: 'Borrower',
      partyNoticeAddress1: '456 Legal Avenue',
      partyNoticeAddress2: 'Floor 5',
      partyNoticeAddress3: 'Legal District',
      partySignatory: 'John Smith',
      noticePerson: 'Jane Doe',
      noticePersonSignatory: 'Jane Doe',
      noticePersonEmail: 'jane.doe@abccorp.com',
      partyAssociateType: 'Corporation',
    },
    {
      id: 2,
      partiesRefNo: 'PS002',
      partyCrnNumber: 'CRN789012',
      partyName: 'XYZ Investment Group',
      partyAddress1: '789 Finance Plaza',
      partyAddress2: 'Tower A',
      partyAddress3: 'Financial Center',
      role: 'Lender',
      partyNoticeAddress1: '321 Banking Boulevard',
      partyNoticeAddress2: 'Level 10',
      partyNoticeAddress3: 'Banking District',
      partySignatory: 'Mike Johnson',
      noticePerson: 'Sarah Wilson',
      noticePersonSignatory: 'Sarah Wilson',
      noticePersonEmail: 'sarah.wilson@xyzinvest.com',
      partyAssociateType: 'Corporation',
    },
    {
      id: 3,
      partiesRefNo: 'PS003',
      partyCrnNumber: 'CRN345678',
      partyName: 'Global Trust Services',
      partyAddress1: '555 Trust Building',
      partyAddress2: 'Office 200',
      partyAddress3: 'Trust Quarter',
      role: 'Guarantor',
      partyNoticeAddress1: '777 Guarantee Street',
      partyAddress2: 'Suite 50',
      partyAddress3: 'Guarantee Plaza',
      partySignatory: 'David Brown',
      noticePerson: 'Lisa Anderson',
      noticePersonSignatory: 'Lisa Anderson',
      noticePersonEmail: 'lisa.anderson@globaltrust.com',
      partyAssociateType: 'Trust',
    },
  ] as PartySignatoryData[], [])

  const getEntityLabelDynamic = useCallback(
    (configId: string): string => {
      return getEntityLabel(configId)
    },
    []
  )

  const tableColumns = [
    {
      key: 'partiesRefNo',
      label: getEntityLabelDynamic('CDL_PS_PARTIES_REF_NO'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'partyName',
      label: getEntityLabelDynamic('CDL_PS_PARTY_NAME'),
      type: 'text' as const,
      width: 'w-48',
      sortable: true,
    },
    {
      key: 'role',
      label: getEntityLabelDynamic('CDL_PS_ROLE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'partySignatory',
      label: getEntityLabelDynamic('CDL_PS_PARTY_SIGNATORY'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'partyAssociateType',
      label: getEntityLabelDynamic('CDL_PS_PARTY_ASSOCIATE_TYPE'),
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
    data: partySignatoryData,
    searchFields: [
      'partiesRefNo',
      'partyName',
      'role',
      'partySignatory',
      'partyAssociateType',
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

  const handleRowDelete = (row: PartySignatoryData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: PartySignatoryData) => {
    const transformedData = {
      name: row.partyName || '',
      actionKey: 'party-signatory',
      actionName: 'Party Signatory',
      moduleCode: 'ENTITY',
      description: 'Party Signatory Management',
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

  const renderExpandedContent = (row: PartySignatoryData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PS_PARTIES_REF_NO')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.partiesRefNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PS_PARTY_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.partyName || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PS_ROLE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.role || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PS_PARTY_SIGNATORY')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.partySignatory || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PS_PARTY_ASSOCIATE_TYPE')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.partyAssociateType || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_PS_NOTICE_PERSON_EMAIL')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.noticePersonEmail || '-'}
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
            Edit Party Signatory
          </button>
          <button
            onClick={() => handleRowDelete(row)}
            className="w-full p-3 text-sm text-left text-red-700 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50"
          >
            Delete Party Signatory
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Party Signatory"
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
              <ExpandableDataTable<PartySignatoryData>
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
        title="Delete Party Signatory"
        message={`Are you sure you want to delete this party signatory record?`}
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
      <RightSlidePartySignatoryPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const PartySignatoryPage: React.FC = () => {
  return <PartySignatoryPageClient />
}

export default PartySignatoryPage