'use client'

import React, { useState } from 'react'
import { TablePageLayout } from '../../../components/templates/TablePageLayout'
import { ExpandableDataTable } from '../../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../../hooks/useTableState'
import { BankData } from '../../../types/bank'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'

// Mock bank data based on the screenshot
const bankData: BankData[] = [
  {
    bankName: 'SBI',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'HDFC',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'ICICI',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'Panjab National',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'Bank Of Baroda',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'Kotak Mahindra Bank',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'Axis Bank',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'IndusInd',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'IDBI',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  {
    bankName: 'Bank of India',
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  },
  // Add more banks to reach 204 total as mentioned in pagination
  ...Array.from({ length: 194 }, (_, i) => ({
    bankName: `Bank ${i + 11}`,
    bankIBAN: 'IBANANS987900',
    swiftCode: 'SCD0093499343434',
    routingCode: 'RC 9349934343',
    ttcCode: 'TRANS987900',
    branchCode: '33349934',
  })),
]

const tableColumns = [
  {
    key: 'bankName',
    label: 'Bank Name',
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'bankIBAN',
    label: 'Bank IBAN',
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'swiftCode',
    label: 'Swift Code',
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'routingCode',
    label: 'Routing Code',
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'ttcCode',
    label: 'TTC Code',
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'branchCode',
    label: 'Branch Code',
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
]

const BankManagementPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const { getLabelResolver } = useSidebarConfig()
  const bankManagementTitle = getLabelResolver
    ? getLabelResolver('bank', 'Bank Management')
    : 'Bank Management'
  // Use the generic table state hook
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
  } = useTableState({
    data: bankData,
    searchFields: [
      'bankName',
      'bankIBAN',
      'swiftCode',
      'routingCode',
      'ttcCode',
      'branchCode',
    ],
    initialRowsPerPage: 20,
  })

  const actionButtons = [
    {
      label: 'Download',
      onClick: () => console.log('Download'),
      icon: '/download.svg',
      iconAlt: 'download icon',
    },
    {
      label: 'More',
      onClick: () => setIsSidePanelOpen(true),
      icon: '/ellipsis.svg',
      iconAlt: 'more icon',
    },
  ]

  // Render expanded content
  const renderExpandedContent = (row: BankData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Bank Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Bank Name:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.bankName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Bank IBAN:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.bankIBAN}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Swift Code:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.swiftCode}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Routing Code:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.routingCode}
            </span>
          </div>
          <div>
            <span className="text-gray-600">TTC Code:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.ttcCode}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Branch Code:</span>
            <span className="ml-2 text-gray-800 font-medium">
              {row.branchCode}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Bank Details
        </h4>
        <div className="space-y-3">
          <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">
            <div className="font-medium text-gray-900 mb-2">
              Contact Information
            </div>
            <div className="text-gray-600">Phone: +91-XXX-XXXXXXX</div>
            <div className="text-gray-600">
              Email: info@{row.bankName.toLowerCase().replace(/\s+/g, '')}.com
            </div>
            <div className="text-gray-600">
              Address: Main Branch, {row.bankName}
            </div>
          </div>
          <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">
            <div className="font-medium text-gray-900 mb-2">
              Operating Hours
            </div>
            <div className="text-gray-600">
              Monday - Friday: 9:00 AM - 5:00 PM
            </div>
            <div className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</div>
            <div className="text-gray-600">Sunday: Closed</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      <TablePageLayout
        title={bankManagementTitle}
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        statusCards={[]}
        actionButtons={actionButtons}
      >
        <ExpandableDataTable<BankData>
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
          onRowSelectionChange={handleRowSelectionChange}
          expandedRows={expandedRows}
          onRowExpansionChange={handleRowExpansionChange}
          renderExpandedContent={renderExpandedContent}
        />
      </TablePageLayout>
    </>
  )
}

export default BankManagementPage
