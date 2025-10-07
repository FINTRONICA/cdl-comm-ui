'use client'

import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Button } from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { FeeData } from '../developerTypes'
import { RightSlideFeeDetailsPanel } from '../../RightSlidePanel/RightSlideFeeDetailsPanel'
import { ExpandableDataTable } from '../../ExpandableDataTable'
import { useTableState } from '@/hooks'
import { useBuildPartnerFees } from '@/hooks/useBuildPartners'
import { FeeUIData } from '@/services/api/buildPartnerService'
import { formatDate } from '@/utils'

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

  // Fetch fee data from API when buildPartnerId is available
  const {
    data: apiFeeData = [],
    isLoading: isLoadingFees,
    error: feeError,
    refetch: refetchFees
  } = useBuildPartnerFees(buildPartnerId)

  // Transform API data to table format
  const transformedApiData: FeeUIData[] = apiFeeData.map((fee: FeeUIData) => ({
    ...fee,
    feeToBeCollected: fee.feeToBeCollected 
      ? formatDate(fee.feeToBeCollected, 'MMM DD, YYYY')
      : '',
    nextRecoveryDate: fee.nextRecoveryDate
      ? formatDate(fee.nextRecoveryDate, 'MMM DD, YYYY')
      : '',
  }))

  // Use API data if available, otherwise use form data
  const feeDetails: (FeeData | FeeUIData)[] = transformedApiData.length > 0 ? transformedApiData : (fees || [])

  const addFee = () => {
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

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  // Debug logging
  useEffect(() => {
   
  }, [buildPartnerId, fees, apiFeeData, transformedApiData, feeDetails, isLoadingFees, feeError])

  const tableColumns = [
    {
      key: 'feeType',
      label: 'Fee Type',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'frequency',
      label: 'Frequency',
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'debitAmount',
      label: 'Debit Amount',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'feeToBeCollected',
      label: 'Fee to be Collected',
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'nextRecoveryDate',
      label: 'Next Recovery Date',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'feePercentage',
      label: 'Fee Percentage',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'vatPercentage',
      label: 'VAT Percentage',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Action',
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

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
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
  } = useTableState({
    data: feeDetails,
    searchFields: [
      'feeType',
      'frequency',
      'debitAmount',
      'feeToBeCollected',
      'nextRecoveryDate',
      'feePercentage',
      'amount',
      'vatPercentage',
      'currency',
    ],
    initialRowsPerPage: 20,
  })

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
            Add Fee
          </Button>
        </Box>
        <ExpandableDataTable<FeeData | FeeUIData>
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
          selectedRows={[]}
          onRowSelectionChange={() => {}}
          expandedRows={[]}
          onRowExpansionChange={() => {}}
        />
      </CardContent>
      {buildPartnerId && (
        <RightSlideFeeDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onFeeAdded={handleFeeAdded}
          buildPartnerId={buildPartnerId}
        />
      )}
    </Card>
  )
}

export default Step3
