'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Card, CardContent, Button } from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { FeeData } from '../developerTypes'
import { RightSlideFeeDetailsPanel } from '../../RightSlidePanel/RightSlideFeeDetailsPanel'
import { ExpandableDataTable } from '../../ExpandableDataTable'
import { useTableState } from '@/hooks'
import { useBuildPartnerFees } from '@/hooks/useBuildPartners'
import { FeeUIData } from '@/services/api/buildPartnerService'
import { formatDate } from '@/utils'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'
import { useDeleteBuildPartnerFee } from '@/hooks/useBuildPartners'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '@/constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'

interface Step3Props {
  fees: FeeData[]
  onFeesChange: (fees: FeeData[]) => void
  buildPartnerId?: string
  isReadOnly?: boolean
}

const Step3: React.FC<Step3Props> = ({
  fees,
  onFeesChange,
  buildPartnerId,
  isReadOnly = false,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [selectedFee, setSelectedFee] = useState<FeeData | FeeUIData | null>(
    null
  )
  const [selectedFeeIndex, setSelectedFeeIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [currentPageSize, setCurrentPageSize] = useState(20)

  const confirmDelete = useDeleteConfirmation()
  const deleteMutation = useDeleteBuildPartnerFee()

  // Dynamic label support
  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)
      return buildPartnerLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  // Fetch fee data from API with pagination when buildPartnerId is available
  const {
    data: apiFeeResponse,
    isLoading: isLoadingFees,
    error: feeError,
    refetch: refetchFees,
    updatePagination,
    apiPagination,
  } = useBuildPartnerFees(buildPartnerId, currentPage, currentPageSize)

  // Transform API data to table format
  const transformedApiData: FeeUIData[] =
    apiFeeResponse?.content?.map((fee: FeeUIData) => ({
      ...fee,
      feeToBeCollected: fee.feeToBeCollected
        ? formatDate(fee.feeToBeCollected, 'DD/MM/YYYY')
        : '',
      nextRecoveryDate: fee.nextRecoveryDate
        ? formatDate(fee.nextRecoveryDate, 'DD/MM/YYYY')
        : '',
      // Normalize collected amount so table can read a single key
      totalAmount: fee.totalAmount ?? fee.Amount ?? '',
    })) || []

  // Use API data if available, otherwise use form data
  const feeDetails: (FeeData | FeeUIData)[] =
    transformedApiData.length > 0 ? transformedApiData : fees || []

  const addFee = () => {
    setEditMode('add')
    setSelectedFee(null)
    setSelectedFeeIndex(null)
    setIsPanelOpen(true)
  }

  const handleFeeAdded = (newFee: unknown) => {
    // Convert FeeUIData back to FeeData format for form
    const convertedFee = newFee as FeeData
    const updatedFees = [...(fees || []), convertedFee]
    onFeesChange(updatedFees)

    // Refresh API data if we have a buildPartnerId
    if (buildPartnerId) {
      refetchFees()
    }
  }

  const handleFeeUpdated = (updatedFee: unknown, index: number) => {
    const updatedFees = [...(fees || [])]
    updatedFees[index] = updatedFee as FeeData
    onFeesChange(updatedFees)

    // Refresh API data if we have a buildPartnerId
    if (buildPartnerId) {
      refetchFees()
    }
  }

  const handleEdit = (row: FeeData | FeeUIData, index: number) => {
    setEditMode('edit')
    setSelectedFee(row)
    setSelectedFeeIndex(index)
    setIsPanelOpen(true)
  }

  const handleDelete = (row: FeeData | FeeUIData, index: number) => {
    const feeId = (row as any).id || (row as any).feeId
    const feeType = row.feeType || 'fee'

    confirmDelete({
      itemName: `fee: ${feeType}`,
      onConfirm: async () => {
        try {
          // If fee has an ID, delete from API
          if (feeId) {
            await deleteMutation.mutateAsync(feeId)
          }

          // Remove from local state
          const updatedFees = (fees || []).filter((_, i) => i !== index)
          onFeesChange(updatedFees)

          // Refresh API data if we have a buildPartnerId
          if (buildPartnerId) {
            refetchFees()
          }
        } catch (error) {
          console.error('Failed to delete fee:', error)
          throw error
        }
      },
    })
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setEditMode('add')
    setSelectedFee(null)
    setSelectedFeeIndex(null)
  }

  // Debug logging
  useEffect(() => {}, [
    buildPartnerId,
    fees,
    transformedApiData,
    feeDetails,
    isLoadingFees,
    feeError,
  ])

  const tableColumns = [
    {
      key: 'feeType',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_TYPE'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'frequency',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_FREQUENCY'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'debitAccount',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_ACCOUNT'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'feeToBeCollected',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEE_COLLECTION_DATE'),
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'nextRecoveryDate',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_DATE'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'feePercentage',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_RATE'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'debitAmount',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_AMOUNT'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'vatPercentage',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_VAT'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'currency',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_CURRENCY'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'amount',
      label: getBuildPartnerLabelDynamic('CDL_BP_FEES_TOTAL_AMOUNT'),
      type: 'text' as const,
      width: 'w-28',
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
    : feeDetails.length
  const totalPages = buildPartnerId
    ? apiPagination.totalPages
    : Math.ceil(feeDetails.length / 20)

  // Use the generic table state hook
  const {
    search,
    paginated,
    startItem: localStartItem,
    endItem: localEndItem,
    page: localPage,
    rowsPerPage: localRowsPerPage,
    handleSearchChange,
    handlePageChange: handleLocalPageChange,
    handleRowsPerPageChange: handleLocalRowsPerPageChange,
  } = useTableState({
    data: feeDetails,
    searchFields: [
      'feeType',
      'frequency',
      'debitAccount',
      'feeToBeCollected',
      'nextRecoveryDate',
      'feePercentage',
      'debitAmount',
      'amount',
      'vatPercentage',
      'currency',
    ],
    initialRowsPerPage: 20,
  })

  // Filter fee details based on search state when buildPartnerId exists (client-side filtering)
  const filteredFeeDetails = useMemo(() => {
    if (!buildPartnerId) return feeDetails

    // Check if there are any search values
    const hasSearchValues = Object.values(search).some(
      (val) => val.trim() !== ''
    )
    if (!hasSearchValues) return feeDetails

    // Filter fee details based on search state (same logic as useTableState)
    return feeDetails.filter((fee) => {
      return [
        'feeType',
        'frequency',
        'debitAccount',
        'feeToBeCollected',
        'nextRecoveryDate',
        'feePercentage',
        'debitAmount',
        'amount',
        'vatPercentage',
        'currency',
      ].every((field) => {
        const searchVal = search[field]?.trim() || ''
        if (!searchVal) return true

        // Handle amount field - it might be stored as 'amount' or 'totalAmount'
        let value: string | undefined
        if (field === 'amount') {
          value = String((fee as any).amount ?? (fee as any).totalAmount ?? '')
        } else {
          value = String((fee as any)[field] ?? '')
        }

        const searchLower = searchVal.toLowerCase()
        const valueLower = value.toLowerCase()
        return valueLower.includes(searchLower)
      })
    })
  }, [feeDetails, search, buildPartnerId])

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
          {!isReadOnly && (
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={addFee}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              {getBuildPartnerLabelDynamic('CDL_BP_FEES_ADD')}
            </Button>
          )}
        </Box>
        <ExpandableDataTable<FeeData | FeeUIData>
          data={buildPartnerId ? filteredFeeDetails : paginated}
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
          selectedRows={[]}
          onRowSelectionChange={() => {}}
          expandedRows={[]}
          onRowExpansionChange={() => {}}
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
        <RightSlideFeeDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onFeeAdded={handleFeeAdded}
          onFeeUpdated={handleFeeUpdated}
          buildPartnerId={buildPartnerId}
          mode={editMode}
          {...(selectedFee && { feeData: selectedFee })}
          {...(selectedFeeIndex !== null && { feeIndex: selectedFeeIndex })}
        />
      )}
    </Card>
  )
}

export default Step3
