'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Box, Card, CardContent, Button, Alert } from '@mui/material'
import { BeneficiaryData } from '../developerTypes'
import { RightSlideBeneficiaryDetailsPanel } from '../../RightSlidePanel/RightSlideBeneficiaryDetailsPanel'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { ExpandableDataTable } from '../../ExpandableDataTable'
import {
  useTableState,
  useDeleteBuildPartnerBeneficiary,
  useBuildPartnerBeneficiaries,
} from '@/hooks'
import { useBeneficiaryDropdowns } from '@/hooks/useBeneficiaryDropdowns'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { GlobalLoading } from '@/components/atoms'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '@/constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'
interface BeneficiaryDetails extends Record<string, unknown> {
  id?: string | number
  bpbBeneficiaryId: string
  bpbBeneficiaryType: string
  bpbTransferTypeDTO?: {
    id: number
    settingKey: string
    settingValue: string
    languageTranslationId: {
      id: number
      configId: string
      configValue: string
      content: string | null
      appLanguageCode: {
        id: number
        languageCode: string
        nameKey: string
        nameNativeValue: string
        deleted: boolean
        enabled: boolean
        rtl: boolean
      }
      applicationModuleDTO: any
      status: any
      enabled: boolean
      deleted: boolean
    }
    remarks: string | null
    status: any
    enabled: boolean
    deleted: boolean
  }
  bpbName: string
  bpbBankName: string
  bpbSwiftCode: string
  bpbRoutingCode?: string
  bpbAccountNumber: string
  buildPartnerId?: number
  createdAt?: string
  updatedAt?: string
  status?: string
  enabled?: boolean
}

interface Step4Props {
  beneficiaries: BeneficiaryData[]
  onBeneficiariesChange: (beneficiaries: BeneficiaryData[]) => void
  buildPartnerId?: string
  isReadOnly?: boolean
}

// Helper function to convert API response to BeneficiaryData format
const mapApiBeneficiaryToBeneficiaryData = (
  apiBeneficiary: any
): BeneficiaryData => {
  return {
    id: String(apiBeneficiary.id || ''),
    transferType: apiBeneficiary.bpbBeneficiaryType || '',
    name: apiBeneficiary.bpbName || '',
    bankName: apiBeneficiary.bpbBankName || '',
    swiftCode: apiBeneficiary.bpbSwiftCode || '',
    routingCode: apiBeneficiary.bpbRoutingCode || '',
    account: apiBeneficiary.bpbAccountNumber || '',
    buildPartnerDTO:
      apiBeneficiary.buildPartnerDTO || apiBeneficiary.buildPartnerDTO?.[0],
    // Include the transfer type DTO for display
    bpbTransferTypeDTO: apiBeneficiary.bpbTransferTypeDTO,
  }
}

