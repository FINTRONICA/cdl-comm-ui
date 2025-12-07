'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CloseIcon from '@mui/icons-material/Close'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { FeeData } from '../types'
import { RightSlideProjectFeeDetailsPanel } from '../../RightSlidePanel/RightSlideProjectFeeDetailsPanel'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks'
import { cardStyles } from '../styles'
import { realEstateAssetService } from '@/services/api/projectService'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'

interface FeeDetails extends Record<string, unknown> {
  id?: string | number
  FeeType: string
  Frequency: string
  DebitAmount: string
  Feetobecollected: string
  NextRecoveryDate: string
  FeePercentage: string
  Amount: string
  VATPercentage: string
  Currency: string
  DebitAccount: string
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
  collectionDate?: string
  realEstateAssetDTO?: any
}

interface Step3Props {
  fees: FeeData[]
  onFeesChange: (fees: FeeData[]) => void
  projectId?: string
  buildPartnerId?: string
  isViewMode?: boolean
}

const Step3: React.FC<Step3Props> = ({
  fees,
  onFeesChange,
  projectId,
  buildPartnerId,
  isViewMode = false,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState<FeeDetails | null>(null)

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [apiFeesData, setApiFeesData] = useState<FeeDetails[]>([])
  const [fullApiFeesData, setFullApiFeesData] = useState<FeeDetails[]>([])
  const [apiPagination, setApiPagination] = useState<{
    totalElements: number
    totalPages: number
  } | null>(null)

  // const { getLabel } = useProjectLabels()
  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'EN'

  const feeDetails = fees || []

  // Helper function to convert FeeDetails to FeeData
  const convertToFeeData = (feeDetails: FeeDetails[]): FeeData[] => {
    return feeDetails.map((fee) => ({
      feeType: fee.FeeType || fee.feeType || '',
      frequency: fee.Frequency || fee.frequency || '',
      debitAmount: fee.DebitAmount || fee.debitAmount || '',
      feeToBeCollected:
        fee.Feetobecollected || fee.feeToBeCollected || fee.totalAmount || '',
      nextRecoveryDate: fee.NextRecoveryDate
        ? dayjs(fee.NextRecoveryDate, 'DD/MM/YYYY')
        : null,
      feePercentage: fee.FeePercentage || fee.feePercentage || '',
      amount: fee.Amount || fee.totalAmount || '',
      vatPercentage: fee.VATPercentage || fee.vatPercentage || '',
      currency: fee.Currency || fee.currency || '',
      debitAccount: fee.DebitAccount || fee.debitAccount || '',
    }))
  }

  // Function to fetch fees from API with pagination
  const fetchFeesFromAPI = async (page: number, size: number) => {
    if (!projectId) return

    try {
      const response = await realEstateAssetService.getProjectFees(projectId)

      if (response && typeof response === 'object') {
        const feesArray =
          (response as any)?.content ||
          (Array.isArray(response) ? response : [])

        // Process all fees data first
        const allProcessedFees = feesArray.map((fee: any) => {
          const currencyValue =
            fee.reafCurrencyDTO?.languageTranslationId?.configValue || ''
          const debitAccountValue =
            fee.reafAccountTypeDTO?.languageTranslationId?.configValue || ''
          const frequencyValue =
            fee.reafFrequencyDTO?.languageTranslationId?.configValue || ''
          const feeCategoryValue =
            fee.reafCategoryDTO?.languageTranslationId?.configValue || ''
          const currencyId = fee.reafCurrencyDTO?.id?.toString() || ''
          const debitAccountId = fee.reafAccountTypeDTO?.id?.toString() || ''
          const frequencyId = fee.reafFrequencyDTO?.id?.toString() || ''
          const feeCategoryId = fee.reafCategoryDTO?.id?.toString() || ''

          // Format dates to DD/MM/YYYY
          const formatDateToDDMMYYYY = (dateString: string) => {
            if (!dateString) return ''
            try {
              // Handle different date formats from API
              const date = dayjs(dateString)
              return date.isValid() ? date.format('DD/MM/YYYY') : ''
            } catch (error) {
              return ''
            }
          }

          return {
            id: fee.id?.toString() || '',
            FeeType: feeCategoryValue,
            Frequency: frequencyValue,
            DebitAmount: fee.reafDebitAmount || '',
            Feetobecollected: formatDateToDDMMYYYY(fee.reafCollectionDate),
            NextRecoveryDate: formatDateToDDMMYYYY(fee.reafNextRecoveryDate),
            FeePercentage: fee.reafFeePercentage || '',
            Amount: fee.reafAmount || fee.reafTotalAmount || '',
            VATPercentage: fee.reafVatPercentage || '',
            Currency: currencyValue,
            DebitAccount: debitAccountValue,
            // Keep original field names for compatibility
            feeType: feeCategoryId,
            frequency: frequencyId,
            debitAccount: debitAccountId,
            currency: currencyId,
            debitAmount: fee.reafDebitAmount || '',
            feeToBeCollected: formatDateToDDMMYYYY(fee.reafCollectionDate),
            nextRecoveryDate: formatDateToDDMMYYYY(fee.reafNextRecoveryDate),
            feePercentage: fee.reafFeePercentage || '',
            vatPercentage: fee.reafVatPercentage || '',
            totalAmount: fee.reafTotalAmount || '',
            collectionDate: formatDateToDDMMYYYY(fee.reafCollectionDate),
          }
        })

        // Store full data
        setFullApiFeesData(allProcessedFees)

        // Apply client-side pagination
        const totalElements = allProcessedFees.length
        const totalPages = Math.ceil(totalElements / size)
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedFees = allProcessedFees.slice(startIndex, endIndex)

        setApiFeesData(paginatedFees)
        setApiPagination({ totalElements, totalPages })
        onFeesChange(convertToFeeData(paginatedFees))
      }
    } catch (error) {
      throw error
    }
  }

  // Load fees on component mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchFeesFromAPI(currentApiPage, currentApiSize)
    }
  }, [projectId, currentApiPage, currentApiSize])

  const addFee = () => {
    setEditingFee(null)
    setIsPanelOpen(true)
  }

  const editFee = (fee: FeeDetails) => {
    setEditingFee(fee)
    setIsPanelOpen(true)
  }

  const handleFeeAdded = async (newFee: unknown) => {
    if (editingFee) {
      // Update existing fee
      const updatedFees = feeDetails.map((fee) =>
        (fee as unknown as FeeDetails).id === editingFee.id
          ? (newFee as FeeData)
          : fee
      )
      onFeesChange(updatedFees)
    } else {
      // Add new fee
      const updatedFees = [...feeDetails, newFee as FeeData]
      onFeesChange(updatedFees)
    }
    setEditingFee(null)

    // Refresh the data from API to ensure consistency
    if (projectId) {
      await fetchFeesFromAPI(currentApiPage, currentApiSize)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setEditingFee(null)
  }

  const handleDeleteClick = (fee: FeeDetails) => {
    setFeeToDelete(fee)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (feeToDelete?.id) {
      try {
        // Call API to soft delete the fee
        await realEstateAssetService.softDeleteProjectFee(
          feeToDelete.id.toString()
        )

        // Remove the fee from the local list after successful API call
        const updatedFees = feeDetails.filter(
          (fee) => (fee as unknown as FeeDetails).id !== feeToDelete.id
        )
        onFeesChange(updatedFees)

        setDeleteDialogOpen(false)
        setFeeToDelete(null)

        // Refresh the data from API to ensure consistency
        if (projectId) {
          await fetchFeesFromAPI(currentApiPage, currentApiSize)
        }
      } catch (error) {
        throw error
      }
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setFeeToDelete(null)
  }

  const tableColumns = [
    {
      key: 'FeeType',
      label: getLabel('CDL_BPA_FEES_TYPE', language, 'Type of Fee'),
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'Frequency',
      label: getLabel(
        'CDL_BPA_FEES_FREQUENCY',
        language,
        'Collection Frequency'
      ),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'Currency',
      label: getLabel(
        'CDL_BPA_FEES_CURRENCY',
        language,
        'Transaction Currency'
      ),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'DebitAccount',
      label: getLabel(
        'CDL_BPA_FEES_DEBIT_ACCOUNT',
        language,
        'Designated Debit Account'
      ),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'Feetobecollected',
      label: getLabel(
        'CDL_BPA_FEE_COLLECTION_DATE',
        language,
        'Fee Collection Date'
      ),
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'NextRecoveryDate',
      label: getLabel('CDL_BPA_FEES_DATE', language, 'Next Collection Date'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'FeePercentage',
      label: getLabel('CDL_BPA_FEES_RATE', language, 'Fee Rate (%)'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'DebitAmount',
      label: getLabel('CDL_BPA_FEES_AMOUNT', language, 'Fee Amount'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'VATPercentage',
      label: getLabel('CDL_BPA_FEES_VAT', language, 'Applicable VAT (%)'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'Amount',
      label: getLabel(
        'CDL_BPA_FEES_TOTAL_AMOUNT',
        language,
        'Collected Amount'
      ),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'actions',
      label: getLabel('CDL_BPA_ACTION', language, 'Action'),
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  // Use the generic table state hook for local search functionality
  const {
    search,
    paginated: localPaginated,
    totalRows: localTotalRows,
    totalPages: localTotalPages,
    startItem: localStartItem,
    endItem: localEndItem,
    page: localPage,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange: localHandlePageChange,
    handleRowsPerPageChange: localHandleRowsPerPageChange,
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
      'Currency',
      'DebitAccount',
    ],
    initialRowsPerPage: currentApiSize,
  })

  // Update the table state when API size changes
  useEffect(() => {
    if (rowsPerPage !== currentApiSize) {
      localHandleRowsPerPageChange(currentApiSize)
    }
  }, [currentApiSize, rowsPerPage, localHandleRowsPerPageChange])

  // API pagination handlers
  const handlePageChange = (newPage: number) => {
    const hasSearch = Object.values(search).some((value) => value.trim())

    if (hasSearch) {
      localHandlePageChange(newPage)
    } else {
      setCurrentApiPage(newPage)
      // Apply client-side pagination to existing data
      const startIndex = (newPage - 1) * currentApiSize
      const endIndex = startIndex + currentApiSize
      const paginatedFees = fullApiFeesData.slice(startIndex, endIndex)
      setApiFeesData(paginatedFees)
      onFeesChange(convertToFeeData(paginatedFees))
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1)
    // Apply client-side pagination to existing data
    const startIndex = 0
    const endIndex = newRowsPerPage
    const paginatedFees = fullApiFeesData.slice(startIndex, endIndex)
    setApiFeesData(paginatedFees)
    onFeesChange(convertToFeeData(paginatedFees))
    localHandleRowsPerPageChange(newRowsPerPage)
  }

  // Determine which data and pagination to use
  const hasActiveSearch = Object.values(search).some((value) => value.trim())
  const apiTotal = apiPagination?.totalElements || 0
  const apiTotalPages = apiPagination?.totalPages || 1

  const effectiveData = hasActiveSearch ? localPaginated : apiFeesData
  const effectiveTotalRows = hasActiveSearch ? localTotalRows : apiTotal
  const effectiveTotalPages = hasActiveSearch ? localTotalPages : apiTotalPages
  const effectivePage = hasActiveSearch ? localPage : currentApiPage

  // Calculate effective startItem and endItem based on pagination type
  const effectiveStartItem = hasActiveSearch
    ? localStartItem
    : (currentApiPage - 1) * currentApiSize + 1
  const effectiveEndItem = hasActiveSearch
    ? localEndItem
    : Math.min(currentApiPage * currentApiSize, apiTotal)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent sx={{ padding: '24px', overflow: 'visible' }}>
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
                {getLabel('CDL_BPA_ADD_FEE', language, 'Add Fee')}
              </Button>
            )}
          </Box>
          <PermissionAwareDataTable<FeeDetails>
            data={effectiveData}
            columns={tableColumns}
            searchState={search}
            onSearchChange={handleSearchChange}
            paginationState={{
              page: effectivePage,
              rowsPerPage: currentApiSize,
              totalRows: effectiveTotalRows,
              totalPages: effectiveTotalPages,
              startItem: effectiveStartItem,
              endItem: effectiveEndItem,
            }}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            selectedRows={selectedRows}
            onRowSelectionChange={handleRowSelectionChange}
            expandedRows={expandedRows}
            onRowExpansionChange={handleRowExpansionChange}
            onRowDelete={handleDeleteClick}
            onRowEdit={editFee}
            {...(!isViewMode && {
              deletePermissions: ['bpa_fee_delete'],
              editPermissions: ['bpa_fee_update'],
            })}
            showDeleteAction={!isViewMode}
            showEditAction={!isViewMode}
          />
        </CardContent>
      </Card>
      <RightSlideProjectFeeDetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onFeeAdded={handleFeeAdded}
        editingFee={editingFee}
        projectId={projectId || ''}
        {...(buildPartnerId && { buildPartnerId })}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            paddingBottom: '16px',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '28px',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              color: '#DC2626',
              fontSize: '24px',
              backgroundColor: '#FEE2E2',
              borderRadius: '50%',
              padding: '4px',
            }}
          />
          Delete Confirmation
          <IconButton
            aria-label="close"
            onClick={cancelDelete}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6B7280',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            Are you sure you want to delete the fee &quot;
            {feeToDelete?.FeeType}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: '#D1D5DB',
              color: '#374151',
              padding: '8px 16px',
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#B91C1C',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default Step3
