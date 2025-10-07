'use client'

import React, { useState } from 'react'
import { Box, Card, CardContent, Button } from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { FeeData } from '../types'
import { RightSlideProjectFeeDetailsPanel } from '../../RightSlidePanel/RightSlideProjectFeeDetailsPanel'
import { ExpandableDataTable } from '../../ExpandableDataTable'
import { useTableState } from '@/hooks'
import { cardStyles } from '../styles'

interface FeeDetails extends Record<string, unknown> {
  FeeType: string
  Frequency: string
  DebitAmount: string
  Feetobecollected: string
  NextRecoveryDate: string
  FeePercentage: string
  Amount: string
  VATPercentage: string
  // Additional fields for compatibility
  feeType?: string
  frequency?: string
  debitAccount?: string
  currency?: string
  debitAmount?: string
  feeToBeCollected?: any
  nextRecoveryDate?: any
  feePercentage?: string
  vatPercentage?: string
  totalAmount?: string
  realEstateAssetDTO?: any
}

interface Step3Props {
  fees: FeeData[]
  onFeesChange: (fees: FeeData[]) => void
  projectId?: string
  buildPartnerId?: string
  isViewMode?: boolean
}

const Step3: React.FC<Step3Props> = ({ fees, onFeesChange, projectId, buildPartnerId, isViewMode = false }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Use form data instead of local state
  const feeDetails = fees || []

  const addFee = () => {
    setIsPanelOpen(true)
  }

  const handleFeeAdded = (newFee: unknown) => {
    const updatedFees = [...feeDetails, newFee as FeeData]
    onFeesChange(updatedFees)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  const tableColumns = [
    {
      key: 'FeeType',
      label: 'Fee Type',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'Frequency',
      label: 'Frequency',
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'DebitAmount',
      label: 'Debit Amount',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'Feetobecollected',
      label: 'Fee to be Collected',
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'NextRecoveryDate',
      label: 'Next Recovery Date',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'FeePercentage',
      label: 'Fee Percentage',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'Amount',
      label: 'Amount',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'VATPercentage',
      label: 'VAT Percentage',
      type: 'text' as const,
      width: 'w-24',
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
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  } = useTableState({
    data: feeDetails as unknown as FeeDetails[],
    searchFields: [
      'FeeType',
      'Frequency',
      'DebitAmount',
      'Feetobecollected',
      'NextRecoveryDate',
      'FeePercentage',
      'Amount',
      'VATPercentage',
    ],
    initialRowsPerPage: 20,
  })

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent>
          <Box display="flex" justifyContent="end" alignItems="center" mb={4}>
            {!isViewMode && (
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
            )}
          </Box>
          <ExpandableDataTable<FeeDetails>
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
          />
        </CardContent>
      </Card>
      <RightSlideProjectFeeDetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onFeeAdded={handleFeeAdded}
        projectId={projectId || ''}
        {...(buildPartnerId && { buildPartnerId })}
      />
    </LocalizationProvider>
  )
}

export default Step3
