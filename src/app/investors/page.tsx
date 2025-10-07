'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components/templates/DashboardLayout'
import { PermissionAwareDataTable } from '../../components/organisms/PermissionAwareDataTable'
import { PageActionButtons } from '../../components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useTableState } from '@/hooks/useTableState'

import { useCapitalPartnerLabelsApi } from '../../hooks/useCapitalPartnerLabelsApi'
import { useAppStore } from '@/store'
import { CapitalPartnerService } from '@/services/api/capitalPartnerService'
import type { CapitalPartnerUIData } from '@/services/api/capitalPartnerService'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'DRAFT',
  'INITIATED',
]
type InvestorData = CapitalPartnerUIData

const getTableColumns = (getLabel: (configId: string) => string) => [
  {
    key: 'investor',
    label: getLabel('CDL_CP_FIRSTNAME'),
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'investorId',
    label: getLabel('CDL_CP_REFID'),
    type: 'text' as const,
    width: 'w-32',
    sortable: true,
  },
  {
    key: 'buildPartnerName',
    label: getLabel('CDL_CP_BP_NAME'),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'buildPartnerId',
    label: getLabel('CDL_CP_BP_ID'),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'buildPartnerCif',
    label: getLabel('CDL_CP_BP_CIF'),
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'projectName',
    label: getLabel('CDL_CP_BPA_NAME'),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'projectCIF',
    label: getLabel('CDL_CP_BPA_CIF'),
    type: 'text' as const,
    width: 'w-48',
    sortable: true,
  },
  {
    key: 'unitNumber',
    label: getLabel('CDL_CP_UNIT_NUMBER'),
    type: 'text' as const,
    width: 'w-40',
    sortable: true,
  },
  {
    key: 'approvalStatus',
    label: getLabel('CDL_CP_APPROVAL_STATUS'),
    type: 'status' as const,
    width: 'w-32',
    sortable: true,
  },
  {
    key: 'actions',
    label: getLabel('CDL_CP_ACTION'),
    type: 'actions' as const,
    width: 'w-20',
  },
]