const Step4: React.FC<Step4Props> = ({
  beneficiaries: _beneficiaries,
  onBeneficiariesChange,
  buildPartnerId,
  isReadOnly = false,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<BeneficiaryDetails | null>(null)
  const [selectedBeneficiaryIndex, setSelectedBeneficiaryIndex] = useState<
    number | null
  >(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [currentPageSize, setCurrentPageSize] = useState(20)

  const confirmDelete = useDeleteConfirmation()
  const deleteMutation = useDeleteBuildPartnerBeneficiary()

  // Fetch beneficiaries from API with pagination
  const {
    data: apiBeneficiariesResponse,
    isLoading: isLoadingData,
    error: dataError,
    refetch: refetchBeneficiaries,
    updatePagination,
    apiPagination,
  } = useBuildPartnerBeneficiaries(buildPartnerId, currentPage, currentPageSize)

  // Use beneficiaries from API (as BeneficiaryDetails[])
  const beneficiaryDetails: BeneficiaryDetails[] =
    (apiBeneficiariesResponse?.content as BeneficiaryDetails[]) || []

  // Load dropdown data from API (this works)
  const {
    bankNames,
    beneficiaryTypes,
    isLoading: dropdownsLoading,
    error: dropdownsError,
  } = useBeneficiaryDropdowns()

  // Dynamic labels (same approach as Contact Details step)
  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)
      if (buildPartnerLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  // Helper function to get display name from ID
  const getDisplayName = (
    id: string | number,
    options: any[],
    fallback?: string
  ): string => {
    if (!id || !options || options.length === 0) return fallback || String(id)

    const option = options.find(
      (opt) =>
        String(opt.id) === String(id) ||
        String(opt.settingValue) === String(id) ||
        String(opt.configId) === String(id)
    )

    return option?.configValue || option?.settingValue || fallback || String(id)
  }

  // Helper function to get beneficiary type display name from DTO
  const getBeneficiaryTypeDisplayName = (
    beneficiary: BeneficiaryDetails
  ): string => {
    // First try to get from bpbTransferTypeDTO
    if (beneficiary.bpbTransferTypeDTO?.languageTranslationId?.configValue) {
      return beneficiary.bpbTransferTypeDTO.languageTranslationId.configValue
    }

    // Fallback to old method if DTO is not available
    // return getDisplayName(beneficiary.bpbBeneficiaryType, beneficiaryTypes, String(beneficiary.bpbBeneficiaryType))
    return ''
  }

  // Helper function to get bank name display name
  const getBankNameDisplayName = (bankName: string | number): string => {
    return getDisplayName(bankName, bankNames, String(bankName))
  }

  // Template download hook
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // Use ref to track if we've already synced the data
  const hasSyncedRef = useRef(false)
  const lastSyncedDataRef = useRef<string>('')

  // Sync fetched beneficiaries with parent component
  useEffect(() => {
    if (
      apiBeneficiariesResponse?.content &&
      apiBeneficiariesResponse.content.length > 0
    ) {
      const mappedBeneficiaries = apiBeneficiariesResponse.content.map(
        mapApiBeneficiaryToBeneficiaryData
      )

      // Create a string representation of the data to check if it has changed
      const dataString = JSON.stringify(mappedBeneficiaries)

      // Only call onBeneficiariesChange if the data has actually changed
      if (dataString !== lastSyncedDataRef.current) {
        onBeneficiariesChange(mappedBeneficiaries)
        lastSyncedDataRef.current = dataString
        hasSyncedRef.current = true
      }
    }
  }, [apiBeneficiariesResponse?.content]) // Remove onBeneficiariesChange from dependencies to prevent infinite loop

  const addBeneficiary = () => {
    setEditMode('add')
    setSelectedBeneficiary(null)
    setSelectedBeneficiaryIndex(null)
    setIsPanelOpen(true)
  }

  // Template download handler
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.BUILD_PARTNER_BENEFICIARY)
    } catch (error) {}
  }

  const handleBeneficiaryAdded = (newBeneficiary: unknown) => {
    // Convert to BeneficiaryData format for form
    const convertedBeneficiary = newBeneficiary as BeneficiaryData
    const updatedBeneficiaries = [
      ...(_beneficiaries || []),
      convertedBeneficiary,
    ]
    onBeneficiariesChange(updatedBeneficiaries)

    // Refresh API data if we have a buildPartnerId
    if (buildPartnerId) {
      refetchBeneficiaries()
    }
  }

  const handleBeneficiaryUpdated = (
    updatedBeneficiary: unknown,
    index: number
  ) => {
    const updatedBeneficiaries = [...(_beneficiaries || [])]
    updatedBeneficiaries[index] = updatedBeneficiary as BeneficiaryData
    onBeneficiariesChange(updatedBeneficiaries)

    // Refresh API data if we have a buildPartnerId
    if (buildPartnerId) {
      refetchBeneficiaries()
    }
  }

  const handleEdit = (row: BeneficiaryDetails, index: number) => {
    setEditMode('edit')
    setSelectedBeneficiary(row)
    setSelectedBeneficiaryIndex(index)
    setIsPanelOpen(true)
  }

  const handleDelete = (row: BeneficiaryDetails, index: number) => {
    const beneficiaryId = row.id
    const beneficiaryName = row.bpbName || 'beneficiary'

    confirmDelete({
      itemName: `beneficiary: ${beneficiaryName}`,
      onConfirm: async () => {
        try {
          // If beneficiary has an ID, delete from API
          if (beneficiaryId) {
            await deleteMutation.mutateAsync(String(beneficiaryId))
          }

          // Remove from local state
          const updatedBeneficiaries = (_beneficiaries || []).filter(
            (_, i) => i !== index
          )
          onBeneficiariesChange(updatedBeneficiaries)

          // Refresh API data if we have a buildPartnerId
          if (buildPartnerId) {
            refetchBeneficiaries()
          }
        } catch (error) {
          console.error('Failed to delete beneficiary:', error)
          throw error
        }
      },
    })
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setEditMode('add')
    setSelectedBeneficiary(null)
    setSelectedBeneficiaryIndex(null)
  }

  const tableColumns = [
    {
      key: 'bpbBeneficiaryId',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_REF'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'bpbBeneficiaryType',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_PAYMODE'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
      render: (_: any, row: BeneficiaryDetails) =>
        getBeneficiaryTypeDisplayName(row),
    },
    {
      key: 'bpbName',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_NAME'),
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'bpbBankName',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_BANK'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
      render: (_: any, row: BeneficiaryDetails) =>
        getBankNameDisplayName(row.bpbBankName),
    },
    {
      key: 'bpbSwiftCode',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_BIC'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'bpbRoutingCode',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_ROUTING'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
      render: (_: any, row: BeneficiaryDetails) =>
        String((row as any).bpbRoutingCode ?? (row as any).routingCode ?? ''),
    },
    {
      key: 'bpbAccountNumber',
      label: getBuildPartnerLabelDynamic('CDL_BP_BENE_ACCOUNT'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'actions',
      label: getBuildPartnerLabelDynamic('CDL_COMMON_ACTION'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  // Get pagination data from API response if available
  const totalRows = buildPartnerId
    ? apiPagination.totalElements
    : beneficiaryDetails.length
  const totalPages = buildPartnerId
    ? apiPagination.totalPages
    : Math.ceil(beneficiaryDetails.length / 20)

  // Use the generic table state hook
  const {
    search,
    paginated,
    startItem: localStartItem,
    endItem: localEndItem,
    page: localPage,
    rowsPerPage: localRowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange: handleLocalPageChange,
    handleRowsPerPageChange: handleLocalRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  } = useTableState({
    data: beneficiaryDetails,
    searchFields: [
      'bpbBeneficiaryId',
      'bpbBeneficiaryType',
      'bpbName',
      'bpbBankName',
      'bpbSwiftCode',
      'bpbRoutingCode',
      'routingCode',
      'bpbAccountNumber',
    ],
    initialRowsPerPage: 20,
  })

  // Filter beneficiaries based on search state when buildPartnerId exists (client-side filtering)
  const filteredBeneficiaries = useMemo(() => {
    if (!buildPartnerId) return beneficiaryDetails

    // Check if there are any search values
    const hasSearchValues = Object.values(search).some(
      (val) => val.trim() !== ''
    )
    if (!hasSearchValues) return beneficiaryDetails

    // Filter beneficiaries based on search state (same logic as useTableState)
    return beneficiaryDetails.filter((beneficiary) => {
      return [
        'bpbBeneficiaryId',
        'bpbBeneficiaryType',
        'bpbName',
        'bpbBankName',
        'bpbSwiftCode',
        'bpbRoutingCode',
        'routingCode',
        'bpbAccountNumber',
      ].every((field) => {
        const searchVal = search[field]?.trim() || ''
        if (!searchVal) return true

        // Handle special fields that need custom extraction
        let value: string | undefined
        if (field === 'bpbRoutingCode' || field === 'routingCode') {
          value = String(
            (beneficiary as any).bpbRoutingCode ??
              (beneficiary as any).routingCode ??
              ''
          )
        } else if (field === 'bpbBeneficiaryType') {
          // For beneficiary type, search in the display name
          value = getBeneficiaryTypeDisplayName(beneficiary)
        } else if (field === 'bpbBankName') {
          // For bank name, search in the display name
          value = getBankNameDisplayName(beneficiary.bpbBankName)
        } else {
          value = String(beneficiary[field as keyof BeneficiaryDetails] ?? '')
        }

        const searchLower = searchVal.toLowerCase()
        const valueLower = value.toLowerCase()
        return valueLower.includes(searchLower)
      })
    })
  }, [beneficiaryDetails, search, buildPartnerId])

  // Use API pagination state when buildPartnerId exists, otherwise use local state
  // Note: useTableState uses 1-based pages (1, 2, 3...), API uses 0-based (0, 1, 2...)
  const page = buildPartnerId ? currentPage + 1 : localPage // Convert API 0-based to UI 1-based
  const rowsPerPage = buildPartnerId ? currentPageSize : localRowsPerPage

  // Calculate start and end items for API pagination
  const startItem = buildPartnerId
    ? currentPage * currentPageSize + 1
    : localStartItem
  const endItem = buildPartnerId
    ? Math.min((currentPage + 1) * currentPageSize, totalRows)
    : localEndItem

  // Wrap pagination handlers to update API pagination
  const handlePageChange = (newPage: number) => {
    if (buildPartnerId) {
      const apiPage = newPage - 1 // Convert UI 1-based to API 0-based
      setCurrentPage(apiPage)
      updatePagination(apiPage, currentPageSize)
    } else {
      handleLocalPageChange(newPage)
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    if (buildPartnerId) {
      setCurrentPage(0)
      setCurrentPageSize(newRowsPerPage)
      updatePagination(0, newRowsPerPage)
    } else {
      handleLocalRowsPerPageChange(newRowsPerPage)
    }
  }

  // Show loading state
  if (isLoadingData || dropdownsLoading) {
    return (
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Box
            sx={{
              backgroundColor: '#FFFFFFBF',
              borderRadius: '16px',
              margin: '0 auto',
              width: '100%',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GlobalLoading fullHeight className="min-h-[200px]" />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (dataError || dropdownsError) {
    return (
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load beneficiary data. Please try again.
            {dataError && (
              <div>Step data error: {(dataError as any).message}</div>
            )}
            {dropdownsError && (
              <div>Dropdown error: {dropdownsError.message}</div>
            )}
          </Alert>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Button
              variant="outlined"
              onClick={() => {
                refetchBeneficiaries()
              }}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
                boxShadow: 'none',
              }}
            >
              {getBuildPartnerLabelDynamic('CDL_COMMON_RETRY')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={addBeneficiary}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
                boxShadow: 'none',
              }}
            >
              {getBuildPartnerLabelDynamic('CDL_BP_BENE_INFO')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: '#FFFFFFBF',
        width: '94%',
        margin: '0 auto',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="end" alignItems="center" mb={4}>
          <Box display="flex" gap={2} alignItems="center">
            <PageActionButtons
              entityType="developerBeneficiary"
              onDownloadTemplate={handleDownloadTemplate}
              isDownloading={isDownloading}
              showButtons={{
                downloadTemplate: !isReadOnly,
                uploadDetails: !isReadOnly,
                addNew: false,
              }}
            />
            {!isReadOnly && (
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={addBeneficiary}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '0.5px',
                  verticalAlign: 'middle',
                  boxShadow: 'none',
                }}
              >
                {getBuildPartnerLabelDynamic('CDL_BP_BENE_INFO')}
              </Button>
            )}
          </Box>
        </Box>

        <ExpandableDataTable<BeneficiaryDetails>
          data={buildPartnerId ? filteredBeneficiaries : paginated}
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
          {...(!isReadOnly && {
            onRowEdit: handleEdit,
            onRowDelete: handleDelete,
          })}
          showEditAction={!isReadOnly}
          showDeleteAction={!isReadOnly}
          showViewAction={false}
        />
      </CardContent>

      {buildPartnerId && (
        <RightSlideBeneficiaryDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onBeneficiaryAdded={handleBeneficiaryAdded}
          onBeneficiaryUpdated={handleBeneficiaryUpdated}
          title={getBuildPartnerLabelDynamic('CDL_BP_BENE_INFO')}
          mode={editMode}
          {...(selectedBeneficiary && {
            beneficiaryData: {
              ...selectedBeneficiary,
              bpbRoutingCode: selectedBeneficiary.bpbRoutingCode || '',
            } as any,
          })}
          {...(selectedBeneficiaryIndex !== null && {
            beneficiaryIndex: selectedBeneficiaryIndex,
          })}
          bankNames={bankNames}
          buildPartnerId={buildPartnerId}
          beneficiaryTypes={beneficiaryTypes}
          dropdownsLoading={dropdownsLoading}
          dropdownsError={dropdownsError}
        />
      )}
    </Card>
  )
}

export default Step4
