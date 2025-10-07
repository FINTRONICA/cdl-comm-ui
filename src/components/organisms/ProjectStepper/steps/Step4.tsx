'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { BeneficiaryData } from '../types'
import { RightSlideProjectBeneficiaryDetailsPanel } from '../../RightSlidePanel/RightSlideProjectBeneficiaryDetailsPanel'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { ExpandableDataTable } from '../../ExpandableDataTable'
import { useTableState } from '@/hooks'
import { useBeneficiaryDropdowns } from '@/hooks/useBeneficiaryDropdowns'
import { cardStyles } from '../styles'

interface BeneficiaryDetails extends Record<string, unknown> {
  reaBeneficiaryId: string
  reaBeneficiaryType: string
  reaName: string
  reaBankName: string
  reaSwiftCode: string
  reaRoutingCode: string
  reaAccountNumber: string
  // Additional fields for compatibility
  reaBeneficiaryTypeId?: string | number
  reaBankNameId?: string | number
  realEstateAssetDTO?: any
}

interface Step4Props {
  beneficiaries: BeneficiaryData[]
  onBeneficiariesChange: (beneficiaries: BeneficiaryData[]) => void
  projectId?: string
  buildPartnerId?: string
  isViewMode?: boolean
}

const Step4: React.FC<Step4Props> = ({
  beneficiaries,
  isViewMode = false,
  onBeneficiariesChange,
  projectId,
  buildPartnerId,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] =
    useState<BeneficiaryDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Use form data instead of local state
  const beneficiaryDetails = beneficiaries || []
  const [beneficiaryToDelete, setBeneficiaryToDelete] =
    useState<BeneficiaryDetails | null>(null)

  // Load dropdown data from API
  const {
    bankNames,
    beneficiaryTypes,
    isLoading: dropdownsLoading,
    error: dropdownsError,
  } = useBeneficiaryDropdowns()

  const addBeneficiary = () => {
    setEditingBeneficiary(null)
    setIsPanelOpen(true)
  }

  const editBeneficiary = (beneficiary: BeneficiaryDetails) => {
    setEditingBeneficiary(beneficiary)
    setIsPanelOpen(true)
  }

  const handleBeneficiaryAdded = (newBeneficiary: unknown) => {
    if (editingBeneficiary) {
      // Update existing beneficiary
      const updatedBeneficiaries = beneficiaryDetails.map((beneficiary) =>
        beneficiary.id === editingBeneficiary.id
          ? (newBeneficiary as BeneficiaryData)
          : beneficiary
      )
      onBeneficiariesChange(updatedBeneficiaries)
    } else {
      // Add new beneficiary
      const updatedBeneficiaries = [
        ...beneficiaryDetails,
        newBeneficiary as BeneficiaryData,
      ]
      onBeneficiariesChange(updatedBeneficiaries)
    }

    setEditingBeneficiary(null)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setEditingBeneficiary(null)
  }

  const handleDeleteClick = (beneficiary: BeneficiaryDetails) => {
    setBeneficiaryToDelete(beneficiary)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (beneficiaryToDelete?.id) {
      try {
        setDeleteDialogOpen(false)
        setBeneficiaryToDelete(null)
      } catch (error) {}
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setBeneficiaryToDelete(null)
  }

  const tableColumns = [
    {
      key: 'reaBeneficiaryId',
      label: 'ID',
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'reaBeneficiaryType',
      label: 'Beneficiary Type',
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'reaName',
      label: 'Name',
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'reaBankName',
      label: 'Bank Name',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'reaSwiftCode',
      label: 'Swift Code',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'reaRoutingCode',
      label: 'Routing Code',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'reaAccountNumber',
      label: 'Account Number',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions' as const,
      width: 'w-24',
      render: (beneficiary: BeneficiaryDetails) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => editBeneficiary(beneficiary)}
            sx={{ color: '#2563EB' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(beneficiary)}
            sx={{ color: '#DC2626' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
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
    data: beneficiaryDetails as unknown as BeneficiaryDetails[],
    searchFields: [
      'reaBeneficiaryId',
      'reaBeneficiaryType',
      'reaName',
      'reaBankName',
      'reaSwiftCode',
      'reaRoutingCode',
      'reaAccountNumber',
    ],
    initialRowsPerPage: 20,
  })

  // Show loading state
  if (dropdownsLoading) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (dropdownsError) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load beneficiary data. Please try again.
            {dropdownsError && (
              <div>Dropdown error: {(dropdownsError as any).message}</div>
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
                // No need to refresh since we're using local state
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
              Retry
            </Button>
            {!isViewMode && (
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
                Add Beneficiary
              </Button>
            )}
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
          {/* <Typography variant="h6">Beneficiary Details</Typography> */}
          <Box>
            <Button
              variant="text"
              startIcon={<FileDownloadOutlinedIcon />}
              sx={{
                mr: 1,
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Download Template
            </Button>
            <Button
              variant="contained"
              startIcon={<FileUploadOutlinedIcon />}
              sx={{
                mr: 1,
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Upload XLS
            </Button>
            {!isViewMode && (
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
                Add Beneficiary
              </Button>
            )}
          </Box>
        </Box>

        <ExpandableDataTable<BeneficiaryDetails>
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

      <RightSlideProjectBeneficiaryDetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onBeneficiaryAdded={handleBeneficiaryAdded}
        title="Beneficiary"
        editingBeneficiary={editingBeneficiary}
        bankNames={bankNames}
        projectId={projectId || ''}
        beneficiaryTypes={beneficiaryTypes}
        dropdownsLoading={dropdownsLoading}
        dropdownsError={dropdownsError}
        {...(buildPartnerId && { buildPartnerId })}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the beneficiary &quot;
            {beneficiaryToDelete?.reaName}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default Step4