const InvestorsPage: React.FC = () => {
  const router = useRouter()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [investorsData, setInvestorsData] = useState<CapitalPartnerUIData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [errorData, setErrorData] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [tableKey, setTableKey] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentLanguage = useAppStore((state) => state.language)
  const { getLabelResolver } = useSidebarConfig()
  const investorsTitle = getLabelResolver
    ? getLabelResolver('investors', 'Investor')
    : 'Investor'
  const { getLabel } = useCapitalPartnerLabelsApi()
  const confirmDelete = useDeleteConfirmation()

  // Template download hook
  const {
    downloadTemplate: downloadInvestorTemplate,
    isLoading: isDownloadingInvestor,
    error: downloadErrorInvestor,
    clearError: clearErrorInvestor,
  } = useTemplateDownload()

  const fetchInvestors = useCallback(async (page: number, size: number) => {
    try {
      setLoadingData(true)
      setErrorData(null)

      const res = await CapitalPartnerService.getCapitalPartners(page - 1, size)

      setInvestorsData(res.content)
      setTotalElements(res.page.totalElements)
      setTotalPages(res.page.totalPages)

      if (res.page.totalPages === 0 && res.content.length > 0) {
        const calculatedPages = Math.ceil(res.page.totalElements / size) || 1
        setTotalPages(calculatedPages)
      }
    } catch (err: any) {
      console.error('Error fetching investors:', err)
      setErrorData(
        `Failed to fetch investors: ${err.message || 'Unknown error'}`
      )
      setInvestorsData([])
      setTotalElements(0)
      setTotalPages(0)
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    fetchInvestors(currentPage, rowsPerPage)
  }, [fetchInvestors, currentPage, rowsPerPage])

  const getCapitalPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      return getLabel(configId, currentLanguage, configId)
    },
    [getLabel, currentLanguage]
  )

  const tableColumns = useMemo(
    () => getTableColumns(getCapitalPartnerLabelDynamic),
    [getCapitalPartnerLabelDynamic]
  )

  const [search, setSearch] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      [
        'investor',
        'investorId',
        'buildPartnerName',
        'buildPartnerCif',
        'buildPartnerId',
        'projectName',
        'projectCIF',
        'unitNumber',
        'approvalStatus',
      ].map((field) => [field, ''])
    )
  )
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  const { handleSort, sortConfig } = useTableState({
    data: investorsData,
    searchFields: [],
    initialRowsPerPage: 20,
  })

  const filteredData = useMemo(() => {
    const hasSearchValues = Object.values(search).some(
      (val) => val.trim() !== ''
    )
    let data = hasSearchValues
      ? investorsData.filter((row) => {
          return Object.entries(search).every(([field, searchVal]) => {
            const trimmedSearch = searchVal?.toLowerCase().trim() || ''
            if (!trimmedSearch) return true
            const value = String(
              row[field as keyof CapitalPartnerUIData] ?? ''
            ).toLowerCase()
            return value.includes(trimmedSearch)
          })
        })
      : investorsData

    // Apply sorting if sortConfig is available
    if (sortConfig && sortConfig.key) {
      data = [...data].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof CapitalPartnerUIData] ?? ''
        const bValue = b[sortConfig.key as keyof CapitalPartnerUIData] ?? ''

        if (sortConfig.direction === 'asc') {
          return String(aValue).localeCompare(String(bValue))
        } else {
          return String(bValue).localeCompare(String(aValue))
        }
      })
    }

    return data
  }, [investorsData, search, sortConfig])

  const startItem = totalElements > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, totalElements)

  const handleSearchChange = useCallback((field: string, value: string) => {
    setSearch((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    setSelectedRows([])
    setExpandedRows([])
  }, [])

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
    setSelectedRows([])
    setExpandedRows([])
  }, [])

  const handleRowSelectionChange = useCallback((newSelectedRows: number[]) => {
    setSelectedRows(newSelectedRows)
  }, [])

  const handleRowExpansionChange = useCallback((newExpandedRows: number[]) => {
    setExpandedRows(newExpandedRows)
  }, [])

  // Template download handler
  const handleDownloadInvestorTemplate = async () => {
    try {
      await downloadInvestorTemplate(TEMPLATE_FILES.INVESTOR)
    } catch (error) {}
  }

  const handleRowDelete = (row: InvestorData) => {
    if (isDeleting) {
      return
    }

    if (!row.id) {
      alert('Cannot delete: No ID found for this investor')
      return
    }

    confirmDelete({
      itemName: `investor: ${row.investor}`,
      onConfirm: async () => {
        try {
          setIsDeleting(true)

          await CapitalPartnerService.deleteCapitalPartner(row.id)

          setSelectedRows([])
          setExpandedRows([])

          await new Promise((resolve) => setTimeout(resolve, 500))

          await fetchInvestors(currentPage, rowsPerPage)

          setTableKey((prev) => prev + 1)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete investor: ${errorMessage}`)
          throw error
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }
  const handleRowView = (row: InvestorData) => {
    if (row.id) {
      router.push(`/investors/new/${row.id}?step=1&mode=view`)
    } else {
      alert('Cannot view: No ID found for this investor')
    }
  }

  const handleRowEdit = (row: InvestorData) => {
    if (row.id) {
      router.push(`/investors/new/${row.id}`)
    } else {
      alert('Cannot edit: No ID found for this investor')
    }
  }

  const renderExpandedContent = (row: InvestorData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          {getCapitalPartnerLabelDynamic('CDL_CP_BASIC_INFO')}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getCapitalPartnerLabelDynamic('CDL_CP_FIRSTNAME')}:
            </span>
            <span className="ml-2">{row.investor}</span>
          </div>
          <div>
            <span className="text-gray-600">
              {getCapitalPartnerLabelDynamic('CDL_CP_REFID')}:
            </span>
            <span className="ml-2">{row.investorId}</span>
          </div>
          <div>
            <span className="text-gray-600">
              {getCapitalPartnerLabelDynamic('CDL_CP_UNIT_NUMBER')}:
            </span>
            <span className="ml-2">{row.unitNumber || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">
              {getCapitalPartnerLabelDynamic('CDL_CP_APPROVAL_STATUS')}:
            </span>
            <span className="ml-2">{row.approvalStatus}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Build Partner Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Build Partner Name:</span>
            <span className="ml-2">{row.buildPartnerName}</span>
          </div>
          <div>
            <span className="text-gray-600">Build Partner CIF:</span>
            <span className="ml-2">{row.buildPartnerCif}</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (loadingData) {
    return (
      <DashboardLayout title={investorsTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (errorData) {
    return (
      <DashboardLayout title={investorsTitle}>
        <div className="p-6 text-red-600">{errorData}</div>
      </DashboardLayout>
    )
  }

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* Download Error Alert */}
      {downloadErrorInvestor && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Investor Template Error: {downloadErrorInvestor}
            </span>
            <button
              onClick={clearErrorInvestor}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <DashboardLayout title={investorsTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <PageActionButtons
              entityType="investor"
              onDownloadTemplate={handleDownloadInvestorTemplate}
              isDownloading={isDownloadingInvestor}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<InvestorData>
                key={`investors-table-${tableKey}`}
                data={filteredData}
                columns={tableColumns}
                searchState={search}
                onSearchChange={handleSearchChange}
                paginationState={{
                  page: currentPage,
                  rowsPerPage,
                  totalRows: totalElements,
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
                statusOptions={statusOptions}
                onRowDelete={handleRowDelete}
                onRowView={handleRowView}
                onRowEdit={handleRowEdit}
                deletePermissions={['cp_delete']}
                viewPermissions={['cp_view']}
                editPermissions={['cp_update']}
                updatePermissions={['cp_update']}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default InvestorsPage
