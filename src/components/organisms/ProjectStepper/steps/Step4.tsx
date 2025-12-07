'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CloseIcon from '@mui/icons-material/Close'
import { BeneficiaryData } from '../types'
import { RightSlideProjectBeneficiaryDetailsPanel } from '../../RightSlidePanel/RightSlideProjectBeneficiaryDetailsPanel'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { PermissionAwareDataTable } from '@/components/organisms/PermissionAwareDataTable'
import { useTableState } from '@/hooks'
import { useBeneficiaryDropdowns } from '@/hooks/useBeneficiaryDropdowns'
import { cardStyles } from '../styles'

import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'
import { realEstateAssetService } from '@/services/api/projectService'
import { PageActionButtons } from '@/components/molecules/PageActionButtons'
import { GlobalLoading } from '@/components/atoms'

interface BeneficiaryDetails extends Record<string, unknown> {
  reaBeneficiaryId: string
  reaBeneficiaryType: string
  reaName: string
  reaBankName: string
  reaSwiftCode: string
  reaRoutingCode: string
  reaAccountNumber: string
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
  const [isDownloading, setIsDownloading] = useState(false)

  const [currentApiPage, setCurrentApiPage] = useState(1)
  const [currentApiSize, setCurrentApiSize] = useState(20)
  const [apiBeneficiariesData, setApiBeneficiariesData] = useState<
    BeneficiaryDetails[]
  >([])
  const [fullApiBeneficiariesData, setFullApiBeneficiariesData] = useState<
    BeneficiaryDetails[]
  >([])
  const [apiPagination, setApiPagination] = useState<{
    totalElements: number
    totalPages: number
  } | null>(null)

  const beneficiaryDetails = beneficiaries || []
  const [beneficiaryToDelete, setBeneficiaryToDelete] =
    useState<BeneficiaryDetails | null>(null)

  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'en'

  const convertToBeneficiaryData = (
    beneficiaryDetails: BeneficiaryDetails[]
  ): BeneficiaryData[] => {
    return beneficiaryDetails.map((beneficiary) => ({
      id: beneficiary.id?.toString() || '',
      expenseType: beneficiary.reaBeneficiaryType || '',
      transferType: beneficiary.reaBeneficiaryType || '',
      name: beneficiary.reaName || '',
      bankName: beneficiary.reaBankName || '',
      swiftCode: beneficiary.reaSwiftCode || '',
      routingCode: beneficiary.reaRoutingCode || '',
      account: beneficiary.reaAccountNumber || '',
    }))
  }

