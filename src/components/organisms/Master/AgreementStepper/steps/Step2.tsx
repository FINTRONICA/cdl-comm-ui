'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useParams } from 'next/navigation'
import {
  type Agreement,
} from '@/services/api/masterApi/Entitie/agreementService'
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import { useAgreementLabelsWithCache, useAgreement, useAgreementDocuments } from '@/hooks'
import { getAgreementLabel } from '@/constants/mappings/master/Entity/agreementMapping'
import { useAppStore } from '@/store'

// Hook to detect dark mode
const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

const getLabelSx = (isDark: boolean) => ({
  color: isDark ? '#9CA3AF' : '#6B7280',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '16px',
  letterSpacing: 0,
  marginBottom: '4px',
})

const getValueSx = (isDark: boolean) => ({
  color: isDark ? '#F9FAFB' : '#1F2937',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
  wordBreak: 'break-word',
})

const fieldBoxSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  marginBottom: '16px',
}

// Data interfaces

interface DocumentData {
  id: string
  fileName: string
  documentType: string
  uploadDate: string
  fileSize: number
}

interface Step2Props {
  agreementId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step2 = ({ agreementId: propAgreementId, onEditStep, isReadOnly = false }: Step2Props) => {
  const params = useParams()
  const agreementId = propAgreementId || (params.id as string)
  const isDarkMode = useIsDarkMode()

  const [agreementDetails, setAgreementDetails] = useState<Agreement | null>(
    null
  )
  const [documentData, setDocumentData] = useState<DocumentData[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dynamic labels helper (same as other steps)
  const { data: agreementLabels, getLabel } = useAgreementLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getAgreementLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementLabel(configId)
      return agreementLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [agreementLabels, currentLanguage, getLabel]
  )

  // Render helper functions with dark mode support
  const renderDisplayField = useCallback(
    (label: string, value: string | number | null = '-') => (
      <Box sx={fieldBoxSx}>
        <Typography sx={getLabelSx(isDarkMode)}>{label}</Typography>
        <Typography sx={getValueSx(isDarkMode)}>{value || '-'}</Typography>
      </Box>
    ),
    [isDarkMode]
  )


  // CRITICAL FIX: Step2 should use stepStatus data from parent if available
  // Only fetch independently if stepStatus is not provided
  // This prevents duplicate API calls when parent already has the data
  const { data: agreementDetailsData, isLoading: isLoadingDetails, error: detailsError } = useAgreement(
    agreementId || ''
  )
  const { data: documentsResponse, isLoading: isLoadingDocuments, error: documentsError } = useAgreementDocuments(
    agreementId || '', 
    'AGREEMENT', 
    0, 
    20
  )

  // Update local state when React Query data changes
  useEffect(() => {
    if (agreementDetailsData) {
      setAgreementDetails(agreementDetailsData)
    }
  }, [agreementDetailsData])

  useEffect(() => {
    if (documentsResponse) {
      // Handle paginated responses for documents
      let documentArray: unknown[] = []
      if (Array.isArray(documentsResponse)) {
        documentArray = documentsResponse
      } else if (
        documentsResponse &&
        typeof documentsResponse === 'object' &&
        'content' in documentsResponse
      ) {
        const content = (documentsResponse as { content?: unknown[] }).content
        documentArray = Array.isArray(content) ? content : []
      }

      setDocumentData(
        documentArray.map((doc) => {
          const docObj = doc as {
            id?: number | string
            documentName?: string
            documentTypeDTO?: {
              languageTranslationId?: { configValue?: string }
            }
            uploadDate?: string
            documentSize?: string
          }
          return {
            id: docObj.id?.toString() || '',
            fileName: docObj.documentName || '',
            documentType:
              docObj.documentTypeDTO?.languageTranslationId?.configValue || '',
            uploadDate: docObj.uploadDate || '',
            fileSize: parseInt(docObj.documentSize || '0'),
          }
        })
      )
    }
  }, [documentsResponse])

  // Update loading and error states
  useEffect(() => {
    setLoading(isLoadingDetails || isLoadingDocuments)
    setError(
      detailsError 
        ? (detailsError instanceof Error ? detailsError.message : 'Failed to fetch agreement details')
        : documentsError
          ? (documentsError instanceof Error ? documentsError.message : 'Failed to fetch documents')
          : null
    )
  }, [isLoadingDetails, isLoadingDocuments, detailsError, documentsError])

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
          borderRadius: '16px',
          margin: '0 auto',
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlobalLoading fullHeight className="min-h-[400px]" />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  // No data state
  if (!agreementDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No agreement details found.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          width: '100%',
          margin: '0 auto',
          mb: 3,
          border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '24px',
                color: isDarkMode ? '#F9FAFB' : '#1E2939',
              }}
            >
              {getAgreementLabelDynamic('CDL_AGREEMENT_DETAILS')}
            </Typography>
            {!isReadOnly && (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => {
                  onEditStep?.(0)
                }}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: isDarkMode ? '#93C5FD' : '#6B7280',
                  borderColor: isDarkMode ? '#334155' : '#D1D5DB',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: isDarkMode ? '#475569' : '#9CA3AF',
                    backgroundColor: isDarkMode
                      ? 'rgba(51, 65, 85, 0.3)'
                      : '#F9FAFB',
                  },
                }}
              >
                Edit
              </Button>
            )}
          </Box>
          <Divider
            sx={{
              mb: 3,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_AGREEMENT_ID'),
                agreementDetails.id?.toString() || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_CIF_NUMBER'),
                agreementDetails.primaryEscrowCifNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_RM_NAME'),
                agreementDetails.relationshipManagerName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_OPERATING_LOCATION_CODE'),
                agreementDetails.operatingLocationCode
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_1'),
                agreementDetails.customField1
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_2'),
                agreementDetails.customField2
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_3'),
                agreementDetails.customField3
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_4'),
                agreementDetails.customField4
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_PRODUCT_MANAGET_NAME'),
                agreementDetails.productManagerName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabelDynamic('CDL_ESCROW_CLIENT_NAME'),
                agreementDetails.clientName
              )}
            </Grid>
            {/* <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_AGREEMENT_PARAMETERS_DTO'),
                agreementDetails.agreementParametersDTO.name
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_AGREEMENT_FEE_SCHEDULE_DTO'),
                agreementDetails.agreementFeeScheduleDTO.name
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_DEAL_STATUS_DTO'),
                agreementDetails.dealStatusDTO.name
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_DEAL_TYPE_DTO'),
                agreementDetails.dealTypeDTO.name
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_DEAL_SUB_TYPE_DTO'),
                agreementDetails.dealSubTypeDTO.name
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_PRODUCT_PROGRAM_DTO'),
                agreementDetails.productProgramDTO.name
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_AGREEMENT_STATUS'),
                agreementDetails.agreementStatusDTO.name
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementLabel('CDL_ESCROW_DEAL_PRIORITY_DTO'),
                agreementDetails.dealPriorityDTO.name
              )}
            </Grid> */}
          </Grid>
        </CardContent>
      </Card>

      {/* Submitted Documents Section */}
      {documentData.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: isDarkMode ? '#F9FAFB' : '#1E2939',
                }}
              >
                Submitted Documents
              </Typography>
              {!isReadOnly && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    onEditStep?.(1)
                  }}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: isDarkMode ? '#93C5FD' : '#6B7280',
                    borderColor: isDarkMode ? '#334155' : '#D1D5DB',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: isDarkMode ? '#475569' : '#9CA3AF',
                      backgroundColor: isDarkMode
                        ? 'rgba(51, 65, 85, 0.3)'
                        : '#F9FAFB',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 'none',
                border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
                backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB',
                    }}
                  >
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentData.map((doc, index) => (
                    <TableRow
                      key={doc.id || index}
                      sx={{
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#F9FAFB',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: isDarkMode ? '#E5E7EB' : '#374151',
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.fileName}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: isDarkMode ? '#E5E7EB' : '#374151',
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {formatDate(doc.uploadDate, 'DD/MM/YYYY')}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: isDarkMode ? '#E5E7EB' : '#374151',
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.documentType}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Step2
