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
import { BeneficiaryData } from '../developerTypes'
import { RightSlideBeneficiaryDetailsPanel } from '../../RightSlidePanel/RightSlideBeneficiaryDetailsPanel'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { ExpandableDataTable } from '../../ExpandableDataTable'
import { useTableState, useDeleteBuildPartnerBeneficiary } from '@/hooks'
import { useBeneficiaryDropdowns } from '@/hooks/useBeneficiaryDropdowns'
import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
import { TEMPLATE_FILES } from '@/constants'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
interface BeneficiaryDetails extends Record<string, unknown> {
  id?: string
  bpbBeneficiaryId: string
  bpbBeneficiaryType: string
  bpbName: string
  bpbBankName: string
  bpbSwiftCode: string
  bpbRoutingCode: string
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

const Step4: React.FC<Step4Props> = ({ beneficiaries, onBeneficiariesChange, buildPartnerId, isReadOnly = false }) => {

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<BeneficiaryDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Use beneficiaries directly as they should match BeneficiaryDetails interface
  const beneficiaryDetails = beneficiaries || []
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<BeneficiaryDetails | null>(null)

  

  // Static data for step data since backend API is not available
  const isLoadingData = false
  const dataError = null
  
  // Load dropdown data from API (this works)
  const { 
    bankNames, 
    beneficiaryTypes, 
    isLoading: dropdownsLoading,
    error: dropdownsError 
  } = useBeneficiaryDropdowns()

  // Mutation hooks
  const deleteBeneficiaryMutation = useDeleteBuildPartnerBeneficiary()

  // Template download hook
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload()

  // No need to load data from API since we're using local state
  // useEffect removed since we're not loading from API

  const addBeneficiary = () => {
    setEditingBeneficiary(null)
    setIsPanelOpen(true)
  }

  // Template download handler
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(TEMPLATE_FILES.BUILD_PARTNER_BENEFICIARY)
    } catch (error) {
      
    }
  }

  const editBeneficiary = (beneficiary: BeneficiaryDetails) => {
    setEditingBeneficiary(beneficiary)
    setIsPanelOpen(true)
  }

  const handleBeneficiaryAdded = (newBeneficiary: unknown) => {
    
    if (editingBeneficiary) {
      // Update existing beneficiary
      const updatedBeneficiaries = beneficiaryDetails.map(beneficiary => 
        beneficiary.id === editingBeneficiary.id 
          ? newBeneficiary as BeneficiaryData
          : beneficiary
      )
      onBeneficiariesChange(updatedBeneficiaries)
    } else {
      // Add new beneficiary
      const updatedBeneficiaries = [...beneficiaryDetails, newBeneficiary as BeneficiaryData]
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
        await deleteBeneficiaryMutation.mutateAsync(beneficiaryToDelete.id)
        onBeneficiariesChange(
          beneficiaryDetails.filter(beneficiary => beneficiary.id !== beneficiaryToDelete.id)
        )
        setDeleteDialogOpen(false)
        setBeneficiaryToDelete(null)
        // No need to refresh since we're using local state
      } catch (error) {
       

      }
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setBeneficiaryToDelete(null)
  }



  const tableColumns = [
    {
      key: 'bpbBeneficiaryId',
      label: 'ID',
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'bpbBeneficiaryType',
      label: 'Beneficiary Type',
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'bpbName',
      label: 'Name',
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'bpbBankName',
      label: 'Bank Name',
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'bpbSwiftCode',
      label: 'Swift Code',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'bpbRoutingCode',
      label: 'Routing Code',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'bpbAccountNumber',
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
          {!isReadOnly && (
            <>
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
            </>
          )}
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
    data: beneficiaryDetails,
    searchFields: [
      'bpbBeneficiaryId',
      'bpbBeneficiaryType',
      'bpbName',
      'bpbBankName',
      'bpbSwiftCode',
      'bpbRoutingCode',
      'bpbAccountNumber',
    ],
    initialRowsPerPage: 20,
  })

  // Show loading state
  if (isLoadingData || dropdownsLoading) {
    return (
      <Card sx={{ boxShadow: 'none', backgroundColor: '#FFFFFFBF', width: '94%', margin: '0 auto' }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (dataError || dropdownsError) {
    return (
      <Card sx={{ boxShadow: 'none', backgroundColor: '#FFFFFFBF', width: '94%', margin: '0 auto' }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load beneficiary data. Please try again.
            {dataError && <div>Step data error: {(dataError as any).message}</div>}
            {dropdownsError && <div>Dropdown error: {dropdownsError.message}</div>}
          </Alert>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Button
              variant="outlined"
              onClick={() => {
                // No need to refresh since we're using local state
              }}
              sx={{
                borderRadius: '8px', textTransform: 'none', fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle', boxShadow: 'none'
              }}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={addBeneficiary}
              sx={{
                borderRadius: '8px', textTransform: 'none', fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle', boxShadow: 'none'
              }}
            >
              Add Beneficiary
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ boxShadow: 'none', backgroundColor: '#FFFFFFBF', width: '94%', margin: '0 auto' }}>
      <CardContent>
        <Box display="flex" justifyContent="end" alignItems="center" mb={4}>
          <Box display="flex" gap={2} alignItems="center">
            <PageActionButtons
              entityType="developerBeneficiary"
              onDownloadTemplate={handleDownloadTemplate}
              isDownloading={isDownloading}
              showButtons={{
                downloadTemplate: true,
                uploadDetails: true,
                addNew: false
              }}
            />
            {!isReadOnly && (
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={addBeneficiary}
                sx={{
                  borderRadius: '8px', textTransform: 'none', fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '0.5px',
                  verticalAlign: 'middle', boxShadow: 'none'
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

      <RightSlideBeneficiaryDetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onBeneficiaryAdded={handleBeneficiaryAdded}
        title='Beneficiary'
        editingBeneficiary={editingBeneficiary}
        bankNames={bankNames}
        buildPartnerId={buildPartnerId}
        beneficiaryTypes={beneficiaryTypes}
        dropdownsLoading={dropdownsLoading}
        dropdownsError={dropdownsError}
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
            Are you sure you want to delete the beneficiary &quot;{beneficiaryToDelete?.bpbName}&quot;? 
            This action cannot be undone.
          </Typography>
          {deleteBeneficiaryMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to delete beneficiary: {deleteBeneficiaryMutation.error.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={cancelDelete}
            color="primary"
            disabled={deleteBeneficiaryMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteBeneficiaryMutation.isPending}
          >
            {deleteBeneficiaryMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Card>
  )
}

export default Step4