  const fetchBeneficiariesFromAPI = async (page: number, size: number) => {
    if (!projectId) return

    try {
      const response =
        await realEstateAssetService.getProjectBeneficiaries(projectId)

      if (response && typeof response === 'object') {
        const beneficiariesArray =
          (response as any)?.content ||
          (Array.isArray(response) ? response : [])

        const allProcessedBeneficiaries = beneficiariesArray.map(
          (beneficiary: any) => ({
            id: beneficiary.id?.toString() || '',
            reaBeneficiaryId: beneficiary.reabBeneficiaryId || '',
            reaBeneficiaryType:
              beneficiary.reabTranferTypeDTO?.languageTranslationId
                ?.configValue ||
              beneficiary.reabType ||
              '',
            reaName: beneficiary.reabName || '',
            reaBankName: beneficiary.reabBank || '',
            reaSwiftCode: beneficiary.reabSwift || '',
            reaRoutingCode: beneficiary.reabRoutingCode || '',
            reaAccountNumber: beneficiary.reabBeneAccount || '',

            beneficiaryId: beneficiary.reabBeneficiaryId || '',
            beneficiaryType: beneficiary.reabType || '',
            name: beneficiary.reabName || '',
            bankName: beneficiary.reabBank || '',
            swiftCode: beneficiary.reabSwift || '',
            routingCode: beneficiary.reabRoutingCode || '',
            accountNumber: beneficiary.reabBeneAccount || '',
          })
        )

        setFullApiBeneficiariesData(allProcessedBeneficiaries)

        const totalElements = allProcessedBeneficiaries.length
        const totalPages = Math.ceil(totalElements / size)
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedBeneficiaries = allProcessedBeneficiaries.slice(
          startIndex,
          endIndex
        )

        setApiBeneficiariesData(paginatedBeneficiaries)
        setApiPagination({ totalElements, totalPages })
        onBeneficiariesChange(convertToBeneficiaryData(paginatedBeneficiaries))
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchBeneficiariesFromAPI(currentApiPage, currentApiSize)
    }
  }, [projectId, currentApiPage, currentApiSize])

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true)
    } catch (error) {
      throw error
    } finally {
      setIsDownloading(false)
    }
  }

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

  const handleBeneficiaryAdded = async (newBeneficiary: unknown) => {
    if (editingBeneficiary) {
      const updatedBeneficiaries = beneficiaryDetails.map((beneficiary) =>
        beneficiary.id === editingBeneficiary.id
          ? (newBeneficiary as BeneficiaryData)
          : beneficiary
      )
      onBeneficiariesChange(updatedBeneficiaries)
    } else {
      const updatedBeneficiaries = [
        ...beneficiaryDetails,
        newBeneficiary as BeneficiaryData,
      ]
      onBeneficiariesChange(updatedBeneficiaries)
    }

    setEditingBeneficiary(null)

    if (projectId) {
      await fetchBeneficiariesFromAPI(currentApiPage, currentApiSize)
    }
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
        await realEstateAssetService.softDeleteProjectBeneficiary(
          beneficiaryToDelete.id.toString()
        )

        const updatedBeneficiaries = beneficiaryDetails.filter(
          (beneficiary) => beneficiary.id !== beneficiaryToDelete.id
        )
        onBeneficiariesChange(updatedBeneficiaries)

        setDeleteDialogOpen(false)
        setBeneficiaryToDelete(null)

        if (projectId) {
          await fetchBeneficiariesFromAPI(currentApiPage, currentApiSize)
        }
      } catch (error) {
        console.error('Error deleting beneficiary:', error)
      }
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setBeneficiaryToDelete(null)
  }

  const tableColumns = [
    {
      key: 'reaBeneficiaryId',
      label: getLabel(
        'CDL_BPA_BENE_REFID',
        language,
        'Beneficiary Reference ID'
      ),
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'reaBeneficiaryType',
      label: getLabel('CDL_BPA_BENE_TRANSFER', language, 'Transfer Method'),
      type: 'text' as const,
      width: 'w-28',
      sortable: true,
    },
    {
      key: 'reaName',
      label: getLabel('CDL_BPA_BENE_NAME', language, 'Beneficiary Full Name'),
      type: 'text' as const,
      width: 'w-30',
      sortable: true,
    },
    {
      key: 'reaBankName',
      label: getLabel('CDL_BPA_BENE_BANK', language, 'Bank Name'),
      type: 'text' as const,
      width: 'w-32',
      sortable: true,
    },
    {
      key: 'reaSwiftCode',
      label: getLabel('CDL_BPA_BENE_BIC', language, 'SWIFT/BIC Code'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'reaRoutingCode',
      label: getLabel('CDL_BPA_BENE_ROUTING', language, 'Routing Number'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'reaAccountNumber',
      label: getLabel('CDL_BPA_BENE_ACC', language, 'Bank Account Number'),
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'actions',
      label: getLabel('CDL_BPA_ACTION', language, 'Actions'),
      type: 'actions' as const,
      width: 'w-24',
    },
  ]

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
    initialRowsPerPage: currentApiSize,
  })

  useEffect(() => {
    if (rowsPerPage !== currentApiSize) {
      localHandleRowsPerPageChange(currentApiSize)
    }
  }, [currentApiSize, rowsPerPage, localHandleRowsPerPageChange])

  const handlePageChange = (newPage: number) => {
    const hasSearch = Object.values(search).some((value) => value.trim())

    if (hasSearch) {
      localHandlePageChange(newPage)
    } else {
      setCurrentApiPage(newPage)

      const startIndex = (newPage - 1) * currentApiSize
      const endIndex = startIndex + currentApiSize
      const paginatedBeneficiaries = fullApiBeneficiariesData.slice(
        startIndex,
        endIndex
      )
      setApiBeneficiariesData(paginatedBeneficiaries)
      onBeneficiariesChange(convertToBeneficiaryData(paginatedBeneficiaries))
    }
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage)
    setCurrentApiPage(1)

    const startIndex = 0
    const endIndex = newRowsPerPage
    const paginatedBeneficiaries = fullApiBeneficiariesData.slice(
      startIndex,
      endIndex
    )
    setApiBeneficiariesData(paginatedBeneficiaries)
    onBeneficiariesChange(convertToBeneficiaryData(paginatedBeneficiaries))
    localHandleRowsPerPageChange(newRowsPerPage)
  }

  const hasActiveSearch = Object.values(search).some((value) => value.trim())

  // Filter API beneficiaries based on search state when projectId exists (client-side filtering)
  const filteredApiBeneficiaries = useMemo(() => {
    if (!projectId || !hasActiveSearch) return fullApiBeneficiariesData

    // Filter fullApiBeneficiariesData based on search state (same logic as useTableState)
    return fullApiBeneficiariesData.filter((beneficiary) => {
      return [
        'reaBeneficiaryId',
        'reaBeneficiaryType',
        'reaName',
        'reaBankName',
        'reaSwiftCode',
        'reaRoutingCode',
        'reaAccountNumber',
      ].every((field) => {
        const searchVal = search[field]?.trim() || ''
        if (!searchVal) return true

        const value = String(
          beneficiary[field as keyof BeneficiaryDetails] ?? ''
        )
        const searchLower = searchVal.toLowerCase()
        const valueLower = value.toLowerCase()
        return valueLower.includes(searchLower)
      })
    })
  }, [fullApiBeneficiariesData, search, projectId, hasActiveSearch])

  // Apply pagination to filtered API beneficiaries when search is active
  const paginatedFilteredApiBeneficiaries = useMemo(() => {
    if (!projectId || !hasActiveSearch) return []

    const startIndex = (localPage - 1) * currentApiSize
    const endIndex = startIndex + currentApiSize
    return filteredApiBeneficiaries.slice(startIndex, endIndex)
  }, [
    filteredApiBeneficiaries,
    localPage,
    currentApiSize,
    projectId,
    hasActiveSearch,
  ])

  const apiTotal = apiPagination?.totalElements || 0
  const apiTotalPages = apiPagination?.totalPages || 1

  // Use filtered API data when projectId exists and search is active, otherwise use existing logic
  const effectiveData =
    projectId && hasActiveSearch
      ? paginatedFilteredApiBeneficiaries
      : hasActiveSearch
        ? localPaginated
        : apiBeneficiariesData
  const effectiveTotalRows =
    projectId && hasActiveSearch
      ? filteredApiBeneficiaries.length
      : hasActiveSearch
        ? localTotalRows
        : apiTotal
  const effectiveTotalPages =
    projectId && hasActiveSearch
      ? Math.ceil(filteredApiBeneficiaries.length / currentApiSize)
      : hasActiveSearch
        ? localTotalPages
        : apiTotalPages
  const effectivePage =
    projectId && hasActiveSearch
      ? localPage
      : hasActiveSearch
        ? localPage
        : currentApiPage

  const effectiveStartItem =
    projectId && hasActiveSearch
      ? (localPage - 1) * currentApiSize + 1
      : hasActiveSearch
        ? localStartItem
        : (currentApiPage - 1) * currentApiSize + 1
  const effectiveEndItem =
    projectId && hasActiveSearch
      ? Math.min(localPage * currentApiSize, filteredApiBeneficiaries.length)
      : hasActiveSearch
        ? localEndItem
        : Math.min(currentApiPage * currentApiSize, apiTotal)

  if (dropdownsLoading) {
    return (
      <Card sx={cardStyles}>
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
              onClick={() => {}}
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
          <Box display="flex" gap={2} alignItems="center">
            <PageActionButtons
              entityType="developerBeneficiary"
              onDownloadTemplate={handleDownloadTemplate}
              isDownloading={isDownloading}
              showButtons={{
                downloadTemplate: !isViewMode,
                uploadDetails: !isViewMode,
                addNew: false,
              }}
            />
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

        <PermissionAwareDataTable<BeneficiaryDetails>
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
          onRowEdit={editBeneficiary}
          {...(!isViewMode && {
            deletePermissions: ['bpa_beneficiary_delete'],
            editPermissions: ['bpa_beneficiary_update'],
          })}
          showDeleteAction={!isViewMode}
          showEditAction={!isViewMode}
        />
      </CardContent>

      <RightSlideProjectBeneficiaryDetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onBeneficiaryAdded={handleBeneficiaryAdded}
        title={getLabel(
          'CDL_BPA_BENE_INFO',
          language,
          'Beneficiary Banking Details'
        )}
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
            Are you sure you want to delete the beneficiary &quot;
            {beneficiaryToDelete?.reaName}&quot;? This action cannot be undone.
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
    </Card>
  )
}

export default Step4
