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
import { RightSlideUploadDocumentsPanel } from '@/components/organisms/RightSlidePanel/customerSlidePanel/RightSlideUploadDocuments'

interface DocumentItem {
  id: string
  name: string
  size: number
  type: string
  uploadDate: Date
  status: 'completed' | 'uploading' | 'error'
  url?: string
  file?: File
  classification?: string
}

interface UploadDocumentsData extends Record<string, unknown> {
  id: number
  documentId: string
  documentName: string
  documentDescription: string
  uploadDocument: string
  documents: DocumentItem[]
}


const UploadDocumentsPageClient = dynamic(
  () => Promise.resolve(UploadDocumentsPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ),
  }
)


const UploadDocumentsPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UploadDocumentsData | null>(null)
  const [panelMode, setPanelMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([])
  const [isDeleting, setIsDeleting] = useState(false)


  // Dummy data for upload documents
  const uploadDocumentsData = useMemo(() => [
    {
      id: 1,
      documentId: 'contract',
      documentName: 'Service Agreement Contract',
      documentDescription: 'Main service agreement contract for the deal',
      uploadDocument: 'service_agreement.pdf',
      documents: [
        {
          id: 'doc_1',
          name: 'service_agreement.pdf',
          size: 1024000,
          type: 'application/pdf',
          uploadDate: new Date('2024-01-15'),
          status: 'completed' as const,
          classification: 'Contract',
        },
        {
          id: 'doc_2',
          name: 'terms_and_conditions.pdf',
          size: 512000,
          type: 'application/pdf',
          uploadDate: new Date('2024-01-16'),
          status: 'completed' as const,
          classification: 'Agreement',
        },
      ],
    },
    {
      id: 2,
      documentId: 'certificate',
      documentName: 'Compliance Certificate',
      documentDescription: 'Regulatory compliance certificate for the transaction',
      uploadDocument: 'compliance_certificate.pdf',
      documents: [
        {
          id: 'doc_3',
          name: 'compliance_certificate.pdf',
          size: 256000,
          type: 'application/pdf',
          uploadDate: new Date('2024-02-01'),
          status: 'completed' as const,
          classification: 'Certificate',
        },
        {
          id: 'doc_4',
          name: 'regulatory_approval.pdf',
          size: 384000,
          type: 'application/pdf',
          uploadDate: new Date('2024-02-02'),
          status: 'completed' as const,
          classification: 'License',
        },
      ],
    },
    {
      id: 3,
      documentId: 'invoice',
      documentName: 'Transaction Invoice',
      documentDescription: 'Invoice for the completed transaction',
      uploadDocument: 'transaction_invoice.pdf',
      documents: [
        {
          id: 'doc_5',
          name: 'transaction_invoice.pdf',
          size: 128000,
          type: 'application/pdf',
          uploadDate: new Date('2024-03-01'),
          status: 'completed' as const,
          classification: 'Invoice',
        },
        {
          id: 'doc_6',
          name: 'payment_receipt.pdf',
          size: 96000,
          type: 'application/pdf',
          uploadDate: new Date('2024-03-02'),
          status: 'completed' as const,
          classification: 'Receipt',
        },
      ],
    },
  ] as UploadDocumentsData[], [])

  const getEntityLabelDynamic = useCallback(
    (configId: string): string => {
      return getEntityLabel(configId)
    },
    []
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const tableColumns = [
    {
      key: 'documentId',
      label: getEntityLabelDynamic('CDL_UD_DOCUMENT_ID'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'documentName',
      label: getEntityLabelDynamic('CDL_UD_DOCUMENT_NAME'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'documentDescription',
      label: getEntityLabelDynamic('CDL_UD_DOCUMENT_DESCRIPTION'),
      type: 'text' as const,
      width: 'w-64',
      sortable: true,
    },
    {
      key: 'documents',
      label: 'Uploaded Files',
      type: 'text' as const,
      width: 'w-32',
      sortable: false,
      render: (value: DocumentItem[]) => `${value?.length || 0} files`,
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
    data: uploadDocumentsData,
    searchFields: [
      'documentId',
      'documentName',
      'documentDescription',
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

  const handleRowDelete = (row: UploadDocumentsData) => {
    if (isDeleting) {
      return
    }

    setDeleteIds([row.id])
    setIsDeleteModalOpen(true)
  }

  const handleRowView = (row: UploadDocumentsData) => {
    const transformedData = {
      name: row.documentName || '',
      actionKey: 'upload-documents',
      actionName: 'Upload Documents',
      moduleCode: 'ENTITY',
      description: 'Upload Documents Management',
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

  const renderExpandedContent = (row: UploadDocumentsData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_UD_DOCUMENT_ID')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.documentId || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_UD_DOCUMENT_NAME')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.documentName || '-'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getEntityLabelDynamic('CDL_UD_DOCUMENT_DESCRIPTION')}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.documentDescription || '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Uploaded Files:</span>
            <span className="ml-2 font-medium text-gray-800">
              {row.documents?.length || 0} files
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Uploaded Documents</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {row.documents?.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.size)} • {formatDate(doc.uploadDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : doc.status === 'uploading'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          )) || (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TablePageLayout
        title="Entity : Upload Documents"
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
              <ExpandableDataTable<UploadDocumentsData>
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
        title="Delete Upload Documents"
        message={`Are you sure you want to delete this upload documents record?`}
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
      <RightSlideUploadDocumentsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        mode={panelMode}
        actionData={editingItem as never}
      />
    </>
  )
}

const UploadDocumentsPage: React.FC = () => {
  return <UploadDocumentsPageClient />
}

export default UploadDocumentsPage
